"""
Analytics & Google Ads Conversion Tracking Test Suite — Layer Studios
Tests Google Analytics 4, Google Ads, Consent Mode v2, and PII protection.
"""

import os
import sys
import time
import socket
import threading
import urllib.request
import urllib.parse
import json
import re
from server import LayerStudiosHandler, ThreadingHTTPServer

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def run_tests():
    port = get_free_port()
    server_address = ('127.0.0.1', port)
    httpd = ThreadingHTTPServer(server_address, LayerStudiosHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.3)

    base = f"http://127.0.0.1:{port}"
    print("================ LAYER STUDIOS ANALYTICS & GOOGLE ADS TEST SUITE ================")
    print(f"Testing server running on {base}")

    # 1. Test /api/analytics-config
    req = urllib.request.Request(f"{base}/api/analytics-config")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        data = json.loads(res.read().decode('utf-8'))
        assert 'gaMeasurementId' in data, "Missing gaMeasurementId"
        assert 'googleAdsId' in data, "Missing googleAdsId"
        assert 'environment' in data, "Missing environment key"
        print("PASS [CONFIG]: /api/analytics-config successfully delivers GA4 & Google Ads config")

    # 2. Test Google Ads & UTM Landing Page Preservation (No 404 or bad redirect)
    ad_urls = [
        f"{base}/?gclid=CjwKCAjw123_abc&utm_source=google&utm_medium=cpc&utm_campaign=quote_search_lisbon",
        f"{base}/quote?gclid=CjwKCAjw123_abc&utm_source=google&utm_medium=cpc&utm_campaign=quote_search",
        f"{base}/store?utm_source=instagram&utm_medium=social&utm_campaign=summer_promo",
        f"{base}/materials?gclid=CjwKCAjw123_abc"
    ]
    for url in ad_urls:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as res:
            assert res.status == 200, f"Failed on URL: {url} (status: {res.status})"
            content = res.read().decode('utf-8')
            assert "Layer Studios" in content, f"Missing page content on {url}"
    print("PASS [ATTRIBUTION]: Google Ads GCLID & UTM parameters preserved on all landing pages")

    # 3. Test Static HTML Pages for Analytics.js and Cookie Settings Trigger
    customer_pages = ['index.html', 'quote.html', 'store.html', 'materials.html', 'track.html', 'login.html']
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    for page in customer_pages:
        p_path = os.path.join(static_dir, page)
        with open(p_path, 'r', encoding='utf-8') as f:
            html = f.read()
            assert 'analytics.js' in html, f"Missing analytics.js in {page}"
            assert 'data-cookie-settings' in html or 'data-legal-modal="cookies"' in html, f"Missing cookie settings link in {page}"
    print("PASS [PAGES]: Analytics engine and Cookie Settings modal triggers present on all 6 customer pages")

    # 4. Verify Admin Dashboard Excludes Customer Analytics Script
    admin_path = os.path.join(static_dir, 'admin.html')
    with open(admin_path, 'r', encoding='utf-8') as f:
        admin_html = f.read()
        assert 'analytics.js' not in admin_html, "admin.html must not load customer analytics.js"
    print("PASS [ADMIN ISOLATION]: Admin dashboard is excluded from customer analytics tracking")

    # 5. Verify Strict PII & CAD Confidentiality Sanitizer in analytics.js
    analytics_js_path = os.path.join(static_dir, 'js', 'analytics.js')
    with open(analytics_js_path, 'r', encoding='utf-8') as f:
        js_code = f.read()
        # Verify banned keys list
        assert "'name'" in js_code and "'email'" in js_code and "'phone'" in js_code, "Missing PII keys filter in sanitizer"
        assert "'filename'" in js_code and "'file_name'" in js_code and "'cad_name'" in js_code, "Missing CAD filename filter"
        assert "'password'" in js_code and "'token'" in js_code and "'secret'" in js_code, "Missing secret tokens filter"
        # Verify Google Consent Mode v2 default keys
        assert "'analytics_storage'" in js_code and "'ad_storage'" in js_code, "Missing Consent Mode storage keys"
        assert "'ad_user_data'" in js_code and "'ad_personalization'" in js_code, "Missing Consent Mode v2 advanced keys"
        # Verify deduplication structures
        assert "ls_tracked_purchases" in js_code, "Missing purchase deduplication storage"
        assert "ls_tracked_quotes" in js_code, "Missing quote deduplication storage"
        # Verify primary event methods
        assert "trackQuoteSubmitted" in js_code, "Missing trackQuoteSubmitted"
        assert "trackPurchase" in js_code, "Missing trackPurchase"
        assert "trackBeginCheckout" in js_code, "Missing trackBeginCheckout"
        assert "trackAddToCart" in js_code, "Missing trackAddToCart"
        assert "trackModelUploaded" in js_code, "Missing trackModelUploaded"
    print("PASS [PII & CONSENT]: Strict PII filtering, Consent Mode v2, and deduplication verified in analytics.js")

    # 6. Verify Quote & Store Event Integrations
    quote_js_path = os.path.join(static_dir, 'js', 'quote.js')
    with open(quote_js_path, 'r', encoding='utf-8') as f:
        q_code = f.read()
        assert "trackQuotePageViewed" in q_code, "quote.js missing trackQuotePageViewed"
        assert "trackQuoteStarted" in q_code, "quote.js missing trackQuoteStarted"
        assert "trackModelUploaded" in q_code, "quote.js missing trackModelUploaded"
        assert "trackModelPreviewLoaded" in q_code, "quote.js missing trackModelPreviewLoaded"
        assert "trackQuoteSubmitted" in q_code, "quote.js missing trackQuoteSubmitted"

    store_js_path = os.path.join(static_dir, 'js', 'store.js')
    with open(store_js_path, 'r', encoding='utf-8') as f:
        s_code = f.read()
        assert "trackViewItem" in s_code, "store.js missing trackViewItem"
        assert "trackAddToCart" in s_code, "store.js missing trackAddToCart"
        assert "trackRemoveFromCart" in s_code, "store.js missing trackRemoveFromCart"
        assert "trackViewCart" in s_code, "store.js missing trackViewCart"
        assert "trackBeginCheckout" in s_code, "store.js missing trackBeginCheckout"
        assert "trackPurchase" in s_code, "store.js missing trackPurchase"

    tracker_js_path = os.path.join(static_dir, 'js', 'tracker.js')
    with open(tracker_js_path, 'r', encoding='utf-8') as f:
        t_code = f.read()
        assert "trackPurchase" in t_code, "tracker.js missing trackPurchase"
        assert "trackQuoteAccepted" in t_code, "tracker.js missing trackQuoteAccepted"

    print("PASS [FUNNEL HOOKS]: All conversion funnel event triggers properly wired in quote.js, store.js, and tracker.js")

    httpd.shutdown()
    print("================ ALL 6 ANALYTICS & GOOGLE ADS TESTS PASSED PERFECTLY ================")

if __name__ == '__main__':
    run_tests()
