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
**打 🔒 的需要登入 Seller Central**，沒帳號的話用 Amazon 全球開店中文頁交叉比對。

| # | `rates.js` 路徑 | 對照來源 | 重點看什麼 |
|---|---|---|---|
| 1 | `fba.smallStandard.bands`<br>`fba.largeStandard.bands`<br>`fba.largeStandard.over`<br>`fba.bulky`<br>`fba.extraLarge.bands` | 🔒 [Seller Central GABBX6GZPA8MSZGW](https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW) | **最容易變、也最影響結果的一項。**<br>三個售價檔（`low` / `mid` / `high`）的每個重量級距都要對。<br>注意 Amazon 有時只調其中一檔。 |
| 2 | `fuelSurcharge.pct` | 同上 | 目前 3.5%。Amazon 曾多次調整燃油附加費，**每次更新都要確認這個數字還在不在、有沒有變**。 |
| 3 | `sizeTiers.*` | 同上（Product size tiers 段） | 尺寸／重量門檻。變動頻率低，但 2024 年 Amazon 改過一次，不要假設不變。 |
| 4 | `storage.offpeak`<br>`storage.peak` | 🔒 [Seller Central G200612770](https://sellercentral.amazon.com/help/hub/reference/external/G200612770) | 淡季 / 旺季每立方英尺費率。**旺季（10-12 月）通常在 9 月公告**，所以 Q3 那次更新特別重要。 |
| 5 | `storage.agedSurchargeFromDays` | 同上 | 超齡庫存起算天數（目前 181 天）。 |
| 6 | `categories.*.pct`<br>`categories.*.threshold`<br>`categories.*.lowPct` | [Amazon 全球開店費率頁](https://gs.amazon.com.tw/pricing)<br>🔒 [Seller Central GTG4BAWSY39Z98EN](https://sellercentral.amazon.com/help/hub/reference/external/GTG4BAWSY39Z98EN) | 各品類佣金 %。<br>階梯費率的**門檻金額**（美妝 $10、家具 $200、珠寶 $250）也要對。<br>**只改數字就好** —— 下拉選單標籤和「≤$10 收 8%」那段說明文字都是自動生成的。 |
| 7 | `refundAdmin.pct`<br>`refundAdmin.cap` | [gs.amazon.com.tw/pricing](https://gs.amazon.com.tw/pricing) | 目前 min(佣金 × 20%, $5.00)。 |
| 8 | `inboundPlacement.*` | 🔒 [Seller Central GC3Q44PBK8SQ2DEN](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8SQ2DEN) | 五個 size tier 各一個數字。 |
| 9 | `accountFee.professional` | [gs.amazon.com.tw/pricing](https://gs.amazon.com.tw/pricing) | 幾乎不變（$39.99），但順手看一下。 |
| 10 | `send.services.*` | Amazon SEND 官方費率表（**問 SEND 團隊或看 Seller Central 站內公告**） | **UPS 快遞費率含燃油費與旺季附加費，季度會動。**<br>空運／海運為金匯國際物流 (Amazon SPN) 報價，區域（西/中/東）三組都要更新。<br>海運 `cbmRates` 是按 CBM 計價，`bands` 只是換算給使用者比較用。 |
| 11 | `freight.tw.*` / `freight.cn.*` | 向 2-3 家貨代詢價（[Amazon 認證服務商名單](https://gs.amazon.com.tw/service-provider)） | **這不是官方費率，是市場行情。**<br>海運／空運／快遞每公斤價，以及 `hint` 裡寫的區間文字要一起改。 |
| 12 | `fbm.methods.*` | 同上，向貨代／海外倉詢價 | 每件配送費 `ship`、公式 `baseUsd` + `perKgUsd`、關稅 `dutyPctOfPrice`。<br>`referenceTable` 那張參考表也要同步。 |
| 13 | `fbm.volumetricDivisor` | 快遞公司公告 | 國際快遞材積重除數，目前 5000。DHL/FedEx/UPS 偶有調整。 |
| 14 | `incentives.nsi.*`<br>`incentives.newSelection.*`<br>`incentives.brandBonus.*` | [新賣家入門大禮包](https://gs.amazon.com.tw/new-seller-incentive)<br>[FBA New Selection](https://sell.amazon.com/blog/fba-new-selection-program)<br>[優惠頁](https://gs.amazon.com.tw/benefits) | 額度金額、件數上限、天數窗口。**方案改版頻繁，建議每季必看。** |
| 15 | `twMode.defaultExchangeRate` | [台灣銀行匯率](https://rate.bot.com.tw/xrt?Lang=zh-TW) | 順手更新成當期匯率（現金賣出）。 |
| 16 | `sourceTable[].retrieved` | — | 改完把對應那列的擷取時間一起改掉，不然頁面下方的來源表會說謊。 |

---

## 2. 已知待複查項目

這些是從原版 v1.1 沿用下來、看起來可疑但沒有官方頁面可即時確認的數字。
**下次更新請優先處理，確認後把這一節對應的項目刪掉。**

### 🔴 `fba.bulky.small` 的 high band 低於 mid band

```js
small: { base: { low: 9.61, mid: 9.61, high: 7.55 }, freeLb: 1, perLbUsd: 0.38 }
//                                     ^^^^^^^^^^^ 售價 >$50 反而比 $10-$50 便宜？
```

Small Bulky 在「售價 > $50」這一檔是 `$7.55`，比「$10-$50」的 `$9.61` **便宜 $2.06**。
其他所有 tier 都是售價越高、配送費越高，只有這裡反過來。高度懷疑是原版抄表時抄錯行。
→ 對照官方 Small Bulky 費率表的三個售價檔確認。

### 🟡 `fba.bulky` 的 low band 沒有獨立數字

原版程式碼寫 `priceRange === 'high' ? 7.55 : 9.61`，意思是 `low` 和 `mid` 共用 `9.61`。
官方表通常三檔都有獨立數字，這裡可能漏了 `low` 檔。

### 🟡 `send.services['send-sea'].bands` 的每公斤近似值

海運實際按 CBM 計費（`$220/cbm` ÷ 假設密度 `1363 kg/cbm` ≈ `$0.16/kg`）。
這個 `1363 kg/cbm` 是很高的密度假設，一般貨物遠低於此，會**低估**海運成本。
→ 若要更準，建議改成讓使用者直接輸入 CBM，或用更貼近實際的密度（例如 200-400 kg/cbm）。

### 🟡 `fba.largeStandard` 的體積重門檻

目前只要 `max(實重, 體積重) <= 20 lb` 就算 Large Standard。
Amazon 實際規則是**實重 1 lb 以下的商品不套用體積重**，這裡沒有實作該例外。
影響範圍：輕但體積大的商品（例如枕頭）可能被高估。

---

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

**兩個都要看到「全部通過」。** 只要 `meta.version` 已經改掉，
測試會自動跳過「與原版 v1.1 寫死費率表的比對」（A 區塊和 B-1），
不會產生假失敗 —— 你會看到：

```
── A. FBA 配送費 parity（新引擎 vs 原版 v1.1）──
   ⏭  跳過：rates.js 已更新到 2026.10（基準為 2026.04），
      與 v1.1 寫死費率表的比對不再適用。這是預期行為，不是失敗。
```

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
