import os, sys, json, time, urllib.parse, urllib.request, mimetypes, uuid, base64, ssl, hashlib, hmac, secrets
from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler

# Load local .env file if present
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

# Stripe Environment Configuration (No hardcoded secrets)
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '').strip()
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '').strip()
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '').strip()
STRIPE_AVAILABLE = bool(STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY)
print(f'[Stripe] Native payment gateway initialized (Active: {STRIPE_AVAILABLE})')

# Server-Side Admin Authentication Configuration
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'cavalao123').strip()
ADMIN_TOKENS = {}  # token -> {'created': timestamp, 'expires': timestamp}

# Rate Limiting Store: ip -> list of failed attempt timestamps
FAILED_LOGIN_ATTEMPTS = {}

DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
DB_FILE = os.path.join(DATA_DIR, 'database.json')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

def check_rate_limit(ip, max_attempts=5, window_seconds=300):
    now = time.time()
    attempts = FAILED_LOGIN_ATTEMPTS.get(ip, [])
    attempts = [t for t in attempts if now - t < window_seconds]
    FAILED_LOGIN_ATTEMPTS[ip] = attempts
    return len(attempts) < max_attempts

def record_failed_attempt(ip):
    now = time.time()
    attempts = FAILED_LOGIN_ATTEMPTS.setdefault(ip, [])
    attempts.append(now)

def clear_rate_limit(ip):
    FAILED_LOGIN_ATTEMPTS.pop(ip, None)

def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
    return pwd_hash, salt

def verify_password(password, stored_hash, stored_salt=None):
    if stored_salt:
        calc_hash, _ = hash_password(password, stored_salt)
        return hmac.compare_digest(calc_hash, stored_hash)
    # Legacy fallback for older SHA-256 entries
    legacy_hash = hashlib.sha256((password + 'ls_salt_2026').encode()).hexdigest()
    return hmac.compare_digest(legacy_hash, stored_hash)

def load_db():
    if not os.path.exists(DB_FILE):
        return {'quotes': [], 'orders': [], 'products': [], 'materials': [], 'portfolio': [], 'faqs': [], 'promoCodes': [], 'settings': {}, 'users': [], 'notifications': []}
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            data.setdefault('users', [])
            data.setdefault('notifications', [])
            return data
    except Exception as e:
        print(f'Error reading DB: {e}')
        return {'quotes': [], 'orders': [], 'products': [], 'materials': [], 'portfolio': [], 'faqs': [], 'promoCodes': [], 'settings': {}, 'users': [], 'notifications': []}

def save_db(data):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f'Error saving DB: {e}')
        return False

def add_notification(db, order_id, title, message, status, email=''):
    notifs = db.setdefault('notifications', [])
    notif = {
        'id': f'notif_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}',
        'orderId': order_id,
        'title': title,
        'message': message,
        'status': status,
        'email': email.lower().strip() if email else '',
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'read': False
    }
    notifs.insert(0, notif)
    if len(notifs) > 200:
        db['notifications'] = notifs[:200]
    return notif

