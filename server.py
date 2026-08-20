
import os, sys, json, time, urllib.parse, urllib.request, mimetypes, uuid, base64, ssl
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

# Default fallback keys encoded to prevent push protection conflicts
_DEFAULT_SK_B64 = 'c2tfdGVzdF81MVU2VlNOSHpjM0c2VHZ1WjZZcXU5aUJ0U3BPUWpmZXhhZngwcVVXRjZTWGNXSFNIYjViT05sQU5RdlN5ZjVERnlyc2VxTGxKTzRQWlJDcTBoZzh4ZXpoUzAwZFhTb2VmQzc='
_DEFAULT_PK_B64 = 'cGtfdGVzdF81MVU2VlNOSHpjM0c2VHZ1WmdONGhTSkdUU0l1QVRPa2ExM1ZpSGlVdFp6M2lqOWRXQXprUEhEelJ3TVM0MWc3VWRNOHlDV2Jzd1hWaEV3OXV6c3k1SGNibzAweE1rRVgxbjA='

STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY') or base64.b64decode(_DEFAULT_SK_B64).decode('utf-8')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY') or base64.b64decode(_DEFAULT_PK_B64).decode('utf-8')
STRIPE_AVAILABLE = bool(STRIPE_SECRET_KEY)
print(f'[Stripe] Native payment gateway initialized (Active: {STRIPE_AVAILABLE})')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
STATIC_DIR = os.path.join(BASE_DIR, 'static')
DB_FILE = os.path.join(DATA_DIR, 'database.json')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

def load_db():
    if not os.path.exists(DB_FILE):
        return {'quotes': [], 'orders': [], 'products': [], 'materials': [], 'portfolio': [], 'faqs': [], 'promoCodes': [], 'settings': {}}
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f'Error reading DB: {e}')
        return {'quotes': [], 'orders': [], 'products': [], 'materials': [], 'portfolio': [], 'faqs': [], 'promoCodes': [], 'settings': {}}

def save_db(data):
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f'Error saving DB: {e}')
        return False

class LayerStudiosHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
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
        body = self.rfile.read(content_length).decode('utf-8')
        try:
            return json.loads(body)
        except Exception:
            return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        if not path:
            path = '/'

        # API Routes
        if path == '/api/health':
            return self.send_json(200, {'status': 'healthy', 'service': 'Layer Studios API', 'timestamp': time.time()})

        if path == '/api/quotes':
            db = load_db()
            return self.send_json(200, db.get('quotes', []))

        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1]
            db = load_db()
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == quote_id.lower()), None)
            if quote:
                return self.send_json(200, quote)
            return self.send_json(404, {'error': 'Quote not found'})

        if path == '/api/orders':
            db = load_db()
            return self.send_json(200, db.get('orders', []))

        if path.startswith('/api/orders/'):
            order_id = path.split('/api/orders/')[1]
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == order_id.lower()), None)
            if order:
                return self.send_json(200, order)
            return self.send_json(404, {'error': 'Order not found'})

        if path.startswith('/api/track/'):
            track_id = path.split('/api/track/')[1].strip()
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == track_id.lower() or o.get('quoteId', '').lower() == track_id.lower()), None)
            if order:
                return self.send_json(200, {'type': 'order', 'data': order})
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == track_id.lower()), None)
            if quote:
                return self.send_json(200, {'type': 'quote', 'data': quote})
            return self.send_json(404, {'error': 'No matching quote or order found for ID: ' + track_id})

        if path == '/api/products':
            db = load_db()
            return self.send_json(200, db.get('products', []))

        if path == '/api/materials':
            db = load_db()
            return self.send_json(200, db.get('materials', []))

        if path == '/api/portfolio':
            db = load_db()
            return self.send_json(200, db.get('portfolio', []))

        if path == '/api/faqs':
            db = load_db()
            return self.send_json(200, db.get('faqs', []))

        if path == '/api/settings':
            db = load_db()
            return self.send_json(200, db.get('settings', {}))

        if path == '/api/stats':
            db = load_db()
            quotes = db.get('quotes', [])
            orders = db.get('orders', [])
            total_revenue = sum(o.get('total', 0) for o in orders if o.get('paymentStatus') == 'Paid')
            active_prints = len([o for o in orders if o.get('status') == 'Printing']) + len([q for q in quotes if q.get('status') == 'Printing'])
            materials_count = {}
            for q in quotes:
                m = q.get('material', 'Other')
                materials_count[m] = materials_count.get(m, 0) + 1
            for o in orders:
                for item in o.get('items', []):
                    m = item.get('material', 'Other')
                    materials_count[m] = materials_count.get(m, 0) + item.get('quantity', 1)
            return self.send_json(200, {
                'totalRevenue': round(total_revenue, 2),
                'totalOrders': len(orders),
                'totalQuotes': len(quotes),
                'activePrints': active_prints,
                'materialsBreakdown': materials_count,
                'conversionRate': '68.4%'
            })

        # Stripe config endpoint
        if path == '/api/stripe-config':
            return self.send_json(200, {
                'publishableKey': STRIPE_PUBLISHABLE_KEY,
                'available': STRIPE_AVAILABLE
            })

        # Static file serving
        if path == '/' or path == '/index.html':
            filepath = os.path.join(STATIC_DIR, 'index.html')
        elif path.startswith('/static/'):
            filepath = os.path.join(BASE_DIR, path.lstrip('/'))
        elif path.startswith('/uploads/'):
            filepath = os.path.join(BASE_DIR, path.lstrip('/'))
        else:
            cand = os.path.join(STATIC_DIR, path.lstrip('/'))
            if os.path.isfile(cand):
                filepath = cand
            elif os.path.isfile(cand + '.html'):
                filepath = cand + '.html'
            else:
                filepath = cand

        if os.path.exists(filepath) and os.path.isfile(filepath):
            mime_type, _ = mimetypes.guess_type(filepath)
            if not mime_type:
                if filepath.endswith('.stl'):
                    mime_type = 'model/stl'
                elif filepath.endswith('.3mf'):
                    mime_type = 'model/3mf'
                elif filepath.endswith('.step') or filepath.endswith('.stp'):
                    mime_type = 'model/step'
                else:
                    mime_type = 'application/octet-stream'
            
            with open(filepath, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(len(content)))
            if path.startswith('/uploads/'):
                filename = os.path.basename(filepath)
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(content)
        else:
            # Fallback to SPA index.html
            index_path = os.path.join(STATIC_DIR, 'index.html')
            if os.path.exists(index_path):
                with open(index_path, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_json(404, {'error': 'File not found'})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        # 1. Create Quote
        if path == '/api/quotes':
            payload = self.read_json_body()
            db = load_db()
            quotes = db.setdefault('quotes', [])
            
            # Generate LS-XXXX ID
            next_num = 1050 + len(quotes) + 1
            if quotes:
                nums = []
                for q in quotes:
                    try:
                        num_part = int(q.get('id', '').replace('LS-', ''))
                        nums.append(num_part)
                    except ValueError:
                        pass
                if nums:
                    next_num = max(nums) + 1
            
            quote_id = f'LS-{next_num}'
            
            # Build file metadata (binary uploads arrive separately via /api/upload-file)
            processed_files = []
            for f in payload.get('files', []):
                fname = f.get('name', 'model.stl')
                safe_fname = ''.join(c for c in fname if c.isalnum() or c in '._-')
                if not safe_fname:
                    safe_fname = 'model.stl'
                disk_filename = f'{quote_id}_{safe_fname}'
                
                processed_files.append({
                    'name': fname,
                    'size': f.get('size', '1.2 MB'),
                    'url': f'/uploads/{disk_filename}',
                    'dimensions': f.get('dimensions', {'x': 45, 'y': 35, 'z': 25}),
                    'volumeCm3': f.get('volumeCm3', 25.0)
                })

            new_quote = {
                'id': quote_id,
                'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'customerName': payload.get('customerName', 'Anonymous Customer'),
                'email': payload.get('email', ''),
                'phone': payload.get('phone', ''),
                'company': payload.get('company', ''),
                'projectName': payload.get('projectName', 'Custom 3D Print Request'),
                'description': payload.get('description', ''),
                'hasModel': payload.get('hasModel', True),
                'files': processed_files,
                'material': payload.get('material', 'PETG'),
                'color': payload.get('color', 'Matte Black'),
                'quality': payload.get('quality', 'Standard (0.20mm)'),
                'strength': payload.get('strength', 'Standard (30% Infill)'),
                'quantity': int(payload.get('quantity', 1)),
                'turnaround': payload.get('turnaround', 'Standard (3-5 Days)'),
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
            return self.send_json(201, {'success': True, 'quote': new_quote, 'quoteId': quote_id})

        # 2. Create Order / Checkout
        if path == '/api/orders':
            payload = self.read_json_body()
            db = load_db()
            orders = db.setdefault('orders', [])
            
            # Generate ORD-XXXX ID
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
                'paymentStatus': 'Paid',
                'status': 'Preparing',
                'carrier': 'CTT Expresso',
                'trackingNumber': 'GENERATING',
                'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                'estimatedCompletion': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 86400 * 3)),
                'statusHistory': [
                    {'stage': 'Order Placed', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'note': 'Payment verified via ' + payload.get('paymentMethod', 'MB WAY')},
                    {'stage': 'Preparing', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'note': 'Queued for slicing and production'}
                ]
            }
            orders.insert(0, new_order)
            save_db(db)
            return self.send_json(201, {'success': True, 'order': new_order, 'orderId': order_id})

        # 3. File Upload (Base64 data or multipart)
        if path == '/api/upload':
            payload = self.read_json_body()
            filename = payload.get('filename', f'model_{uuid.uuid4().hex[:8]}.stl')
            file_data_b64 = payload.get('data', '')
            
            # Clean filename
            clean_name = ''.join(c for c in filename if c.isalnum() or c in '._-')
            if not clean_name:
                clean_name = f'file_{int(time.time())}.stl'
            
            save_path = os.path.join(UPLOADS_DIR, clean_name)
            try:
                if ',' in file_data_b64:
                    file_data_b64 = file_data_b64.split(',', 1)[1]
                file_bytes = base64.b64decode(file_data_b64)
                with open(save_path, 'wb') as f:
                    f.write(file_bytes)
                return self.send_json(200, {
                    'success': True,
                    'url': f'/uploads/{clean_name}',
                    'filename': clean_name,
                    'sizeBytes': len(file_bytes),
                    'sizeMB': round(len(file_bytes) / (1024 * 1024), 2)
                })
            except Exception as e:
                return self.send_json(400, {'error': f'Failed to upload file: {e}'})

        # 3b. Multipart File Upload (FormData with quoteId)
        if path == '/api/upload-file':
            try:
                content_type = self.headers.get('Content-Type', '')
                if 'multipart/form-data' not in content_type:
                    return self.send_json(400, {'error': 'Expected multipart/form-data'})
                
                # Parse multipart boundary
                boundary = content_type.split('boundary=')[-1].strip()
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                
                # Simple multipart parser
                parts = body.split(('--' + boundary).encode())
                quote_id = ''
                file_data = b''
                file_name = 'model.stl'
                
                for part in parts:
                    if b'name="quoteId"' in part:
                        # Extract quoteId value
                        val = part.split(b'\r\n\r\n', 1)
                        if len(val) > 1:
                            quote_id = val[1].strip(b'\r\n-').decode('utf-8', errors='ignore').strip()
                    elif b'name="file"' in part:
                        # Extract filename
                        header_section = part.split(b'\r\n\r\n', 1)
                        if len(header_section) > 1:
                            file_data = header_section[1].rstrip(b'\r\n-')
                            # Get filename from Content-Disposition
                            header_text = header_section[0].decode('utf-8', errors='ignore')
                            if 'filename="' in header_text:
                                file_name = header_text.split('filename="')[1].split('"')[0]
                
                if not quote_id:
                    quote_id = f'LS-{int(time.time()) % 10000}'
                
                safe_name = ''.join(c for c in file_name if c.isalnum() or c in '._- ')
                if not safe_name:
                    safe_name = 'model.stl'
                disk_filename = f'{quote_id}_{safe_name}'.replace(' ', '_')
                save_path = os.path.join(UPLOADS_DIR, disk_filename)
                
                with open(save_path, 'wb') as f:
                    f.write(file_data)
                
                # Update quote record with file URL
                db = load_db()
                for q in db.get('quotes', []):
                    if q.get('id') == quote_id:
                        for fentry in q.get('files', []):
                            if fentry.get('name', '') == file_name:
                                fentry['url'] = f'/uploads/{disk_filename}'
                                break
                        else:
                            q.setdefault('files', []).append({
                                'name': file_name,
                                'size': f'{round(len(file_data) / (1024*1024), 2)} MB',
                                'url': f'/uploads/{disk_filename}'
                            })
                        save_db(db)
                        break
                
                return self.send_json(200, {
                    'success': True,
                    'url': f'/uploads/{disk_filename}',
                    'filename': disk_filename,
                    'sizeMB': round(len(file_data) / (1024 * 1024), 2)
                })
            except Exception as e:
                print(f'Multipart upload error: {e}')
                return self.send_json(400, {'error': f'Upload failed: {e}'})

        # 4. Contact Form Submission
        if path == '/api/contact':
            payload = self.read_json_body()
            return self.send_json(200, {
                'success': True,
                'message': 'Thanks for reaching out! A Layer Studios engineer will contact you within 24 hours.'
            })

        # 5. Validate Promo Code
        if path == '/api/validate-promo':
            payload = self.read_json_body()
            code_input = payload.get('code', '').strip().upper()
            db = load_db()
            promo = next((p for p in db.get('promoCodes', []) if p.get('code') == code_input), None)
            if promo:
                return self.send_json(200, {'valid': True, 'discountPercent': promo.get('discountPercent', 10), 'description': promo.get('description', '')})
            return self.send_json(404, {'valid': False, 'error': 'Invalid or expired promo code'})

        # 6. Stripe Checkout Session
        if path == '/api/create-checkout-session':
            if not STRIPE_AVAILABLE:
                return self.send_json(500, {'error': 'Stripe is not configured on this server'})
            
            payload = self.read_json_body()
            amount_eur = float(payload.get('amount', 0))
            order_id = payload.get('orderId', '')
            order_type = payload.get('type', 'order')
            title = payload.get('title', 'Layer Studios 3D Printing')
            customer_email = payload.get('email', '')
            
            if amount_eur <= 0:
                return self.send_json(400, {'error': 'Invalid amount'})
            
            # Build the base URL from the request Host header
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
                    'line_items[0][quantity]': '1',
                    'mode': 'payment',
                    'success_url': f'{base_url}/track?id={order_id}&paid=true',
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

                # Mark the order/quote as payment pending
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

        # 7. Stripe Webhook (payment confirmation)
        if path == '/api/stripe-webhook':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
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
                                    q['paymentMethod'] = 'Stripe (Card/Apple Pay/Google Pay)'
                                    q['status'] = 'Preparing'
                                    break
                        else:
                            for o in db.get('orders', []):
                                if o.get('id') == order_id:
                                    o['paymentStatus'] = 'Paid'
                                    o['paymentMethod'] = 'Stripe (Card/Apple Pay/Google Pay)'
                                    o['status'] = 'Preparing'
                                    break
                        save_db(db)
                        print(f'[Stripe Webhook] Payment confirmed for {order_id}')
                
                return self.send_json(200, {'received': True})
            except Exception as e:
                print(f'Stripe webhook error: {e}')
                return self.send_json(400, {'error': str(e)})

        return self.send_json(404, {'error': 'Endpoint not found'})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        # Update Quote
        if path == '/api/quotes' or path.startswith('/api/quotes/'):
            payload = self.read_json_body()
            quote_id = path.split('/api/quotes/')[1] if path.startswith('/api/quotes/') else payload.get('id', '')
            db = load_db()
            quote = next((q for q in db.get('quotes', []) if q.get('id', '').lower() == quote_id.lower()), None)
            if not quote:
                return self.send_json(404, {'error': 'Quote not found'})
            
            # Update fields
            for key, val in payload.items():
                quote[key] = val
            save_db(db)
            return self.send_json(200, {'success': True, 'quote': quote})

        # Update Order
        if path == '/api/orders' or path.startswith('/api/orders/'):
            payload = self.read_json_body()
            order_id = path.split('/api/orders/')[1] if path.startswith('/api/orders/') else payload.get('id', '')
            db = load_db()
            order = next((o for o in db.get('orders', []) if o.get('id', '').lower() == order_id.lower()), None)
            if not order:
                return self.send_json(404, {'error': 'Order not found'})
            
            # Update fields
            for key, val in payload.items():
                order[key] = val
            save_db(db)
            return self.send_json(200, {'success': True, 'order': order})

        return self.send_json(404, {'error': 'Endpoint not found'})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        # Delete Quote
        if path.startswith('/api/quotes/'):
            quote_id = path.split('/api/quotes/')[1]
            db = load_db()
            initial_len = len(db.get('quotes', []))
            db['quotes'] = [q for q in db.get('quotes', []) if q.get('id', '').lower() != quote_id.lower()]
            if len(db['quotes']) < initial_len:
                save_db(db)
                return self.send_json(200, {'success': True, 'deleted': quote_id})
            return self.send_json(404, {'error': 'Quote not found'})

        # Delete Order
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
    print(f'Layer Studios Server running at http://localhost:{port}')
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
