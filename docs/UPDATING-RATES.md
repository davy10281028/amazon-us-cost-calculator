# 費率更新手冊

> 每季（或 Amazon 公告調費時）照這份清單走一遍。
> **所有費率都只在 `rates.js` 一個檔案裡，不要去改 `app.js` 或 `index.html`。**

---

## 0. 更新前先做的兩件事

```bash
# 1. 記下目前的基準期，方便對照
grep -A4 "meta: {" rates.js

# 2. 跑一次測試，確認起點是乾淨的
node test/engine.test.js
node test/lint.js
```

---

## 1. 逐項對照清單

下表左邊是 `rates.js` 裡的路徑，右邊是要去對照的官方頁面。
**打 🔒 的需要登入 Seller Central** —— 讀法見 §1b（Lens + Midway，有腳本可用）。

| # | `rates.js` 路徑 | 對照來源 | 重點看什麼 |
|---|---|---|---|
| 1 | `fba.rates.{nonApparel,apparel}.{nonPeak,peak}` | 🔒 [Seller Central GABBX6GZPA8MSZGW](https://sellercentral.amazon.dev/help/hub/reference/external/GABBX6GZPA8MSZGW)（見 §1b） | **最容易變、也最影響結果的一項。**<br>四張費率卡（服裝/非服裝 × 旺季/非旺季）各 3 個售價檔 × 每個重量級距。<br>⚠️ 官方表會把**多個年度並排**，務必確認抓的是當期那幾欄 —— 原版 v1.1 就是在這裡抄錯（見 §2b）。<br>用 `scripts/read-seller-central.py` 匯出後以腳本轉換，不要人工抄。 |
| 2 | `fuelSurcharge.pct` | 同上 | 目前 3.5%。Amazon 曾多次調整燃油附加費，**每次更新都要確認這個數字還在不在、有沒有變**。 |
| 3 | `sizeTiers.*` | 同上（Product size tiers 段） | 尺寸／重量門檻。變動頻率低，但 2024 年 Amazon 改過一次，不要假設不變。 |
| 4 | `storage.standard.*`<br>`storage.oversize.*` | 🔒 [Seller Central G200612770](https://sellercentral.amazon.com/help/hub/reference/external/G200612770) | 淡季 / 旺季每立方英尺費率，**標準尺寸與大件是兩組不同數字**。<br>**旺季（10-12 月）通常在 9 月公告**，所以 Q3 那次更新特別重要。<br>⚠️ `storage._conflict` 記錄了 standard.offpeak 的未解衝突，優先處理。 |
| 4b | `minReferralFee.usd` | [gs.amazon.com.tw/pricing](https://gs.amazon.com.tw/pricing)（北美費用表「最低銷售佣金」欄） | 目前 $0.30。低價商品的佣金會被這個下限咬到。 |
| 5 | `storage.agedSurchargeFromDays` | 同上 | 超齡庫存起算天數（目前 181 天）。 |
| 6 | `categories.*.pct`<br>`categories.*.threshold`<br>`categories.*.lowPct` | [Amazon 全球開店費率頁](https://gs.amazon.com.tw/pricing)<br>🔒 [Seller Central GTG4BAWSY39Z98EN](https://sellercentral.amazon.com/help/hub/reference/external/GTG4BAWSY39Z98EN) | 各品類佣金 %。<br>階梯費率的**門檻金額**（美妝 $10、家具 $200、珠寶 $250）也要對。<br>**只改數字就好** —— 下拉選單標籤和「≤$10 收 8%」那段說明文字都是自動生成的。 |
| 7 | `refundAdmin.pct`<br>`refundAdmin.cap` | [gs.amazon.com.tw/pricing](https://gs.amazon.com.tw/pricing) | 目前 min(佣金 × 20%, $5.00)。 |
| 8 | `inboundPlacement.*` | 🔒 [Seller Central GC3Q44PBK8SQ2DEN](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8SQ2DEN) | 五個 size tier 各一個數字。 |
| 9 | `accountFee.professional` | [gs.amazon.com.tw/pricing](https://gs.amazon.com.tw/pricing) | 幾乎不變（$39.99），但順手看一下。 |
| 10 | `send.services.*` | Amazon SEND 官方費率表（**問 SEND 團隊或看 Seller Central 站內公告**） | **UPS 快遞費率含燃油費與旺季附加費，季度會動。**<br>空運／海運為金匯國際物流 (Amazon SPN) 報價，區域（西/中/東）三組都要更新。<br>海運 `cbmRates` 是按 CBM 計價，`bands` 只是換算給使用者比較用。 |
| 11 | `freight.tw.*` / `freight.cn.*` | 向 2-3 家貨代詢價（[Amazon 認證服務商名單](https://gs.amazon.com.tw/service-provider)） | **這不是官方費率，是市場行情，沒有任何公開頁面可以抓。**<br>海運／空運／快遞每公斤價，以及 `hint` 裡寫的區間文字要一起改。<br>方向性參考可看 [Drewry WCI](https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry) 或 Freightos FBX 的貨櫃現貨指數，但那是港到港整櫃價，**不等於每公斤 DDP 到 FBA 倉**的價格，只能用來判斷「該調漲還是調降」，不能直接填。 |
| 12 | `fbm.methods.*` | 同上，向貨代／海外倉詢價 | 每件配送費 `ship`、公式 `baseUsd` + `perKgUsd`、關稅 `dutyPctOfPrice`。<br>`referenceTable` 那張參考表也要同步。 |
| 13 | `fbm.volumetricDivisor` | 快遞公司公告 | 國際快遞材積重除數，目前 5000。DHL/FedEx/UPS 偶有調整。 |
| 14 | `incentives.nsi.*`<br>`incentives.newSelection.*`<br>`incentives.brandBonus.*` | [新賣家入門大禮包](https://gs.amazon.com.tw/new-seller-incentive)<br>[FBA New Selection](https://sell.amazon.com/blog/fba-new-selection-program)<br>[優惠頁](https://gs.amazon.com.tw/benefits) | 額度金額、件數上限、天數窗口。**方案改版頻繁，建議每季必看。** |
| 15 | `twMode.defaultExchangeRate` | [台灣銀行匯率](https://rate.bot.com.tw/xrt?Lang=zh-TW) | 順手更新成當期匯率（現金賣出）。 |
| 16 | `sourceTable[].retrieved` | — | 改完把對應那列的擷取時間一起改掉，不然頁面下方的來源表會說謊。 |

---

## 1b. 🔑 怎麼讀那些「需要登入」的 Seller Central 頁面

**這是整份手冊最重要的一節。** 打 🔒 的頁面用 `curl` 抓會回 HTTP 200
但內容是 JS 外殼（0 筆費率），一定要用瀏覽器渲染 + 認證。

Amazon 內部的 **Lens** 把 Seller Central 代理到 `sellercentral.amazon.dev`
（注意是 **.dev**，不是 .com）。`.dev` 走 **Midway** 認證，所以只要 Midway
是新的，就能用本機 Chrome + Midway cookie 直接讀到官方表格。

### 步驟

```bash
# 1. 確保 Midway 是新的（過期就重跑）
mwinit -f
ls -l ~/.midway/cookie          # 看時間戳

# 2. 用 Playwright 帶 Midway cookie 渲染 .dev 網址
python scripts/read-seller-central.py GABBX6GZPA8MSZGW
```

URL 形式（把 .com 換成 .dev 就好）：

```
https://sellercentral.amazon.dev/help/hub/reference/external/<NODE_ID>
```

### 重點細節

- **必須用 `.dev`**，`.com` 那個網域 Midway cookie 沒用。
- Playwright 要用 `channel="chrome"`（本機 Chrome），並把
  `~/.midway/cookie`（Netscape 格式）解析後用 `context.add_cookies()` 注入。
- 頁面是 SPA，`goto` 之後要 **等 6-7 秒 + 往下滾動**，表格才會渲染完。
- 有些 node id 會被導到 `/sign-in`（例如倉儲費 G200612770 會轉到
  G3EDYEF6KUCFQTNM），那就是這條路走不通，得改用你自己登入的 Chrome
  手動開、或請有權限的人代查。
- 用 `ReadInternalWebsites` MCP 工具讀同樣的網址會回
  「Could not extract meaningful content」—— 它做的是純文字擷取，
  抓不到 JS 渲染後的表格。**必須用瀏覽器渲染。**

### 抓到之後

**不要人工抄數字。** 把 `<table>` 的 rows 匯出成 JSON，再用腳本生成
`rates.js` 的區塊。2026-08 這次就是這樣做的 —— 因為原版 v1.1 的錯誤
正是人工轉抄時看錯欄位造成的（詳見第 2b 節）。

驗證方式：官方頁最下方通常有 **「Product size examples」**，
給了含完整尺寸／重量／ASP 的商品範例和應收費用。
把那些範例寫進 `test/engine.test.js` 當黃金測試，比對到分為止。

---

## 2. 已知待複查項目

這些是從原版 v1.1 沿用下來、看起來可疑但沒有官方頁面可即時確認的數字。
**下次更新請優先處理，確認後把這一節對應的項目刪掉。**

> 讀 🔒 頁面的方法見上面第 1b 節（Lens + Midway）。
> 注意 `gs.amazon.com.tw/pricing` 雖然公開，但**它的 FBA 費率區塊是 2023/24 年份**
> （頁面自己寫「將於 2024 年 1 月 15 日恢復至非旺季費率」），
> 品類佣金那張「北美費用表」是現行的，但 FBA 費率不能用它。

### 🟡 `send.services['send-sea'].bands` 的每公斤近似值

海運實際按 CBM 計費（`$220/cbm` ÷ 假設密度 `1363 kg/cbm` ≈ `$0.16/kg`）。
這個 `1363 kg/cbm` 是很高的密度假設，一般貨物遠低於此，會**低估**海運成本。
→ 若要更準，建議改成讓使用者直接輸入 CBM，或用更貼近實際的密度（例如 200-400 kg/cbm）。

### 🟡 `storage.standard.offpeak`：$0.78 還是 $0.87

`rates.js` 寫 `0.78`（原版 2026-04 擷取），官方公開頁寫 `$0.87`。
旺季 `$2.40` 和大件 `$0.56 / $1.40` 兩邊完全一致，**只有這一格對不上**。
已記錄在 `storage._conflict`，保留 `0.78` 未動。→ 查 🔒 G200612770 定案。

### 🟡 `fba.largeStandard` 的體積重門檻

目前只要 `max(實重, 體積重) <= 20 lb` 就算 Large Standard。
Amazon 實際規則是**實重 1 lb 以下的商品不套用體積重**，這裡沒有實作該例外。
影響範圍：輕但體積大的商品（例如枕頭）可能被高估。

### 🟡 官方頁上提到、但本工具尚未建模的費用

這些都寫在 GABBX6GZPA8MSZGW 上，2026-08-27 讀到但沒實作。
不影響現有計算的正確性，但會讓估算偏低：

| 費用 | 內容 | 影響誰 |
|---|---|---|
| **Overmax handling fee** | 2026-01-15 起，Extra-Large（≤150 lb）最長邊超過 96 吋、或長+圍超過 130 吋要加收 | 超大件賣家 |
| **Low-inventory-level fee** | 標準尺寸與 Bulky 商品，庫存低於 28 天供給量時加收 | 庫存週轉太快／補貨不及的賣家 |
| **SIPP（Ships in Product Packaging）** | 通過認證的標準尺寸商品**降低**配送費；未認證的 Small/Bulky 商品**加收** | 想省配送費的人（是機會不是風險） |
| **危險品費率** | 官方另有一張危險品費率表（本工具用非服裝表） | 電池、化學品類賣家 |

要加的話，四張費率卡的結構已經在 `fba.rates` 裡了，照樣擴充即可。

---

## 2b. 2026-08-27 已完成的核對

### FBA 配送費：整張表重建（影響最大）

經 Lens 讀取官方 `GABBX6GZPA8MSZGW` 後發現**原版 v1.1 的費率表抄錯欄位**：

官方表把「2025-01-15 ~ 2025-10-14」和「2026-01-15 ~ 2026-10-14」兩個期間
並排放在同一張表（各佔三個售價欄）。原版的取法是：

| rates.js 欄位 | 原版實際抄到的 | 應該是 |
|---|---|---|
| `low` (<$10) | 2025 年的 `<$10` | 2026 年的 `<$10` |
| `mid` ($10-$50) | 2025 年的 `$10-$50` | 2026 年的 `$10-$50` |
| `high` (>$50) | **2026 年的 `$10-$50`** | 2026 年的 `>$50` |

所以最常見的 $10-$50 售價區間一直在用 2025 年舊費率。
這也解釋了先前記錄的「Small Bulky 的 high 檔比 mid 檔便宜 $2.06」矛盾 ——
`high` 來自 2026 表（Small Bulky 該年降價到 $7.55），`mid` 來自 2025 表（$9.61）。
不是官方費率不合邏輯，是兩個年份混在一起。

一併修正／新增：

| 項目 | 內容 |
|---|---|
| **四張費率卡** | `fba.rates.{nonApparel,apparel}.{nonPeak,peak}`。原版只有一張（非服裝非旺季） |
| **旺季配送費** | 官方明文 **2026-10-15 ~ 2027-01-14**，原版完全沒有。與倉儲費旺季（10-12 月）不同 |
| **服裝費率卡** | `clothing` 品類加 `apparel: true` 後自動套用。服裝的 3+lb 級距是每半磅 $0.16（非服裝是每 4 oz $0.08） |
| **整磅取整級距** | Bulky / XL 的加價是 `ceil(計費重) - freeLb` 個級距，原版用連續乘。官方 Baby cot 範例 7.90 lb → 7 級距（不是 6.9） |
| **XL 各級距的售價分檔** | 原版 `extraLarge` 的 base 是單一數字，官方其實也分三檔 |
| **燃油附加費** | 確認官方原文「Starting April 17, 2026, a 3.5% fuel and logistics-related surcharge」，且費率表數字**不含**此附加費 → 我們的疊加方式正確 |

驗證：官方頁「Product size examples」的 6 個商品 × 非旺季/旺季 = **12 個數字，
全部分毫不差**（含服裝、Bulky 取整、XL 實重例外、體積重）。
這 12 個案例已寫進 `test/engine.test.js` 的 A 區塊當黃金測試。

### 品類佣金與倉儲（來源：gs.amazon.com.tw/pricing 北美費用表）

| 項目 | 結果 |
|---|---|
| 18 個品類的佣金 % 與階梯門檻 | 逐列核對，除 `health` 外全部相符 |
| `health` | **修正**：官方把「美妝和個護健康」列為 ≤$10 收 8%、>$10 收 15% 的階梯品類，原版寫固定 15%。$9 的商品佣金原本高估近一倍 |
| `minReferralFee` | **新增** $0.30。官方每個品類都標，原版沒實作，低價商品佣金被低估 |
| `storage.oversize` | **新增**（$0.56 淡季 / $1.40 旺季）。原版對所有 size tier 一律套標準費率 |
| `accountFee` / 181 天超齡 / 媒介 $1.80 | 確認無誤 |

### 還沒動的

- `storage.standard.offpeak`（$0.78 vs $0.87）—— 倉儲費頁 `G200612770` 會被導到登入頁，Lens 這條路讀不到
- `inboundPlacement.*` —— 同樣讀不到
- `send.*` / `freight.*` / `fbm.*` —— 夥伴費率表與市場行情，只能詢價

## 3. 改完之後

### 3.1 更新 meta

```js
meta: {
  version: '2026.10',           // ← 改成新的基準期
  lastUpdated: '2026-10-03',    // ← 改成今天
  nextReviewDue: '2027-01-01',  // ← 往後推一季
  staleAfterDays: 120,
  note: {
    zh: '已對照 2026-10 官方費率表全面更新，含旺季倉儲費。',   // ← 寫這次改了什麼
    en: 'Fully re-verified against the 2026-10 official rate tables, incl. peak storage.'
  }
}
```

> 沒改 `meta` 的話，頁面右上角的徽章會一直顯示舊版本，超過 `staleAfterDays`
> 或過了 `nextReviewDue` 就會變成紅色警示。這是刻意設計的 —— 讓你和使用者
> 都看得出來費率該更新了。

### 3.2 跑測試

```bash
node test/engine.test.js   # 引擎邏輯 + 資料完整性
node test/lint.js          # i18n / element id / 中英字典對齊
```

**兩個都要看到「全部通過」。**

與原版 v1.1 的 parity 比對是**逐組獨立判斷**的，看的是各組自己的 `_verified`：

| 測試區塊 | 只在這個條件成立時執行 |
|---|---|
| A（FBA 配送費 2,450 組） | `fba._verified === '2026-04'` |
| B-1（品類佣金） | `categories._verified === '2026-04'` |

所以你更新某一組費率、把它的 `_verified` 改成新日期之後，
**只有那一組的 parity 比對會自動跳過**，其他組的防護還在。
跳過時會明確印出來，不會偽裝成通過：

```
── B. 佣金 / 倉儲 / 退款管理費 ──
   ⏭  跳過與 v1.1 的佣金 parity 比對（categories._verified = 2026-08-27）
```

（這樣設計的原因：各組費率的更新步調不同。如果統一看 `meta.version`，
改了佣金就會連 FBA 那 2,450 組的防護一起關掉，白白失去保護。）

其餘所有測試（階梯佣金公式、倉儲費公式、退款管理費上限、燃油附加費、
bug 迴歸、端到端試算）都是**從 `rates.js` 讀值再驗算**，任何費率版本都會跑。
所以如果它們失敗了，就是真的有問題，不要放過。

### 3.3 新增品類的話

在 `rates.js` 的 `categories` 加一筆，只需要 `label.zh/en` 加費率數字：

```js
grocery: { pct: 15, tiered: false, label: { zh: 'Grocery 食品雜貨', en: 'Grocery' } },
```

下拉選單、佣金計算、佣金說明文字會自動跟上（**說明文字不用手寫**，
由 `pct` / `threshold` / `lowPct` 生成；想加編輯評語才用選配的 `hint: { zh, en }`）。

但**還要去 `app.js` 的 `INSIGHTS` 加對應的市場洞察**，否則 `node test/lint.js` 會報錯。

### 3.4 部署

```bash
git add rates.js docs/UPDATING-RATES.md test/
git commit -m "rates: 更新至 2026-10 官方費率（含旺季倉儲費）"
git push
```

GitHub Pages 大約 1 分鐘後生效。

---

## 4. 半自動比對（選配）

Seller Central 需要登入所以沒辦法無腦爬，但 `gs.amazon.com.tw` 是公開的。
如果之後想加自動比對，抓這幾個公開頁面就能覆蓋清單裡的 #6、#7、#9、#14：

```
https://gs.amazon.com.tw/pricing
https://gs.amazon.com.tw/new-seller-incentive
https://gs.amazon.com.tw/benefits
https://rate.bot.com.tw/xrt?Lang=zh-TW
```

FBA 配送費和倉儲費（#1、#2、#4，也就是最重要的三項）必須人工登入查，
所以「全自動」這條路走不通 —— 老實用這份清單人工走一遍反而更快也更可靠。