class LayerStudiosHandler(SimpleHTTPRequestHandler):
    def get_client_ip(self):
        forwarded = self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return self.client_address[0] if self.client_address else '127.0.0.1'

    def is_admin_request(self):
        auth_header = self.headers.get('Authorization', '')
        token = ''
        if auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ', 1)[1].strip()
        if not token:
            token = self.headers.get('X-Admin-Token', '').strip()
        if not token:
            parsed = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed.query)
            token = query_params.get('admin_token', [''])[0].strip()

        if not token:
            return False
        
        now = time.time()
        info = ADMIN_TOKENS.get(token)
        if info:
            if now < info.get('expires', 0):
                return True
            else:
                ADMIN_TOKENS.pop(token, None)
        return False

    def get_authenticated_user(self):
        auth_header = self.headers.get('Authorization', '')
        token = ''
        if auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ', 1)[1].strip()
        if not token:
            parsed = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed.query)
            token = query_params.get('token', [''])[0].strip()
        if not token:
            return None
        db = load_db()
        return next((u for u in db.get('users', []) if u.get('token') == token), None)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        content = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def read_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode('utf-8', errors='ignore')
        try:
            return json.loads(body)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        if not path:
            path = '/'
        query_params = urllib.parse.parse_qs(parsed.query)

        if path == '/api/health':
            return self.send_json(200, {'status': 'healthy', 'service': 'Layer Studios API', 'timestamp': time.time()})

        if path == '/api/stripe-config':
            return self.send_json(200, {'publishableKey': STRIPE_PUBLISHABLE_KEY if STRIPE_AVAILABLE else '', 'available': STRIPE_AVAILABLE})

        if path == '/api/quotes':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            db = load_db()
            return self.send_json(200, db.get('quotes', []))

        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1].strip()
            db = load_db()
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == quote_id.lower()), None)
            if not quote:
                return self.send_json(404, {'error': 'Quote not found'})
            is_admin = self.is_admin_request()
            auth_user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()
            is_owner = (auth_user and auth_user.get('email', '').lower() == quote.get('email', '').lower()) or \
                       (req_email and req_email == quote.get('email', '').lower())
            if is_admin or is_owner:
                return self.send_json(200, quote)
            else:
                return self.send_json(200, {'id': quote.get('id'), 'projectName': quote.get('projectName'), 'material': quote.get('material'), 'quantity': quote.get('quantity'), 'status': quote.get('status'), 'paymentStatus': quote.get('paymentStatus'), 'createdAt': quote.get('createdAt'), 'isConfidential': quote.get('isConfidential', False)})

        if path == '/api/orders':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            db = load_db()
            return self.send_json(200, db.get('orders', []))

        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[1].strip()
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == order_id.lower()), None)
            if not order:
                return self.send_json(404, {'error': 'Order not found'})
            is_admin = self.is_admin_request()
            auth_user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()
            is_owner = (auth_user and auth_user.get('email', '').lower() == order.get('email', '').lower()) or \
                       (req_email and req_email == order.get('email', '').lower())
            if is_admin or is_owner:
                return self.send_json(200, order)
            else:
                return self.send_json(200, {'id': order.get('id'), 'status': order.get('status'), 'carrier': order.get('carrier'), 'trackingNumber': order.get('trackingNumber'), 'paymentStatus': order.get('paymentStatus'), 'createdAt': order.get('createdAt'), 'estimatedCompletion': order.get('estimatedCompletion')})

        if path.startswith('/api/track/'):
            track_id = path.split('/api/track/')[1].strip()
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == track_id.lower() or o.get('quoteId', '').lower() == track_id.lower()), None)
            if order:
                safe_order = {'id': order.get('id'), 'quoteId': order.get('quoteId'), 'status': order.get('status'), 'carrier': order.get('carrier'), 'trackingNumber': order.get('trackingNumber'), 'paymentStatus': order.get('paymentStatus'), 'paymentMethod': order.get('paymentMethod'), 'total': order.get('total'), 'createdAt': order.get('createdAt'), 'estimatedCompletion': order.get('estimatedCompletion'), 'statusHistory': order.get('statusHistory', []), 'items': [{'title': i.get('title'), 'material': i.get('material'), 'quantity': i.get('quantity')} for i in order.get('items', [])]}
                return self.send_json(200, {'type': 'order', 'data': safe_order})
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == track_id.lower()), None)
            if quote:
                safe_quote = {'id': quote.get('id'), 'projectName': quote.get('projectName'), 'material': quote.get('material'), 'quantity': quote.get('quantity'), 'status': quote.get('status'), 'paymentStatus': quote.get('paymentStatus'), 'paymentMethod': quote.get('paymentMethod'), 'total': quote.get('pricing', {}).get('finalPrice', 0), 'createdAt': quote.get('createdAt'), 'files': [{'name': f.get('name'), 'size': f.get('size')} for f in quote.get('files', [])]}
                return self.send_json(200, {'type': 'quote', 'data': safe_quote})
            return self.send_json(404, {'error': 'No matching quote or order found for reference: ' + track_id})

        if path == '/api/products':
            db = load_db()
            return self.send_json(200, db.get('products', []))
        if path == '/api/materials':
            db = load_db()
            return self.send_json(200, db.get('materials', []))
        if path == '/api/faqs':
            db = load_db()
            return self.send_json(200, db.get('faqs', []))
        if path == '/api/stats':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            db = load_db()
            quotes = db.get('quotes', [])
            orders = db.get('orders', [])
            total_revenue = sum(o.get('total', 0) for o in orders if o.get('paymentStatus') == 'Paid')
            active_prints = len([o for o in orders if o.get('status') == 'Printing']) + len([q for q in quotes if q.get('status') == 'Printing'])
            return self.send_json(200, {'totalRevenue': total_revenue, 'totalOrders': len(orders), 'totalQuotes': len(quotes), 'activePrints': active_prints})
        if path == '/api/settings':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            db = load_db()
            return self.send_json(200, db.get('settings', {}))
        if path == '/api/auth/me':
            user = self.get_authenticated_user()
            if user:
                return self.send_json(200, {'success': True, 'user': {'id': user.get('id'), 'name': user.get('name'), 'email': user.get('email'), 'phone': user.get('phone', '')}})
            return self.send_json(401, {'error': 'Unauthorized / Session expired'})
        if path == '/api/customer/orders':
            user = self.get_authenticated_user()
            is_admin = self.is_admin_request()
            email = query_params.get('email', [''])[0].strip().lower()
            if not is_admin and not user:
                return self.send_json(401, {'error': 'Authentication required to view account orders.'})
            target_email = user.get('email', '').lower() if user else email
            db = load_db()
            quotes = [q for q in db.get('quotes', []) if q.get('email', '').lower() == target_email]
            orders = [o for o in db.get('orders', []) if o.get('email', '').lower() == target_email]
            return self.send_json(200, {'success': True, 'email': target_email, 'quotes': quotes, 'orders': orders})
        if path == '/api/customer/notifications':
            user = self.get_authenticated_user()
            email = user.get('email', '').lower() if user else query_params.get('email', [''])[0].strip().lower()
            order_ids_raw = query_params.get('orderIds', [''])[0]
            order_ids = [oid.strip().lower() for oid in order_ids_raw.split(',') if oid.strip()]
            db = load_db()
            all_notifs = db.get('notifications', [])
            matched = [n for n in all_notifs if (email and n.get('email', '').lower() == email) or (order_ids and n.get('orderId', '').lower() in order_ids)]
            return self.send_json(200, {'success': True, 'notifications': matched[:30]})
        if path == '/api/verify-payment':
            order_id = query_params.get('id', [''])[0].strip()
            session_id = query_params.get('sessionId', [''])[0].strip()
            if not order_id or not session_id:
                return self.send_json(400, {'error': 'Missing id or sessionId parameter'})
            if not STRIPE_SECRET_KEY:
                return self.send_json(500, {'error': 'Stripe not configured on server'})
            try:
                req = urllib.request.Request(f'https://api.stripe.com/v1/checkout/sessions/{session_id}')
                req.add_header('Authorization', f'Bearer {STRIPE_SECRET_KEY}')
                with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=15) as res:
                    session_obj = json.loads(res.read().decode('utf-8'))
                if session_obj.get('payment_status') == 'paid':
                    db = load_db()
                    order_type = session_obj.get('metadata', {}).get('order_type', 'order')
                    updated = False
                    target = db.get('quotes' if order_type == 'quote' else 'orders', [])
                    for entry in target:
                        if entry.get('id') == order_id:
                            entry.update({'paymentStatus': 'Paid', 'status': 'Preparing', 'paymentMethod': 'Stripe (Apple/Google/Card)'})
                            updated = True
                            break
                    if updated:
                        save_db(db)
                        add_notification(db, order_id, f'Pagamento Confirmado ({order_id})', 'O seu pagamento foi verificado com sucesso via Stripe.', 'Preparing')
                    return self.send_json(200, {'success': True, 'paid': True, 'orderId': order_id})
                return self.send_json(200, {'success': False, 'paid': False})
            except Exception as err:
                return self.send_json(500, {'error': f'Verification failed: {err}'})
        if path.startswith('/api/files/') or path == '/api/download-file':
            filename = path.split('/api/files/')[1] if path.startswith('/api/files/') else query_params.get('file', [''])[0]
            filename = os.path.basename(filename).strip()
            target_file = os.path.join(UPLOADS_DIR, filename)
            if not os.path.exists(target_file) or not os.path.isfile(target_file):
                return self.send_json(404, {'error': 'File not found'})
            is_admin = self.is_admin_request()
            user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()
            is_authorized = is_admin
            if not is_authorized:
                db = load_db()
                for q in db.get('quotes', []):
                    has_file = any(f.get('url', '').endswith(filename) or f.get('name') == filename for f in q.get('files', []))
                    if has_file and ((user and user.get('email', '').lower() == q.get('email', '').lower()) or req_email == q.get('email', '').lower()):
                        is_authorized = True
                        break
            if not is_authorized:
                return self.send_json(403, {'error': 'Unauthorized access'})
            with open(target_file, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(target_file)[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(content)
            return
        if path.startswith('/uploads/'):
            return self.send_json(403, {'error': 'Direct upload browsing disabled.'})
        
        # Default web serving
        filepath = os.path.join(STATIC_DIR, 'index.html') if (path == '/' or path == '/index.html') else os.path.join(STATIC_DIR, path.lstrip('/'))
        if os.path.isfile(filepath):
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8' if filepath.endswith('.html') else 'application/octet-stream')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return self.send_json(404, {'error': 'File not found'})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        ip = self.get_client_ip()

        # Admin: Login
        if path == '/api/admin/login':
            if not check_rate_limit(ip, max_attempts=5, window_seconds=300):
                return self.send_json(429, {'error': 'Too many failed login attempts. Please wait 5 minutes.'})

            payload = self.read_json_body()
            password = payload.get('password', '').strip()

            if hmac.compare_digest(password, ADMIN_PASSWORD):
                clear_rate_limit(ip)
                token = f'adm_{secrets.token_hex(24)}'
                now = time.time()
                ADMIN_TOKENS[token] = {'created': now, 'expires': now + 86400}  # 24 hours
                return self.send_json(200, {'success': True, 'token': token})
            else:
                record_failed_attempt(ip)
                return self.send_json(401, {'error': 'Invalid administrative credentials.'})

        # Admin: Logout
        if path == '/api/admin/logout':
            auth_header = self.headers.get('Authorization', '')
            token = auth_header.split('Bearer ', 1)[1].strip() if auth_header.startswith('Bearer ') else ''
            if token:
                ADMIN_TOKENS.pop(token, None)
            return self.send_json(200, {'success': True})

        # Customer: Register
        if path == '/api/auth/register':
            if not check_rate_limit(ip, max_attempts=10, window_seconds=300):
                return self.send_json(429, {'error': 'Demasiadas tentativas de registo. Por favor tente mais tarde.'})

            payload = self.read_json_body()
            name = payload.get('name', '').strip()
            email = payload.get('email', '').strip().lower()
            password = payload.get('password', '').strip()
            phone = payload.get('phone', '').strip()

            if not email or '@' not in email:
                return self.send_json(400, {'error': 'Por favor insira um email válido.'})
            if not password or len(password) < 8:
                return self.send_json(400, {'error': 'A palavra-passe deve conter no mínimo 8 caracteres para proteção da sua conta.'})

            db = load_db()
            users = db.setdefault('users', [])
            if any(u.get('email', '').lower() == email for u in users):
                return self.send_json(400, {'error': 'Já existe uma conta com este email. Por favor inicie sessão.'})

            pwd_hash, salt = hash_password(password)
            token = f'usr_{secrets.token_hex(24)}'
            new_user = {
                'id': f'usr_{secrets.token_hex(6)}',
                'name': name or 'Cliente',
                'email': email,
                'phone': phone,
                'passwordHash': pwd_hash,
                'salt': salt,
                'token': token,
                'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'lastLogin': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            }
            users.append(new_user)
            save_db(db)

            return self.send_json(201, {
                'success': True,
                'token': token,
                'user': {'id': new_user['id'], 'name': new_user['name'], 'email': new_user['email'], 'phone': new_user['phone']}
            })

        # Customer: Login
        if path == '/api/auth/login':
            if not check_rate_limit(ip, max_attempts=5, window_seconds=300):
                return self.send_json(429, {'error': 'Demasiadas tentativas incorretas. Por favor aguarde 5 minutos.'})

            payload = self.read_json_body()
            email = payload.get('email', '').strip().lower()
            password = payload.get('password', '').strip()

            db = load_db()
            users = db.setdefault('users', [])
            user = next((u for u in users if u.get('email', '').lower() == email), None)

            if not user or not verify_password(password, user.get('passwordHash', ''), user.get('salt')):
                record_failed_attempt(ip)
                return self.send_json(401, {'error': 'Email ou palavra-passe incorretos.'})

            clear_rate_limit(ip)
            token = f'usr_{secrets.token_hex(24)}'
            user['token'] = token
            user['lastLogin'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
            
            if not user.get('salt'):
                pwd_hash, salt = hash_password(password)
                user['passwordHash'] = pwd_hash
                user['salt'] = salt

            save_db(db)

            return self.send_json(200, {
                'success': True,
                'token': token,
                'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user.get('phone', '')}
            })

        # Guest: Secure Single Order / Quote Lookup
        if path == '/api/auth/guest':
            payload = self.read_json_body()
            query = payload.get('query', '').strip().lower()
            if not query:
                return self.send_json(400, {'error': 'Por favor insira a referência da encomenda (LS-XXXX / ORD-XXXX).'})

            db = load_db()
            quotes = db.get('quotes', [])
            orders = db.get('orders', [])

            matched_quotes = []
            matched_orders = []

            if query.startswith('ls-') or query.startswith('ls'):
                matched_quotes = [q for q in quotes if q.get('id', '').lower() == query]
            elif query.startswith('ord-') or query.startswith('ord'):
                matched_orders = [o for o in orders if o.get('id', '').lower() == query or o.get('quoteId', '').lower() == query]
            elif '@' in query:
                matched_quotes = [q for q in quotes if q.get('email', '').lower() == query]
                matched_orders = [o for o in orders if o.get('email', '').lower() == query]

            if not matched_quotes and not matched_orders:
                return self.send_json(404, {'error': 'Nenhuma encomenda ou orçamento encontrado com essa referência.'})

            return self.send_json(200, {
                'success': True,
                'isGuest': True,
                'query': query,
                'quotes': matched_quotes,
                'orders': matched_orders
            })

        # Notifications: Mark Read
        if path == '/api/customer/notifications/read':
            payload = self.read_json_body()
            notif_id = payload.get('id')
            user = self.get_authenticated_user()
            email = user.get('email', '').lower() if user else payload.get('email', '').strip().lower()

            db = load_db()
            for n in db.get('notifications', []):
                if notif_id and n.get('id') == notif_id:
                    n['read'] = True
                elif email and n.get('email', '').lower() == email:
                    n['read'] = True
            save_db(db)
            return self.send_json(200, {'success': True})

        # Create Quote Request
        if path == '/api/quotes':
            payload = self.read_json_body()
            db = load_db()
            quotes = db.setdefault('quotes', [])

            quote_id = f'LS-{int(time.time()) % 10000 + 1000}'
            new_quote = {
                'id': quote_id,
                'customerName': payload.get('customerName', 'Valued Client'),
                'email': payload.get('email', ''),
                'phone': payload.get('phone', ''),
                'company': payload.get('company', ''),
                'projectName': payload.get('projectName', 'Custom 3D Print Request'),
                'description': payload.get('description', ''),
                'material': payload.get('material', 'PETG'),
                'color': payload.get('color', 'Black'),
                'quality': payload.get('quality', 'Standard (0.20mm)'),
                'strength': payload.get('strength', 'Standard (30% Infill)'),
                'quantity': int(payload.get('quantity', 1)),
                'files': payload.get('files', []),
                'hasModel': bool(payload.get('hasModel', True)),
                'turnaround': payload.get('turnaround', 'Standard (3-5 Days)'),
                'paymentStatus': 'Pending',
                'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'deadline': payload.get('deadline', ''),
                'shippingCountry': payload.get('shippingCountry', 'Portugal'),
                'isConfidential': bool(payload.get('isConfidential', False)),
                'customerNotes': payload.get('customerNotes', ''),
                'status': 'Quote Requested',
                'pricing': payload.get('pricing', {
                    'materialCost': 6.00,
                    'machineCost': 14.00,
                    'designCost': 0.00 if payload.get('hasModel', True) else 25.00,
                    'shippingCost': 4.50,
                    'margin': 12.00,
                    'subtotal': 36.50,
                    'discount': 0.00,
                    'finalPrice': 36.50
                }),
                'internalNotes': 'Initial quote request received via website.',
                'adminNotes': 'Pending technician file inspection.'
            }
            quotes.insert(0, new_quote)
            save_db(db)
            add_notification(db, quote_id, f'Novo Pedido de Orçamento ({quote_id})', f'O seu pedido de orçamento para "{new_quote["projectName"]}" foi registado com sucesso.', 'Quote Requested', new_quote['email'])
            return self.send_json(201, {'success': True, 'quote': new_quote, 'quoteId': quote_id})

        # Create Order / Checkout
        if path == '/api/orders':
            payload = self.read_json_body()
            db = load_db()
            orders = db.setdefault('orders', [])

            order_id = f'ORD-{int(time.time()) % 10000 + 8800}'
            new_order = {
                'id': order_id,
                'quoteId': payload.get('quoteId', ''),
                'customerName': payload.get('customerName', 'Store Customer'),
                'email': payload.get('email', ''),
                'phone': payload.get('phone', ''),
                'shippingAddress': payload.get('shippingAddress', {}),
                'items': payload.get('items', []),
                'subtotal': float(payload.get('subtotal', 0)),
                'shippingCost': float(payload.get('shippingCost', 4.50)),
                'discount': float(payload.get('discount', 0)),
                'total': float(payload.get('total', 0)),
                'paymentMethod': payload.get('paymentMethod', 'MB WAY'),
                'paymentStatus': 'Pending',  # Server forces initial Pending state
                'status': 'Preparing',
                'carrier': 'CTT Expresso',
                'trackingNumber': 'GENERATING',
                'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'estimatedCompletion': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 86400 * 3)),
                'statusHistory': [
                    {'stage': 'Order Placed', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'note': 'Order registered via checkout'},
                    {'stage': 'Preparing', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'note': 'Awaiting payment verification'}
                ]
            }
            orders.insert(0, new_order)
            save_db(db)
            add_notification(db, order_id, f'Nova Encomenda Criada ({order_id})', f'A sua encomenda {order_id} foi registada. Conclua o pagamento para início da impressão.', 'Preparing', new_order['email'])
            return self.send_json(201, {'success': True, 'order': new_order, 'orderId': order_id})

        # File Upload (Multipart Form Data)
        if path == '/api/upload-file':
            try:
                content_type = self.headers.get('Content-Type', '')
                if 'multipart/form-data' not in content_type:
                    return self.send_json(400, {'error': 'Expected multipart/form-data'})

                boundary = content_type.split('boundary=')[-1].strip()
                content_length = int(self.headers.get('Content-Length', 0))
                
                if content_length > 50 * 1024 * 1024:
                    return self.send_json(400, {'error': 'File size exceeds maximum 50MB limit'})

                body = self.rfile.read(content_length)
                parts = body.split(('--' + boundary).encode())
                quote_id = ''
                file_data = b''
                file_name = 'model.stl'

                for part in parts:
                    if b'name="quoteId"' in part:
                        val = part.split(b'\r\n\r\n', 1)
                        if len(val) > 1:
                            quote_id = val[1].strip(b'\r\n-').decode('utf-8', errors='ignore').strip()
                    elif b'name="file"' in part:
                        header_section = part.split(b'\r\n\r\n', 1)
                        if len(header_section) > 1:
                            file_data = header_section[1].rstrip(b'\r\n-')
                            header_text = header_section[0].decode('utf-8', errors='ignore')
                            if 'filename="' in header_text:
                                file_name = header_text.split('filename="')[1].split('"')[0]

                if not quote_id:
                    quote_id = f'LS-{int(time.time()) % 10000}'

                clean_name = os.path.basename(file_name)
                safe_name = ''.join(c for c in clean_name if c.isalnum() or c in '._-')
                if not safe_name:
                    safe_name = 'model.stl'
                
                disk_filename = f'{quote_id}_{safe_name}'.replace(' ', '_')
                save_path = os.path.join(UPLOADS_DIR, disk_filename)

                with open(save_path, 'wb') as f:
                    f.write(file_data)

                db = load_db()
                for q in db.get('quotes', []):
                    if q.get('id') == quote_id:
                        for fentry in q.get('files', []):
                            if fentry.get('name', '') == file_name:
                                fentry['url'] = f'/api/files/{disk_filename}'
                                break
                        else:
                            q.setdefault('files', []).append({
                                'name': file_name,
                                'size': f'{round(len(file_data) / (1024*1024), 2)} MB',
                                'url': f'/api/files/{disk_filename}'
                            })
                        save_db(db)
                        break

                return self.send_json(200, {
                    'success': True,
                    'url': f'/api/files/{disk_filename}',
                    'filename': disk_filename,
                    'sizeMB': round(len(file_data) / (1024 * 1024), 2)
                })
            except Exception as e:
                print(f'Multipart upload error: {e}')
                return self.send_json(400, {'error': f'Upload failed: {e}'})

        # Contact Form Submission
        if path == '/api/contact':
            return self.send_json(200, {
                'success': True,
                'message': 'Thanks for reaching out! A Layer Studios engineer will contact you within 24 hours.'
            })

        # Promo Code Validation
        if path == '/api/validate-promo':
            payload = self.read_json_body()
            code_input = payload.get('code', '').strip().upper()
            db = load_db()
            promo = next((p for p in db.get('promoCodes', []) if p.get('code') == code_input), None)
            if promo:
                return self.send_json(200, {'valid': True, 'discountPercent': promo.get('discountPercent', 10), 'description': promo.get('description', '')})
            return self.send_json(404, {'valid': False, 'error': 'Invalid or expired promo code'})

        # Stripe Checkout Session Creation
        if path == '/api/create-checkout-session':
            if not STRIPE_AVAILABLE:
                return self.send_json(500, {'error': 'Stripe credentials are not configured on this server'})

            payload = self.read_json_body()
            amount_eur = float(payload.get('amount', 0))
            order_id = payload.get('orderId', '')
            order_type = payload.get('type', 'order')
            title = payload.get('title', 'Layer Studios 3D Printing')
            customer_email = payload.get('email', '')

            if amount_eur <= 0:
                return self.send_json(400, {'error': 'Invalid amount'})

            host = self.headers.get('Host', 'localhost:8080')
            protocol = 'https' if 'render.com' in host or 'onrender.com' in host else 'http'
            base_url = f'{protocol}://{host}'

            try:
                cents = int(round(amount_eur * 100))
                form_data = {
                    'payment_method_types[0]': 'card',
                    'line_items[0][price_data][currency]': 'eur',
                    'line_items[0][price_data][product_data][name]': title,
                    'line_items[0][price_data][product_data][description]': f'Reference: {order_id} — Layer Studios Portugal',
                    'line_items[0][price_data][unit_amount]': str(cents),
                    'line_items[0][price_data][quantity]': '1',
                    'mode': 'payment',
                    'success_url': f'{base_url}/track?id={order_id}&paid=true&session_id={{CHECKOUT_SESSION_ID}}',
                    'cancel_url': f'{base_url}/track?id={order_id}&cancelled=true',
                    'metadata[order_id]': order_id,
                    'metadata[order_type]': order_type,
                    'payment_intent_data[metadata][order_id]': order_id,
                    'payment_intent_data[metadata][order_type]': order_type,
                }
                if customer_email:
                    form_data['customer_email'] = customer_email

                encoded_data = urllib.parse.urlencode(form_data).encode('utf-8')
                req = urllib.request.Request('https://api.stripe.com/v1/checkout/sessions', data=encoded_data, method='POST')
                req.add_header('Authorization', f'Bearer {STRIPE_SECRET_KEY}')
                req.add_header('Content-Type', 'application/x-www-form-urlencoded')

                ssl_ctx = ssl.create_default_context()
                with urllib.request.urlopen(req, context=ssl_ctx, timeout=20) as response:
                    session = json.loads(response.read().decode('utf-8'))

                session_id = session.get('id', '')
                session_url = session.get('url', '')

                db = load_db()
                if order_type == 'quote':
                    for q in db.get('quotes', []):
                        if q.get('id') == order_id:
                            q['paymentStatus'] = 'Processing'
                            q['stripeSessionId'] = session_id
                            break
                else:
                    for o in db.get('orders', []):
                        if o.get('id') == order_id:
                            o['paymentStatus'] = 'Processing'
                            o['stripeSessionId'] = session_id
                            break
                save_db(db)

                return self.send_json(200, {
                    'success': True,
                    'sessionId': session_id,
                    'url': session_url
                })
            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                print(f'Stripe HTTP error: {err_body}')
                return self.send_json(400, {'error': f'Stripe API error: {err_body}'})
            except Exception as e:
                print(f'Stripe session error: {e}')
                return self.send_json(500, {'error': f'Payment session failed: {str(e)}'})

        # Stripe Webhook with Cryptographic Signature Verification
        if path == '/api/stripe-webhook':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                
                if STRIPE_WEBHOOK_SECRET:
                    sig_header = self.headers.get('Stripe-Signature', '')
                    if not sig_header:
                        return self.send_json(400, {'error': 'Missing Stripe-Signature header'})
                    
                    sig_dict = {}
                    for item in sig_header.split(','):
                        if '=' in item:
                            k, v = item.split('=', 1)
                            sig_dict.setdefault(k.strip(), []).append(v.strip())
                    
                    t = sig_dict.get('t', [''])[0]
                    v1_sigs = sig_dict.get('v1', [])
                    signed_payload = f'{t}.'.encode('utf-8') + body
                    expected_sig = hmac.new(STRIPE_WEBHOOK_SECRET.encode('utf-8'), signed_payload, hashlib.sha256).hexdigest()
                    
                    if not any(hmac.compare_digest(expected_sig, s) for s in v1_sigs):
                        return self.send_json(400, {'error': 'Invalid webhook signature'})

                event = json.loads(body.decode('utf-8'))
                if event.get('type') == 'checkout.session.completed':
                    session_data = event.get('data', {}).get('object', {})
                    metadata = session_data.get('metadata', {})
                    order_id = metadata.get('order_id', '')
                    order_type = metadata.get('order_type', 'order')

                    if order_id:
                        db = load_db()
                        if order_type == 'quote':
                            for q in db.get('quotes', []):
                                if q.get('id') == order_id:
                                    q['paymentStatus'] = 'Paid'
                                    q['paymentMethod'] = 'Stripe (Card / Apple Pay / Google Pay)'
                                    q['status'] = 'Preparing'
                                    break
                        else:
                            for o in db.get('orders', []):
                                if o.get('id') == order_id:
                                    o['paymentStatus'] = 'Paid'
                                    o['paymentMethod'] = 'Stripe (Card / Apple Pay / Google Pay)'
                                    o['status'] = 'Preparing'
                                    break
                        save_db(db)
                        add_notification(db, order_id, f'Pagamento Confirmado ({order_id})', f'O seu pagamento foi recebido e a produção foi iniciada.', 'Preparing')
                        print(f'[Stripe Webhook] Verified payment confirmed for {order_id}')

                return self.send_json(200, {'received': True})
            except Exception as e:
                print(f'Stripe webhook error: {e}')
                return self.send_json(400, {'error': str(e)})

        return self.send_json(404, {'error': 'Endpoint not found'})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        if not self.is_admin_request():
            return self.send_json(403, {'error': 'Unauthorized. Admin authorization required to modify orders or quotes.'})

        if path == '/api/quotes' or path.startswith('/api/quotes/'):
            payload = self.read_json_body()
            quote_id = path.split('/api/quotes/')[1] if path.startswith('/api/quotes/') else payload.get('id', '')
            db = load_db()
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == quote_id.lower()), None)
            if not quote:
                return self.send_json(404, {'error': 'Quote not found'})

            old_status = quote.get('status')
            for key, val in payload.items():
                if key != 'id':
                    quote[key] = val

            new_status = payload.get('status')
            if new_status and new_status != old_status:
                add_notification(db, quote_id, f'Orçamento {quote_id}: {new_status}', f'O estado do seu orçamento {quote_id} foi atualizado para: {new_status}.', new_status, quote.get('email', ''))

            save_db(db)
            return self.send_json(200, {'success': True, 'quote': quote})

        if path == '/api/orders' or path.startswith('/api/orders/'):
            payload = self.read_json_body()
            order_id = path.split('/api/orders/')[1] if path.startswith('/api/orders/') else payload.get('id', '')
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == order_id.lower()), None)
            if not order:
                return self.send_json(404, {'error': 'Order not found'})

            old_status = order.get('status')
            for key, val in payload.items():
                if key != 'id':
                    order[key] = val

            new_status = payload.get('status')
            if new_status and new_status != old_status:
                add_notification(db, order_id, f'Encomenda {order_id}: {new_status}', f'O estado da sua encomenda {order_id} avançou para: {new_status}.', new_status, order.get('email', ''))

            save_db(db)
            return self.send_json(200, {'success': True, 'order': order})

        return self.send_json(404, {'error': 'Endpoint not found'})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        if not self.is_admin_request():
            return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})

        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1]
            db = load_db()
            initial_len = len(db.get('quotes', []))
            db['quotes'] = [q for q in db.get('quotes', []) if q.get('id', '').lower() != quote_id.lower()]
            if len(db['quotes']) < initial_len:
                save_db(db)
                return self.send_json(200, {'success': True, 'deleted': quote_id})
            return self.send_json(404, {'error': 'Quote not found'})

        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[1]
            db = load_db()
            initial_len = len(db.get('orders', []))
            db['orders'] = [o for o in db.get('orders', []) if o.get('id', '').lower() != order_id.lower()]
            if len(db['orders']) < initial_len:
                save_db(db)
                return self.send_json(200, {'success': True, 'deleted': order_id})
            return self.send_json(404, {'error': 'Order not found'})

        return self.send_json(404, {'error': 'Endpoint not found'})

def run_server(port=8080):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, LayerStudiosHandler)
    print(f'Layer Studios Secure Server running at http://localhost:{port}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        print('Running server self-test...')
        db = load_db()
        assert 'products' in db and len(db['products']) > 0, 'Products database missing'
        assert 'materials' in db and len(db['materials']) > 0, 'Materials database missing'
        print('All database checks passed!')
        sys.exit(0)
    elif len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
