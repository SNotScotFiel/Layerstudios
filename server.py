import os
import sys
import json
import time
import urllib.parse
import urllib.request
import mimetypes
import uuid
import base64
import ssl
import hashlib
import hmac
import secrets
from http.server import HTTPServer, ThreadingHTTPServer, SimpleHTTPRequestHandler
from database import db, DatabaseManager

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

# Domain and Environment Configuration
BASE_URL = os.environ.get('BASE_URL', 'https://layerstudios.pt').rstrip('/')

# Stripe Environment Configuration (No hardcoded secrets)
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '').strip()
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '').strip()
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '').strip()
STRIPE_AVAILABLE = bool(STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY)
print(f'[Stripe] Native payment gateway initialized (Active: {STRIPE_AVAILABLE})')
print(f'[Config] Canonical Base URL: {BASE_URL}')

# Server-Side Admin Authentication Configuration
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'cavalao123').strip()
ADMIN_TOKENS = {}  # token -> {'created': timestamp, 'expires': timestamp}

# Rate Limiting Store: ip -> list of failed attempt timestamps
FAILED_LOGIN_ATTEMPTS = {}

DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
STATIC_DIR = os.path.join(BASE_DIR, 'static')

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
    legacy_hash = hashlib.sha256((password + 'ls_salt_2026').encode()).hexdigest()
    return hmac.compare_digest(legacy_hash, stored_hash)

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

        return db.get_user_by_token(token)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, status_code, data):
        content = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(content)))
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
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

        # 1. Health check
        if path == '/api/health':
            return self.send_json(200, {
                'status': 'healthy',
                'service': 'Layer Studios Production Engine',
                'database': 'PostgreSQL' if db.is_postgres else 'SQLite Relational',
                'timestamp': time.time()
            })

        # 2. Stripe Config
        if path == '/api/stripe-config':
            return self.send_json(200, {
                'publishableKey': STRIPE_PUBLISHABLE_KEY if STRIPE_AVAILABLE else '',
                'available': STRIPE_AVAILABLE
            })

        # 3. List All Quotes (Admin Only)
        if path == '/api/quotes':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            quotes = db.get_quotes()
            # Normalize field names for UI
            for q in quotes:
                q['customerName'] = q.get('customer_name')
                q['projectName'] = q.get('project_name')
                q['paymentStatus'] = q.get('payment_status')
                q['pricing'] = {
                    'materialCost': float(q.get('estimated_material_cost', 0)),
                    'machineCost': float(q.get('estimated_machine_cost', 0)),
                    'designCost': float(q.get('design_cost', 0)),
                    'shippingCost': float(q.get('shipping_cost', 4.5)),
                    'discount': float(q.get('discount', 0)),
                    'subtotal': float(q.get('subtotal', 0)),
                    'finalPrice': float(q.get('final_price', 0))
                }
            return self.send_json(200, quotes)

        # 4. Single Quote Lookup
        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1].strip()
            quote = db.get_quote_by_id_or_ref(quote_id)
            if not quote:
                return self.send_json(404, {'error': 'Quote not found'})

            is_admin = self.is_admin_request()
            auth_user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()

            is_owner = (auth_user and auth_user.get('email', '').lower() == quote.get('guest_email', '').lower()) or \
                       (req_email and req_email == quote.get('guest_email', '').lower())

            if is_admin or is_owner:
                quote['customerName'] = quote.get('customer_name')
                quote['projectName'] = quote.get('project_name')
                quote['paymentStatus'] = quote.get('payment_status')
                quote['pricing'] = {
                    'materialCost': float(quote.get('estimated_material_cost', 0)),
                    'machineCost': float(quote.get('estimated_machine_cost', 0)),
                    'designCost': float(quote.get('design_cost', 0)),
                    'shippingCost': float(quote.get('shipping_cost', 4.5)),
                    'discount': float(quote.get('discount', 0)),
                    'subtotal': float(quote.get('subtotal', 0)),
                    'finalPrice': float(quote.get('final_price', 0))
                }
                return self.send_json(200, quote)
            else:
                return self.send_json(200, {
                    'id': quote.get('id'),
                    'publicReference': quote.get('public_reference'),
                    'projectName': quote.get('project_name'),
                    'material': quote.get('material'),
                    'quantity': quote.get('quantity'),
                    'status': quote.get('status'),
                    'paymentStatus': quote.get('payment_status'),
                    'createdAt': quote.get('created_at'),
                    'isConfidential': bool(quote.get('is_confidential'))
                })

        # 5. List All Orders (Admin Only)
        if path == '/api/orders':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            orders = db.get_orders()
            for o in orders:
                o['customerName'] = o.get('customer_name')
                o['quoteId'] = o.get('quote_id')
                o['total'] = float(o.get('total', 0))
                o['shippingAddress'] = {'city': o.get('city'), 'country': o.get('country'), 'address': o.get('shipping_address')}
            return self.send_json(200, orders)

        # 6. Single Order Lookup
        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[1].strip()
            order = db.get_order_by_id_or_ref(order_id)
            if not order:
                return self.send_json(404, {'error': 'Order not found'})

            is_admin = self.is_admin_request()
            auth_user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()

            is_owner = (auth_user and auth_user.get('email', '').lower() == order.get('email', '').lower()) or \
                       (req_email and req_email == order.get('email', '').lower())

            if is_admin or is_owner:
                order['customerName'] = order.get('customer_name')
                order['quoteId'] = order.get('quote_id')
                order['total'] = float(order.get('total', 0))
                order['shippingAddress'] = {'city': order.get('city'), 'country': order.get('country'), 'address': order.get('shipping_address')}
                return self.send_json(200, order)
            else:
                return self.send_json(200, {
                    'id': order.get('id'),
                    'publicReference': order.get('public_reference'),
                    'status': order.get('status'),
                    'carrier': order.get('carrier'),
                    'trackingNumber': order.get('tracking_number'),
                    'paymentStatus': order.get('payment_status'),
                    'createdAt': order.get('created_at'),
                    'estimatedCompletion': order.get('estimated_completion')
                })

        # 7. Public Tracking Pipeline
        if path.startswith('/api/track/'):
            track_id = path.split('/api/track/')[1].strip()
            order = db.get_order_by_id_or_ref(track_id)
            if order:
                safe_order = {
                    'id': order.get('public_reference') or order.get('id'),
                    'quoteId': order.get('quote_id'),
                    'status': order.get('status'),
                    'carrier': order.get('carrier'),
                    'trackingNumber': order.get('tracking_number'),
                    'paymentStatus': order.get('payment_status'),
                    'paymentMethod': order.get('payment_method'),
                    'total': float(order.get('total', 0)),
                    'createdAt': order.get('created_at'),
                    'estimatedCompletion': order.get('estimated_completion'),
                    'items': [{'title': i.get('product_name'), 'material': i.get('material'), 'quantity': i.get('quantity')} for i in order.get('items', [])]
                }
                return self.send_json(200, {'type': 'order', 'data': safe_order})

            quote = db.get_quote_by_id_or_ref(track_id)
            if quote:
                safe_quote = {
                    'id': quote.get('public_reference') or quote.get('id'),
                    'projectName': quote.get('project_name'),
                    'material': quote.get('material'),
                    'quantity': quote.get('quantity'),
                    'status': quote.get('status'),
                    'paymentStatus': quote.get('payment_status'),
                    'paymentMethod': quote.get('payment_method'),
                    'total': float(quote.get('final_price', 0)),
                    'createdAt': quote.get('created_at'),
                    'files': [{'name': f.get('original_filename'), 'size': f.get('file_size')} for f in quote.get('files', [])]
                }
                return self.send_json(200, {'type': 'quote', 'data': safe_quote})

            return self.send_json(404, {'error': f'No matching quote or order found for reference: {track_id}'})

        # 8. Products, Materials, Portfolio, FAQs
        if path == '/api/products':
            return self.send_json(200, db.get_products())

        if path == '/api/materials':
            return self.send_json(200, db.get_materials())

        if path == '/api/portfolio' or path == '/api/faqs':
            # Seed structures if needed
            if os.path.exists(os.path.join(DATA_DIR, 'database.json')):
                with open(os.path.join(DATA_DIR, 'database.json'), 'r', encoding='utf-8') as f:
                    legacy = json.load(f)
                    return self.send_json(200, legacy.get(path.lstrip('/api/'), []))
            return self.send_json(200, [])

        # 9. Admin Stats & Settings
        if path == '/api/stats':
            if not self.is_admin_request():
                return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})
            return self.send_json(200, db.get_admin_stats())

        # 10. Auth Profile Endpoint
        if path == '/api/auth/me':
            user = self.get_authenticated_user()
            if user:
                return self.send_json(200, {
                    'success': True,
                    'user': {
                        'id': user.get('id'),
                        'name': user.get('name'),
                        'email': user.get('email'),
                        'phone': user.get('phone', '')
                    }
                })
            return self.send_json(401, {'error': 'Unauthorized / Session expired'})

        # 11. Customer Orders & Quotes
        if path == '/api/customer/orders':
            user = self.get_authenticated_user()
            is_admin = self.is_admin_request()
            email = query_params.get('email', [''])[0].strip().lower()

            if not is_admin and not user:
                return self.send_json(401, {'error': 'Authentication required to view account orders.'})

            target_email = user.get('email', '').lower() if user else email
            quotes = db.fetchall('SELECT * FROM quotes WHERE LOWER(guest_email) = ?', (target_email,))
            orders = db.fetchall('SELECT * FROM orders WHERE LOWER(email) = ?', (target_email,))

            for q in quotes:
                q['customerName'] = q.get('customer_name')
                q['projectName'] = q.get('project_name')
                q['paymentStatus'] = q.get('payment_status')
                q['pricing'] = {'finalPrice': float(q.get('final_price', 0))}
            for o in orders:
                o['customerName'] = o.get('customer_name')
                o['total'] = float(o.get('total', 0))

            return self.send_json(200, {
                'success': True,
                'email': target_email,
                'quotes': quotes,
                'orders': orders
            })

        # 12. Customer Notifications
        if path == '/api/customer/notifications':
            user = self.get_authenticated_user()
            email = user.get('email', '').lower() if user else query_params.get('email', [''])[0].strip().lower()
            order_ids_raw = query_params.get('orderIds', [''])[0]
            order_ids = [oid.strip() for oid in order_ids_raw.split(',') if oid.strip()]
            notifs = db.get_notifications(email=email, user_id=user.get('id') if user else None, order_ids=order_ids)
            return self.send_json(200, {'success': True, 'notifications': notifs})

        # 13. Stripe Session Verification
        if path == '/api/verify-payment':
            order_id = query_params.get('id', [''])[0].strip()
            session_id = query_params.get('sessionId', [''])[0].strip()

            if not order_id or not session_id:
                return self.send_json(400, {'error': 'Missing id or sessionId parameter'})

            if not STRIPE_SECRET_KEY:
                return self.send_json(500, {'error': 'Stripe credentials not configured'})

            try:
                req = urllib.request.Request(f'https://api.stripe.com/v1/checkout/sessions/{session_id}')
                req.add_header('Authorization', f'Bearer {STRIPE_SECRET_KEY}')
                ssl_ctx = ssl.create_default_context()
                with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as res:
                    session_obj = json.loads(res.read().decode('utf-8'))

                if session_obj.get('payment_status') == 'paid':
                    db.process_stripe_webhook_event(session_id, 'checkout.session.completed', session_obj)
                    return self.send_json(200, {'success': True, 'paid': True, 'orderId': order_id})
                else:
                    return self.send_json(200, {'success': False, 'paid': False, 'status': session_obj.get('payment_status')})
            except Exception as err:
                print(f'Stripe verification error: {err}')
                return self.send_json(500, {'error': f'Verification failed: {err}'})

        # 14. Protected Customer Upload File Serving
        if path.startswith('/api/files/') or path == '/api/download-file':
            filename = path.split('/api/files/')[1] if path.startswith('/api/files/') else query_params.get('file', [''])[0]
            filename = os.path.basename(filename).strip()
            target_file = os.path.join(UPLOADS_DIR, filename)

            if not os.path.exists(target_file) or not os.path.isfile(target_file):
                return self.send_json(404, {'error': 'File not found'})

            is_admin = self.is_admin_request()
            user = self.get_authenticated_user()
            req_email = query_params.get('email', [''])[0].strip().lower()

            if not db.verify_file_access(filename, user_id=user.get('id') if user else None, email=req_email, is_admin=is_admin):
                return self.send_json(403, {'error': 'Unauthorized access to customer CAD model.'})

            mime_type, _ = mimetypes.guess_type(target_file)
            with open(target_file, 'rb') as f:
                file_bytes = f.read()

            self.send_response(200)
            self.send_header('Content-Type', mime_type or 'application/octet-stream')
            self.send_header('Content-Length', str(len(file_bytes)))
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(file_bytes)
            return

        # 15. Deny Direct Browsing of /uploads/
        if path.startswith('/uploads/'):
            return self.send_json(403, {'error': 'Direct upload browsing disabled. Access via /api/files with valid authorization.'})

        # 16. Robots.txt
        if path == '/robots.txt':
            robots_path = os.path.join(STATIC_DIR, 'robots.txt')
            if os.path.exists(robots_path):
                with open(robots_path, 'rb') as f:
                    content = f.read()
            else:
                content = f"User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /uploads/\nSitemap: {BASE_URL}/sitemap.xml\n".encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            self.wfile.write(content)
            return

        # 17. Sitemap.xml
        if path == '/sitemap.xml':
            sitemap_path = os.path.join(STATIC_DIR, 'sitemap.xml')
            if os.path.exists(sitemap_path):
                with open(sitemap_path, 'rb') as f:
                    content = f.read()
            else:
                content = b'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
            self.send_response(200)
            self.send_header('Content-Type', 'application/xml; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            self.wfile.write(content)
            return

        # 18. Favicon shortcut
        if path == '/favicon.ico':
            fav_path = os.path.join(STATIC_DIR, 'assets', 'logo.svg')
            if os.path.exists(fav_path):
                with open(fav_path, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'image/svg+xml')
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Cache-Control', 'public, max-age=604800')
                self.end_headers()
                self.wfile.write(content)
                return

        # Default web serving
        if path == '/' or path == '/index.html':
            filepath = os.path.join(STATIC_DIR, 'index.html')
        elif path.startswith('/static/'):
            filepath = os.path.join(BASE_DIR, path.lstrip('/'))
        else:
            cand = os.path.join(STATIC_DIR, path.lstrip('/'))
            filepath = cand if os.path.isfile(cand) else (cand + '.html' if os.path.isfile(cand + '.html') else cand)

        if os.path.exists(filepath) and os.path.isfile(filepath):
            mime_type, _ = mimetypes.guess_type(filepath)
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime_type or ('text/html; charset=utf-8' if filepath.endswith('.html') else 'application/octet-stream'))
            self.send_header('Content-Length', str(len(content)))

            # Caching strategy: Static assets cached for 7 days, HTML files require revalidation
            if filepath.endswith(('.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff2', '.woff')):
                self.send_header('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400')
            else:
                self.send_header('Cache-Control', 'no-cache, must-revalidate')

            self.end_headers()
            self.wfile.write(content)
        else:
            # Custom branded 404 response with proper HTTP 404 status (clean technical SEO)
            err_404_path = os.path.join(STATIC_DIR, '404.html')
            if os.path.exists(err_404_path):
                with open(err_404_path, 'rb') as f:
                    content = f.read()
                self.send_response(404)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Cache-Control', 'no-cache, must-revalidate')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_json(404, {'error': 'Page not found'})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        ip = self.get_client_ip()

        # Admin Login
        if path == '/api/admin/login':
            if not check_rate_limit(ip, max_attempts=5, window_seconds=300):
                return self.send_json(429, {'error': 'Too many failed login attempts. Please wait 5 minutes.'})

            payload = self.read_json_body()
            password = payload.get('password', '').strip()

            if hmac.compare_digest(password, ADMIN_PASSWORD):
                clear_rate_limit(ip)
                token = f'adm_{secrets.token_hex(24)}'
                ADMIN_TOKENS[token] = {'created': time.time(), 'expires': time.time() + 86400}
                return self.send_json(200, {'success': True, 'token': token})
            else:
                record_failed_attempt(ip)
                return self.send_json(401, {'error': 'Invalid administrative credentials.'})

        # Customer Registration
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

            existing = db.get_user_by_email(email)
            if existing:
                return self.send_json(400, {'error': 'Já existe uma conta com este email. Por favor inicie sessão.'})

            pwd_hash, salt = hash_password(password)
            user = db.create_user(email=email, password_hash=pwd_hash, salt=salt, name=name or 'Cliente', phone=phone)

            return self.send_json(201, {
                'success': True,
                'token': user.get('token'),
                'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user.get('phone', '')}
            })

        # Customer Login
        if path == '/api/auth/login':
            if not check_rate_limit(ip, max_attempts=5, window_seconds=300):
                return self.send_json(429, {'error': 'Demasiadas tentativas incorretas. Por favor aguarde 5 minutos.'})

            payload = self.read_json_body()
            email = payload.get('email', '').strip().lower()
            password = payload.get('password', '').strip()

            user = db.get_user_by_email(email)
            if not user or not verify_password(password, user.get('password_hash', ''), user.get('salt')):
                record_failed_attempt(ip)
                return self.send_json(401, {'error': 'Email ou palavra-passe incorretos.'})

            clear_rate_limit(ip)
            new_token = f'usr_{secrets.token_hex(24)}'
            db.update_user_login(user['id'], new_token)

            return self.send_json(200, {
                'success': True,
                'token': new_token,
                'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'phone': user.get('phone', '')}
            })

        # Guest Lookup
        if path == '/api/auth/guest':
            payload = self.read_json_body()
            query = payload.get('query', '').strip().lower()
            if not query:
                return self.send_json(400, {'error': 'Por favor insira a referência da encomenda (LS-XXXX / ORD-XXXX).'})

            matched_quotes = []
            matched_orders = []

            if query.startswith('ls-') or query.startswith('ls'):
                q = db.get_quote_by_id_or_ref(query)
                if q: matched_quotes.append(q)
            elif query.startswith('ord-') or query.startswith('ord'):
                o = db.get_order_by_id_or_ref(query)
                if o: matched_orders.append(o)
            elif '@' in query:
                matched_quotes = db.fetchall('SELECT * FROM quotes WHERE LOWER(guest_email) = ?', (query,))
                matched_orders = db.fetchall('SELECT * FROM orders WHERE LOWER(email) = ?', (query,))

            if not matched_quotes and not matched_orders:
                return self.send_json(404, {'error': 'Nenhuma encomenda ou orçamento encontrado com essa referência.'})

            for q in matched_quotes:
                q['customerName'] = q.get('customer_name')
                q['projectName'] = q.get('project_name')
                q['paymentStatus'] = q.get('payment_status')
                q['pricing'] = {'finalPrice': float(q.get('final_price', 0))}
            for o in matched_orders:
                o['customerName'] = o.get('customer_name')
                o['total'] = float(o.get('total', 0))

            return self.send_json(200, {
                'success': True,
                'isGuest': True,
                'query': query,
                'quotes': matched_quotes,
                'orders': matched_orders
            })

        # Mark Notification Read
        if path == '/api/customer/notifications/read':
            payload = self.read_json_body()
            db.mark_notification_read(notif_id=payload.get('id'), email=payload.get('email', ''))
            return self.send_json(200, {'success': True})

        # Create Quote Request
        if path == '/api/quotes':
            payload = self.read_json_body()
            quote = db.create_quote(payload, payload.get('files', []))
            quote['customerName'] = quote.get('customer_name')
            quote['projectName'] = quote.get('project_name')
            quote['paymentStatus'] = quote.get('payment_status')
            quote['pricing'] = {
                'finalPrice': float(quote.get('final_price', 24.50)),
                'subtotal': float(quote.get('subtotal', 20.00))
            }
            return self.send_json(201, {'success': True, 'quote': quote, 'quoteId': quote.get('public_reference')})

        # Create Store Order (Server-Side Price Calculation)
        if path == '/api/orders':
            payload = self.read_json_body()
            raw_items = payload.get('items', [])
            shipping_country = payload.get('shippingCountry', 'Portugal')
            promo_code = payload.get('promoCode', '')

            pricing = db.calculate_store_pricing(raw_items, shipping_country=shipping_country, promo_code=promo_code)
            order_data = {
                'customerId': payload.get('customerId'),
                'quoteId': payload.get('quoteId', ''),
                'customerName': payload.get('customerName', 'Store Customer'),
                'email': payload.get('email', ''),
                'phone': payload.get('phone', ''),
                'shippingName': payload.get('customerName', 'Store Customer'),
                'shippingAddress': payload.get('shippingAddress', {}).get('address', ''),
                'postalCode': payload.get('shippingAddress', {}).get('postalCode', ''),
                'city': payload.get('shippingAddress', {}).get('city', 'Portugal'),
                'country': shipping_country,
                'subtotal': pricing['subtotal'],
                'shippingCost': pricing['shippingCost'],
                'discount': pricing['discount'],
                'total': pricing['total'],
                'paymentMethod': payload.get('paymentMethod', 'MB WAY'),
                'paymentProvider': 'stripe'
            }

            order = db.create_order(order_data, pricing['items'])
            order['customerName'] = order.get('customer_name')
            order['total'] = float(order.get('total', 0))
            return self.send_json(201, {'success': True, 'order': order, 'orderId': order.get('public_reference')})

        # File Upload
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
                    quote_id = f'LS-{secrets.token_hex(3).upper()}'

                clean_name = os.path.basename(file_name)
                safe_name = ''.join(c for c in clean_name if c.isalnum() or c in '._-') or 'model.stl'
                disk_filename = f'{quote_id}_{safe_name}'.replace(' ', '_')
                save_path = os.path.join(UPLOADS_DIR, disk_filename)

                with open(save_path, 'wb') as f:
                    f.write(file_data)

                # Link to quote if quote exists
                q = db.get_quote_by_id_or_ref(quote_id)
                if q:
                    db.execute('''
                        INSERT INTO quote_files (id, quote_id, original_filename, disk_filename, storage_url, mime_type, file_size, uploaded_at)
                        VALUES (?, ?, ?, ?, ?, 'application/octet-stream', ?, ?)
                    ''', (
                        f'file_{uuid.uuid4().hex[:8]}',
                        q['id'],
                        safe_name,
                        disk_filename,
                        f'/api/files/{disk_filename}',
                        f'{round(len(file_data)/(1024*1024), 2)} MB',
                        time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                    ))

                return self.send_json(200, {
                    'success': True,
                    'url': f'/api/files/{disk_filename}',
                    'filename': disk_filename,
                    'sizeMB': round(len(file_data) / (1024 * 1024), 2)
                })
            except Exception as e:
                return self.send_json(400, {'error': f'Upload failed: {e}'})

        # Validate Promo
        if path == '/api/validate-promo':
            payload = self.read_json_body()
            code_input = payload.get('code', '').strip().upper()
            promo = db.fetchone('SELECT * FROM promo_codes WHERE code = ? AND active = 1', (code_input,))
            if promo:
                return self.send_json(200, {'valid': True, 'discountPercent': float(promo['discount_percent']), 'description': promo.get('description', '')})
            return self.send_json(404, {'valid': False, 'error': 'Invalid or expired promo code'})

        # Stripe Checkout Session Creation (Independent Server-Side Price Verification)
        if path == '/api/create-checkout-session':
            if not STRIPE_AVAILABLE:
                return self.send_json(500, {'error': 'Stripe credentials are not configured on this server'})

            payload = self.read_json_body()
            order_id = payload.get('orderId', '')
            order_type = payload.get('type', 'order')
            title = payload.get('title', 'Layer Studios 3D Printing')
            customer_email = payload.get('email', '')

            # Server verifies real price from database!
            verified_amount = 0.0
            if order_type == 'quote' or order_id.startswith('LS-Q'):
                quote = db.get_quote_by_id_or_ref(order_id)
                if not quote:
                    return self.send_json(404, {'error': f'Quote {order_id} not found in database'})
                verified_amount = float(quote.get('final_price', 0.0))
                customer_email = customer_email or quote.get('guest_email', '')
            else:
                order = db.get_order_by_id_or_ref(order_id)
                if not order:
                    return self.send_json(404, {'error': f'Order {order_id} not found in database'})
                verified_amount = float(order.get('total', 0.0))
                customer_email = customer_email or order.get('email', '')

            if verified_amount <= 0.0:
                return self.send_json(400, {'error': 'Invalid verified order amount'})

            host = self.headers.get('Host', 'localhost:8080')
            protocol = 'https' if 'render.com' in host or 'onrender.com' in host or 'layerstudios.pt' in host else 'http'
            if 'localhost' in host or '127.0.0.1' in host:
                base_url = f'{protocol}://{host}'
            else:
                base_url = BASE_URL

            try:
                cents = int(round(verified_amount * 100))
                form_data = {
                    'payment_method_types[0]': 'card',
                    'line_items[0][price_data][currency]': 'eur',
                    'line_items[0][price_data][product_data][name]': title,
                    'line_items[0][price_data][product_data][description]': f'Reference: {order_id} — Layer Studios Portugal',
                    'line_items[0][price_data][unit_amount]': str(cents),
                    'line_items[0][quantity]': '1',
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

                # Update session id in database
                if order_type == 'quote' or order_id.startswith('LS-Q'):
                    db.update_quote(order_id, {'stripe_session_id': session_id, 'payment_status': 'processing'})
                else:
                    db.update_order(order_id, {'stripe_session_id': session_id, 'payment_status': 'processing'})

                return self.send_json(200, {
                    'success': True,
                    'sessionId': session_id,
                    'url': session_url,
                    'amountVerified': verified_amount
                })
            except Exception as e:
                print(f'Stripe session error: {e}')
                return self.send_json(500, {'error': f'Payment session failed: {str(e)}'})

        # Stripe Webhook with Cryptographic Signature Verification & Idempotency
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
                event_id = event.get('id', f'evt_{int(time.time())}')
                event_type = event.get('type', '')
                session_data = event.get('data', {}).get('object', {})

                result = db.process_stripe_webhook_event(event_id, event_type, session_data)
                return self.send_json(200, {'received': True, 'result': result})
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
            quote = db.get_quote_by_id_or_ref(quote_id)
            if not quote:
                return self.send_json(404, {'error': 'Quote not found'})

            db.update_quote(quote['id'], {k: v for k, v in payload.items() if k != 'id'})
            return self.send_json(200, {'success': True, 'quote': db.get_quote_by_id_or_ref(quote['id'])})

        if path == '/api/orders' or path.startswith('/api/orders/'):
            payload = self.read_json_body()
            order_id = path.split('/api/orders/')[1] if path.startswith('/api/orders/') else payload.get('id', '')
            order = db.get_order_by_id_or_ref(order_id)
            if not order:
                return self.send_json(404, {'error': 'Order not found'})

            db.update_order(order['id'], {k: v for k, v in payload.items() if k != 'id'})
            return self.send_json(200, {'success': True, 'order': db.get_order_by_id_or_ref(order['id'])})

        return self.send_json(404, {'error': 'Endpoint not found'})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        if not self.is_admin_request():
            return self.send_json(403, {'error': 'Unauthorized. Admin authorization required.'})

        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1]
            quote = db.get_quote_by_id_or_ref(quote_id)
            if quote:
                db.delete_quote(quote['id'])
                return self.send_json(200, {'success': True, 'deleted': quote_id})
            return self.send_json(404, {'error': 'Quote not found'})

        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[1]
            order = db.get_order_by_id_or_ref(order_id)
            if order:
                db.delete_order(order['id'])
                return self.send_json(200, {'success': True, 'deleted': order_id})
            return self.send_json(404, {'error': 'Order not found'})

        return self.send_json(404, {'error': 'Endpoint not found'})

def run_server(port=8080):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, LayerStudiosHandler)
    print(f'Layer Studios Production Server running at http://localhost:{port}')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        print('Running production server self-test...')
        prods = db.get_products()
        assert len(prods) > 0, 'Products table missing records'
        print('All database checks passed!')
        sys.exit(0)
    elif len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
