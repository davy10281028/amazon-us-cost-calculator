# 🇺🇸 Amazon 美國站 FBA 成本計算機

給台灣（與中國）賣家用的 Amazon 美國站成本／利潤試算工具。純前端、零依賴、零建置步驟 —— 下載下來用瀏覽器打開就能跑。

**所有費率集中在一個 `rates.js`，維護者每季只要改這一個檔案。** 更新流程見 [`docs/UPDATING-RATES.md`](docs/UPDATING-RATES.md)。

---

## 功能

| | |
|---|---|
| **4 種模式** | FBA 基礎 / FBA 進階 / FBM 自配送 / 台灣電商 → 美國 Amazon |
| **2 種出貨地** | 台灣出貨（含 Amazon SEND DDP 費率）、中國出貨 |
| **雙語** | 繁中 / English，**兩份字典鍵完全對齊，有 lint 把關** |
| **自動估算** | FBA 配送費（Size Tier + 體積重 + 售價分檔 + 燃油附加費）、月倉儲費、Inbound Placement、階梯佣金、退款管理費 |
| **優惠模擬** | 新賣家入門大禮包、FBA 新選品計畫、品牌退傭；**一次性額度與結構性優惠分開標示** |
| **輸出** | 成本結構比例條、優化建議、品類市場洞察、月度預估 |
| **存檔／分享** | 自動存 localStorage、產生可分享的網址、匯出 CSV、列印成 PDF 報價單 |
| **費率新鮮度徽章** | 右上角顯示費率基準期；超過 `staleAfterDays` 或過了複查日就轉紅警示 |

---

## 檔案結構

```
amazon-cost-calculator/
├── index.html              # 版面（只有結構，沒有費率、沒有文案硬編碼）
├── styles.css              # 樣式（含手機版與列印版）
├── rates.js                # ★ 全部費率資料 —— 你唯一需要定期改的檔案
├── app.js                  # Engine（純計算）+ I18N（雙語字典）+ UI
├── docs/
│   └── UPDATING-RATES.md   # ★ 每季更新的逐項對照清單
├── test/
│   ├── engine.test.js      # 104 項斷言：與原版 parity + bug 迴歸 + 公式驗算 + 端到端
│   └── lint.js             # i18n / element id / 字典對齊靜態檢查
├── NOTICE.md               # 原作者標註
└── README.md
```

### 為什麼拆成 4 個檔案

原版是單一 2,091 行的 `index.html`，費率、文案、版面、邏輯全部混在一起。
想更新一個 FBA 費率要在 HTML 中間翻 JS，改錯一個字整頁就白畫面。

拆開之後：

- 更新費率 → 只碰 `rates.js`
- 加品類 → 只碰 `rates.js` 的 `categories` + `app.js` 的 `INSIGHTS`（lint 會提醒你別忘了）
- 佣金說明文字（「≤$10 收 8%，>$10 收 15%」）由費率數字自動生成，改數字不會忘記改說明
- 改文案 → 只碰 `app.js` 的 `I18N`，中英同一個地方，不會再漏翻
- 計算邏輯 → `Engine` 完全不碰 DOM，可以直接用 node 測

---

## 開發

不需要 npm install，Node 18+ 即可。

```bash
# 引擎測試：與原版 v1.1 逐項對照 + bug 迴歸驗證
node test/engine.test.js

# 靜態檢查：i18n key、element id、中英字典對齊
node test/lint.js
```

`engine.test.js` 的 A 區塊會拿新引擎跟**原版 v1.1 的計算函式**（原封不動抄進測試檔）
比對 2,450 組重量／尺寸／售價組合，確保重構沒有改動任何數字。

這個 parity 比對只在 `rates.js` 的 `meta.version` 仍為 `2026.04` 時執行 ——
你更新費率後會自動跳過，不會產生假失敗。其餘所有測試都是從 `rates.js`
讀值再驗算（公式、上限、迴歸、端到端），任何費率版本都會跑。

---

## 部署

### GitHub Pages

1. Settings → Pages → Source 選 `main` branch、`/ (root)`
2. 約 1 分鐘後上線於 `https://<你的帳號>.github.io/<repo 名>/`

### 本機

直接用瀏覽器打開 `index.html` 就好。
`rates.js` 是用 `<script src>` 載入而不是 `fetch`，所以 `file://` 也能正常運作，不需要起 local server。

---

## 與原版 v1.1 的差異

### 修掉的 bug

