#!/usr/bin/env python3
"""
read-seller-central.py — 讀取需要登入的 Seller Central 說明頁，把表格匯出成 JSON

    python scripts/read-seller-central.py GABBX6GZPA8MSZGW
    python scripts/read-seller-central.py GABBX6GZPA8MSZGW --out fba.json --show

為什麼需要這支腳本
------------------
Seller Central 的費率頁 (`/help/hub/reference/external/<NODE_ID>`) 是 SPA，
用 curl 抓會回 HTTP 200 但內容是 JS 外殼，0 筆費率資料。

Amazon 內部的 Lens 把 Seller Central 代理到 `sellercentral.amazon.dev`
（注意是 .dev），該網域走 Midway 認證。所以只要 Midway 是新的，
就能用本機 Chrome + Midway cookie 渲染出官方表格。

前置條件
--------
1. `mwinit -f`（確保 ~/.midway/cookie 是新的）
2. `pip install playwright` 且本機裝有 Chrome
   （用 channel="chrome"，不需要 `playwright install`）

注意
----
・有些 node id 會被導到 /sign-in，代表這條路走不通，得手動開或請人代查。
・匯出的 JSON 請用腳本轉成 rates.js，**不要人工抄數字** ——
  原版 v1.1 的費率錯誤正是人工轉抄看錯欄位造成的。
・官方頁通常附「Product size examples」，把它寫進 test/engine.test.js 當黃金測試。
"""

import argparse
import io
import json
import os
import re
import sys

# Windows 預設 cp1252，印中文會炸。stderr 也要設，否則進度訊息會變成轉義碼。
for _stream in (sys.stdout, sys.stderr):
    if _stream.encoding and _stream.encoding.lower() != "utf-8":
        _stream.reconfigure(encoding="utf-8")

BASE = "https://sellercentral.amazon.dev/help/hub/reference/external/"
DEFAULT_COOKIE = os.path.expanduser("~/.midway/cookie")

MONEY_RE = re.compile(r"[$][0-9]+[.][0-9]{2}")   # 用來粗估頁面上有多少筆費率
WS_RE = re.compile(r"[ \t\r\n]+")
NL = chr(10)


def load_midway_cookies(path):
    """把 Netscape 格式的 Midway cookie 轉成 Playwright 的 cookie dict"""
    if not os.path.exists(path):
        sys.exit(f"找不到 Midway cookie：{path}\n請先執行 mwinit -f")
    out = []
    for line in io.open(path, encoding="utf-8", errors="ignore"):
        line = line.rstrip("\n")
        if line.startswith("#HttpOnly_"):
            line = line[len("#HttpOnly_"):]
        elif line.startswith("#") or not line.strip():
            continue
        f = line.split("\t")
        if len(f) < 7:
            continue
        domain, _flag, cpath, secure, expires, name, value = f[:7]
        try:
            expires = int(float(expires))
        except ValueError:
            expires = -1
        out.append({
            "name": name, "value": value, "domain": domain, "path": cpath,
            "expires": expires if expires > 0 else -1,
            "httpOnly": False, "secure": secure.upper() == "TRUE",
            "sameSite": "None" if secure.upper() == "TRUE" else "Lax",
        })
    if not out:
        sys.exit(f"{path} 解析不出任何 cookie，格式可能不對")
    return out


def scrape(node_id, cookie_path, headless):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("需要 playwright：pip install playwright")

    url = BASE + node_id
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=headless)
        ctx = browser.new_context(viewport={"width": 1600, "height": 1200}, locale="en-US")
        cookies = load_midway_cookies(cookie_path)
        ctx.add_cookies(cookies)
        print(f"注入 {len(cookies)} 個 Midway cookie", file=sys.stderr)

        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_timeout(7000)                 # SPA 要時間渲染
        for _ in range(12):                          # 往下滾，觸發 lazy render
            page.mouse.wheel(0, 3000)
            page.wait_for_timeout(350)
        page.wait_for_timeout(2000)

        final_url, title = page.url, page.title()
        if "/sign-in" in final_url:
            browser.close()
            sys.exit(f"被導到登入頁，這個 node 讀不到：\n  {final_url}\n"
                     f"請手動用你已登入的 Chrome 開啟，或請有權限的同事代查。")

        body = page.inner_text("body")
        tables = page.eval_on_selector_all("table", """ts => ts.map((t, i) => ({
            index: i,
            heading: (t.previousElementSibling ? t.previousElementSibling.innerText : '').slice(0, 300),
            rows: [...t.querySelectorAll('tr')].map(r =>
                [...r.querySelectorAll('th,td')].map(c => c.innerText.trim()))
        }))""")
        browser.close()

    return {"nodeId": node_id, "url": url, "finalUrl": final_url,
            "title": title, "bodyText": body, "tables": tables}


def main():
    ap = argparse.ArgumentParser(description="讀取 Seller Central 說明頁並匯出表格")
    ap.add_argument("node_id", help="例如 GABBX6GZPA8MSZGW")
    ap.add_argument("--out", help="輸出 JSON 路徑（預設 sc_<NODE_ID>.json）")
    ap.add_argument("--cookie", default=DEFAULT_COOKIE, help="Midway cookie 路徑")
    ap.add_argument("--show", action="store_true", help="順便把表格印到畫面上")
    ap.add_argument("--headed", action="store_true", help="顯示瀏覽器視窗（除錯用）")
    a = ap.parse_args()

    data = scrape(a.node_id, a.cookie, headless=not a.headed)
    out = a.out or f"sc_{a.node_id}.json"
    io.open(out, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=1))

    print(f"\n標題   : {data['title']}")
    print(f"字元數 : {len(data['bodyText'])}")
    print(f"表格數 : {len(data['tables'])}")
    print(f"金額數 : {len(re.findall(MONEY_RE, data['bodyText']))}")
    print(f"已寫入 : {out}")

    if not data["tables"]:
        print("\n⚠️ 沒抓到任何表格。可能是渲染還沒完成，或這頁本來就沒有表格。")

    if a.show:
        for t in data["tables"]:
            print(f"\n{'=' * 78}\n### table {t['index']}  rows={len(t['rows'])}")
            head = WS_RE.sub(" ", t["heading"]).strip()
            if head:
                print("heading:", head[:160])
            for row in t["rows"]:
                print("  ", " | ".join(c.replace(NL, " ")[:28] for c in row))

    print("\n下一步：用腳本把 tables 轉成 rates.js 的區塊，不要人工抄數字。")
    print("        並把官方的 Product size examples 加進 test/engine.test.js。")


if __name__ == "__main__":
    main()
