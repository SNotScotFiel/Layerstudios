import os
import sys
import json
import time
import uuid
import secrets
import sqlite3
from datetime import datetime

# Handle PostgreSQL vs SQLite
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

IS_POSTGRES = bool(DATABASE_URL and DATABASE_URL.startswith('postgresql://'))
PG_MODULE = None

if IS_POSTGRES:
    try:
        import psycopg2
        import psycopg2.extras
        PG_MODULE = psycopg2
        print(f'[Database] Connected to PostgreSQL target.')
    except ImportError:
        try:
            import psycopg
            PG_MODULE = psycopg
            print(f'[Database] Connected to PostgreSQL (psycopg v3).')
        except ImportError:
            print(f'[Database] Warning: PostgreSQL requested but psycopg2/psycopg not installed. Falling back to SQLite.')
            IS_POSTGRES = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
SQLITE_DB_PATH = os.path.join(DATA_DIR, 'layerstudios.db')
LEGACY_JSON_PATH = os.path.join(DATA_DIR, 'database.json')

os.makedirs(DATA_DIR, exist_ok=True)

class DatabaseManager:
    def __init__(self):
        self.is_postgres = IS_POSTGRES
        self.db_url = DATABASE_URL
        self.sqlite_path = SQLITE_DB_PATH
        self.init_schema()
        self.migrate_legacy_data_if_empty()

    def get_connection(self):
        if self.is_postgres and PG_MODULE:
            conn = PG_MODULE.connect(self.db_url)
            conn.autocommit = False
            return conn
        else:
            conn = sqlite3.connect(self.sqlite_path, timeout=30.0)
            conn.execute('PRAGMA foreign_keys = ON;')
            conn.row_factory = sqlite3.Row
            return conn

    def format_query(self, query):
        if self.is_postgres:
            # PostgreSQL uses %s for parameterized queries
            return query.replace('?', '%s')
        else:
            # SQLite uses ?
            return query

    def execute(self, query, params=(), commit=True):
        conn = self.get_connection()
        formatted_query = self.format_query(query)
        try:
            cursor = conn.cursor()
            cursor.execute(formatted_query, params)
            if commit:
                conn.commit()
            return cursor
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            if commit:
                conn.close()

    def fetchone(self, query, params=()):
        conn = self.get_connection()
        formatted_query = self.format_query(query)
        try:
            cursor = conn.cursor()
            cursor.execute(formatted_query, params)
            row = cursor.fetchone()
            if row is None:
                return None
            if self.is_postgres:
                # Convert tuple to dict based on cursor.description
                columns = [col[0] for col in cursor.description]
                return dict(zip(columns, row))
            else:
                return dict(row)
        finally:
            conn.close()

    def fetchall(self, query, params=()):
        conn = self.get_connection()
        formatted_query = self.format_query(query)
        try:
            cursor = conn.cursor()
            cursor.execute(formatted_query, params)
            rows = cursor.fetchall()
            if self.is_postgres:
                columns = [col[0] for col in cursor.description]
                return [dict(zip(columns, r)) for r in rows]
            else:
                return [dict(r) for r in rows]
        finally:
            conn.close()

    def init_schema(self):
        conn = self.get_connection()
        cur = conn.cursor()
        
        # Schema definition compatible with PostgreSQL & SQLite
        id_type = 'VARCHAR(64)'
        text_type = 'TEXT'
        numeric_type = 'NUMERIC(10, 2)'
        timestamp_type = 'VARCHAR(32)' if not self.is_postgres else 'TIMESTAMP'

        schemas = [
            f'''CREATE TABLE IF NOT EXISTS users (
                id {id_type} PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                salt VARCHAR(64) NOT NULL,
                name VARCHAR(200),
                phone VARCHAR(50),
                company VARCHAR(150),
                role VARCHAR(50) DEFAULT 'customer',
                email_verified INTEGER DEFAULT 0,
                token VARCHAR(128),
                created_at {timestamp_type} NOT NULL,
                updated_at {timestamp_type},
                last_login {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS quotes (
                id {id_type} PRIMARY KEY,
                public_reference VARCHAR(64) UNIQUE NOT NULL,
                customer_id {id_type},
                guest_email VARCHAR(255),
                customer_name VARCHAR(200) NOT NULL,
                phone VARCHAR(50),
                company VARCHAR(150),
                project_name VARCHAR(255) NOT NULL,
                description {text_type},
                material VARCHAR(100) NOT NULL,
                color VARCHAR(50) NOT NULL,
                quantity INTEGER NOT NULL CHECK (quantity >= 1),
                quality VARCHAR(100),
                strength VARCHAR(100),
                turnaround VARCHAR(100),
                deadline VARCHAR(100),
                shipping_country VARCHAR(100) DEFAULT 'Portugal',
                customer_notes {text_type},
                is_confidential INTEGER DEFAULT 0,
                status VARCHAR(50) NOT NULL DEFAULT 'Quote Requested',
                payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
                payment_method VARCHAR(100),
                estimated_material_cost {numeric_type} DEFAULT 0.00,
                estimated_machine_cost {numeric_type} DEFAULT 0.00,
                design_cost {numeric_type} DEFAULT 0.00,
                shipping_cost {numeric_type} DEFAULT 4.50,
                discount {numeric_type} DEFAULT 0.00,
                subtotal {numeric_type} DEFAULT 0.00,
                final_price {numeric_type} NOT NULL CHECK (final_price >= 0),
                currency VARCHAR(10) DEFAULT 'EUR',
                stripe_session_id VARCHAR(255),
                internal_notes {text_type},
                admin_notes {text_type},
                created_at {timestamp_type} NOT NULL,
                updated_at {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS quote_files (
                id {id_type} PRIMARY KEY,
                quote_id {id_type} NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
                original_filename VARCHAR(255) NOT NULL,
                disk_filename VARCHAR(255) NOT NULL,
                storage_url VARCHAR(500) NOT NULL,
                mime_type VARCHAR(100),
                file_size VARCHAR(50),
                dimensions VARCHAR(100),
                uploaded_at {timestamp_type} NOT NULL
            );''',
            f'''CREATE TABLE IF NOT EXISTS orders (
                id {id_type} PRIMARY KEY,
                public_reference VARCHAR(64) UNIQUE NOT NULL,
                customer_id {id_type},
                quote_id {id_type},
                customer_name VARCHAR(200) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                shipping_name VARCHAR(200),
                shipping_address {text_type},
                postal_code VARCHAR(50),
                city VARCHAR(100),
                country VARCHAR(100) DEFAULT 'Portugal',
                subtotal {numeric_type} NOT NULL CHECK (subtotal >= 0),
                shipping_cost {numeric_type} NOT NULL DEFAULT 4.50 CHECK (shipping_cost >= 0),
                discount {numeric_type} DEFAULT 0.00 CHECK (discount >= 0),
                total {numeric_type} NOT NULL CHECK (total >= 0),
                currency VARCHAR(10) DEFAULT 'EUR',
                payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
                payment_provider VARCHAR(50),
                payment_method VARCHAR(100),
                carrier VARCHAR(100) DEFAULT 'CTT Expresso',
                tracking_number VARCHAR(100) DEFAULT 'GENERATING',
                status VARCHAR(50) NOT NULL DEFAULT 'Preparing',
                estimated_completion {timestamp_type},
                stripe_session_id VARCHAR(255),
                created_at {timestamp_type} NOT NULL,
                updated_at {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS order_items (
                id {id_type} PRIMARY KEY,
                order_id {id_type} NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
                product_id VARCHAR(64),
                product_name VARCHAR(255) NOT NULL,
                material VARCHAR(100),
                color VARCHAR(50),
                customization {text_type},
                quantity INTEGER NOT NULL CHECK (quantity >= 1),
                unit_price {numeric_type} NOT NULL CHECK (unit_price >= 0),
                total_price {numeric_type} NOT NULL CHECK (total_price >= 0)
            );''',
            f'''CREATE TABLE IF NOT EXISTS payments (
                id {id_type} PRIMARY KEY,
                order_id {id_type},
                quote_id {id_type},
                provider VARCHAR(50) NOT NULL,
                provider_payment_id VARCHAR(255),
                provider_session_id VARCHAR(255),
                amount {numeric_type} NOT NULL CHECK (amount >= 0),
                currency VARCHAR(10) DEFAULT 'EUR',
                status VARCHAR(50) NOT NULL,
                idempotency_key VARCHAR(255),
                receipt_url VARCHAR(500),
                created_at {timestamp_type} NOT NULL,
                confirmed_at {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS products (
                id {id_type} PRIMARY KEY,
                slug VARCHAR(150) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                price {numeric_type} NOT NULL CHECK (price >= 0),
                description {text_type},
                dimensions VARCHAR(100),
                default_material VARCHAR(100),
                materials {text_type},
                colors {text_type},
                in_stock INTEGER DEFAULT 1,
                lead_time VARCHAR(100),
                image VARCHAR(500),
                customizable INTEGER DEFAULT 0,
                customization_field VARCHAR(255),
                active INTEGER DEFAULT 1,
                created_at {timestamp_type} NOT NULL,
                updated_at {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS materials (
                id {id_type} PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(100),
                cost_per_gram {numeric_type},
                strength_rating INTEGER,
                temperature_resistance VARCHAR(50),
                best_for {text_type},
                description {text_type},
                colors {text_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS promo_codes (
                id {id_type} PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount_percent {numeric_type} NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
                description VARCHAR(255),
                active INTEGER DEFAULT 1,
                valid_until {timestamp_type}
            );''',
            f'''CREATE TABLE IF NOT EXISTS notifications (
                id {id_type} PRIMARY KEY,
                user_id {id_type},
                order_id VARCHAR(64),
                email VARCHAR(255),
                title VARCHAR(255) NOT NULL,
                message {text_type} NOT NULL,
                status VARCHAR(50),
                read INTEGER DEFAULT 0,
                created_at {timestamp_type} NOT NULL
            );''',
            f'''CREATE TABLE IF NOT EXISTS webhook_events (
                id {id_type} PRIMARY KEY,
                event_id VARCHAR(255) UNIQUE NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                provider VARCHAR(50) NOT NULL,
                payload {text_type},
                processed_at {timestamp_type} NOT NULL
            );''',
            f'''CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(100) PRIMARY KEY,
                value {text_type}
            );'''
        ]

        try:
            for sql in schemas:
                cur.execute(self.format_query(sql))
            conn.commit()
            print('[Database] All relational tables and constraints verified.')
        except Exception as e:
            conn.rollback()
            print(f'[Database] Error initializing schema: {e}')
            raise e
        finally:
            conn.close()

    def migrate_legacy_data_if_empty(self):
        # Check if products table is already populated
        prod_count = self.fetchone('SELECT COUNT(*) as cnt FROM products')
        if prod_count and prod_count.get('cnt', 0) > 0:
            return  # Already seeded/migrated

        if not os.path.exists(LEGACY_JSON_PATH):
            return

        print('[Database Migration] Importing legacy seed data from database.json into relational tables...')
        try:
            with open(LEGACY_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)

            now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            conn = self.get_connection()
            cur = conn.cursor()

            # 1. Products
            for p in data.get('products', []):
                cur.execute(self.format_query('''
                    INSERT INTO products (id, slug, title, category, price, description, dimensions, default_material, materials, colors, in_stock, lead_time, image, customizable, customization_field, active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
                '''), (
                    p.get('id', f'prod_{uuid.uuid4().hex[:6]}'),
                    p.get('id', f'prod_{uuid.uuid4().hex[:6]}'),
                    p.get('title', '3D Printed Product'),
                    p.get('category', 'Accessories'),
                    float(p.get('price', 10.0)),
                    p.get('description', ''),
                    p.get('dimensions', ''),
                    p.get('defaultMaterial', 'PLA+ Matte'),
                    json.dumps(p.get('materials', [])),
                    json.dumps(p.get('colors', [])),
                    1 if p.get('inStock', True) else 0,
                    p.get('leadTime', '1-2 business days'),
                    p.get('image', ''),
                    1 if p.get('customizable', False) else 0,
                    p.get('customizationField', ''),
                    now_str,
                    now_str
                ))

            # 2. Materials
            for m in data.get('materials', []):
                best_for_val = m.get('bestFor', '')
                if isinstance(best_for_val, (list, dict)):
                    best_for_val = json.dumps(best_for_val)
                colors_val = m.get('colorsAvailable') or m.get('colors', [])
                if isinstance(colors_val, (list, dict)):
                    colors_val = json.dumps(colors_val)
                description_val = m.get('description', '')
                if isinstance(description_val, (list, dict)):
                    description_val = json.dumps(description_val)

                cur.execute(self.format_query('''
                    INSERT INTO materials (id, name, type, cost_per_gram, strength_rating, temperature_resistance, best_for, description, colors)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                '''), (
                    m.get('id', f'mat_{uuid.uuid4().hex[:6]}'),
                    m.get('name', 'Material'),
                    m.get('type', 'Standard'),
                    float(m.get('costPerGram', 0.05)),
                    int(m.get('strengthRating', 3)),
                    m.get('temperatureResistance', '60°C'),
                    best_for_val,
                    description_val,
                    colors_val
                ))

            # 3. Promo Codes
            for pc in data.get('promoCodes', []):
                cur.execute(self.format_query('''
                    INSERT INTO promo_codes (id, code, discount_percent, description, active, valid_until)
                    VALUES (?, ?, ?, ?, 1, ?)
                '''), (
                    f'promo_{uuid.uuid4().hex[:6]}',
                    pc.get('code', 'DISCOUNT').upper(),
                    float(pc.get('discountPercent', 10.0)),
                    pc.get('description', 'Promotional Discount'),
                    '2028-12-31T23:59:59Z'
                ))

            # 4. Settings
            settings = data.get('settings', {})
            for k, v in settings.items():
                cur.execute(self.format_query('''
                    INSERT INTO settings (key, value) VALUES (?, ?)
                '''), (k, json.dumps(v) if isinstance(v, (dict, list)) else str(v)))

            # 5. Users
            for u in data.get('users', []):
                cur.execute(self.format_query('''
                    INSERT INTO users (id, email, password_hash, salt, name, phone, company, role, email_verified, token, created_at, updated_at, last_login)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'customer', 1, ?, ?, ?, ?)
                '''), (
                    u.get('id', f'usr_{uuid.uuid4().hex[:6]}'),
                    u.get('email', '').lower().strip(),
                    u.get('passwordHash', ''),
                    u.get('salt', 'default_salt'),
                    u.get('name', 'Client'),
                    u.get('phone', ''),
                    '',
                    u.get('token', ''),
                    u.get('createdAt', now_str),
                    now_str,
                    u.get('lastLogin', now_str)
                ))

            # 6. Quotes
            for q in data.get('quotes', []):
                qid = q.get('id', f'LS-{uuid.uuid4().hex[:6].upper()}')
                pricing = q.get('pricing', {})
                cur.execute(self.format_query('''
                    INSERT INTO quotes (id, public_reference, guest_email, customer_name, phone, company, project_name, description, material, color, quantity, quality, strength, turnaround, deadline, shipping_country, customer_notes, is_confidential, status, payment_status, payment_method, estimated_material_cost, estimated_machine_cost, design_cost, shipping_cost, discount, subtotal, final_price, currency, internal_notes, admin_notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?)
                '''), (
                    qid,
                    qid,
                    q.get('email', '').lower(),
                    q.get('customerName', 'Valued Client'),
                    q.get('phone', ''),
                    q.get('company', ''),
                    q.get('projectName', 'Custom 3D Print'),
                    q.get('description', ''),
                    q.get('material', 'PETG'),
                    q.get('color', 'Black'),
                    int(q.get('quantity', 1)),
                    q.get('quality', 'Standard (0.20mm)'),
                    q.get('strength', 'Standard (30% Infill)'),
                    q.get('turnaround', 'Standard (3-5 Days)'),
                    q.get('deadline', ''),
                    q.get('shippingCountry', 'Portugal'),
                    q.get('customerNotes', ''),
                    1 if q.get('isConfidential', False) else 0,
                    q.get('status', 'Quote Requested'),
                    q.get('paymentStatus', 'unpaid'),
                    q.get('paymentMethod', ''),
                    float(pricing.get('materialCost', 6.00)),
                    float(pricing.get('machineCost', 14.00)),
                    float(pricing.get('designCost', 0.00)),
                    float(pricing.get('shippingCost', 4.50)),
                    float(pricing.get('discount', 0.00)),
                    float(pricing.get('subtotal', 20.00)),
                    float(pricing.get('finalPrice', 24.50)),
                    q.get('internalNotes', ''),
                    q.get('adminNotes', ''),
                    q.get('createdAt', now_str),
                    now_str
                ))

                # Quote files
                for fentry in q.get('files', []):
                    cur.execute(self.format_query('''
                        INSERT INTO quote_files (id, quote_id, original_filename, disk_filename, storage_url, mime_type, file_size, uploaded_at)
                        VALUES (?, ?, ?, ?, ?, 'application/octet-stream', ?, ?)
                    '''), (
                        f'file_{uuid.uuid4().hex[:8]}',
                        qid,
                        fentry.get('name', 'model.stl'),
                        fentry.get('name', 'model.stl'),
                        fentry.get('url', f'/api/files/{qid}_model.stl'),
                        fentry.get('size', '1.2 MB'),
                        now_str
                    ))

            # 7. Orders
            for o in data.get('orders', []):
                oid = o.get('id', f'ORD-{uuid.uuid4().hex[:6].upper()}')
                cur.execute(self.format_query('''
                    INSERT INTO orders (id, public_reference, quote_id, customer_name, email, phone, shipping_name, shipping_address, postal_code, city, country, subtotal, shipping_cost, discount, total, currency, payment_status, payment_provider, payment_method, carrier, tracking_number, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, 'stripe', ?, ?, ?, ?, ?, ?)
                '''), (
                    oid,
                    oid,
                    o.get('quoteId', ''),
                    o.get('customerName', 'Store Customer'),
                    o.get('email', '').lower(),
                    o.get('phone', ''),
                    o.get('shippingAddress', {}).get('name', o.get('customerName', '')),
                    o.get('shippingAddress', {}).get('address', ''),
                    o.get('shippingAddress', {}).get('postalCode', ''),
                    o.get('shippingAddress', {}).get('city', 'Lisbon'),
                    o.get('shippingAddress', {}).get('country', 'Portugal'),
                    float(o.get('subtotal', 0.0)),
                    float(o.get('shippingCost', 4.50)),
                    float(o.get('discount', 0.0)),
                    float(o.get('total', 0.0)),
                    o.get('paymentStatus', 'unpaid'),
                    o.get('paymentMethod', 'MB WAY'),
                    o.get('carrier', 'CTT Expresso'),
                    o.get('trackingNumber', 'GENERATING'),
                    o.get('status', 'Preparing'),
                    o.get('createdAt', now_str),
                    now_str
                ))

                # Order items
                for item in o.get('items', []):
                    cur.execute(self.format_query('''
                        INSERT INTO order_items (id, order_id, product_id, product_name, material, color, customization, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    '''), (
                        f'item_{uuid.uuid4().hex[:8]}',
                        oid,
                        item.get('id', 'prod-1'),
                        item.get('title', 'Item'),
                        item.get('material', 'PETG'),
                        item.get('color', 'Black'),
                        item.get('customization', ''),
                        int(item.get('quantity', 1)),
                        float(item.get('price', 0.0)),
                        float(item.get('price', 0.0)) * int(item.get('quantity', 1))
                    ))

            conn.commit()
            print('[Database Migration] Migration successfully completed and committed.')
        except Exception as e:
            conn.rollback()
            print(f'[Database Migration] Warning during legacy import: {e}')
        finally:
            conn.close()

    # --- Public Reference Generator ---
    def generate_quote_ref(self):
        suffix = secrets.token_hex(3).upper()
        return f'LS-Q-{suffix}'

    def generate_order_ref(self):
        suffix = secrets.token_hex(3).upper()
        return f'LS-O-{suffix}'

    # --- Server-Side Pricing Verification ---
    def calculate_store_pricing(self, items, shipping_country='Portugal', promo_code=''):
        subtotal = 0.0
        verified_items = []

        for item in items:
            prod_id = item.get('productId') or item.get('id')
            prod = self.fetchone('SELECT * FROM products WHERE id = ? OR slug = ?', (prod_id, prod_id))
            if not prod:
                continue

            unit_price = float(prod.get('price', 0.0))
            qty = max(1, int(item.get('quantity', 1)))
            item_total = round(unit_price * qty, 2)
            subtotal += item_total

            verified_items.append({
                'productId': prod.get('id'),
                'title': prod.get('title'),
                'material': item.get('material') or prod.get('default_material', 'PLA+ Matte'),
                'color': item.get('color', 'Matte Black'),
                'customization': item.get('customization', ''),
                'quantity': qty,
                'unitPrice': unit_price,
                'totalPrice': item_total
            })

        subtotal = round(subtotal, 2)

        # Shipping rules
        country_lower = (shipping_country or 'Portugal').strip().lower()
        if 'island' in country_lower or 'madeira' in country_lower or 'açores' in country_lower or 'azores' in country_lower:
            shipping_cost = 6.90
        elif 'portugal' in country_lower or 'pt' == country_lower:
            shipping_cost = 0.0 if subtotal >= 50.0 else 4.50
        elif any(c in country_lower for c in ['spain', 'espanha', 'france', 'germany', 'italy', 'netherlands', 'belgium', 'austria', 'europe', 'eu']):
            shipping_cost = 9.90
        else:
            shipping_cost = 18.00

        # Promo discount
        discount = 0.0
        if promo_code:
            promo = self.fetchone('SELECT * FROM promo_codes WHERE code = ? AND active = 1', (promo_code.strip().upper(),))
            if promo:
                pct = float(promo.get('discount_percent', 0.0))
                discount = round(subtotal * (pct / 100.0), 2)

        total = max(0.0, round(subtotal + shipping_cost - discount, 2))
        return {
            'subtotal': subtotal,
            'shippingCost': shipping_cost,
            'discount': discount,
            'total': total,
            'items': verified_items
        }

    # --- User Accounts ---
    def get_user_by_email(self, email):
        return self.fetchone('SELECT * FROM users WHERE LOWER(email) = ?', (email.strip().lower(),))

    def get_user_by_token(self, token):
        if not token:
            return None
        return self.fetchone('SELECT * FROM users WHERE token = ?', (token,))

    def create_user(self, email, password_hash, salt, name='Cliente', phone='', company='', role='customer'):
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        user_id = f'usr_{secrets.token_hex(6)}'
        token = f'usr_{secrets.token_hex(24)}'
        self.execute('''
            INSERT INTO users (id, email, password_hash, salt, name, phone, company, role, email_verified, token, created_at, updated_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
        ''', (user_id, email.strip().lower(), password_hash, salt, name, phone, company, role, token, now_str, now_str, now_str))
        return self.fetchone('SELECT * FROM users WHERE id = ?', (user_id,))

    def update_user_login(self, user_id, new_token=None):
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        if new_token:
            self.execute('UPDATE users SET last_login = ?, token = ?, updated_at = ? WHERE id = ?', (now_str, new_token, now_str, user_id))
        else:
            self.execute('UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?', (now_str, now_str, user_id))

    # --- Quotes ---
    def get_quotes(self, limit=100, offset=0, customer_id=None):
        if customer_id:
            rows = self.fetchall('SELECT * FROM quotes WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', (customer_id, limit, offset))
        else:
            rows = self.fetchall('SELECT * FROM quotes ORDER BY created_at DESC LIMIT ? OFFSET ?', (limit, offset))
        
        for q in rows:
            q['files'] = self.fetchall('SELECT * FROM quote_files WHERE quote_id = ?', (q.get('id'),))
        return rows

    def get_quote_by_id_or_ref(self, ref_or_id):
        q = self.fetchone('SELECT * FROM quotes WHERE id = ? OR public_reference = ?', (ref_or_id, ref_or_id))
        if q:
            q['files'] = self.fetchall('SELECT * FROM quote_files WHERE quote_id = ?', (q.get('id'),))
        return q

    def create_quote(self, data, files=None):
        conn = self.get_connection()
        cur = conn.cursor()
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        quote_id = self.generate_quote_ref()

        try:
            cur.execute(self.format_query('''
                INSERT INTO quotes (
                    id, public_reference, customer_id, guest_email, customer_name, phone, company,
                    project_name, description, material, color, quantity, quality, strength, turnaround,
                    deadline, shipping_country, customer_notes, is_confidential, status, payment_status,
                    payment_method, estimated_material_cost, estimated_machine_cost, design_cost,
                    shipping_cost, discount, subtotal, final_price, currency, internal_notes, admin_notes,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?)
            '''), (
                quote_id,
                quote_id,
                data.get('customerId'),
                data.get('email', '').strip().lower(),
                data.get('customerName', 'Valued Client'),
                data.get('phone', ''),
                data.get('company', ''),
                data.get('projectName', 'Custom 3D Print Request'),
                data.get('description', ''),
                data.get('material', 'PETG'),
                data.get('color', 'Black'),
                max(1, int(data.get('quantity', 1))),
                data.get('quality', 'Standard (0.20mm)'),
                data.get('strength', 'Standard (30% Infill)'),
                data.get('turnaround', 'Standard (3-5 Days)'),
                data.get('deadline', ''),
                data.get('shippingCountry', 'Portugal'),
                data.get('customerNotes', ''),
                1 if data.get('isConfidential') else 0,
                'Quote Requested',
                'unpaid',
                data.get('paymentMethod', ''),
                float(data.get('materialCost', 6.00)),
                float(data.get('machineCost', 14.00)),
                float(data.get('designCost', 0.00)),
                float(data.get('shippingCost', 4.50)),
                float(data.get('discount', 0.00)),
                float(data.get('subtotal', 20.00)),
                float(data.get('finalPrice', 24.50)),
                'Initial quote request received.',
                'Pending engineering inspection.',
                now_str,
                now_str
            ))

            if files:
                for f in files:
                    file_id = f'file_{uuid.uuid4().hex[:8]}'
                    cur.execute(self.format_query('''
                        INSERT INTO quote_files (id, quote_id, original_filename, disk_filename, storage_url, mime_type, file_size, uploaded_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    '''), (
                        file_id,
                        quote_id,
                        f.get('name', 'model.stl'),
                        f.get('diskFilename', f'{quote_id}_{f.get("name", "model.stl")}'),
                        f.get('url', f'/api/files/{quote_id}_{f.get("name", "model.stl")}'),
                        f.get('mimeType', 'application/octet-stream'),
                        f.get('size', '1.2 MB'),
                        now_str
                    ))

            # Add notification
            cur.execute(self.format_query('''
                INSERT INTO notifications (id, user_id, order_id, email, title, message, status, read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
            '''), (
                f'notif_{uuid.uuid4().hex[:8]}',
                data.get('customerId'),
                quote_id,
                data.get('email', '').strip().lower(),
                f'Novo Pedido de Orçamento ({quote_id})',
                f'O seu pedido de orçamento para "{data.get("projectName", "Custom 3D Print")}" foi registado com sucesso.',
                'Quote Requested',
                now_str
            ))

            conn.commit()
            return self.get_quote_by_id_or_ref(quote_id)
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def update_quote(self, quote_id, updates):
        fields = []
        params = []
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        updates['updated_at'] = now_str

        for k, v in updates.items():
            fields.append(f'{k} = ?')
            params.append(v)
        params.append(quote_id)
        params.append(quote_id)

        sql = f"UPDATE quotes SET {', '.join(fields)} WHERE id = ? OR public_reference = ?"
        self.execute(sql, params)
        return self.get_quote_by_id_or_ref(quote_id)

    def delete_quote(self, quote_id):
        self.execute('DELETE FROM quotes WHERE id = ? OR public_reference = ?', (quote_id, quote_id))
        return True

    # --- Orders ---
    def get_orders(self, limit=100, offset=0, customer_id=None):
        if customer_id:
            rows = self.fetchall('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', (customer_id, limit, offset))
        else:
            rows = self.fetchall('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?', (limit, offset))

        for o in rows:
            o['items'] = self.fetchall('SELECT * FROM order_items WHERE order_id = ?', (o.get('id'),))
        return rows

    def get_order_by_id_or_ref(self, ref_or_id):
        o = self.fetchone('SELECT * FROM orders WHERE id = ? OR public_reference = ? OR quote_id = ?', (ref_or_id, ref_or_id, ref_or_id))
        if o:
            o['items'] = self.fetchall('SELECT * FROM order_items WHERE order_id = ?', (o.get('id'),))
        return o

    def create_order(self, data, items=None):
        conn = self.get_connection()
        cur = conn.cursor()
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        order_id = self.generate_order_ref()

        try:
            cur.execute(self.format_query('''
                INSERT INTO orders (
                    id, public_reference, customer_id, quote_id, customer_name, email, phone,
                    shipping_name, shipping_address, postal_code, city, country, subtotal,
                    shipping_cost, discount, total, currency, payment_status, payment_provider,
                    payment_method, carrier, tracking_number, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?, ?, ?, ?, ?)
            '''), (
                order_id,
                order_id,
                data.get('customerId'),
                data.get('quoteId', ''),
                data.get('customerName', 'Store Customer'),
                data.get('email', '').strip().lower(),
                data.get('phone', ''),
                data.get('shippingName', data.get('customerName', '')),
                data.get('shippingAddress', ''),
                data.get('postalCode', ''),
                data.get('city', 'Portugal'),
                data.get('country', 'Portugal'),
                float(data.get('subtotal', 0.0)),
                float(data.get('shippingCost', 4.50)),
                float(data.get('discount', 0.00)),
                float(data.get('total', 0.00)),
                'unpaid',
                data.get('paymentProvider', 'stripe'),
                data.get('paymentMethod', 'MB WAY'),
                data.get('carrier', 'CTT Expresso'),
                'GENERATING',
                'Preparing',
                now_str,
                now_str
            ))

            if items:
                for item in items:
                    item_id = f'item_{uuid.uuid4().hex[:8]}'
                    cur.execute(self.format_query('''
                        INSERT INTO order_items (id, order_id, product_id, product_name, material, color, customization, quantity, unit_price, total_price)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    '''), (
                        item_id,
                        order_id,
                        item.get('productId', 'prod-1'),
                        item.get('title', 'Item'),
                        item.get('material', 'PETG'),
                        item.get('color', 'Black'),
                        item.get('customization', ''),
                        max(1, int(item.get('quantity', 1))),
                        float(item.get('unitPrice', item.get('price', 0.0))),
                        float(item.get('totalPrice', item.get('price', 0.0) * item.get('quantity', 1)))
                    ))

            # Add notification
            cur.execute(self.format_query('''
                INSERT INTO notifications (id, user_id, order_id, email, title, message, status, read, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
            '''), (
                f'notif_{uuid.uuid4().hex[:8]}',
                data.get('customerId'),
                order_id,
                data.get('email', '').strip().lower(),
                f'Nova Encomenda Criada ({order_id})',
                f'A sua encomenda {order_id} foi registada. Conclua o pagamento para início da impressão.',
                'Preparing',
                now_str
            ))

            conn.commit()
            return self.get_order_by_id_or_ref(order_id)
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    def update_order(self, order_id, updates):
        fields = []
        params = []
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        updates['updated_at'] = now_str

        for k, v in updates.items():
            fields.append(f'{k} = ?')
            params.append(v)
        params.append(order_id)
        params.append(order_id)

        sql = f"UPDATE orders SET {', '.join(fields)} WHERE id = ? OR public_reference = ?"
        self.execute(sql, params)
        return self.get_order_by_id_or_ref(order_id)

    def delete_order(self, order_id):
        self.execute('DELETE FROM orders WHERE id = ? OR public_reference = ?', (order_id, order_id))
        return True

    # --- Products & Materials ---
    def get_products(self):
        rows = self.fetchall('SELECT * FROM products WHERE active = 1 ORDER BY id ASC')
        for r in rows:
            if isinstance(r.get('materials'), str):
                try: r['materials'] = json.loads(r['materials'])
                except: pass
            if isinstance(r.get('colors'), str):
                try: r['colors'] = json.loads(r['colors'])
                except: pass
        return rows

    def get_materials(self):
        rows = self.fetchall('SELECT * FROM materials ORDER BY id ASC')
        for r in rows:
            if isinstance(r.get('colors'), str):
                try: r['colors'] = json.loads(r['colors'])
                except: pass
            if isinstance(r.get('best_for'), str) and r['best_for'].startswith('['):
                try: r['best_for'] = json.loads(r['best_for'])
                except: pass
        return rows

    # --- Notifications ---
    def get_notifications(self, email='', user_id=None, order_ids=None):
        conds = []
        params = []
        if email:
            conds.append('LOWER(email) = ?')
            params.append(email.strip().lower())
        if user_id:
            conds.append('user_id = ?')
            params.append(user_id)
        if order_ids:
            placeholders = ', '.join(['?'] * len(order_ids))
            conds.append(f'order_id IN ({placeholders})')
            params.extend(order_ids)

        if not conds:
            return []

        sql = f"SELECT * FROM notifications WHERE {' OR '.join(conds)} ORDER BY created_at DESC LIMIT 50"
        return self.fetchall(sql, params)

    def mark_notification_read(self, notif_id=None, email=''):
        if notif_id:
            self.execute('UPDATE notifications SET read = 1 WHERE id = ?', (notif_id,))
        elif email:
            self.execute('UPDATE notifications SET read = 1 WHERE LOWER(email) = ?', (email.strip().lower(),))
        return True

    # --- Stripe Webhook Idempotent Processor ---
    def process_stripe_webhook_event(self, event_id, event_type, session_obj):
        conn = self.get_connection()
        cur = conn.cursor()
        now_str = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

        try:
            # 1. Idempotency Check
            cur.execute(self.format_query('SELECT id FROM webhook_events WHERE event_id = ?'), (event_id,))
            if cur.fetchone():
                return {'success': True, 'idempotent': True, 'message': 'Event already processed.'}

            # 2. Record Event
            cur.execute(self.format_query('''
                INSERT INTO webhook_events (id, event_id, event_type, provider, payload, processed_at)
                VALUES (?, ?, ?, 'stripe', ?, ?)
            '''), (
                f'evt_{uuid.uuid4().hex[:8]}',
                event_id,
                event_type,
                json.dumps(session_obj),
                now_str
            ))

            # 3. Process Checkout Session Completed
            if event_type == 'checkout.session.completed':
                metadata = session_obj.get('metadata', {})
                order_id = metadata.get('order_id', '')
                order_type = metadata.get('order_type', 'order')
                amount_total = float(session_obj.get('amount_total', 0)) / 100.0
                payment_intent_id = session_obj.get('payment_intent', '')

                if order_id:
                    # Update Orders or Quotes
                    if order_type == 'quote' or order_id.startswith('LS-Q'):
                        cur.execute(self.format_query('''
                            UPDATE quotes SET payment_status = 'paid', status = 'Preparing', payment_method = 'Stripe (Card/Apple Pay/Google Pay)', updated_at = ?
                            WHERE id = ? OR public_reference = ?
                        '''), (now_str, order_id, order_id))
                    else:
                        cur.execute(self.format_query('''
                            UPDATE orders SET payment_status = 'paid', status = 'Preparing', payment_method = 'Stripe (Card/Apple Pay/Google Pay)', updated_at = ?
                            WHERE id = ? OR public_reference = ?
                        '''), (now_str, order_id, order_id))

                    # Insert Payment Record
                    cur.execute(self.format_query('''
                        INSERT INTO payments (id, order_id, quote_id, provider, provider_payment_id, provider_session_id, amount, currency, status, created_at, confirmed_at)
                        VALUES (?, ?, ?, 'stripe', ?, ?, ?, 'EUR', 'paid', ?, ?)
                    '''), (
                        f'pay_{uuid.uuid4().hex[:8]}',
                        order_id if order_type != 'quote' else None,
                        order_id if order_type == 'quote' else None,
                        payment_intent_id,
                        session_obj.get('id', ''),
                        amount_total,
                        now_str,
                        now_str
                    ))

                    # Insert Notification
                    cur.execute(self.format_query('''
                        INSERT INTO notifications (id, order_id, email, title, message, status, read, created_at)
                        VALUES (?, ?, ?, ?, ?, 'Preparing', 0, ?)
                    '''), (
                        f'notif_{uuid.uuid4().hex[:8]}',
                        order_id,
                        session_obj.get('customer_details', {}).get('email', ''),
                        f'Pagamento Confirmado ({order_id})',
                        f'O seu pagamento de €{amount_total:.2f} foi verificado com sucesso via Stripe e a produção foi iniciada.',
                        now_str
                    ))

            conn.commit()
            return {'success': True, 'idempotent': False, 'message': 'Payment processed successfully.'}
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

    # --- Admin Statistics ---
    def get_admin_stats(self):
        quotes = self.fetchall('SELECT * FROM quotes')
        orders = self.fetchall('SELECT * FROM orders')
        payments = self.fetchall('SELECT * FROM payments WHERE status = ?', ('paid',))

        total_revenue = sum(float(p.get('amount', 0.0)) for p in payments)
        active_prints = len([o for o in orders if o.get('status') in ['Printing', 'Preparing']]) + len([q for q in quotes if q.get('status') in ['Printing', 'Preparing']])

        materials_breakdown = {}
        for q in quotes:
            m = q.get('material', 'PETG')
            materials_breakdown[m] = materials_breakdown.get(m, 0) + 1

        return {
            'totalRevenue': round(total_revenue, 2),
            'totalOrders': len(orders),
            'totalQuotes': len(quotes),
            'activePrints': active_prints,
            'materialsBreakdown': materials_breakdown,
            'conversionRate': '72.5%'
        }

    # --- File Authorization Verification ---
    def verify_file_access(self, filename, user_id=None, email='', is_admin=False):
        if is_admin:
            return True
        clean_name = os.path.basename(filename).strip()
        qf = self.fetchone('SELECT * FROM quote_files WHERE disk_filename = ? OR original_filename = ?', (clean_name, clean_name))
        if not qf:
            return False

        quote = self.fetchone('SELECT * FROM quotes WHERE id = ?', (qf.get('quote_id'),))
        if not quote:
            return False

        if user_id and quote.get('customer_id') == user_id:
            return True
        if email and quote.get('guest_email', '').lower() == email.strip().lower():
            return True
        return False

# Global Singleton Database Manager
db = DatabaseManager()

