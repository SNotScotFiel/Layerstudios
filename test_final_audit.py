"""
Final Pre-Launch Audit Comprehensive Suite — Layer Studios
"""
import urllib.request
import urllib.parse
import json
import time
import socket
import threading
from server import LayerStudiosHandler, ThreadingHTTPServer
from database import db

def run_audit():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        port = s.getsockname()[1]

    server_address = ('127.0.0.1', port)
    httpd = ThreadingHTTPServer(server_address, LayerStudiosHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.3)
    base = f"http://127.0.0.1:{port}"

    print("=== STARTING FINAL PRE-LAUNCH SECURITY & OPERATIONAL AUDIT ===")

    # 1. Customer Isolation Test: Customer A vs Customer B
    ts = int(time.time())
    emailA = f"customer.a.{ts}@test.com"
    emailB = f"customer.b.{ts}@test.com"

    # Register Customer A
    reqA = urllib.request.Request(f"{base}/api/auth/register", data=json.dumps({
        "name": "Customer Alpha",
        "email": emailA,
        "password": "SecurePassword123!",
        "phone": "912345678"
    }).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(reqA) as res:
        dataA = json.loads(res.read())
        tokenA = dataA['token']
        userA_id = dataA['user']['id']

    # Register Customer B
    reqB = urllib.request.Request(f"{base}/api/auth/register", data=json.dumps({
        "name": "Customer Beta",
        "email": emailB,
        "password": "SecurePassword456!",
        "phone": "912345679"
    }).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(reqB) as res:
        dataB = json.loads(res.read())
        tokenB = dataB['token']
        userB_id = dataB['user']['id']

    # Create Order for Customer A
    reqOrderA = urllib.request.Request(f"{base}/api/orders", data=json.dumps({
        "customerName": "Customer Alpha",
        "email": emailA,
        "items": [{"title": "Headphone Stand", "price": 28.50, "quantity": 1}],
        "shippingAddress": {"street": "Rua A 123", "city": "Lisboa", "postalCode": "1000-001", "country": "Portugal"},
        "paymentMethod": "Card"
    }).encode(), headers={"Content-Type": "application/json", "Authorization": f"Bearer {tokenA}"})
    with urllib.request.urlopen(reqOrderA) as res:
        orderA = json.loads(res.read())
        orderA_ref = orderA['orderId']

    # Customer B attempts to fetch Customer A's private order details via API
    reqFetch = urllib.request.Request(f"{base}/api/orders/{orderA_ref}", headers={"Authorization": f"Bearer {tokenB}"})
    with urllib.request.urlopen(reqFetch) as res:
        leak_check = json.loads(res.read())
        # Customer B should NOT receive customerName, email, or shippingAddress
        assert 'customerName' not in leak_check or leak_check['customerName'] is None, "CUSTOMER ISOLATION LEAK: Customer B saw Customer A name"
        assert 'shippingAddress' not in leak_check, "CUSTOMER ISOLATION LEAK: Customer B saw Customer A address"
        print("PASS [CUSTOMER ISOLATION]: Customer B cannot access Customer A's private PII or address")

    # 2. Guest Order Lookup Protection
    # Random visitor attempts to look up orderA_ref without email verification
    reqAnon = urllib.request.Request(f"{base}/api/orders/{orderA_ref}")
    with urllib.request.urlopen(reqAnon) as res:
        anon_data = json.loads(res.read())
        assert 'customerName' not in anon_data or anon_data['customerName'] is None, "GUEST LEAK: Anonymous lookup exposed customer name"
        assert 'shippingAddress' not in anon_data, "GUEST LEAK: Anonymous lookup exposed shipping address"
        assert 'publicReference' in anon_data or 'id' in anon_data, "Expected public status fields"
        print("PASS [GUEST PROTECTION]: Anonymous order lookup exposes only public tracking status without PII")

    # 3. Server-Side Price Calculation Verification
    attackerEmail = f"attacker.{ts}@test.com"
    tampered_quote = {
        "customerName": "Attacker",
        "email": attackerEmail,
        "material": "Carbon Fiber Nylon",
        "quantity": 10,
        "pricing": {
            "finalPrice": 0.05 # Client attempts to tamper price to 5 cents
        }
    }
    reqTamper = urllib.request.Request(f"{base}/api/quotes", data=json.dumps(tampered_quote).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(reqTamper) as res:
        quote_res = json.loads(res.read())
        q_ref = quote_res['quoteId']
        # Check verified server price
        db_quote = db.get_quote_by_id_or_ref(q_ref)
        assert float(db_quote['final_price']) > 5.0, f"PRICE TAMPERING VULNERABILITY: Price accepted as {db_quote['final_price']}"
        print(f"PASS [SERVER PRICING]: Client price tampering defeated (Server set real price: €{db_quote['final_price']})")

    # 4. Admin Workflow: Edit Quote -> Approve -> Update Status -> Tracking
    # Login as admin
    reqAdm = urllib.request.Request(f"{base}/api/admin/login", data=json.dumps({"password": "cavalao123"}).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(reqAdm) as res:
        adm_data = json.loads(res.read())
        adm_token = adm_data['token']

    # Admin updates quote price & notes
    reqUpd = urllib.request.Request(f"{base}/api/quotes/{q_ref}", data=json.dumps({
        "final_price": 85.00,
        "internal_notes": "Reviewed CAD mesh, ready for Bambu X1-Carbon CF printing",
        "status": "Quote Ready"
    }).encode(), headers={"Content-Type": "application/json", "Authorization": f"Bearer {adm_token}"}, method="PUT")
    with urllib.request.urlopen(reqUpd) as res:
        assert res.status == 200
        print("PASS [ADMIN QUOTE EDIT]: Admin modified quote price and internal notes successfully")

    # Verify Customer cannot see internal admin notes
    reqCustView = urllib.request.Request(f"{base}/api/quotes/{q_ref}?email={attackerEmail}")
    with urllib.request.urlopen(reqCustView) as res:
        cust_quote = json.loads(res.read())
        assert 'internal_notes' not in cust_quote or not cust_quote.get('internal_notes'), "ADMIN NOTE LEAK: Internal notes exposed to customer"
        print("PASS [INTERNAL NOTE PRIVACY]: Internal admin notes remain private from customer view")

    # 5. File Protection Test
    reqDirect = urllib.request.Request(f"{base}/uploads/test_mesh.stl")
    try:
        urllib.request.urlopen(reqDirect)
        assert False, "Uploads directory was publicly browsable"
    except urllib.error.HTTPError as err:
        assert err.code == 403, f"Expected 403 Forbidden on direct uploads, got {err.code}"
        print("PASS [FILE PROTECTION]: Direct /uploads/ browsing blocked with HTTP 403")

    httpd.shutdown()
    print("=== ALL PRE-LAUNCH AUDIT TESTS PASSED SUCCESSFULLY ===")

if __name__ == '__main__':
    run_audit()
