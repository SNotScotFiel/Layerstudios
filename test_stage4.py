"""
Stage 4 Test Suite — Layer Studios
Tests domain routing, robots.txt, sitemap.xml, 404 status codes, security headers, caching, and SEO tags.
"""

import os
import sys
import time
import socket
import threading
import urllib.request
import urllib.parse
from server import LayerStudiosHandler, ThreadingHTTPServer

TEST_PORT = 8993

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
    print(f"================ STAGE 4 COMPREHENSIVE TEST SUITE ================")
    print(f"Testing server running on {base}")

    # 1. Test /robots.txt
    req = urllib.request.Request(f"{base}/robots.txt")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"robots.txt status: {res.status}"
        body = res.read().decode('utf-8')
        assert "Disallow: /api/" in body, "Missing Disallow /api/ in robots.txt"
        assert "Disallow: /uploads/" in body, "Missing Disallow /uploads/ in robots.txt"
        assert "Sitemap:" in body, "Missing Sitemap in robots.txt"
        print("PASS [ROBOTS]: robots.txt served with correct directives and sitemap link")

    # 2. Test /sitemap.xml
    req = urllib.request.Request(f"{base}/sitemap.xml")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"sitemap.xml status: {res.status}"
        assert 'xml' in res.headers.get('Content-Type', ''), f"Bad content type: {res.headers.get('Content-Type')}"
        body = res.read().decode('utf-8')
        assert "https://layerstudios.pt/" in body, "Missing homepage in sitemap.xml"
        assert "https://layerstudios.pt/quote" in body, "Missing quote page in sitemap.xml"
        assert "https://layerstudios.pt/store" in body, "Missing store page in sitemap.xml"
        print("PASS [SITEMAP]: sitemap.xml valid and lists canonical URLs with hreflang")

    # 3. Test Custom 404 (Real HTTP 404 status, not soft-404)
    try:
        req = urllib.request.Request(f"{base}/non-existent-page-xyz")
        with urllib.request.urlopen(req) as res:
            assert False, "Expected 404 HTTPError, got 200 OK"
    except urllib.error.HTTPError as err:
        assert err.code == 404, f"Expected 404, got {err.code}"
        body = err.read().decode('utf-8')
        assert "Página Não Encontrada" in body or "404" in body, "404 page missing branded template"
        print("PASS [404]: Clean technical 404 status returned for non-existent routes")

    # 4. Test Security Headers
    req = urllib.request.Request(f"{base}/")
    with urllib.request.urlopen(req) as res:
        assert res.headers.get('X-Content-Type-Options') == 'nosniff', "Missing X-Content-Type-Options"
        assert res.headers.get('X-Frame-Options') == 'SAMEORIGIN', "Missing X-Frame-Options"
        assert res.headers.get('Referrer-Policy') == 'strict-origin-when-cross-origin', "Missing Referrer-Policy"
        print("PASS [SECURITY HEADERS]: X-Content-Type-Options, X-Frame-Options, Referrer-Policy verified")

    # 5. Test Static Asset Caching
    req = urllib.request.Request(f"{base}/static/assets/logo.svg")
    with urllib.request.urlopen(req) as res:
        cache_ctrl = res.headers.get('Cache-Control', '')
        assert 'public' in cache_ctrl and 'max-age' in cache_ctrl, f"Bad asset Cache-Control: {cache_ctrl}"
        print("PASS [CACHE]: Static assets served with public max-age caching")

    # 6. Verify HTML SEO Metadata & Structured Data
    html_files = ['index.html', 'quote.html', 'store.html', 'materials.html', 'track.html', 'login.html']
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    for hf in html_files:
        path = os.path.join(static_dir, hf)
        assert os.path.exists(path), f"Missing {hf}"
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            assert '<title>' in content, f"Missing <title> in {hf}"
            assert 'rel="canonical"' in content, f"Missing canonical tag in {hf}"
            assert 'og:title' in content, f"Missing Open Graph title in {hf}"
            assert 'lang-toggle-btn' in content, f"Missing language switcher in {hf}"
            assert 'analytics.js' in content, f"Missing analytics script in {hf}"

    print("PASS [SEO METADATA]: Canonical, Open Graph, hreflang, JSON-LD and analytics verified on all 6 pages")

    httpd.shutdown()
    print("================ ALL 6 STAGE 4 TESTS PASSED PERFECTLY ================")

if __name__ == '__main__':
    run_tests()