| | 問題 | 影響 |
|---|---|---|
| 1 | **FBM 模式偷算隱藏成本** —— 原版 `isBasic = (mode === 'basic')`，FBM 模式不是 basic，所以「營運成本」卡片被 CSS 隱藏了，廣告費／退貨損失／帳戶月費／Vine／關稅／其他費用卻全都算進總成本 | FBM 利潤被低估，且使用者看不到是哪來的成本 |
| 2 | **Small Bulky 的 Inbound Placement 費算錯** —— 原版用 `tier.includes('Small')` 判斷，`'Small Bulky'` 被誤判成 Small Standard 的 `$0.15`（應為 `$0.79`） | 大件商品入倉費低估 $0.64/件 |
| 3 | **售價填 0 會出現 `NaN%`** —— 有效佣金率與部分百分比欄位沒有除零防護 | 顯示 `NaN` |
| 4 | **台灣電商模式的尺寸欄位是死的** —— `twDimL/W/H` 三個輸入框完全沒有被 `calcTw()` 使用 | 國際快遞其實按材積重計費，尺寸不影響結果等於算錯 |
| 5 | **台灣電商模式的海外倉分支到不了** —— `twFbmMethod` 下拉只有一個選項，程式裡的 `else`（海外倉代發）永遠不會執行 | 功能等於不存在 |
| 6 | **Extra Large 150 lb+ 的顯示重量與計費基準不一致** —— 費用用實重算，畫面顯示 `max(實重, 體積重)`；程式裡 `tier === 'Extra Large 150+'` 這個分支的字串永遠不會相等，是死碼 | 顯示與計算對不上 |
| 7 | **英文模式只翻了一半** —— FBA 卡片、單位切換鈕、倉儲季節、優惠說明、資料來源表、`updateOriginLabels()` / `onShipMethodChange()` / `setBrandRebate()` 產生的所有文字都還是中文 | 英文使用者看到中英混雜 |
| 8 | **`setLang()` 對 `<input>` 設 `textContent`** —— 對 input 無效；且切語言後不會重跑動態標籤更新，切回來狀態會掉 | 語言切換不完整 |
| 9 | **切語言時不會刷新台灣電商面板** —— `setLang()` 只呼叫 `calc()`，沒有 `calcTw()` | 該模式下切語言結果不更新 |
| 10 | **`fns-vine`（Vine 75 折）寫死 `0.05`** —— 註解自稱「象徵性分攤」 | 現在改成 `Vine 費用 × 25%` 實算 |
| 11 | **原始碼有 mojibake** —— `// ???? + ????` 註解、重複的註解行 | 可讀性 |
| 12 | **一次性優惠額度被當成永久成本下降** —— 廣告金／Coupon／Vine／運費金按 3 個月攤提後直接併入單位成本，畫面沒有任何提示 | 賣家會以為那是長期的成本結構，照著定價會虧。現在一次性額度以 ★ 標記、單獨累計，並在建議區顯示「額度用完後利潤率會掉到 X%」 |

### 新增

- **費率資料層分離**（`rates.js`）+ 費率新鮮度徽章
- **完整英文化**，並用 `test/lint.js` 保證中英字典鍵永遠對齊
- **手機優化**：tooltip 改成可點擊（原版只有 `:hover`，手機完全點不開）、模式列可換行、390px 寬無橫向滾動
- **存檔／分享／匯出**：localStorage 自動存、分享網址、CSV 匯出、列印用 CSS（6 頁 A4、無空白頁）
- **輸入範圍檢查**：超出 min/max 的欄位邊框轉紅
- **模式切換改為純 CSS class 驅動**（原版混用 inline style 與 class，容易打架）
- **台灣電商模式**：加上材積重計算、月銷量輸入、海外倉選項、無解時的說明文字
- **測試**：104 項斷言 + 靜態 lint；費率 parity 會依 `meta.version` 自動跳過，不會假失敗

---

## 免責

所有費用估算僅供參考。Amazon 官方費用以 [Seller Central](https://sellercentral.amazon.com) 為準；
頭程運費、FBM 配送費、進口關稅等非官方費用為市場行情估算，請向
[Amazon 認證第三方服務商](https://gs.amazon.com.tw/service-provider) 取得正式報價。

本工具不收集任何使用者資料，所有計算都在瀏覽器端完成，輸入值只存在使用者自己的 localStorage。

原作者標註見 [`NOTICE.md`](NOTICE.md)。
