/* =============================================================================
 * app.js — Amazon 美國站成本計算機
 *
 *   Engine : 純計算，不碰 DOM，全部費率從 window.AMZ_RATES 讀（可用 node 單測）
 *   I18N   : 所有文案集中在這裡，中英各一份，不會再出現「切英文只翻一半」
 *   UI     : DOM 綁定、狀態存檔、分享連結、CSV 匯出
 *
 *   費率資料一律改 rates.js，不要動這個檔案。
 * ===========================================================================*/

/* ===========================================================================
 * 1. I18N
 * =========================================================================*/
const I18N = {
zh: {
  'app.title': '🇺🇸 Amazon <span>美國站</span> FBA 成本計算機',
  'app.subtitle.tw': '台灣出貨 ｜ 依據 Amazon 官方費率 ｜ 費率基準 {ver}',
  'app.subtitle.cn': '中國出貨 ｜ 依據 Amazon 官方費率 ｜ 費率基準 {ver}',

  'origin.tw': '🇹🇼 台灣出貨',
  'origin.cn': '🇨🇳 中國出貨',
  'mode.basic': '📦 FBA 基礎',
  'mode.advanced': '🔧 FBA 進階',
  'mode.fbm': '🚚 FBM 自配送',
  'mode.fbmtw': '🇹🇼 台灣電商 → 美國',

  'modeDesc.basic': 'FBA 基礎：產品成本 + 佣金 + FBA + 頭程物流',
  'modeDesc.advanced': 'FBA 進階：基礎 + 廣告 + 退換貨 + Vine + 帳戶費 + 優惠方案',
  'modeDesc.fbm': 'FBM 自配送：產品成本 + 佣金 + 自行配送費 + 客服退貨',
  'modeDesc.fbm-tw': '台灣電商銷售美國亞馬遜：輸入台灣產品資訊，估算 Amazon 額外成本和建議售價',

  'action.share': '複製分享連結',
  'action.csv': '匯出 CSV',
  'action.print': '列印 / 存成 PDF',
  'action.reset': '重設為預設值',

  'badge.rates': '費率 {ver}',
  'badge.ratesTip': '費率基準期 {ver}｜最後核對 {updated}｜下次複查 {due}\n{note}',
  'badge.ratesTipStale': '⚠️ 費率已超過 {days} 天未核對（最後核對 {updated}，應於 {due} 前複查）。請依 docs/UPDATING-RATES.md 更新 rates.js。\n{note}',

  'card.account': '🏪 開店費用 & 產品',
  'card.referral': '💰 銷售佣金',
  'card.logisticsFba': '🚢 物流運輸 (FBA)',
  'card.logisticsFbm': '🚚 物流運輸 (FBM 自配送)',
  'card.twMode': '🇹🇼 台灣現有產品 → 美國 Amazon 額外成本',
  'card.operating': '📣 營運成本',
  'card.incentives': '🎁 新賣家優惠 & FBA 新選品',
  'card.result': '📊 利潤分析',
  'card.breakdown': '📈 成本結構分析',
  'card.incentiveGuide': '🎁 新賣家優惠方案說明',
  'card.sources': '📚 資料來源與參考連結',

  'unit.month': '月', 'unit.mo': '個月', 'unit.months': '個月', 'unit.unitsMo': '件/月',
  'unit.g': '公克 (g)', 'unit.kg': '公斤 (kg)', 'unit.lb': '磅 (lb)',
  'unit.cm': '公分 (cm)', 'unit.in': '英吋 (in)', 'unit.usdPerReturn': 'USD/件退貨',
  'badge.auto': '自動估算', 'badge.autoReferral': '自動帶入佣金', 'badge.autoByMethod': '依方式估算',

  'f.accountFee': '賣家帳戶月費 (固定)',
  'tip.accountFee': 'Professional 專業計畫固定 $39.99/月，此為必要費用，在「FBA 進階」模式下依月銷量自動分攤到每件商品。',
  'f.sellPrice': '產品售價 (USD)',
  'f.productCost': '產品成本 (含包裝)',
  'f.productCost.hint': '工廠出廠價 + 包材 + 標籤貼紙（美金）',
  'f.monthlySales': '預估月銷量',
  'tip.monthlySales': '用於分攤帳戶月費、攤提一次性優惠額度，以及計算月營收與月利潤。',

  'f.category': '商品品類',
  'f.referralPct': '銷售佣金 (Referral Fee)',
  'tip.referralPct': 'Amazon 依品類收取不同比例佣金，大部分品類 8%-20%。部分品類有階梯費率（如 Beauty ≤$10 收 8%、>$10 收 15%；家具 >$200 的部分降到 10%）。此欄會依售價自動換算「實際有效費率」。',
  'f.brandRebate': '🏷️ 新品牌入駐退傭 (Brand Referral Bonus)',
  'tip.brandRebate': '擁有美國商標並首次完成 Amazon Brand Registry，即可享銷售退傭。前 $50,000 銷售額退 10%，之後退 5%（最高 $52,500），退傭直接抵扣銷售佣金，12 個月內有效。',
  'f.rebate.off': '未申請', 'f.rebate.t10': '退傭 10% (前 $50K)', 'f.rebate.t5': '退傭 5% (超過 $50K)',
  'note.rebate.off': '需有美國商標 + 完成 Amazon Brand Registry',
  'note.rebate.t10': '前 $50,000 銷售額享 10% 退傭（抵扣佣金）',
  'note.rebate.t5': '超過 $50,000 銷售額享 5% 退傭（最高 $52,500）',

  'f.weight': '商品重量 (含包裝)',
  'f.dims': '商品尺寸 (含包裝)',
  'tip.dims': '包裝後的 長×寬×高。用於計算體積重、FBA 尺寸分級（Size Tier）和月倉儲費。',
  'f.shipMethod': '頭程運費方式',
  'tip.shipMethod': 'Amazon SEND 是亞馬遜官方跨境物流計畫，費率為 DDP（含關稅到門），僅適用台灣出貨到美國 FBA，費率依重量和目的地區域而異。一般貨代費率不含關稅，需在「營運成本」另外估算。',
  'f.shipRate': '頭程運費單價',
  'f.shipPerPiece': '改用「每件固定運費」',
  'tip.shipPerPiece': '已知每件運費可直接填入，跳過重量計算。例：一箱 200 件空運 $400，每件 = $400 ÷ 200 = $2.00。',
  'f.shipmode.rate': '按重量計費', 'f.shipmode.piece': '每件固定金額',
  'f.shipPerPiece.hint': '例：一箱 200 件空運 $400 → 每件 $2.00',
  'ship.calcNote': '{kg} kg × ${rate}/kg = ${cost}/件',
  'ship.calcNotePiece': '每件 ${cost}（直接填入）',
  'ship.sendSeaUnit': 'USD/kg (≈${cbm}/cbm)',
  'ship.sendSeaNote': '✅ SEND 海運 DDP（含關稅到門）。實際按 CBM 計費：西部 ${w}/cbm、中部 ${c}/cbm、東部 ${e}/cbm，最低 {min} CBM。時效 {transit}。',
  'ship.sendAirNote': '✅ SEND 空運 DDP（含關稅到門）。費率依區域：西部 ${w}、中部 ${c}、東部 ${e}/kg。時效 {transit}。',
  'ship.sendUpsNote': '✅ SEND UPS {svc} DDP（含關稅、燃油費及旺季附加費）。費率 ${rate}/kg（{kg}kg 級距）。',
  'ship.groupSend': '── Amazon SEND (DDP 含關稅) ──',
  'ship.groupStd': '── 一般貨代 (不含關稅) ──',
  'ship.groupCustom': '── 自訂 ──',
  'ship.custom': '自訂費率 (USD/kg)',
  'ship.dutyIncluded': '✅ 目前頭程使用 SEND (DDP)，關稅已含在運費中，此欄可留 0。',

  'f.fbaFee': 'FBA 配送費 (每件)',
  'tip.fbaFee': '依商品重量、尺寸和售價自動估算。費率依售價分三檔（<$10 / $10-$50 / >$50），並含 {fuel}% 燃油附加費。已包含揀貨、包裝、配送、客服和退貨處理。可手動覆蓋。',
  'fba.tierNote': '{tier}（計費重 {w} lb）→ ${base} + {fuel}% 燃油 = ${fee} ｜售價檔 {band}',
  'f.season': '倉儲季節',
  'tip.season': '1-9 月淡季 ${off}/立方英尺；10-12 月旺季 ${peak}/立方英尺（約 {x} 倍）。',
  'f.season.off': '淡季 1-9月', 'f.season.peak': '旺季 10-12月',
  'f.storageFee': 'FBA 月倉儲費 (每件)',
  'storage.note': '體積 {cuft} cuft × ${rate} = ${fee}/件/月',
  'f.storageMonths': '預估倉儲月數',
  'tip.storageMonths': '商品從入倉到售出的平均存放月數。建議維持 2-3 個月庫存；超過 {days} 天會產生超齡庫存附加費。',
  'f.storageMonths.hint': '倉儲費 = 月倉儲費 × 月數。超過 6 個月會有超齡附加費風險。',
  'f.inboundFee': 'Inbound Placement 費 (每件)',
  'tip.inboundFee': 'Amazon 將庫存分配到多個倉庫的費用，依 size tier 而異。選擇 Amazon 優化配置可降低此費用。',

  'f.fbmMethod': '配送方式',
  'f.fbmShip': '每件國際配送費',
  'tip.fbmShip': '國際快遞 DDP：台灣直發到美國買家，含關稅清關，市場行情約 $8-20/件（0.5kg）。海外倉代發：先批量海運到美國倉庫（頭程約 $1-2/kg），再由倉庫逐件出貨（美國境內 $3-6/件）。總成本較低但需預付頭程和倉租。',
  'f.fbmDuty': '美國進口關稅 (每件估算)',
  'tip.fbmDuty': '2025 年起美國取消 $800 以下免稅（de minimis）政策，所有海外直發包裹都需繳關稅。稅率依 HTS 編碼而定，一般消費品約 0-25%。DDP 方式通常已含關稅；海外倉方式在批量入倉時繳納。',
  'f.fbmDuty.hint': 'DDP 方式通常已含關稅（填 0）；海外倉需另估',
  'f.fbmPack': '包裝材料費 (每件)',
  'f.fbmCs': '客服 & 退貨處理費 (每件分攤)',
  'tip.fbmCs': 'FBM 賣家需自行處理客服和退貨，退貨運費通常由賣家承擔。建議預估每件 $0.50-$2.00，視退貨率和客服量而定。',
  'fbm.info.title': '📋 FBM 配送費估算說明',
  'fbm.info.express': '<b>國際快遞 DDP（含稅到門）</b>：台灣直發到美國買家，由 DHL/FedEx/UPS 或第三方貨代處理清關和配送。費用含國際運費 + 燃油附加費 + 清關 + 關稅 + 最後一哩配送。',
  'fbm.info.warehouse': '<b>海外倉代發</b>：先將商品批量海運到美國第三方倉庫（頭程 $1-2/kg），再由倉庫逐件出貨給買家（美國境內配送 $3-6/件）。總成本較低，但需預付頭程和倉租。',
  'fbm.tbl.method': '配送方式', 'fbm.tbl.cost': '費用參考 (每件)', 'fbm.tbl.transit': '時效',
  'fbm.info.footnote': '* 海外倉出貨時效，不含台灣→美國頭程（海運 30-45 天）。費率為市場行情估算，實際費率依貨代合約、重量、體積和燃油附加費而異。建議向 2-3 家貨代詢價比較。',
  'fbm.vs.title': '💡 FBM vs FBA',
  'fbm.vs.body': 'FBM 無需支付 FBA 配送費和倉儲費，但需自行處理物流、客服和退貨。商品不會有 Prime 標誌，可能影響曝光和轉換率。適合大型/重型商品、客製化商品或利潤較薄的品項。',

  'f.twPrice': '台灣售價 (TWD)',
  'f.twExRate': '匯率 (1 USD = ? TWD)',
  'tip.twExRate': '預設值來自 rates.js 的 twMode.defaultExchangeRate，更新費率時會一併更新。可自行改成你的實際結匯匯率。',
  'f.twCost': '產品成本 (TWD)',
  'f.twCost.hint': '工廠出廠價 + 包材（台幣）',
  'f.twMonthlySales': '預估月銷量（用來分攤帳戶月費）',
  'tip.twDims': '國際快遞是按「材積重」計費：材積重 = 長×寬×高(cm) ÷ {div}，取材積重與實際重量的較大值。所以尺寸會直接影響配送費。',
  'tw.weightNote': '實重 {actual} kg、材積重 {vol} kg → 以 {billable} kg 計費',
  'f.twFbmMethod': 'FBM 配送方式',
  'tw.res.title': '📊 額外成本估算結果',
  'tw.res.twPrice': '台灣售價', 'tw.res.usdPrice': '換算美金售價', 'tw.res.cogs': '產品成本 (USD)',
  'tw.res.extraTitle': 'Amazon 額外成本',
  'tw.res.referral': '銷售佣金', 'tw.res.account': '帳戶月費分攤', 'tw.res.ship': 'FBM 配送費',
  'tw.res.duty': '進口關稅', 'tw.res.misc': '包裝 + 客服退貨',
  'tw.res.extraTotal': 'Amazon 額外成本合計', 'tw.res.extraPct': '額外成本佔售價比例',
  'tw.res.profitUsd': '淨利潤 (USD)', 'tw.res.profitTwd': '淨利潤 (TWD)', 'tw.res.margin': '利潤率',
  'tw.res.sugTitle': '💡 建議美金售價（維持台灣利潤率）',
  'tw.res.twMargin': '台灣利潤率', 'tw.res.suggested': '建議美金售價',
  'tw.suggest.ok': '以品類有效佣金 {pct}% 反推，此售價可讓你在 Amazon 上維持與台灣相同的 {margin}% 利潤率。',
  'tw.suggest.impossible': '⚠️ 台灣利潤率 {margin}% 加上佣金 {pct}% 已超過 100%，無法反推出可行售價。這通常代表台灣端的售價/成本填反了，或此品類不適合直接搬到 Amazon。',
  'tw.info.title': '📋 計算說明',
  'tw.info.body': '此模式幫助台灣賣家評估：把現有台灣產品拿到 Amazon 美國站用 FBM 自配送銷售，會額外產生多少成本。<br><br><b>額外成本 = 銷售佣金 + 帳戶月費分攤 + FBM 國際配送 + 關稅 + 包裝客服</b><br><br>「建議美金售價」是根據你在台灣的利潤率，反推在 Amazon 上要定多少價才能維持相同利潤率（已含所有 Amazon 額外成本）。<br><br>配送費依「材積重與實重取大」估算，實際費率請向貨代確認。',

  'f.tacos': '廣告花費佔比 (TACoS)',
  'tip.tacos': 'Total Advertising Cost of Sales = 廣告花費 ÷ 總營收。新品期通常 15-25%，穩定期 8-12%。',
  'f.vineFee': 'Vine 評論費用 (每件分攤)',
  'tip.vineFee': 'Amazon Vine 透過可信賴評論者取得真實評論。費用依註冊單位數而定：0 單位免費、1-2 單位 $75、3-10 單位 $200。此處填分攤到每件的費用。',
  'f.vineFee.hint': '例：Vine $200 / 首批 200 件 = $1.00/件',
  'f.returnRate': '退貨率',
  'tip.returnRate': '退貨率依品類差異大：一般商品 3-5%、服飾鞋類 15-25%、電子配件 5-8%。',
  'f.refundAdmin': '退款管理費',
  'tip.refundAdmin': '退款時 Amazon 收取「銷售佣金的 {pct}%」或 ${cap}，取較低者。此欄依售價和品類自動計算。',
  'note.refundAdmin': '= min(佣金 × {pct}%, ${cap})',
  'f.importDuty': '美國進口關稅 (每件估算)',
  'tip.importDuty': '美國進口關稅依 HTS 編碼而定，一般消費品約 0-25%。FBA 賣家通常在批量入倉時由貨代代繳。此為估算值，非 Amazon 官方費用。使用 Amazon SEND (DDP) 時關稅已含在頭程運費中。',
  'f.importDuty.hint': '依 HTS 編碼而定，一般消費品 0-25%。建議向報關行確認。',
  'f.otherFee': '其他費用 (每件)',
  'f.otherFee.hint': '驗貨、攝影分攤、保險、軟體工具等',

  'promo.nsi.title': '📦 新賣家入門大禮包 (New Seller Incentives)',
  'promo.nsiAds': 'Sponsored Products 廣告折價券', 'promo.nsiAds.badge': '最高 $1,000',
  'promo.nsiAds.desc': '階梯式獎勵（需 2025/8/20 後首次建立廣告）：<br>・花費 $50~$200 → 獲得 $50 折價券<br>・花費 $200~$1,000 → 獲得 $200 折價券<br>・花費 $1,000+ → 獲得 $1,000 折價券<br><a href="https://gs.amazon.com.tw/new-seller-incentive" target="_blank" rel="noopener">📎 查看官方新賣家入門大禮包頁面</a>',
  'promo.nsiCoupon': '$50 Amazon Coupon 折價券額度',
  'promo.nsiCoupon.desc': '90 天內建立優惠券促銷活動即可獲得，無需加入 FBA',
  'promo.nsiVine': '$200 Vine 評論計畫額度',
  'promo.nsiVine.desc': '品牌賣家限定。需在品牌註冊後 90 天內註冊 Vine，領取後一年內使用',
  'promo.nsiShip': 'FBA 入倉運費抵用金',
  'promo.nsiShip.desc': '境內發貨 $100（Amazon Partnered Carrier）；跨境發貨 $200（需使用 AGL 或 Amazon SEND）',
  'promo.adsTier': '${amt}（花費 {range}）',
  'promo.shipDomestic': '$100（境內發貨 Partnered Carrier）',
  'promo.shipCross': '$200（跨境發貨 AGL / SEND）',
  'promo.fns.title': '📦 FBA 物流新選品計畫 (FBA New Selection)',
  'promo.fnsStorage': '免費倉儲 120 天', 'promo.fnsStorage.badge': '免倉儲費',
  'promo.fnsStorage.desc': 'Standard 前 100 件 / Oversize 前 50 件，入倉後 120 天免月倉儲費',
  'promo.fnsReturn': '免費退貨處理 (前 20 件)',
  'promo.fnsReturn.desc': 'Standard 尺寸商品，入倉後 180 天內前 20 件退貨免處理費',
  'promo.fnsRebate': '10% 銷售回饋 (Rebate)', 'promo.fnsRebate.badge': '抵扣配送費',
  'promo.fnsRebate.desc': '新 ASIN 銷售額平均 10% 回饋，次月抵扣 FBA 配送費用',
  'promo.fnsVine': 'Vine 註冊費 75 折',
  'promo.fnsVine.desc': '每個 Parent ASIN 可享 Vine 註冊費 25% 折扣（依上方 Vine 費用計算）',
  'promo.fnsInbound': '免 Inbound Placement 費', 'promo.fnsInbound.badge': '免入倉配置費',
  'promo.fnsInbound.desc': '新 ASIN 前 100 件入倉免 Inbound Placement Service 費用',
  'promo.savings.title': '✅ 已勾選優惠 — 每件預估節省',

  'sv.nsiAds': '廣告抵用金攤提', 'sv.nsiCoupon': 'Coupon 額度攤提', 'sv.nsiVine': 'Vine 額度攤提',
  'sv.nsiShip': 'FBA 運費抵用金攤提', 'sv.fnsStorage': '免倉儲費 (120 天)',
  'sv.fnsReturn': '免退貨處理費', 'sv.fnsRebate': '10% 銷售回饋', 'sv.fnsVine': 'Vine 註冊費 75 折',
  'sv.fnsInbound': '免 Inbound Placement', 'sv.total': '每件合計節省',
  'sv.note': '★ 標記者為<b>一次性額度</b>，已按「{m} 個月 × 月銷 {n} 件」攤提。額度用完後單件成本會回升到未折抵水準，不要把它當成長期的成本結構。<br>其餘項目為新 ASIN 期間的方案優惠，也有件數上限（如免倉儲 Standard 前 100 件）。',

  'r.price': '售價', 'r.sec.account': '— 開店 & 產品 —', 'r.cogs': '產品成本 (COGS)',
  'r.account': '帳戶月費分攤', 'r.sec.referral': '— 銷售佣金 —', 'r.referral': '銷售佣金',
  'r.brandRebate': '品牌退傭', 'r.sec.fba': '— 物流運輸 (FBA) —', 'r.sec.fbm': '— 物流運輸 (FBM) —',
  'r.ship': '頭程運費', 'r.fba': 'FBA 配送費', 'r.storage': 'FBA 倉儲費',
  'r.fbmShip': 'FBM 配送費', 'r.duty': '進口關稅', 'r.fbmPack': '包裝材料', 'r.fbmCs': '客服 & 退貨處理',
  'r.sec.operating': '— 營運成本 —', 'r.ads': '廣告', 'r.vine': 'Vine 評論費', 'r.return': '退貨損失',
  'r.refundAdmin': '退款管理費', 'r.other': '其他費用', 'r.promo': '優惠折抵',
  'r.netProfit': '單件淨利潤', 'r.margin': '利潤率', 'r.totalCost': '單件總成本',
  'r.sec.monthly': '— 月度預估 —', 'r.mRev': '月營收', 'r.mProfit': '月淨利潤 (USD)',

  'bd.cogs': '產品成本', 'bd.ship': '頭程運費', 'bd.storage': '倉儲', 'bd.referral': '佣金',
  'bd.ads': '廣告', 'bd.account': '帳戶費', 'bd.returns': '退貨+退款', 'bd.other': '其他',
  'bd.profit': '淨利潤', 'bd.fbmShip': 'FBM 配送', 'bd.duty': '關稅', 'bd.pack': '包裝', 'bd.cs': '客服退貨',

  'adv.tipsHeading': '📋 優化建議',
  'adv.insightHeading': '🏪 品類市場洞察',
  'adv.insightLink': '📥 下載完整品類報告 → Amazon 全球開店選品指南',
  'adv.fbmHigh': '⚠️ FBM 配送成本佔售價 <b>{pct}%</b>（超過 50%）。此產品體積/重量較大或售價較低，<b>建議改用 FBA</b>，通常能大幅降低單件物流成本。',
  'adv.fbmMid': '💡 FBM 配送成本佔售價 {pct}%，尚可接受。銷量成長後可考慮轉 FBA 以取得 Prime 標誌提升轉換率。',
  'adv.fbmLow': '✅ FBM 配送成本佔售價 {pct}%，成本結構良好。客單價高、體積輕小的產品適合 FBM。',
  'adv.logHigh': '📦 FBA 物流總成本佔售價 <b>{pct}%</b>。可考慮：① 優化包裝降低 Size Tier ② 增加海運比例降低頭程 ③ 提高售價改善比例。',
  'adv.marginNeg': '🚨 <b>利潤為負</b>，此定價無法獲利。建議：① 降低產品成本 ② 提高售價 ③ 優化物流方式 ④ 選擇佣金較低的品類。',
  'adv.marginLow': '⚠️ 利潤率僅 <b>{pct}%</b>，低於 10%。扣除廣告和退貨後可能虧損，建議利潤率至少 20% 以上。',
  'adv.marginMidBasic': '💡 利潤率 {pct}%，尚未計入廣告和退貨成本（切換到「FBA 進階」查看完整成本）。',
  'adv.marginMidAdv': '💡 利潤率 {pct}%，建議目標 25-30% 以確保長期獲利空間。',
  'adv.marginGood': '✅ 利潤率 {pct}%，成本結構健康。有足夠空間應對廣告投放和市場競爭。',
  'adv.refHigh': '💰 佣金比例 {pct}%（{cat}）屬於高佣金品類。高客單價商品可稀釋佣金影響。',
  'adv.basicNote': '📌 目前為基礎版，未計入廣告 (TACoS)、退貨損失、Vine、帳戶月費等營運成本。切換到「FBA 進階」查看完整成本分析。',
  'adv.promoNote': '📌 目前利潤有 <b>${amt}/件</b> 來自一次性優惠額度攤提。額度用完後利潤率會降到 <b>{pct}%</b>，定價請以這個數字為基準。',
  'adv.twHigh': '⚠️ <b>配送成本佔售價 {pct}%</b>，超過 50%。此產品可能體積/重量較大或售價較低，<b>建議改用 FBA 配送</b>，通常能大幅降低單件物流成本。',
  'adv.twMid': '💡 配送成本佔售價 {pct}%，尚可接受。若銷量成長可考慮轉 FBA。',
  'adv.twLow': '✅ 配送成本佔售價 {pct}%，成本結構良好。此產品<b>客單價高、體積輕小</b>，適合 FBM 模式。',

  'opt.reduceWeight': '💡 若減重至 {g}g（{unit}）以下，可省 ${saving}/件',
  'opt.toSmallStd': '💡 若減重至 454g (16oz) 以下，可降為 Small Standard，省 ${saving}/件',
  'opt.toLargeStd': '💡 尺寸符合 Standard，若減重至 20lb 以下可降為 Large Standard，省 ${saving}/件',

  'tier.smallStandard': 'Small Standard', 'tier.largeStandard': 'Large Standard',
  'tier.smallBulky': 'Small Bulky', 'tier.largeBulky': 'Large Bulky', 'tier.extraLarge': 'Extra Large',

  'guide.nsi.title': '新賣家入門大禮包（最高 $50,000+）',
  'guide.fns.title': 'FBA 物流新選品計畫',
  'guide.col.item': '優惠項目', 'guide.col.value': '價值', 'guide.col.window': '期限', 'guide.col.content': '內容',
  'guide.nsi.note': '需 Professional 帳戶 + 首次上架 90 天內完成 FBA 入倉<br>* 廣告折價券為階梯式：花費 $50→得 $50、$200→得 $200、$1K+→得 $1,000（需 2025/8/20 後首次建立廣告）<br>** 品牌退傭已整合至上方「銷售佣金」區塊，可獨立設定',
  'guide.fns.note': '需 Professional 帳戶 + IPI ≥ 300 + 新 ASIN（從未入過 FBA 倉）',
  'guide.stack.title': '💡 台灣賣家專屬：兩個方案可以疊加使用',
  'guide.stack.body': '新賣家大禮包 + FBA 新選品計畫可同時享有。Brand Bonus 會先適用，之後再適用 New Selection 回饋。建議在開帳後 90 天內完成 FBA 入倉、啟動廣告和 Vine，才能最大化所有優惠。<br>詳情：<a href="https://gs.amazon.com.tw/benefits" target="_blank" rel="noopener">Amazon 全球開店官方優惠頁</a>',

  'src.col.item': '費用項目', 'src.col.source': '資料來源', 'src.col.retrieved': '擷取時間',
  'src.warning': '⚠️ 以上費率擷取自公開來源，可能隨 Amazon 政策調整而變動。本工具的所有費率集中在 <code>rates.js</code>，維護者應定期依 <code>docs/UPDATING-RATES.md</code> 的清單複查並更新。部分連結需登入 Seller Central 才能查看完整內容。',
  'src.revenueCalc': 'Amazon Revenue Calculator — 官方利潤計算器，可輸入 ASIN 查詢實際 FBA 費用',

  'dis.title': '⚖️ 免責聲明',
  'dis.body': '本工具提供的所有費用估算僅供參考，不構成任何商業建議或承諾。<br><br><b>Amazon 官方費用</b>（銷售佣金、FBA 配送費、倉儲費、Inbound Placement 費等）依公開資料估算，實際費用以 <a href="https://sellercentral.amazon.com" target="_blank" rel="noopener">Amazon Seller Central</a> 為準，費率可能隨 Amazon 政策調整而變動。<br><br><b>非 Amazon 官方費用</b>（頭程運費、FBM 國際配送費、進口關稅、包裝材料費等）為市場行情估算值，實際費用依供應商合約、商品特性、運輸方式和時間而異。<b>強烈建議向專業第三方服務商取得完整報價</b>，包括貨代、報關行、海外倉、物流公司等。<br><br>📋 <a href="https://gs.amazon.com.tw/service-provider" target="_blank" rel="noopener"><b>台灣 Amazon 官方認證第三方服務商名單 →</b></a><br><br>本工具不收集任何使用者資料，所有計算都在瀏覽器端完成，輸入值僅存在你自己的瀏覽器 localStorage 中。使用者應自行驗證所有費用數據，並為其商業決策承擔全部責任。',

  'foot.warning': '⚠️ 本工具僅供參考估算，實際費用以 Amazon Seller Central 為準。',
  'foot.credit': '費率基準 {ver}（最後核對 {updated}）｜所有費率集中於 <code>rates.js</code>，更新方式見 <code>docs/UPDATING-RATES.md</code><br>原始版本由 Kai Tung 製作；本版為維護分支，新增資料層分離、雙語補完、存檔／分享／匯出功能。',

  'toast.shared': '✅ 分享連結已複製到剪貼簿',
  'toast.sharedFail': '⚠️ 無法自動複製，連結已顯示在網址欄，請手動複製',
  'toast.csv': '✅ CSV 已下載',
  'csv.header.item': '項目', 'csv.header.value': '金額 (USD)', 'csv.header.pct': '佔售價 %',
}
};

/* ---- 品類市場洞察（獨立區塊，方便單獨維護） ---------------------------- */
const INSIGHTS = {
  home:        { zh: '🏠 <b>Home & Kitchen</b>：美國站最大品類之一，市場成熟但競爭激烈。建議聚焦細分市場（如收納、廚房小工具），避開大品牌主導的品項。平均售價 $15-$35，退貨率約 5-8%。台灣賣家在設計感和品質上有優勢。', en: '🏠 <b>Home & Kitchen</b>: One of the largest US categories — mature but highly competitive. Focus on niches (storage, kitchen gadgets) and avoid segments dominated by major brands. Avg price $15-$35, return rate ~5-8%.' },
  sports:      { zh: '⚽ <b>Sports & Outdoors</b>：戶外運動品類持續成長，季節性明顯（Q2-Q3 旺季）。輕量化、便攜式產品需求高。注意產品安全認證要求。平均售價 $20-$40。', en: '⚽ <b>Sports & Outdoors</b>: Steady growth with clear seasonality (Q2-Q3 peak). Strong demand for lightweight, portable products. Watch safety certification requirements. Avg price $20-$40.' },
  toys:        { zh: '🧸 <b>Toys & Games</b>：Q4 節慶旺季銷量可達全年 40%+。需注意美國 CPSIA 兒童產品安全認證。STEM 教育玩具和戶外玩具需求成長中。平均售價 $15-$30。', en: '🧸 <b>Toys & Games</b>: Q4 holiday season can be 40%+ of annual sales. CPSIA certification required. STEM and outdoor toys are growing. Avg price $15-$30.' },
  pet:         { zh: '🐾 <b>Pet Supplies</b>：北美寵物市場規模超過 1,520 億美元，持續高成長。食品、護理、智慧用品和寵物家具四大品類商機大。訂閱制 (Subscribe & Save) 佔比高，有利回購。平均售價 $12-$25。', en: '🐾 <b>Pet Supplies</b>: North American pet market exceeds $152B with continued growth. Food, grooming, smart devices and pet furniture are the key segments. Subscribe & Save drives repeat purchases. Avg price $12-$25.' },
  health:      { zh: '💊 <b>Health & Household</b>：穩定成長品類，銀髮照護和睡眠科技是新趨勢。部分商品需 FDA 認證。Subscribe & Save 佔比高。平均售價 $10-$25。', en: '💊 <b>Health & Household</b>: Steady growth; senior care and sleep tech are emerging trends. Some products require FDA clearance. Subscribe & Save is popular. Avg price $10-$25.' },
  office:      { zh: '📎 <b>Office Products</b>：遠端工作趨勢帶動需求，桌面收納、人體工學配件成長快。競爭相對較低，適合新賣家切入。平均售價 $10-$30。', en: '📎 <b>Office Products</b>: Remote work drives demand for desk organizers and ergonomic accessories. Relatively low competition — a good entry point for new sellers. Avg price $10-$30.' },
  lawn:        { zh: '🌿 <b>Lawn & Garden</b>：歐美家庭庭院文化帶動強勁需求，庭院派對、燒烤用品熱銷。季節性強（Q1-Q2 旺季）。大型商品適合 FBA，小型配件可考慮 FBM。平均售價 $15-$40。', en: '🌿 <b>Lawn & Garden</b>: Strong demand from outdoor living culture — patio and BBQ products sell well. Highly seasonal (Q1-Q2 peak). Large items suit FBA; small accessories can use FBM. Avg price $15-$40.' },
  beauty:      { zh: '💄 <b>Beauty & Personal Care</b>：智慧美容和環保永續是主要趨勢。≤$10 商品佣金僅 8%（有利潤優勢）。需注意 FDA 和成分標示要求。平均售價 $10-$25。', en: '💄 <b>Beauty & Personal Care</b>: Smart beauty and sustainability are the leading trends. Items ≤$10 pay only 8% referral fee. FDA and ingredient labeling rules apply. Avg price $10-$25.' },
  baby:        { zh: '👶 <b>Baby Products</b>：智慧育兒產品需求成長，安全認證要求嚴格（CPSIA、ASTM）。≤$10 商品佣金僅 8%。品牌信任度很重要，建議做好 Brand Registry。平均售價 $12-$30。', en: '👶 <b>Baby Products</b>: Smart parenting products are growing; safety certification is strict (CPSIA, ASTM). Items ≤$10 pay only 8%. Brand trust matters — complete Brand Registry. Avg price $12-$30.' },
  clothing:    { zh: '👕 <b>Clothing & Accessories</b>：佣金 17%（較高），退貨率 15-25%（品類最高）。時尚品類隨季節和流行趨勢變化快，需要快速反應能力。建議從配件（帽子、圍巾、手套）切入，退貨率較低。', en: '👕 <b>Clothing & Accessories</b>: 17% referral fee (high) and 15-25% return rate (highest of all categories). Trends move fast. Start with accessories (hats, scarves, gloves) for lower return rates.' },
  electronics: { zh: '📱 <b>Electronics</b>：佣金僅 8%（最低），但競爭極激烈。全球消費電子線上收入預計 2029 年突破 7,123 億美元。需注意 FCC 認證和產品責任保險。配件類（充電器、保護殼）門檻較低。', en: '📱 <b>Electronics</b>: Only 8% referral fee (lowest) but extremely competitive. Global online CE revenue is projected to exceed $712B by 2029. FCC certification and product liability insurance needed. Accessories (chargers, cases) have lower barriers.' },
  camera:      { zh: '📷 <b>Camera & Photo</b>：佣金 8%，市場被大品牌主導。建議從配件切入（相機包、三腳架、濾鏡）。平均售價較高，利潤空間好。', en: '📷 <b>Camera & Photo</b>: 8% referral fee; market dominated by major brands. Enter via accessories (bags, tripods, filters). Higher ASP leaves good margin room.' },
  auto:        { zh: '🚗 <b>Automotive</b>：佣金 12%，部分商品需要認證。車用配件和工具需求穩定。注意產品相容性描述要精確，避免退貨。平均售價 $15-$35。', en: '🚗 <b>Automotive</b>: 12% referral fee; some products need certification. Stable demand for car accessories and tools. Precise fitment descriptions reduce returns. Avg price $15-$35.' },
  furniture:   { zh: '🪑 <b>Furniture</b>：≤$200 佣金 15%，超過 $200 的部分降為 10%。大型商品物流成本高，但競爭相對較低。組裝式家具和小型家具（邊桌、層架）適合跨境賣家。', en: '🪑 <b>Furniture</b>: 15% up to $200, 10% above. High logistics cost but lower competition. Flat-pack and small furniture (side tables, shelves) suit cross-border sellers.' },
  jewelry:     { zh: '💎 <b>Jewelry</b>：≤$250 佣金 20%（最高），超過 $250 的部分降為 5%。高客單價商品的實際佣金比例較低。品牌和設計差異化是關鍵。退貨率中等。', en: '💎 <b>Jewelry</b>: 20% up to $250 (highest), 5% above — so higher-ASP items carry a lower effective fee ratio. Brand and design differentiation is key. Moderate return rate.' },
  videogames:  { zh: '🎮 <b>Video Games</b>：佣金 15%，市場被大型發行商主導。周邊配件（手把、耳機架、收納）是跨境賣家較好的切入點。', en: '🎮 <b>Video Games</b>: 15% referral fee; dominated by major publishers. Peripherals and accessories (controllers, headset stands, storage) are better entry points.' },
  musical:     { zh: '🎸 <b>Musical Instruments</b>：佣金 15%，市場相對小眾但競爭較低。配件類（弦、撥片、譜架、調音器）門檻低、回購率高。', en: '🎸 <b>Musical Instruments</b>: 15% referral fee. Niche market with lower competition. Accessories (strings, picks, stands, tuners) have low barriers and high repeat purchase.' },
  books:       { zh: '📚 <b>Books</b>：佣金 15% + $1.80 交易手續費。除非自有出版品，否則不建議跨境賣家進入。', en: '📚 <b>Books</b>: 15% + $1.80 closing fee. Not recommended for cross-border sellers unless self-published.' }
};

/* ---- 英文字典：以中文為骨架，逐鍵覆寫 ---------------------------------- */
I18N.en = {
  'app.title': '🇺🇸 Amazon <span>US</span> FBA Cost Calculator',
  'app.subtitle.tw': 'Ship from Taiwan ｜ Based on official Amazon rates ｜ Rate basis {ver}',
  'app.subtitle.cn': 'Ship from China ｜ Based on official Amazon rates ｜ Rate basis {ver}',

  'origin.tw': '🇹🇼 Ship from Taiwan',
  'origin.cn': '🇨🇳 Ship from China',
  'mode.basic': '📦 FBA Basic',
  'mode.advanced': '🔧 FBA Advanced',
  'mode.fbm': '🚚 FBM',
  'mode.fbmtw': '🇹🇼 TW eCommerce → US',

  'modeDesc.basic': 'FBA Basic: COGS + referral + FBA + inbound freight',
  'modeDesc.advanced': 'FBA Advanced: Basic + ads + returns + Vine + account fee + incentives',
  'modeDesc.fbm': 'FBM: COGS + referral + self-fulfilment + CS & returns',
  'modeDesc.fbm-tw': 'TW eCommerce → US Amazon: enter your Taiwan product data, estimate the extra Amazon costs and a suggested price',

  'action.share': 'Copy share link',
  'action.csv': 'Export CSV',
  'action.print': 'Print / save as PDF',
  'action.reset': 'Reset to defaults',

  'badge.rates': 'Rates {ver}',
  'badge.ratesTip': 'Rate basis {ver}｜last verified {updated}｜next review {due}\n{note}',
  'badge.ratesTipStale': '⚠️ Rates have not been verified for over {days} days (last verified {updated}, review was due {due}). Update rates.js per docs/UPDATING-RATES.md.\n{note}',

  'card.account': '🏪 Account & Product',
  'card.referral': '💰 Referral Fee',
  'card.logisticsFba': '🚢 Logistics (FBA)',
  'card.logisticsFbm': '🚚 Logistics (FBM self-fulfilled)',
  'card.twMode': '🇹🇼 Existing Taiwan product → extra US Amazon costs',
  'card.operating': '📣 Operating Costs',
  'card.incentives': '🎁 New Seller Incentives & FBA New Selection',
  'card.result': '📊 Profit Analysis',
  'card.breakdown': '📈 Cost Breakdown',
  'card.incentiveGuide': '🎁 New Seller Incentives Guide',
  'card.sources': '📚 Data Sources & References',

  'unit.month': 'mo', 'unit.mo': 'mo', 'unit.months': 'months', 'unit.unitsMo': 'units/mo',
  'unit.g': 'Grams (g)', 'unit.kg': 'Kilograms (kg)', 'unit.lb': 'Pounds (lb)',
  'unit.cm': 'Centimetres (cm)', 'unit.in': 'Inches (in)', 'unit.usdPerReturn': 'USD per return',
  'badge.auto': 'Auto', 'badge.autoReferral': 'Auto-filled', 'badge.autoByMethod': 'By method',

  'f.accountFee': 'Seller account fee (fixed)',
  'tip.accountFee': 'The Professional plan is a flat $39.99/month. In FBA Advanced mode it is amortised across each unit based on your monthly sales volume.',
  'f.sellPrice': 'Selling price (USD)',
  'f.productCost': 'Product cost (incl. packaging)',
  'f.productCost.hint': 'Factory cost + packaging + labels (USD)',
  'f.monthlySales': 'Est. monthly sales',
  'tip.monthlySales': 'Used to amortise the account fee and one-time incentive credits, and to compute monthly revenue and profit.',

  'f.category': 'Product category',
  'f.referralPct': 'Referral fee',
  'tip.referralPct': 'Amazon charges a category-dependent referral fee, typically 8%-20%. Some categories are tiered (Beauty pays 8% at ≤$10 and 15% above; Furniture drops to 10% on the portion above $200). This field shows the effective rate at your current price.',
  'f.brandRebate': '🏷️ Brand Referral Bonus',
  'tip.brandRebate': 'If you own a US trademark and complete Amazon Brand Registry for the first time, you earn a referral-fee rebate: 10% on the first $50,000 of sales, then 5% (up to $52,500 total). The rebate offsets your referral fee and is valid for 12 months.',
  'f.rebate.off': 'Not enrolled', 'f.rebate.t10': '10% rebate (first $50K)', 'f.rebate.t5': '5% rebate (above $50K)',
  'note.rebate.off': 'Requires a US trademark + completed Amazon Brand Registry',
  'note.rebate.t10': '10% rebate on the first $50,000 of sales (offsets referral fee)',
  'note.rebate.t5': '5% rebate above $50,000 of sales (up to $52,500)',

  'f.weight': 'Product weight (incl. packaging)',
  'f.dims': 'Product dimensions (incl. packaging)',
  'tip.dims': 'Packaged length × width × height. Used for dimensional weight, FBA size tier and monthly storage fee.',
  'f.shipMethod': 'Inbound shipping method',
  'tip.shipMethod': 'Amazon SEND is Amazon\'s official cross-border logistics programme, quoted DDP (duty included, delivered to the FBA warehouse). It is only available for shipments from Taiwan, and rates vary by weight and destination region. Standard forwarder rates exclude duty — estimate it separately under Operating Costs.',
  'f.shipRate': 'Inbound rate',
  'f.shipPerPiece': 'Use a flat per-unit freight cost instead',
  'tip.shipPerPiece': 'If you already know the freight cost per unit, enter it directly and skip the weight calculation. E.g. a 200-unit carton costing $400 by air = $400 ÷ 200 = $2.00 per unit.',
  'f.shipmode.rate': 'By weight', 'f.shipmode.piece': 'Flat per unit',
  'f.shipPerPiece.hint': 'E.g. 200 units/carton at $400 air freight → $2.00 per unit',
  'ship.calcNote': '{kg} kg × ${rate}/kg = ${cost} per unit',
  'ship.calcNotePiece': '${cost} per unit (entered directly)',
  'ship.sendSeaUnit': 'USD/kg (≈${cbm}/cbm)',
  'ship.sendSeaNote': '✅ SEND Sea, DDP (duty included). Billed by CBM in practice: West ${w}/cbm, Central ${c}/cbm, East ${e}/cbm, minimum {min} CBM. Transit {transit}.',
  'ship.sendAirNote': '✅ SEND Air, DDP (duty included). Rates by region: West ${w}, Central ${c}, East ${e} per kg. Transit {transit}.',
  'ship.sendUpsNote': '✅ SEND UPS {svc}, DDP (incl. duty, fuel and peak surcharges). Rate ${rate}/kg at the {kg}kg band.',
  'ship.groupSend': '── Amazon SEND (DDP, duty included) ──',
  'ship.groupStd': '── Standard forwarder (duty excluded) ──',
  'ship.groupCustom': '── Custom ──',
  'ship.custom': 'Custom rate (USD/kg)',
  'ship.dutyIncluded': '✅ Your inbound method is SEND (DDP) — duty is already included in the freight rate, so this field can stay at 0.',

  'f.fbaFee': 'FBA fulfilment fee (per unit)',
  'tip.fbaFee': 'Estimated automatically from weight, dimensions and price. Rates fall into three price bands (<$10 / $10-$50 / >$50) and include a {fuel}% fuel surcharge. Covers picking, packing, delivery, customer service and returns processing. You can override it manually.',
  'fba.tierNote': '{tier} (billable weight {w} lb) → ${base} + {fuel}% fuel = ${fee} ｜price band {band}',
  'f.season': 'Storage season',
  'tip.season': 'Jan-Sep off-peak is ${off} per cubic foot; Oct-Dec peak is ${peak} per cubic foot (about {x}× higher).',
  'f.season.off': 'Off-peak Jan-Sep', 'f.season.peak': 'Peak Oct-Dec',
  'f.storageFee': 'FBA monthly storage (per unit)',
  'storage.note': 'Volume {cuft} cuft × ${rate} = ${fee} per unit per month',
  'f.storageMonths': 'Est. months in storage',
  'tip.storageMonths': 'Average months from inbound receipt to sale. Aim to hold 2-3 months of inventory; beyond {days} days an aged-inventory surcharge applies.',
  'f.storageMonths.hint': 'Storage = monthly fee × months. Beyond 6 months you risk the aged-inventory surcharge.',
  'f.inboundFee': 'Inbound Placement fee (per unit)',
  'tip.inboundFee': 'The fee for Amazon distributing your inventory across multiple fulfilment centres; it varies by size tier. Choosing Amazon-optimised placement reduces it.',

  'f.fbmMethod': 'Shipping method',
  'f.fbmShip': 'International shipping per unit',
  'tip.fbmShip': 'Express DDP: shipped direct from Taiwan to the US buyer with duty and clearance included — the market rate is roughly $8-20 per unit at 0.5kg. Overseas warehouse: bulk-ship to a US 3PL first (inbound ~$1-2/kg), then ship per order domestically ($3-6/unit). Lower total cost but requires prepaid freight and storage.',
  'f.fbmDuty': 'US import duty (est. per unit)',
  'tip.fbmDuty': 'From 2025 the US removed the $800 de minimis exemption, so every direct-from-overseas parcel owes duty. The rate depends on the HTS code — typically 0-25% for consumer goods. DDP shipping usually includes duty; with an overseas warehouse it is paid at bulk inbound.',
  'f.fbmDuty.hint': 'DDP usually includes duty (enter 0); an overseas warehouse needs a separate estimate',
  'f.fbmPack': 'Packaging materials (per unit)',
  'f.fbmCs': 'Customer service & returns (per unit)',
  'tip.fbmCs': 'FBM sellers handle their own customer service and returns, and usually absorb the return shipping cost. Budget $0.50-$2.00 per unit depending on return rate and support volume.',
  'fbm.info.title': '📋 How FBM shipping is estimated',
  'fbm.info.express': '<b>Express DDP (duty included, delivered)</b>: direct from Taiwan to the US buyer via DHL/FedEx/UPS or a third-party forwarder handling clearance and delivery. The cost covers international freight + fuel surcharge + clearance + duty + last-mile delivery.',
  'fbm.info.warehouse': '<b>Overseas warehouse</b>: bulk-ship by sea to a US third-party warehouse (inbound $1-2/kg), then the warehouse ships each order to the buyer ($3-6/unit domestically). Lower total cost, but you prepay freight and storage.',
  'fbm.tbl.method': 'Method', 'fbm.tbl.cost': 'Reference cost (per unit)', 'fbm.tbl.transit': 'Transit',
  'fbm.info.footnote': '* Warehouse dispatch time only — excludes Taiwan → US inbound transit (30-45 days by sea). Rates are market estimates; actual pricing varies with your forwarder contract, weight, volume and fuel surcharges. Get quotes from 2-3 forwarders.',
  'fbm.vs.title': '💡 FBM vs FBA',
  'fbm.vs.body': 'FBM avoids FBA fulfilment and storage fees, but you handle shipping, customer service and returns yourself. Your listing gets no Prime badge, which can hurt visibility and conversion. It suits large or heavy items, custom-made products, and thin-margin lines.',

  'f.twPrice': 'Taiwan retail price (TWD)',
  'f.twExRate': 'Exchange rate (1 USD = ? TWD)',
  'tip.twExRate': 'The default comes from twMode.defaultExchangeRate in rates.js and is refreshed whenever rates are updated. Override it with your actual settlement rate.',
  'f.twCost': 'Product cost (TWD)',
  'f.twCost.hint': 'Factory cost + packaging (TWD)',
  'f.twMonthlySales': 'Est. monthly sales (to amortise the account fee)',
  'tip.twDims': 'International couriers bill on volumetric weight: volumetric kg = L × W × H (cm) ÷ {div}, and they charge on whichever is greater — volumetric or actual weight. So dimensions directly drive your shipping cost.',
  'tw.weightNote': 'Actual {actual} kg, volumetric {vol} kg → billed at {billable} kg',
  'f.twFbmMethod': 'FBM shipping method',
  'tw.res.title': '📊 Extra cost estimate',
  'tw.res.twPrice': 'Taiwan price', 'tw.res.usdPrice': 'USD equivalent', 'tw.res.cogs': 'Product cost (USD)',
  'tw.res.extraTitle': 'Extra Amazon costs',
  'tw.res.referral': 'Referral fee', 'tw.res.account': 'Account fee per unit', 'tw.res.ship': 'FBM shipping',
  'tw.res.duty': 'Import duty', 'tw.res.misc': 'Packaging + CS/returns',
  'tw.res.extraTotal': 'Total extra Amazon cost', 'tw.res.extraPct': 'Extra cost as % of price',
  'tw.res.profitUsd': 'Net profit (USD)', 'tw.res.profitTwd': 'Net profit (TWD)', 'tw.res.margin': 'Margin',
  'tw.res.sugTitle': '💡 Suggested USD price (to match your Taiwan margin)',
  'tw.res.twMargin': 'Taiwan margin', 'tw.res.suggested': 'Suggested USD price',
  'tw.suggest.ok': 'Derived using the {pct}% effective referral fee — at this price you keep the same {margin}% margin on Amazon as you do in Taiwan.',
  'tw.suggest.impossible': '⚠️ A Taiwan margin of {margin}% plus a {pct}% referral fee already exceeds 100%, so no workable price exists. This usually means the Taiwan price and cost are swapped, or this category does not transfer directly to Amazon.',
  'tw.info.title': '📋 How this is calculated',
  'tw.info.body': 'This mode helps Taiwan sellers estimate the extra cost of taking an existing Taiwan product to Amazon US via FBM self-fulfilment.<br><br><b>Extra cost = referral fee + account fee share + FBM international shipping + duty + packaging/CS</b><br><br>The suggested USD price is back-solved from your Taiwan margin: what you would need to charge on Amazon to keep the same margin after all extra Amazon costs.<br><br>Shipping is estimated on the greater of volumetric and actual weight. Confirm actual rates with your forwarder.',

  'f.tacos': 'Advertising cost share (TACoS)',
  'tip.tacos': 'Total Advertising Cost of Sales = ad spend ÷ total revenue. Typically 15-25% during launch and 8-12% once stable.',
  'f.vineFee': 'Vine review cost (per unit)',
  'tip.vineFee': 'Amazon Vine gets you authentic reviews from trusted reviewers. The fee depends on enrolled units: free for 0 units, $75 for 1-2, $200 for 3-10. Enter the per-unit amortised amount.',
  'f.vineFee.hint': 'E.g. Vine $200 across a first batch of 200 units = $1.00 per unit',
  'f.returnRate': 'Return rate',
  'tip.returnRate': 'Return rates vary widely by category: 3-5% for general goods, 15-25% for apparel and footwear, 5-8% for electronics accessories.',
  'f.refundAdmin': 'Refund administration fee',
  'tip.refundAdmin': 'On a refund Amazon keeps the lower of {pct}% of the referral fee or ${cap}. This field is computed automatically from price and category.',
  'note.refundAdmin': '= min(referral × {pct}%, ${cap})',
  'f.importDuty': 'US import duty (est. per unit)',
  'tip.importDuty': 'US import duty depends on the HTS code — typically 0-25% for consumer goods. FBA sellers usually have their forwarder pay it at bulk inbound. This is an estimate, not an official Amazon fee. With Amazon SEND (DDP) the duty is already included in the inbound rate.',
  'f.importDuty.hint': 'Depends on HTS code; typically 0-25% for consumer goods. Confirm with your customs broker.',
  'f.otherFee': 'Other costs (per unit)',
  'f.otherFee.hint': 'Inspection, photography amortisation, insurance, software tools, etc.',

  'promo.nsi.title': '📦 New Seller Incentives',
  'promo.nsiAds': 'Sponsored Products ad credit', 'promo.nsiAds.badge': 'Up to $1,000',
  'promo.nsiAds.desc': 'Tiered reward (requires your first campaign created after 2025-08-20):<br>・Spend $50-$200 → $50 credit<br>・Spend $200-$1,000 → $200 credit<br>・Spend $1,000+ → $1,000 credit<br><a href="https://gs.amazon.com.tw/new-seller-incentive" target="_blank" rel="noopener">📎 View the official New Seller Incentives page</a>',
  'promo.nsiCoupon': '$50 Amazon Coupon credit',
  'promo.nsiCoupon.desc': 'Granted when you create a coupon promotion within 90 days. FBA enrolment not required.',
  'promo.nsiVine': '$200 Vine review credit',
  'promo.nsiVine.desc': 'Brand sellers only. Enrol in Vine within 90 days of Brand Registry; use within one year of receipt.',
  'promo.nsiShip': 'FBA inbound shipping credit',
  'promo.nsiShip.desc': '$100 for domestic inbound (Amazon Partnered Carrier); $200 for cross-border inbound (requires AGL or Amazon SEND)',
  'promo.adsTier': '${amt} (spend {range})',
  'promo.shipDomestic': '$100 (domestic, Partnered Carrier)',
  'promo.shipCross': '$200 (cross-border, AGL / SEND)',
  'promo.fns.title': '📦 FBA New Selection Program',
  'promo.fnsStorage': 'Free storage for 120 days', 'promo.fnsStorage.badge': 'No storage fee',
  'promo.fnsStorage.desc': 'First 100 standard-size / 50 oversize units: no monthly storage fee for 120 days after inbound receipt',
  'promo.fnsReturn': 'Free returns processing (first 20 units)',
  'promo.fnsReturn.desc': 'Standard-size items: no returns processing fee on the first 20 returns within 180 days of inbound receipt',
  'promo.fnsRebate': '10% sales rebate', 'promo.fnsRebate.badge': 'Offsets fulfilment fee',
  'promo.fnsRebate.desc': 'Averages a 10% rebate on new-ASIN sales, credited against next month\'s FBA fulfilment fees',
  'promo.fnsVine': '25% off Vine enrolment',
  'promo.fnsVine.desc': '25% discount on the Vine enrolment fee per parent ASIN (calculated from the Vine cost above)',
  'promo.fnsInbound': 'No Inbound Placement fee', 'promo.fnsInbound.badge': 'Placement fee waived',
  'promo.fnsInbound.desc': 'First 100 units of a new ASIN are exempt from the Inbound Placement Service fee',
  'promo.savings.title': '✅ Selected incentives — estimated saving per unit',

  'sv.nsiAds': 'Ad credit amortised', 'sv.nsiCoupon': 'Coupon credit amortised', 'sv.nsiVine': 'Vine credit amortised',
  'sv.nsiShip': 'Inbound freight credit amortised', 'sv.fnsStorage': 'Storage waived (120 days)',
  'sv.fnsReturn': 'Returns processing waived', 'sv.fnsRebate': '10% sales rebate', 'sv.fnsVine': '25% off Vine enrolment',
  'sv.fnsInbound': 'Inbound Placement waived', 'sv.total': 'Total saved per unit',
  'sv.note': '★ Marked items are <b>one-time credits</b>, amortised over "{m} months × {n} units/month". Once the credit is exhausted your unit cost returns to the undiscounted level — do not treat this as your long-run cost structure.<br>The remaining items are new-ASIN programme benefits and also have unit caps (e.g. free storage covers only the first 100 standard-size units).',

  'r.price': 'Price', 'r.sec.account': '— Account & product —', 'r.cogs': 'Product cost (COGS)',
  'r.account': 'Account fee per unit', 'r.sec.referral': '— Referral fee —', 'r.referral': 'Referral fee',
  'r.brandRebate': 'Brand rebate', 'r.sec.fba': '— Logistics (FBA) —', 'r.sec.fbm': '— Logistics (FBM) —',
  'r.ship': 'Inbound freight', 'r.fba': 'FBA fulfilment', 'r.storage': 'FBA storage',
  'r.fbmShip': 'FBM shipping', 'r.duty': 'Import duty', 'r.fbmPack': 'Packaging', 'r.fbmCs': 'CS & returns',
  'r.sec.operating': '— Operating costs —', 'r.ads': 'Advertising', 'r.vine': 'Vine reviews', 'r.return': 'Return losses',
  'r.refundAdmin': 'Refund admin fee', 'r.other': 'Other costs', 'r.promo': 'Incentive offset',
  'r.netProfit': 'Net profit per unit', 'r.margin': 'Margin', 'r.totalCost': 'Total cost per unit',
  'r.sec.monthly': '— Monthly estimate —', 'r.mRev': 'Monthly revenue', 'r.mProfit': 'Monthly profit (USD)',

  'bd.cogs': 'COGS', 'bd.ship': 'Inbound', 'bd.storage': 'Storage', 'bd.referral': 'Referral',
  'bd.ads': 'Ads', 'bd.account': 'Account', 'bd.returns': 'Returns', 'bd.other': 'Other',
  'bd.profit': 'Profit', 'bd.fbmShip': 'FBM ship', 'bd.duty': 'Duty', 'bd.pack': 'Packaging', 'bd.cs': 'CS/returns',

  'adv.tipsHeading': '📋 Optimisation tips',
  'adv.insightHeading': '🏪 Category market insight',
  'adv.insightLink': '📥 Download the full category report → Amazon Global Selling selection guide',
  'adv.fbmHigh': '⚠️ FBM shipping is <b>{pct}%</b> of your price (over 50%). This product is bulky/heavy or priced too low — <b>consider switching to FBA</b>, which usually cuts per-unit logistics cost sharply.',
  'adv.fbmMid': '💡 FBM shipping is {pct}% of price — acceptable. As volume grows, consider FBA to gain the Prime badge and lift conversion.',
  'adv.fbmLow': '✅ FBM shipping is {pct}% of price — a healthy structure. High-ASP, light and compact products suit FBM well.',
  'adv.logHigh': '📦 Total FBA logistics is <b>{pct}%</b> of price. Consider: ① optimise packaging to drop a size tier ② shift more volume to sea freight ③ raise the price.',
  'adv.marginNeg': '🚨 <b>Negative margin</b> — this price cannot be profitable. Consider: ① lower COGS ② raise the price ③ optimise logistics ④ pick a lower-fee category.',
  'adv.marginLow': '⚠️ Margin is only <b>{pct}%</b>, below 10%. After advertising and returns this may run at a loss — target at least 20%.',
  'adv.marginMidBasic': '💡 Margin {pct}%, but advertising and returns are not yet included. Switch to FBA Advanced for the full cost picture.',
  'adv.marginMidAdv': '💡 Margin {pct}%. Target 25-30% to leave sustainable headroom.',
  'adv.marginGood': '✅ Margin {pct}% — a healthy cost structure with room for advertising and competition.',
  'adv.refHigh': '💰 A {pct}% referral fee ({cat}) puts this in the high-fee bracket. A higher ASP dilutes the impact.',
  'adv.basicNote': '📌 This is Basic mode — advertising (TACoS), return losses, Vine and the account fee are excluded. Switch to FBA Advanced for the full analysis.',
  'adv.promoNote': '📌 <b>${amt}/unit</b> of your current profit comes from amortised one-time credits. Once they run out, margin drops to <b>{pct}%</b> — price against that number.',
  'adv.twHigh': '⚠️ <b>Shipping is {pct}% of price</b> (over 50%). This product is likely bulky/heavy or priced too low — <b>consider FBA instead</b>, which usually cuts per-unit logistics cost sharply.',
  'adv.twMid': '💡 Shipping is {pct}% of price — acceptable. Consider FBA as volume grows.',
  'adv.twLow': '✅ Shipping is {pct}% of price — a healthy structure. This product is <b>high-ASP, light and compact</b>, which suits FBM.',

  'opt.reduceWeight': '💡 Cutting weight below {g}g ({unit}) would save ${saving} per unit',
  'opt.toSmallStd': '💡 Cutting weight below 454g (16oz) would drop this to Small Standard, saving ${saving} per unit',
  'opt.toLargeStd': '💡 Dimensions already fit Standard — cutting weight below 20lb would drop this to Large Standard, saving ${saving} per unit',

  'tier.smallStandard': 'Small Standard', 'tier.largeStandard': 'Large Standard',
  'tier.smallBulky': 'Small Bulky', 'tier.largeBulky': 'Large Bulky', 'tier.extraLarge': 'Extra Large',

  'guide.nsi.title': 'New Seller Incentives (up to $50,000+)',
  'guide.fns.title': 'FBA New Selection Program',
  'guide.col.item': 'Benefit', 'guide.col.value': 'Value', 'guide.col.window': 'Window', 'guide.col.content': 'Details',
  'guide.nsi.note': 'Requires a Professional account + FBA inbound completed within 90 days of your first listing<br>* The ad credit is tiered: spend $50→get $50, $200→get $200, $1K+→get $1,000 (first campaign must be created after 2025-08-20)<br>** The brand rebate is configured in the Referral Fee card above',
  'guide.fns.note': 'Requires a Professional account + IPI ≥ 300 + a new ASIN (never previously sent to an FBA warehouse)',
  'guide.stack.title': '💡 For Taiwan sellers: the two programmes stack',
  'guide.stack.body': 'New Seller Incentives and the FBA New Selection Program can be used together. The Brand Bonus applies first, then New Selection rebates. Complete FBA inbound, launch advertising and enrol in Vine within 90 days of opening your account to maximise everything.<br>Details: <a href="https://gs.amazon.com.tw/benefits" target="_blank" rel="noopener">Amazon Global Selling incentives page</a>',

  'src.col.item': 'Fee item', 'src.col.source': 'Source', 'src.col.retrieved': 'Retrieved',
  'src.warning': '⚠️ These rates were captured from public sources and may change as Amazon updates its policies. Every rate in this tool lives in <code>rates.js</code>; the maintainer should re-verify and update it periodically using the checklist in <code>docs/UPDATING-RATES.md</code>. Some links require a Seller Central login.',
  'src.revenueCalc': 'Amazon Revenue Calculator — the official profitability calculator; enter an ASIN to look up actual FBA fees',

  'dis.title': '⚖️ Disclaimer',
  'dis.body': 'All cost estimates from this tool are for reference only and do not constitute business advice or any commitment.<br><br><b>Official Amazon fees</b> (referral, FBA fulfilment, storage, Inbound Placement, etc.) are estimated from public data. Actual fees are governed by <a href="https://sellercentral.amazon.com" target="_blank" rel="noopener">Amazon Seller Central</a> and may change with Amazon policy updates.<br><br><b>Non-Amazon costs</b> (inbound freight, FBM international shipping, import duty, packaging, etc.) are market estimates and vary with supplier contracts, product characteristics, shipping mode and timing. <b>We strongly recommend obtaining full quotes from professional service providers</b> — freight forwarders, customs brokers, overseas warehouses and logistics companies.<br><br>📋 <a href="https://gs.amazon.com.tw/service-provider" target="_blank" rel="noopener"><b>Amazon certified service provider directory (Taiwan) →</b></a><br><br>This tool collects no user data. All calculations run in your browser, and your inputs are stored only in your own browser\'s localStorage. Verify all fee data independently and assume full responsibility for your business decisions.',

  'foot.warning': '⚠️ Estimates only — actual fees are governed by Amazon Seller Central.',
  'foot.credit': 'Rate basis {ver} (last verified {updated}) ｜ all rates live in <code>rates.js</code>; see <code>docs/UPDATING-RATES.md</code> to update<br>Original version by Kai Tung; this is a maintained fork adding a separated data layer, complete bilingual coverage, and save/share/export.',

  'toast.shared': '✅ Share link copied to clipboard',
  'toast.sharedFail': '⚠️ Could not copy automatically — the link is in the address bar, please copy it manually',
  'toast.csv': '✅ CSV downloaded',
  'csv.header.item': 'Item', 'csv.header.value': 'Amount (USD)', 'csv.header.pct': '% of price',
};

/* ===========================================================================
 * 2. ENGINE — 純計算，可用 node 載入單測
 * =========================================================================*/
const Engine = (function () {
  const OZ_PER_G = 0.03527396;
  const IN_PER_CM = 0.393701;
  const G_PER_LB = 453.592;
  const OZ_PER_LB = 16;

  /** 挑出第一個 value <= band[key] 的級距；找不到就回最後一個 */
  function pickBand(bands, value, key) {
    for (const b of bands) if (value <= b[key]) return b;
    return bands[bands.length - 1];
  }

  function priceBandOf(price, R) {
    const pb = R.fba.priceBands;
    if (price < pb.lowMax) return 'low';
    if (price > pb.highMin) return 'high';
    return 'mid';
  }

  /**
   * 判斷 FBA size tier
   * @returns {{tier:string, unitLb:number, dimLb:number, shipLb:number}}
   */
  function classifyTier(dimsIn, unitOz, R) {
    const T = R.sizeTiers;
    const sorted = [dimsIn.l, dimsIn.w, dimsIn.h].slice().sort((a, b) => a - b);
    const minSide = sorted[0], medSide = sorted[1], maxSide = sorted[2];
    const girth = 2 * (medSide + minSide);
    const lengthGirth = maxSide + girth;

    const unitLb = unitOz / OZ_PER_LB;
    const effW = Math.max(dimsIn.w, T.dimWeightMinSideIn);
    const effH = Math.max(dimsIn.h, T.dimWeightMinSideIn);
    const dimLb = (dimsIn.l * effW * effH) / T.dimWeightDivisor;
    const shipLb = Math.max(unitLb, dimLb);

    const ss = T.smallStandard, ls = T.largeStandard, sb = T.smallBulky, bk = T.bulky;

    let tier;
    if (maxSide <= ss.maxLongestIn && medSide <= ss.maxMedianIn &&
        minSide <= ss.maxShortestIn && unitOz <= ss.maxUnitOz) {
      tier = 'smallStandard';
    } else if (maxSide <= ls.maxLongestIn && medSide <= ls.maxMedianIn &&
               minSide <= ls.maxShortestIn && shipLb <= ls.maxShipLb) {
      tier = 'largeStandard';
    } else if (lengthGirth <= bk.maxLengthGirthIn && maxSide <= bk.maxLongestIn && shipLb <= bk.maxShipLb) {
      tier = (maxSide <= sb.maxLongestIn && medSide <= sb.maxMedianIn && minSide <= sb.maxShortestIn)
        ? 'smallBulky' : 'largeBulky';
    } else {
      tier = 'extraLarge';
    }
    return { tier, unitLb, dimLb, shipLb, lengthGirth };
  }

  /**
   * FBA 配送費
   * @returns {{fee,baseFee,fuel,tier,basisLb,priceBand}}
   */
  function fbaFee(unitOz, dimsIn, price, R) {
    const cls = classifyTier(dimsIn, unitOz, R);
    const band = priceBandOf(price, R);
    const F = R.fba;
    let base = 0;
    let basisLb = cls.shipLb;

    if (cls.tier === 'smallStandard') {
      basisLb = cls.unitLb;
      base = pickBand(F.smallStandard.bands, unitOz, 'maxOz')[band];

    } else if (cls.tier === 'largeStandard') {
      const w = cls.shipLb;
      const over = F.largeStandard.over;
      if (w <= over.fromLb) {
        base = pickBand(F.largeStandard.bands, w, 'maxLb')[band];
      } else {
        // 超過 3 lb：每滿一個 intervalOz 加一次 perIntervalUsd
        const extraLb = w - over.fromLb;
        const intervals = Math.ceil(extraLb * (OZ_PER_LB / over.intervalOz));
        base = over.base[band] + intervals * over.perIntervalUsd;
      }

    } else if (cls.tier === 'smallBulky' || cls.tier === 'largeBulky') {
      const cfg = cls.tier === 'smallBulky' ? F.bulky.small : F.bulky.large;
      base = cfg.base[band] + Math.max(0, cls.shipLb - cfg.freeLb) * cfg.perLbUsd;

    } else {
      const xl = pickBand(F.extraLarge.bands, cls.shipLb, 'maxLb');
      // 最重的級距改用實際重量計費
      basisLb = xl.basis === 'unitWeight' ? cls.unitLb : cls.shipLb;
      base = xl.base + Math.max(0, basisLb - xl.freeLb) * xl.perLbUsd;
    }

    const fuel = base * (R.fuelSurcharge.pct / 100);
    return {
      fee: round2(base + fuel),
      baseFee: round2(base),
      fuel: round2(fuel),
      tier: cls.tier,
      basisLb: round2(basisLb),
      priceBand: band,
      cls
    };
  }

  function storageFee(dimsIn, season, R) {
    const cuft = (dimsIn.l * dimsIn.w * dimsIn.h) / R.storage.cubicInchesPerCuFt;
    const rate = R.storage[season];
    return { fee: round2(cuft * rate), cuft: Math.round(cuft * 1000) / 1000, rate };
  }

  function referralFee(price, catKey, R) {
    const cat = R.categories[catKey];
    if (!cat) return price * 0.15;
    if (!cat.tiered) return price * (cat.pct / 100);
    if (cat.above) {
      // 家具 / 珠寶：門檻以下用高費率，超過的部分才降到 lowPct
      if (price <= cat.threshold) return price * (cat.pct / 100);
      return cat.threshold * (cat.pct / 100) + (price - cat.threshold) * (cat.lowPct / 100);
    }
    // 美妝 / 嬰兒：門檻以下整筆用低費率
    return price <= cat.threshold ? price * (cat.lowPct / 100) : price * (cat.pct / 100);
  }

  /** 有效佣金比例 (%)；price 為 0 時回品類名目費率，避免 NaN */
  function effectiveReferralPct(price, catKey, R) {
    const cat = R.categories[catKey];
    if (price <= 0) {
      if (!cat) return 15;
      return cat.tiered && !cat.above ? cat.lowPct : cat.pct;
    }
    return referralFee(price, catKey, R) / price * 100;
  }

  function refundAdminFee(price, catKey, R) {
    const ref = referralFee(price, catKey, R);
    return Math.min(ref * (R.refundAdmin.pct / 100), R.refundAdmin.cap);
  }

  function inboundFee(tierKey, R) {
    const v = R.inboundPlacement[tierKey];
    return typeof v === 'number' ? v : R.inboundPlacement.extraLarge;
  }

  /** SEND 費率 (USD/kg)，找不到服務回 null */
  function sendRate(service, weightKg, R) {
    const svc = R.send.services[service];
    if (!svc) return null;
    return pickBand(svc.bands, weightKg, 'maxKg').rate;
  }

  /** 材積重 (kg) — 國際快遞計費用 */
  function volumetricKg(dimsCm, R) {
    return (dimsCm.l * dimsCm.w * dimsCm.h) / R.fbm.volumetricDivisor;
  }

  /* ---- 優惠折抵 ------------------------------------------------------- */
  function promoSavings(input, ctx, R) {
    const p = input.promos || {};
    const inc = R.incentives;
    const months = inc.amortizeMonths;
    const perMonth = Math.max(1, input.monthlySales);
    const spread = perMonth * months;
    const details = [];
    let perUnit = 0, oneTime = 0;

    const add = (key, value, isOneTime) => {
      if (!(value > 0)) return;
      perUnit += value;
      if (isOneTime) oneTime += value;
      details.push({ key, value, oneTime: !!isOneTime });
    };

    if (p.nsiAds)    add('sv.nsiAds',    (p.nsiAdsAmount || inc.nsi.adsCredit.defaultTier) / spread, true);
    if (p.nsiCoupon) add('sv.nsiCoupon', inc.nsi.couponCredit / spread, true);
    if (p.nsiVine)   add('sv.nsiVine',   inc.nsi.vineCredit / spread, true);
    if (p.nsiShip)   add('sv.nsiShip',   (p.nsiShipAmount || inc.nsi.inboundCredit.default) / spread, true);

    if (p.fnsStorage) add('sv.fnsStorage', ctx.storageTotal, false);
    if (p.fnsReturn)  add('sv.fnsReturn',  ctx.fbaFee * (input.returnRate / 100), false);
    if (p.fnsRebate)  add('sv.fnsRebate',  Math.min(input.price * (inc.newSelection.rebatePct / 100), ctx.fbaFee), false);
    if (p.fnsVine)    add('sv.fnsVine',    input.vineFee * (inc.newSelection.vineDiscountPct / 100), false);
    if (p.fnsInbound) add('sv.fnsInbound', ctx.inboundFee, false);

    return { perUnit, oneTime, structural: perUnit - oneTime, details, months, perMonth };
  }

  /* ---- 主計算 --------------------------------------------------------- */
  function computeAll(input, R) {
    // 只有「FBA 進階」才計入營運成本與優惠折抵。
    // 原版用 isBasic = (mode === 'basic')，導致 FBM 模式下「營運成本」卡片被隱藏，
    // 廣告費／退貨損失／帳戶月費／其他費用卻還是被算進總成本 —— 使用者看不到卻付得到。
    const includeOps = input.mode === 'advanced';
    const isFbm = input.mode === 'fbm';
    const price = Math.max(0, input.price);
    const monthlySales = Math.max(1, input.monthlySales);
    const cat = R.categories[input.category];

    const referralCost = referralFee(price, input.category, R);
    const extraPerItem = (cat && cat.extraPerItem) || 0;
    const brandRebate = isFbm ? 0 : price * (input.brandRebatePct / 100);

    // 頭程
    let shipCost = 0;
    if (!isFbm) {
      shipCost = input.useShipPerPiece
        ? input.shipPerPiece
        : input.shipRate * (input.weightG / 1000);
    }

    const fbaFeeVal = isFbm ? 0 : input.fbaFee;
    const storageTotal = isFbm ? 0 : input.storageFee * input.storageMonths;
    const inboundFeeVal = isFbm ? 0 : input.inboundFee;

    const fbmShip = isFbm ? input.fbmShip : 0;
    const fbmDuty = isFbm ? input.fbmDuty : 0;
    const fbmPack = isFbm ? input.fbmPack : 0;
    const fbmCs = isFbm ? input.fbmCs : 0;

    const accountPerUnit = includeOps ? R.accountFee.professional / monthlySales : 0;
    const adsCost = includeOps ? price * (input.tacos / 100) : 0;
    const returnPct = includeOps ? input.returnRate / 100 : 0;
    const returnCost = price * returnPct;
    const refundAdmin = includeOps ? input.refundAdminFee * returnPct : 0;
    const vineFee = includeOps ? input.vineFee : 0;
    const importDuty = includeOps ? input.importDuty : 0;
    const otherFee = includeOps ? input.otherFee : 0;

    const promo = !includeOps
      ? { perUnit: 0, oneTime: 0, structural: 0, details: [], months: R.incentives.amortizeMonths, perMonth: monthlySales }
      : promoSavings(input, { storageTotal, fbaFee: fbaFeeVal, inboundFee: inboundFeeVal }, R);

    const totalCost = input.cogs + shipCost + fbaFeeVal + storageTotal + inboundFeeVal
      + fbmShip + fbmDuty + fbmPack + fbmCs
      + referralCost - brandRebate + extraPerItem
      + accountPerUnit + adsCost + vineFee + importDuty + returnCost + refundAdmin + otherFee
      - promo.perUnit;

    const profit = price - totalCost;
    const margin = price > 0 ? (profit / price) * 100 : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    // 一次性額度用完後的利潤（定價真正該看的數字）
    const profitExOneTime = profit - promo.oneTime;
    const marginExOneTime = price > 0 ? (profitExOneTime / price) * 100 : 0;

    return {
      price, cogs: input.cogs, shipCost, fbaFee: fbaFeeVal, storageTotal, inboundFee: inboundFeeVal,
      fbmShip, fbmDuty, fbmPack, fbmCs,
      referralCost, brandRebate, extraPerItem, effReferralPct: effectiveReferralPct(price, input.category, R),
      accountPerUnit, adsCost, vineFee, importDuty, returnCost, refundAdmin, otherFee,
      promo, totalCost, profit, margin, roi, profitExOneTime, marginExOneTime,
      monthlyRevenue: price * monthlySales, monthlyProfit: profit * monthlySales
    };
  }

  /* ---- 台灣電商 → 美國 ------------------------------------------------ */
  function computeTw(input, R) {
    const ex = Math.max(0.0001, input.exRate);
    const usdPrice = input.twPrice / ex;
    const cogsUsd = input.twCost / ex;
    const twMargin = input.twPrice > 0 ? ((input.twPrice - input.twCost) / input.twPrice * 100) : 0;

    const referral = referralFee(usdPrice, input.category, R);
    const accountPerUnit = R.accountFee.professional / Math.max(1, input.monthlySales);

    const actualKg = input.weightG / 1000;
    const volKg = volumetricKg(input.dimsCm, R);
    const billableKg = Math.max(actualKg, volKg);

    const m = R.fbm.methods[input.method];
    const cfg = m ? (m[input.origin] || m.tw) : null;
    let shipCost = 0, duty = 0;
    if (cfg) {
      shipCost = round2((cfg.baseUsd || 0) + billableKg * (cfg.perKgUsd || 0));
      duty = cfg.dutyPctOfPrice ? round2(usdPrice * (cfg.dutyPctOfPrice / 100)) : 0;
    }
    const misc = R.fbm.miscPerUnit;

    const extraTotal = referral + accountPerUnit + shipCost + duty + misc;
    const extraPct = usdPrice > 0 ? (extraTotal / usdPrice * 100) : 0;
    const profit = usdPrice - cogsUsd - extraTotal;
    const margin = usdPrice > 0 ? (profit / usdPrice * 100) : 0;

    // 反推建議售價：P - cogs - P*refPct - fixed = P * twMargin/100
    const refPct = effectiveReferralPct(usdPrice, input.category, R) / 100;
    const fixed = cogsUsd + accountPerUnit + shipCost + duty + misc;
    const denom = 1 - refPct - (twMargin / 100);
    const suggested = denom > 0 ? fixed / denom : null;

    return {
      usdPrice, cogsUsd, twMargin, referral, accountPerUnit,
      actualKg, volKg, billableKg, shipCost, duty, misc,
      extraTotal, extraPct, profit, margin,
      suggested, refPct: refPct * 100, shipPct: usdPrice > 0 ? shipCost / usdPrice * 100 : 0
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  return {
    OZ_PER_G, IN_PER_CM, G_PER_LB, OZ_PER_LB,
    pickBand, priceBandOf, classifyTier, fbaFee, storageFee,
    referralFee, effectiveReferralPct, refundAdminFee, inboundFee, sendRate, volumetricKg,
    promoSavings, computeAll, computeTw, round2
  };
})();

/* node 單測用；瀏覽器不會走到這一行 */
if (typeof module !== 'undefined' && module.exports) module.exports = { Engine, I18N, INSIGHTS };

/* ===========================================================================
 * 3. UI
 * =========================================================================*/
if (typeof document !== 'undefined') (function () {

const R = window.AMZ_RATES;
const LS_KEY = 'amzCostCalc.v2';

/* ---- 狀態 ----------------------------------------------------------- */
const State = {
  lang: 'zh',
  mode: 'basic',
  origin: 'tw',
  weightUnit: 'g',
  dimUnit: 'cm',
  season: 'offpeak',
  useShipPerPiece: false,
  rebateLevel: 'off'
};

/** 所有會存檔／進分享連結的 <input> / <select> id */
const FIELD_IDS = [
  'sellPrice', 'productCost', 'monthlySales', 'category', 'referralPct', 'brandRebatePct',
  'weightInput', 'dimL', 'dimW', 'dimH', 'shipMethod', 'shipRate', 'shipPerPiece',
  'fbaFee', 'storageFee', 'storageMonths', 'inboundFee',
  'fbmMethod', 'fbmShipCost', 'fbmDuty', 'fbmPackCost', 'fbmCsFee',
  'tacos', 'vineFee', 'returnRate', 'refundAdminFee', 'importDuty', 'otherFee',
  'nsiAdsAmount', 'nsiShipAmount',
  'twPrice', 'twExRate', 'twCost', 'twCategory', 'twMonthlySales',
  'twWeight', 'twDimL', 'twDimW', 'twDimH', 'twFbmMethod'
];
const CHECK_IDS = ['nsi-ads', 'nsi-coupon', 'nsi-vine', 'nsi-ship',
                   'fns-storage', 'fns-return', 'fns-rebate', 'fns-vine', 'fns-inbound'];
const STATE_KEYS = ['lang', 'mode', 'origin', 'weightUnit', 'dimUnit', 'season', 'useShipPerPiece', 'rebateLevel'];

/* ---- 小工具 --------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const num = (id) => { const v = parseFloat($(id).value); return Number.isFinite(v) ? v : 0; };
const checked = (id) => $(id).checked;

function t(key, vars) {
  let s = (I18N[State.lang] && I18N[State.lang][key]) ?? I18N.zh[key] ?? key;
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
const L = (obj) => (obj && (obj[State.lang] ?? obj.zh)) || '';

function fmt(n) { return (n >= 0 ? '$' : '-$') + Math.abs(n).toFixed(2); }
function fmtK(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtTwd(n) { return 'NT$' + Math.round(n).toLocaleString('en-US'); }
function pctOf(v, price) { return price > 0 ? (v / price * 100).toFixed(1) + '%' : '—'; }
function daysBetween(aIso, bIso) {
  return Math.round((new Date(bIso) - new Date(aIso)) / 86400000);
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/** 只列舉真正的資料鍵，跳過 _source / _verified 之類的 metadata */
const dataKeys = (obj) => Object.keys(obj).filter(k => !k.startsWith('_'));

let toastTimer = null;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---- 讀取表單 → Engine input ---------------------------------------- */
function weightGrams() {
  const v = num('weightInput');
  if (State.weightUnit === 'g') return v;
  if (State.weightUnit === 'kg') return v * 1000;
  return v * Engine.G_PER_LB;
}
function dimCm(id) {
  const v = num(id);
  return State.dimUnit === 'cm' ? v : v * 2.54;
}
function dimsInches() {
  return {
    l: dimCm('dimL') * Engine.IN_PER_CM,
    w: dimCm('dimW') * Engine.IN_PER_CM,
    h: dimCm('dimH') * Engine.IN_PER_CM
  };
}

function collectInput() {
  return {
    mode: State.mode,
    origin: State.origin,
    price: num('sellPrice'),
    cogs: num('productCost'),
    monthlySales: num('monthlySales'),
    category: $('category').value,
    brandRebatePct: num('brandRebatePct'),
    weightG: weightGrams(),
    useShipPerPiece: State.useShipPerPiece,
    shipRate: num('shipRate'),
    shipPerPiece: num('shipPerPiece'),
    fbaFee: num('fbaFee'),
    storageFee: num('storageFee'),
    storageMonths: num('storageMonths'),
    inboundFee: num('inboundFee'),
    fbmShip: num('fbmShipCost'),
    fbmDuty: num('fbmDuty'),
    fbmPack: num('fbmPackCost'),
    fbmCs: num('fbmCsFee'),
    tacos: num('tacos'),
    vineFee: num('vineFee'),
    returnRate: num('returnRate'),
    refundAdminFee: num('refundAdminFee'),
    importDuty: num('importDuty'),
    otherFee: num('otherFee'),
    promos: {
      nsiAds: checked('nsi-ads'), nsiAdsAmount: parseFloat($('nsiAdsAmount').value),
      nsiCoupon: checked('nsi-coupon'), nsiVine: checked('nsi-vine'),
      nsiShip: checked('nsi-ship'), nsiShipAmount: parseFloat($('nsiShipAmount').value),
      fnsStorage: checked('fns-storage'), fnsReturn: checked('fns-return'),
      fnsRebate: checked('fns-rebate'), fnsVine: checked('fns-vine'), fnsInbound: checked('fns-inbound')
    }
  };
}

/* =========================================================================
 * 動態選單 / 表格（全部從 rates.js 生成）
 * =======================================================================*/
function buildCategorySelects() {
  const keys = dataKeys(R.categories);
  const opts = (subset) => subset.map(k => {
    const c = R.categories[k];
    const pctLabel = c.tiered
      ? (c.above ? `${c.pct}%/${c.lowPct}%` : `${c.lowPct}%/${c.pct}%`)
      : `${c.pct}%`;
    return `<option value="${k}">${esc(L(c.label))} (${pctLabel})</option>`;
  }).join('');

  const keep = $('category').value;
  $('category').innerHTML = opts(keys);
  if (keep && R.categories[keep]) $('category').value = keep;

  // 台灣電商模式用同一份品類（原版只列 9 個，這裡統一）
  const keepTw = $('twCategory').value;
  $('twCategory').innerHTML = opts(keys);
  if (keepTw && R.categories[keepTw]) $('twCategory').value = keepTw;
}

function buildShipMethodSelect() {
  const keep = $('shipMethod').value;
  const sendOk = R.send.availableFor.includes(State.origin);
  let html = '';
  if (sendOk) {
    html += `<optgroup label="${esc(t('ship.groupSend'))}">`;
    for (const k of dataKeys(R.send.services)) {
      const s = R.send.services[k];
      let priceHint;
      if (k === 'send-sea') {
        const c = s.cbmRates;
        priceHint = `$${c.west}-${c.east}/cbm`;
      } else {
        const rates = s.bands.map(b => b.rate);
        const lo = Math.min(...rates).toFixed(2), hi = Math.max(...rates).toFixed(2);
        priceHint = lo === hi ? `$${lo}/kg` : `$${lo}-${hi}/kg`;
      }
      html += `<option value="${k}">${esc(L(s.label))} — ${priceHint}</option>`;
    }
    html += '</optgroup>';
  }
  html += `<optgroup label="${esc(t('ship.groupStd'))}">`;
  for (const k of ['sea', 'air', 'express']) {
    html += `<option value="${k}">${esc(L(R.freight[State.origin][k].label))}</option>`;
  }
  html += '</optgroup>';
  html += `<optgroup label="${esc(t('ship.groupCustom'))}"><option value="custom">${esc(t('ship.custom'))}</option></optgroup>`;

  $('shipMethod').innerHTML = html;
  // 中國出貨時 SEND 不存在，退回海運
  if (keep && $('shipMethod').querySelector(`option[value="${keep}"]`)) $('shipMethod').value = keep;
  else $('shipMethod').value = 'sea';
}

function buildFbmSelects() {
  const keys = dataKeys(R.fbm.methods);
  const html = keys.map(k => `<option value="${k}">${esc(L(R.fbm.methods[k].label))}</option>`).join('');
  const keep = $('fbmMethod').value;
  $('fbmMethod').innerHTML = html;
  if (keep && R.fbm.methods[keep]) $('fbmMethod').value = keep;

  // 台灣電商模式：只給有 baseUsd 公式的方式（自訂費率沒有公式，排除）
  const twKeys = keys.filter(k => {
    const cfg = R.fbm.methods[k][State.origin] || R.fbm.methods[k].tw;
    return cfg && typeof cfg.baseUsd === 'number';
  });
  const keepTw = $('twFbmMethod').value;
  $('twFbmMethod').innerHTML = twKeys.map(k => `<option value="${k}">${esc(L(R.fbm.methods[k].label))}</option>`).join('');
  if (keepTw && twKeys.includes(keepTw)) $('twFbmMethod').value = keepTw;
}

function buildPromoSelects() {
  const keepAds = $('nsiAdsAmount').value;
  const tiers = R.incentives.nsi.adsCredit.tiers;
  const ranges = ['$50~$200', '$200~$1K', '$1K+'];
  $('nsiAdsAmount').innerHTML = tiers.map((amt, i) =>
    `<option value="${amt}">${esc(t('promo.adsTier', { amt: amt.toLocaleString('en-US'), range: ranges[i] || '' }))}</option>`
  ).join('');
  $('nsiAdsAmount').value = keepAds && tiers.includes(+keepAds) ? keepAds : R.incentives.nsi.adsCredit.defaultTier;

  const keepShip = $('nsiShipAmount').value;
  const ic = R.incentives.nsi.inboundCredit;
  $('nsiShipAmount').innerHTML =
    `<option value="${ic.domestic}">${esc(t('promo.shipDomestic'))}</option>` +
    `<option value="${ic.crossBorder}">${esc(t('promo.shipCross'))}</option>`;
  $('nsiShipAmount').value = keepShip || ic.default;
}

function buildStaticTables() {
  // FBM 參考費率表
  $('fbmRefTable').innerHTML = R.fbm.referenceTable.map(r =>
    `<tr><td>${esc(L(r.method))}</td><td>${esc(r.cost)}</td><td>${esc(L(r.transit))}</td></tr>`
  ).join('');

  // 資料來源表
  $('sourcesBody').innerHTML = R.sourceTable.map(row => {
    const links = row.links.map(l =>
      `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(typeof l.text === 'string' ? l.text : L(l.text))}</a>`).join('<br>');
    const detail = L(row.detail);
    return `<tr><td>${esc(L(row.item))}</td><td>${links}${detail ? `<span class="src-detail">${detail}</span>` : ''}</td><td>${esc(row.retrieved)}</td></tr>`;
  }).join('');

  // 優惠方案說明表
  const nsi = R.incentives.nsi, fns = R.incentives.newSelection, bb = R.incentives.brandBonus;
  const nsiRows = [
    [t('promo.nsiAds'), '$' + Math.max(...nsi.adsCredit.tiers).toLocaleString('en-US') + '*', '90d'],
    [t('promo.nsiCoupon'), '$' + nsi.couponCredit, '90d'],
    [t('promo.nsiVine'), '$' + nsi.vineCredit, '90d'],
    [t('promo.nsiShip'), '$' + nsi.inboundCredit.domestic + '~$' + nsi.inboundCredit.crossBorder, '—'],
    [t('f.brandRebate').replace(/^🏷️\s*/, '') + '**', '$' + bb.maxTotalUsd.toLocaleString('en-US'), bb.validMonths + ' ' + t('unit.months')]
  ];
  $('guideNsiTable').innerHTML = nsiRows.map(r =>
    `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');

  const fnsRows = [
    [t('promo.fnsStorage'), `Std ${fns.freeStorageUnits.standard} / OS ${fns.freeStorageUnits.oversize}`, fns.freeStorageDays + 'd'],
    [t('promo.fnsReturn'), `${fns.freeReturnsUnits} pcs`, fns.freeReturnsDays + 'd'],
    [t('promo.fnsRebate'), `${fns.rebatePct}%`, '—'],
    [t('promo.fnsVine'), `-${fns.vineDiscountPct}%`, '—'],
    [t('promo.fnsInbound'), `${fns.freeInboundUnits} pcs`, '—']
  ];
  $('guideFnsTable').innerHTML = fnsRows.map(r =>
    `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('');
}

/* =========================================================================
 * i18n 套用
 * =======================================================================*/
function applyI18n() {
  document.documentElement.lang = State.lang === 'zh' ? 'zh-TW' : 'en';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-tip-i18n]').forEach(el => {
    el.setAttribute('data-tip', t(el.getAttribute('data-tip-i18n'), {
      fuel: R.fuelSurcharge.pct,
      off: R.storage.offpeak.toFixed(2), peak: R.storage.peak.toFixed(2),
      x: (R.storage.peak / R.storage.offpeak).toFixed(1),
      days: R.storage.agedSurchargeFromDays,
      pct: R.refundAdmin.pct, cap: R.refundAdmin.cap.toFixed(2),
      div: R.fbm.volumetricDivisor
    }));
  });

  // 依語言重建有文字的選單和表格
  buildCategorySelects();
  buildShipMethodSelect();
  buildFbmSelects();
  buildPromoSelects();
  buildStaticTables();

  // 動態文字
  $('appSubtitle').textContent = t('app.subtitle.' + State.origin, { ver: R.meta.version });
  $('modeDesc').textContent = t('modeDesc.' + State.mode);
  $('accountFeeLabel').textContent = R.accountFee.professional.toFixed(2);
  $('rateOffpeak').textContent = R.storage.offpeak.toFixed(2);
  $('ratePeak').textContent = R.storage.peak.toFixed(2);
  $('refundNote').textContent = t('note.refundAdmin', { pct: R.refundAdmin.pct, cap: R.refundAdmin.cap.toFixed(2) });
  $('brandRebateNote').textContent = t('note.rebate.' + (State.rebateLevel === 'off' ? 'off' : 't' + State.rebateLevel));

  // footer credit
  document.querySelectorAll('[data-i18n-html="foot.credit"]').forEach(el => {
    el.innerHTML = t('foot.credit', { ver: R.meta.version, updated: R.meta.lastUpdated });
  });

  renderRatesBadge();
  updateOriginDependent();
}

function renderRatesBadge() {
  const badge = $('ratesBadge');
  const today = new Date().toISOString().slice(0, 10);
  const age = daysBetween(R.meta.lastUpdated, today);
  const overdue = age > R.meta.staleAfterDays || today > R.meta.nextReviewDue;

  $('ratesBadgeText').textContent = t('badge.rates', { ver: R.meta.version });
  badge.classList.toggle('stale', overdue);
  badge.setAttribute('title', overdue
    ? t('badge.ratesTipStale', { days: age, updated: R.meta.lastUpdated, due: R.meta.nextReviewDue, note: L(R.meta.note) })
    : t('badge.ratesTip', { ver: R.meta.version, updated: R.meta.lastUpdated, due: R.meta.nextReviewDue, note: L(R.meta.note) }));
}

/* =========================================================================
 * 出貨地 / 模式 / 單位切換
 * =======================================================================*/
function updateOriginDependent() {
  const fr = R.freight[State.origin];
  // 一般貨代預設費率
  const m = $('shipMethod').value;
  if (fr[m]) $('shipRate').value = fr[m].rate;
  $('shipHintArea').innerHTML = L(fr.hint) + '<br>' + L(R.freight._note);

  // 台灣出貨才有「台灣電商 → 美國」模式
  const twBtn = $('btn-mode-fbm-tw');
  twBtn.classList.toggle('js-hidden', State.origin !== 'tw');
  if (State.origin !== 'tw' && State.mode === 'fbm-tw') setMode('basic');

  applyFbmMethodDefaults();
}

function setOrigin(origin) {
  State.origin = origin;
  document.querySelectorAll('.origin-bar button').forEach(b => b.classList.remove('active'));
  $('btn-origin-' + origin).classList.add('active');
  buildShipMethodSelect();
  buildFbmSelects();
  $('appSubtitle').textContent = t('app.subtitle.' + origin, { ver: R.meta.version });
  updateOriginDependent();
  onShipMethodChange();
  recalc();
}

function setMode(mode) {
  State.mode = mode;
  document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
  $('btn-mode-' + mode).classList.add('active');
  $('appContainer').setAttribute('data-mode', mode);
  $('modeDesc').textContent = t('modeDesc.' + mode);
  recalc();
}

function setLang(lang) {
  State.lang = lang;
  document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('active'));
  $('btn-lang-' + lang).classList.add('active');
  applyI18n();
  recalc();
}

function setWeightUnit(unit) {
  const input = $('weightInput');
  const old = parseFloat(input.value) || 0;
  let grams;
  if (State.weightUnit === 'g') grams = old;
  else if (State.weightUnit === 'kg') grams = old * 1000;
  else grams = old * Engine.G_PER_LB;

  let val;
  if (unit === 'g') { val = grams; input.step = '10'; }
  else if (unit === 'kg') { val = grams / 1000; input.step = '0.01'; }
  else { val = grams / Engine.G_PER_LB; input.step = '0.01'; }

  input.value = parseFloat(val.toFixed(unit === 'g' ? 0 : 3));
  State.weightUnit = unit;
  $('weightUnitLabel').textContent = unit;
  document.querySelectorAll('[id^="btn-wt-"]').forEach(b => b.classList.remove('active'));
  $('btn-wt-' + unit).classList.add('active');
  recalc();
}

function setDimUnit(unit) {
  ['dimL', 'dimW', 'dimH'].forEach(id => {
    const input = $(id);
    const old = parseFloat(input.value) || 0;
    let val = old;
    if (State.dimUnit === 'cm' && unit === 'in') { val = old * Engine.IN_PER_CM; input.step = '0.1'; }
    else if (State.dimUnit === 'in' && unit === 'cm') { val = old * 2.54; input.step = '0.5'; }
    input.value = parseFloat(val.toFixed(1));
  });
  State.dimUnit = unit;
  $('dimUnitLabel').textContent = unit;
  document.querySelectorAll('[id^="btn-dim-"]').forEach(b => b.classList.remove('active'));
  $('btn-dim-' + unit).classList.add('active');
  recalc();
}

function setSeason(s) {
  State.season = s;
  $('btn-offpeak').classList.toggle('active', s === 'offpeak');
  $('btn-peak').classList.toggle('active', s === 'peak');
  recalc();
}

function setBrandRebate(level) {
  State.rebateLevel = level;
  document.querySelectorAll('[id^="btn-rebate-"]').forEach(b => b.classList.remove('active'));
  $('btn-rebate-' + level).classList.add('active');
  const bb = R.incentives.brandBonus;
  $('brandRebatePct').value = level === 'off' ? 0 : level === '10' ? bb.tier1Pct : bb.tier2Pct;
  $('brandRebateNote').textContent = t('note.rebate.' + (level === 'off' ? 'off' : 't' + level));
  recalc();
}

function setShipMode(mode) {
  State.useShipPerPiece = (mode === 'piece');
  $('btn-shipmode-rate').classList.toggle('active', !State.useShipPerPiece);
  $('btn-shipmode-piece').classList.toggle('active', State.useShipPerPiece);
  $('shipRateGroup').classList.toggle('js-hidden', State.useShipPerPiece);
  $('shipPerPieceGroup').classList.toggle('js-hidden', !State.useShipPerPiece);
  recalc();
}

function onShipMethodChange() {
  const m = $('shipMethod').value;
  const isSend = m.startsWith('send-');
  const kg = weightGrams() / 1000;
  const ddp = $('sendDdpNote');

  if (isSend) {
    const svc = R.send.services[m];
    const rate = Engine.sendRate(m, kg, R);
    $('shipRate').value = rate;
    ddp.classList.remove('js-hidden');

    if (m === 'send-sea') {
      const c = svc.cbmRates;
      $('shipRateUnit').textContent = t('ship.sendSeaUnit', { cbm: c.central });
      ddp.innerHTML = t('ship.sendSeaNote', {
        w: c.west, c: c.central, e: c.east, min: svc.minCbm, transit: L(svc.transit)
      });
    } else if (m === 'send-air') {
      $('shipRateUnit').textContent = 'USD/kg';
      const rg = svc.regions;
      ddp.innerHTML = t('ship.sendAirNote', {
        w: Engine.pickBand(rg.west, kg, 'maxKg').rate.toFixed(2),
        c: Engine.pickBand(rg.central, kg, 'maxKg').rate.toFixed(2),
        e: Engine.pickBand(rg.east, kg, 'maxKg').rate.toFixed(2),
        transit: L(svc.transit)
      });
    } else {
      $('shipRateUnit').textContent = 'USD/kg';
      ddp.innerHTML = t('ship.sendUpsNote', {
        svc: L(svc.transit), rate: rate.toFixed(2), kg: kg.toFixed(1)
      });
    }
  } else {
    ddp.classList.add('js-hidden');
    $('shipRateUnit').textContent = 'USD/kg';
    const fr = R.freight[State.origin][m];
    if (fr) $('shipRate').value = fr.rate;
  }
  recalc();
}

function applyFbmMethodDefaults() {
  const m = $('fbmMethod').value;
  const method = R.fbm.methods[m];
  if (!method) return;
  const cfg = method[State.origin] || method.tw;
  if (cfg.ship !== null && cfg.ship !== undefined) {
    $('fbmShipCost').value = cfg.ship;
    $('fbmDuty').value = cfg.duty;
    $('fbmPackCost').value = cfg.pack;
    $('fbmCsFee').value = cfg.cs;
  }
  $('fbmShipNote').textContent = L(cfg.note);
}

function onFbmMethodChange() { applyFbmMethodDefaults(); recalc(); }

/* =========================================================================
 * 尺寸 / 重量優化提示
 * =======================================================================*/
function sizeOptimizationHint(unitOz, dimsIn, price, current) {
  const feeAt = (oz) => Engine.fbaFee(oz, dimsIn, price, R).fee;
  const sorted = [dimsIn.l, dimsIn.w, dimsIn.h].slice().sort((a, b) => a - b);
  const maxSide = sorted[2], medSide = sorted[1], minSide = sorted[0];

  if (current.tier === 'smallStandard') {
    for (const th of [12, 10, 8, 6, 4, 2]) {
      if (unitOz > th && unitOz <= th + 2) {
        const saving = current.fee - feeAt(th);
        if (saving > 0.05) {
          return t('opt.reduceWeight', {
            g: Math.floor(th / Engine.OZ_PER_G), unit: th + 'oz', saving: saving.toFixed(2)
          });
        }
      }
    }
  } else if (current.tier === 'largeStandard') {
    const ss = R.sizeTiers.smallStandard;
    if (maxSide <= ss.maxLongestIn && unitOz > ss.maxUnitOz && unitOz <= ss.maxUnitOz + 8) {
      const saving = current.fee - feeAt(ss.maxUnitOz);
      if (saving > 0.10) return t('opt.toSmallStd', { saving: saving.toFixed(2) });
    }
    for (const cp of [2, 1.75, 1.5, 1.25]) {
      if (current.basisLb > cp && current.basisLb <= cp + 0.5) {
        const saving = current.fee - feeAt(cp * Engine.OZ_PER_LB);
        if (saving > 0.10) {
          return t('opt.reduceWeight', {
            g: Math.floor(cp * Engine.G_PER_LB), unit: cp + 'lb', saving: saving.toFixed(2)
          });
        }
      }
    }
  } else if (current.tier === 'smallBulky' || current.tier === 'largeBulky') {
    const ls = R.sizeTiers.largeStandard;
    if (maxSide <= ls.maxLongestIn && medSide <= ls.maxMedianIn && minSide <= ls.maxShortestIn &&
        current.basisLb > ls.maxShipLb && current.basisLb <= ls.maxShipLb + 5) {
      const target = Engine.fbaFee(ls.maxShipLb * Engine.OZ_PER_LB,
        { l: ls.maxLongestIn, w: ls.maxMedianIn, h: ls.maxShortestIn }, price, R).fee;
      const saving = current.fee - target;
      if (saving > 0.50) return t('opt.toLargeStd', { saving: saving.toFixed(2) });
    }
  }
  return null;
}

/* =========================================================================
 * 主渲染
 * =======================================================================*/
let lastResult = null;

function recalc() {
  if (State.mode === 'fbm-tw') { renderTw(); saveState(); return; }

  const price = num('sellPrice');
  const catKey = $('category').value;
  const wG = weightGrams();
  const unitOz = wG * Engine.OZ_PER_G;
  const dimsIn = dimsInches();

  /* --- 自動估算：FBA 配送費 --- */
  const fbaInfo = Engine.fbaFee(unitOz, dimsIn, price, R);
  $('fbaFee').value = fbaInfo.fee;
  const bandLabel = fbaInfo.priceBand === 'low' ? '<$' + R.fba.priceBands.lowMax
    : fbaInfo.priceBand === 'high' ? '>$' + R.fba.priceBands.highMin
    : '$' + R.fba.priceBands.lowMax + '-$' + R.fba.priceBands.highMin;
  $('fbaTierNote').textContent = t('fba.tierNote', {
    tier: t('tier.' + fbaInfo.tier), w: fbaInfo.basisLb.toFixed(2),
    base: fbaInfo.baseFee.toFixed(2), fuel: R.fuelSurcharge.pct,
    fee: fbaInfo.fee.toFixed(2), band: bandLabel
  });

  const hint = sizeOptimizationHint(unitOz, dimsIn, price, fbaInfo);
  $('fbaTierOptimize').textContent = hint || '';
  $('fbaTierOptimize').classList.toggle('js-hidden', !hint);

  /* --- 自動估算：倉儲費 / Inbound --- */
  const stor = Engine.storageFee(dimsIn, State.season, R);
  $('storageFee').value = stor.fee;
  $('storageNote').textContent = t('storage.note', {
    cuft: stor.cuft.toFixed(3), rate: stor.rate.toFixed(2), fee: stor.fee.toFixed(2)
  });
  $('inboundFee').value = Engine.inboundFee(fbaInfo.tier, R);

  /* --- 佣金 / 退款管理費 --- */
  const effPct = Engine.effectiveReferralPct(price, catKey, R);
  $('referralPct').value = effPct.toFixed(1);
  $('referralNote').textContent = L(R.categories[catKey].note);
  $('refundAdminFee').value = Engine.refundAdminFee(price, catKey, R).toFixed(2);

  /* --- 頭程明細 --- */
  const shipMethod = $('shipMethod').value;
  if (State.useShipPerPiece) {
    $('shipCalcNote').textContent = t('ship.calcNotePiece', { cost: num('shipPerPiece').toFixed(2) });
  } else {
    const kg = wG / 1000;
    $('shipCalcNote').textContent = t('ship.calcNote', {
      kg: kg.toFixed(2), rate: num('shipRate').toFixed(2), cost: (num('shipRate') * kg).toFixed(2)
    });
  }
  // SEND 是 DDP，關稅欄提示可留 0
  $('dutyDdpNote').textContent = shipMethod.startsWith('send-') ? t('ship.dutyIncluded') : '';

  /* --- 計算 --- */
  const input = collectInput();
  const r = Engine.computeAll(input, R);
  lastResult = { input, r, fbaInfo, stor, catKey };

  renderResults(r);
  renderPromoPanel(r);
  renderAdvice(r, catKey);
  renderBreakdown(r);
  saveState();
}

function renderResults(r) {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  set('r-price', fmt(r.price));
  set('r-cogs', '-' + fmt(r.cogs));
  set('r-account', '-' + fmt(r.accountPerUnit));
  set('r-ref-pct', r.effReferralPct.toFixed(1));
  set('r-referral', '-' + fmt(r.referralCost + r.extraPerItem));
  set('r-ship', '-' + fmt(r.shipCost));
  set('r-fba', '-' + fmt(r.fbaFee));
  set('r-storage', '-' + fmt(r.storageTotal));
  set('r-storage-months', num('storageMonths'));
  set('r-inbound', '-' + fmt(r.inboundFee));
  set('r-fbm-ship', '-' + fmt(r.fbmShip));
  set('r-fbm-duty', '-' + fmt(r.fbmDuty));
  set('r-fbm-pack', '-' + fmt(r.fbmPack));
  set('r-fbm-cs', '-' + fmt(r.fbmCs));
  set('r-tacos-pct', num('tacos'));
  set('r-ads', '-' + fmt(r.adsCost));
  set('r-vine', '-' + fmt(r.vineFee));
  set('r-ret-pct', num('returnRate'));
  set('r-return', '-' + fmt(r.returnCost));
  set('r-refund-admin', '-' + fmt(r.refundAdmin));
  set('r-duty', '-' + fmt(r.importDuty));
  set('r-other', '-' + fmt(r.otherFee));

  // 百分比
  const P = (id, v) => set(id, pctOf(v, r.price));
  P('r-cogs-pct', r.cogs); P('r-ship-pct', r.shipCost); P('r-fba-pct', r.fbaFee);
  P('r-storage-pct', r.storageTotal); P('r-inbound-pct', r.inboundFee);
  P('r-fbm-ship-pct', r.fbmShip); P('r-fbm-duty-pct', r.fbmDuty);
  P('r-fbm-pack-pct', r.fbmPack); P('r-fbm-cs-pct', r.fbmCs);
  P('r-referral-cost-pct', r.referralCost + r.extraPerItem);
  P('r-account-pct', r.accountPerUnit); P('r-ads-pct', r.adsCost); P('r-vine-pct', r.vineFee);
  P('r-return-cost-pct', r.returnCost); P('r-refund-admin-pct', r.refundAdmin);
  P('r-duty-pct', r.importDuty); P('r-other-pct', r.otherFee);

  // 品牌退傭
  const rebateRow = $('r-brand-rebate-row');
  const showRebate = r.brandRebate > 0.001;
  rebateRow.classList.toggle('js-hidden', !showRebate);
  if (showRebate) {
    set('r-rebate-pct', num('brandRebatePct'));
    set('r-brand-rebate', '+' + fmt(r.brandRebate));
  }

  // 優惠折抵
  const promoRow = $('r-promo-row');
  const showPromo = r.promo.perUnit > 0.001;
  promoRow.classList.toggle('js-hidden', !showPromo);
  if (showPromo) set('r-promo', '+' + fmt(r.promo.perUnit));

  const profitEl = $('r-profit');
  profitEl.textContent = fmt(r.profit);
  profitEl.className = 'big-number ' +
    (r.margin >= 20 ? 'profit-positive' : r.margin >= 10 ? 'profit-warning' : 'profit-negative');
  set('r-margin', r.margin.toFixed(1) + '%');
  set('r-total-cost', fmt(r.totalCost));
  set('r-roi', r.totalCost > 0 ? r.roi.toFixed(1) + '%' : '—');
  set('r-m-rev', fmtK(r.monthlyRevenue));
  set('r-m-profit', fmtK(r.monthlyProfit));
}

function renderPromoPanel(r) {
  const summary = $('savingsSummary');
  if (!r.promo.details.length) { summary.classList.add('js-hidden'); return; }
  summary.classList.remove('js-hidden');

  $('savingsDetail').innerHTML = r.promo.details.map(d =>
    `<div class="savings-row${d.oneTime ? ' one-time' : ''}"><span>${esc(t(d.key))}${d.oneTime ? ' ★' : ''}</span><span class="sv">+${fmt(d.value)}</span></div>`
  ).join('') +
  `<div class="savings-row" style="border-top:1px solid #10b981;margin-top:0.3rem;padding-top:0.3rem;font-weight:600;"><span>${esc(t('sv.total'))}</span><span class="sv">+${fmt(r.promo.perUnit)}</span></div>`;

  $('savingsNote').innerHTML = r.promo.oneTime > 0
    ? t('sv.note', { m: r.promo.months, n: r.promo.perMonth })
    : '';
}

function renderAdvice(r, catKey) {
  const tips = [];
  const mode = State.mode;

  if (mode === 'fbm') {
    const total = r.fbmShip + r.fbmDuty + r.fbmPack + r.fbmCs;
    const pct = r.price > 0 ? total / r.price * 100 : 0;
    if (pct > 50) tips.push(['red', t('adv.fbmHigh', { pct: pct.toFixed(1) })]);
    else if (pct > 30) tips.push(['yellow', t('adv.fbmMid', { pct: pct.toFixed(1) })]);
    else tips.push(['green', t('adv.fbmLow', { pct: pct.toFixed(1) })]);
  }

  if (mode === 'basic' || mode === 'advanced') {
    const log = r.shipCost + r.fbaFee + r.storageTotal + r.inboundFee;
    const pct = r.price > 0 ? log / r.price * 100 : 0;
    if (pct > 40) tips.push(['yellow', t('adv.logHigh', { pct: pct.toFixed(1) })]);
  }

  if (r.margin < 0) tips.push(['red', t('adv.marginNeg')]);
  else if (r.margin < 10) tips.push(['red', t('adv.marginLow', { pct: r.margin.toFixed(1) })]);
  else if (r.margin < 20) tips.push(['yellow', t(mode === 'basic' ? 'adv.marginMidBasic' : 'adv.marginMidAdv', { pct: r.margin.toFixed(1) })]);
  else if (r.margin >= 30) tips.push(['green', t('adv.marginGood', { pct: r.margin.toFixed(1) })]);

  if (r.effReferralPct >= 17) {
    tips.push(['yellow', t('adv.refHigh', {
      pct: r.effReferralPct.toFixed(0), cat: L(R.categories[catKey].label)
    })]);
  }

  // 一次性優惠額度警示 — 原版把它算成永久成本下降，這裡明確拆開
  if (r.promo.oneTime > 0.005) {
    tips.push(['yellow', t('adv.promoNote', {
      amt: r.promo.oneTime.toFixed(2), pct: r.marginExOneTime.toFixed(1)
    })]);
  }

  if (mode === 'basic' && r.margin > 0) tips.push(['blue', t('adv.basicNote')]);

  const insight = INSIGHTS[catKey] ? L(INSIGHTS[catKey]) : null;
  let html = '';
  if (tips.length) {
    html += `<div class="advice-heading">${esc(t('adv.tipsHeading'))}</div>`;
    html += tips.map(([type, text]) => `<div class="advice-box ${type}">${text}</div>`).join('');
  }
  if (insight) {
    html += `<div class="advice-heading" style="margin-top:0.6rem;">${esc(t('adv.insightHeading'))}</div>`;
    html += `<div class="advice-box purple">${insight}</div>`;
    html += `<div style="margin-top:0.3rem;font-size:0.68rem;"><a href="https://gs.amazon.com.tw/category" target="_blank" rel="noopener" style="color:var(--accent);">${esc(t('adv.insightLink'))}</a></div>`;
  }
  $('optimAdvice').innerHTML = html;
}

function breakdownItems(r) {
  const isFbm = State.mode === 'fbm';
  const items = [
    { k: 'bd.cogs', v: r.cogs, c: '#6366f1' }
  ];
  if (isFbm) {
    items.push(
      { k: 'bd.fbmShip', v: r.fbmShip, c: '#8b5cf6' },
      { k: 'bd.duty', v: r.fbmDuty, c: '#a855f7' },
      { k: 'bd.pack', v: r.fbmPack, c: '#ec4899' },
      { k: 'bd.cs', v: r.fbmCs, c: '#f43f5e' }
    );
  } else {
    items.push(
      { k: 'bd.ship', v: r.shipCost, c: '#8b5cf6' },
      { k: 'FBA', v: r.fbaFee, c: '#ec4899', raw: true },
      { k: 'bd.storage', v: r.storageTotal, c: '#f43f5e' },
      { k: 'Inbound', v: r.inboundFee, c: '#a855f7', raw: true }
    );
  }
  items.push(
    { k: 'bd.referral', v: Math.max(0, r.referralCost + r.extraPerItem - r.brandRebate), c: '#f59e0b' },
    { k: 'bd.ads', v: r.adsCost, c: '#10b981' },
    { k: 'Vine', v: r.vineFee, c: '#059669', raw: true },
    { k: 'bd.account', v: r.accountPerUnit, c: '#d97706' },
    { k: 'bd.returns', v: r.returnCost + r.refundAdmin, c: '#6b7280' },
    { k: 'bd.duty', v: isFbm ? 0 : r.importDuty, c: '#78716c' },
    { k: 'bd.other', v: r.otherFee, c: '#94a3b8' },
    { k: 'bd.profit', v: Math.max(0, r.profit), c: '#22c55e' }
  );
  return items.filter(i => i.v > 0.0001).map(i => ({ ...i, label: i.raw ? i.k : t(i.k) }));
}

function renderBreakdown(r) {
  const items = breakdownItems(r);
  const total = items.reduce((s, i) => s + i.v, 0);
  $('costBar').innerHTML = items.map(i => {
    const pct = total > 0 ? i.v / total * 100 : 0;
    return `<div style="width:${pct}%;background:${i.c}" title="${esc(i.label)}: ${fmt(i.v)} (${pct.toFixed(1)}%)"></div>`;
  }).join('');
  $('costLegend').innerHTML = items.map(i => {
    const pct = total > 0 ? i.v / total * 100 : 0;
    return `<span class="legend-item"><span class="legend-dot" style="background:${i.c}"></span>${esc(i.label)} ${pct.toFixed(1)}%</span>`;
  }).join('');
}

/* =========================================================================
 * 台灣電商 → 美國
 * =======================================================================*/
function renderTw() {
  const input = {
    twPrice: num('twPrice'),
    twCost: num('twCost'),
    exRate: num('twExRate'),
    category: $('twCategory').value,
    monthlySales: num('twMonthlySales'),
    weightG: num('twWeight'),
    dimsCm: { l: num('twDimL'), w: num('twDimW'), h: num('twDimH') },
    method: $('twFbmMethod').value,
    origin: State.origin
  };
  const w = Engine.computeTw(input, R);

  $('twWeightNote').textContent = t('tw.weightNote', {
    actual: w.actualKg.toFixed(2), vol: w.volKg.toFixed(2), billable: w.billableKg.toFixed(2)
  });

  const set = (id, v) => { $(id).textContent = v; };
  set('tw-r-twprice', fmtTwd(input.twPrice));
  set('tw-r-usdprice', fmt(w.usdPrice));
  set('tw-r-cogs', '-' + fmt(w.cogsUsd));
  set('tw-r-referral', '-' + fmt(w.referral));
  set('tw-r-account', '-' + fmt(w.accountPerUnit));
  set('tw-r-ship', '-' + fmt(w.shipCost));
  set('tw-r-duty', '-' + fmt(w.duty));
  set('tw-r-misc', '-' + fmt(w.misc));
  set('tw-r-extra-total', '-' + fmt(w.extraTotal));
  set('tw-r-extra-pct', w.usdPrice > 0 ? w.extraPct.toFixed(1) + '%' : '—');
  set('tw-r-profit', fmt(w.profit));
  set('tw-r-profit-twd', fmtTwd(w.profit * input.exRate));
  set('tw-r-margin', w.usdPrice > 0 ? w.margin.toFixed(1) + '%' : '—');
  set('tw-r-tw-margin', w.twMargin.toFixed(1) + '%');
  set('tw-r-suggested', w.suggested ? fmt(w.suggested) : '—');

  $('twSuggestNote').innerHTML = w.suggested
    ? t('tw.suggest.ok', { pct: w.refPct.toFixed(1), margin: w.twMargin.toFixed(1) })
    : t('tw.suggest.impossible', { margin: w.twMargin.toFixed(1), pct: w.refPct.toFixed(1) });

  const adv = $('twFbmAdvice');
  adv.className = 'advice-box ' + (w.shipPct > 50 ? 'red' : w.shipPct > 30 ? 'yellow' : 'green');
  adv.innerHTML = t(w.shipPct > 50 ? 'adv.twHigh' : w.shipPct > 30 ? 'adv.twMid' : 'adv.twLow',
    { pct: w.shipPct.toFixed(1) });

  lastResult = { twInput: input, tw: w };
}

/* =========================================================================
 * 存檔 / 分享 / 匯出
 * =======================================================================*/
function snapshot() {
  const s = {};
  STATE_KEYS.forEach(k => { s[k] = State[k]; });
  FIELD_IDS.forEach(id => { const el = $(id); if (el) s[id] = el.value; });
  CHECK_IDS.forEach(id => { const el = $(id); if (el) s[id] = el.checked ? 1 : 0; });
  return s;
}

let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot())); } catch (e) { /* 無痕模式等情況，忽略 */ }
  }, 250);
}

function restore(s) {
  if (!s) return false;
  // 先套用 State（會影響單位換算與選單內容）
  STATE_KEYS.forEach(k => {
    if (s[k] === undefined) return;
    State[k] = (k === 'useShipPerPiece') ? (s[k] === true || s[k] === 'true') : s[k];
  });

  // 語言／出貨地會改變選單內容，先重建
  document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.remove('active'));
  $('btn-lang-' + State.lang).classList.add('active');
  document.querySelectorAll('.origin-bar button').forEach(b => b.classList.remove('active'));
  $('btn-origin-' + State.origin).classList.add('active');
  applyI18n();

  FIELD_IDS.forEach(id => {
    if (s[id] === undefined) return;
    const el = $(id);
    if (!el) return;
    if (el.tagName === 'SELECT') {
      if (el.querySelector(`option[value="${String(s[id]).replace(/"/g, '')}"]`)) el.value = s[id];
    } else {
      el.value = s[id];
    }
  });
  CHECK_IDS.forEach(id => { if (s[id] !== undefined && $(id)) $(id).checked = (s[id] === 1 || s[id] === '1' || s[id] === true); });

  // 同步各 toggle 的視覺狀態
  $('weightUnitLabel').textContent = State.weightUnit;
  document.querySelectorAll('[id^="btn-wt-"]').forEach(b => b.classList.remove('active'));
  $('btn-wt-' + State.weightUnit).classList.add('active');
  $('dimUnitLabel').textContent = State.dimUnit;
  document.querySelectorAll('[id^="btn-dim-"]').forEach(b => b.classList.remove('active'));
  $('btn-dim-' + State.dimUnit).classList.add('active');
  $('btn-offpeak').classList.toggle('active', State.season === 'offpeak');
  $('btn-peak').classList.toggle('active', State.season === 'peak');
  document.querySelectorAll('[id^="btn-rebate-"]').forEach(b => b.classList.remove('active'));
  $('btn-rebate-' + State.rebateLevel).classList.add('active');
  setShipMode(State.useShipPerPiece ? 'piece' : 'rate');
  setMode(State.mode);
  onShipMethodChange();
  return true;
}

function loadFromUrl() {
  const h = location.hash.replace(/^#/, '');
  if (!h) return null;
  const p = new URLSearchParams(h);
  if (![...p.keys()].length) return null;
  const s = {};
  p.forEach((v, k) => { s[k] = v; });
  return s;
}

function buildShareUrl() {
  const s = snapshot();
  const p = new URLSearchParams();
  Object.keys(s).forEach(k => p.set(k, s[k]));
  return location.origin + location.pathname + '#' + p.toString();
}

async function doShare() {
  const url = buildShareUrl();
  history.replaceState(null, '', '#' + url.split('#')[1]);
  try {
    await navigator.clipboard.writeText(url);
    toast(t('toast.shared'));
  } catch (e) {
    toast(t('toast.sharedFail'));
  }
}

function doCsv() {
  const rows = [];
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;

  if (State.mode === 'fbm-tw' && lastResult && lastResult.tw) {
    const w = lastResult.tw, i = lastResult.twInput;
    rows.push([t('csv.header.item'), t('csv.header.value'), t('csv.header.pct')]);
    const add = (label, v) => rows.push([label, v.toFixed(2), pctOf(Math.abs(v), w.usdPrice)]);
    rows.push([t('tw.res.twPrice'), i.twPrice.toFixed(0), '']);
    add(t('tw.res.usdPrice'), w.usdPrice);
    add(t('tw.res.cogs'), -w.cogsUsd);
    add(t('tw.res.referral'), -w.referral);
    add(t('tw.res.account'), -w.accountPerUnit);
    add(t('tw.res.ship'), -w.shipCost);
    add(t('tw.res.duty'), -w.duty);
    add(t('tw.res.misc'), -w.misc);
    add(t('tw.res.profitUsd'), w.profit);
    rows.push([t('tw.res.margin'), w.margin.toFixed(1) + '%', '']);
    rows.push([t('tw.res.suggested'), w.suggested ? w.suggested.toFixed(2) : '', '']);
  } else if (lastResult && lastResult.r) {
    const r = lastResult.r;
    rows.push([t('csv.header.item'), t('csv.header.value'), t('csv.header.pct')]);
    const add = (label, v) => rows.push([label, v.toFixed(2), pctOf(Math.abs(v), r.price)]);
    add(t('r.price'), r.price);
    add(t('r.cogs'), -r.cogs);
    if (State.mode === 'fbm') {
      add(t('r.fbmShip'), -r.fbmShip); add(t('r.duty'), -r.fbmDuty);
      add(t('r.fbmPack'), -r.fbmPack); add(t('r.fbmCs'), -r.fbmCs);
    } else {
      add(t('r.ship'), -r.shipCost); add(t('r.fba'), -r.fbaFee);
      add(t('r.storage'), -r.storageTotal); add('Inbound Placement', -r.inboundFee);
    }
    add(t('r.referral'), -(r.referralCost + r.extraPerItem));
    if (r.brandRebate > 0) add(t('r.brandRebate'), r.brandRebate);
    if (State.mode === 'advanced') {
      add(t('r.account'), -r.accountPerUnit); add(t('r.ads'), -r.adsCost);
      add(t('r.vine'), -r.vineFee); add(t('r.return'), -r.returnCost);
      add(t('r.refundAdmin'), -r.refundAdmin); add(t('r.duty'), -r.importDuty);
      add(t('r.other'), -r.otherFee);
      if (r.promo.perUnit > 0) add(t('r.promo'), r.promo.perUnit);
    }
    add(t('r.totalCost'), -r.totalCost);
    add(t('r.netProfit'), r.profit);
    rows.push([t('r.margin'), r.margin.toFixed(1) + '%', '']);
    rows.push(['ROI', r.roi.toFixed(1) + '%', '']);
    rows.push([t('r.mRev'), r.monthlyRevenue.toFixed(0), '']);
    rows.push([t('r.mProfit'), r.monthlyProfit.toFixed(0), '']);
    if (r.promo.oneTime > 0) {
      rows.push([]);
      rows.push([t('sv.total') + ' (' + t('r.promo') + ')', r.promo.perUnit.toFixed(2), '']);
      rows.push([t('r.margin') + ' (ex one-time)', r.marginExOneTime.toFixed(1) + '%', '']);
    }
  } else {
    return;
  }

  rows.push([]);
  rows.push(['rates.js', R.meta.version, R.meta.lastUpdated]);

  // ﻿ BOM 讓 Excel 正確認出 UTF-8
  const csv = '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `amazon-cost-${State.mode}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(t('toast.csv'));
}

function doReset() {
  try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
  location.hash = '';
  location.reload();
}

/* =========================================================================
 * 事件綁定 / 啟動
 * =======================================================================*/
function clampInput(el) {
  const min = el.getAttribute('min'), max = el.getAttribute('max');
  const v = parseFloat(el.value);
  let bad = false;
  if (el.value !== '' && Number.isFinite(v)) {
    if (min !== null && v < parseFloat(min)) bad = true;
    if (max !== null && v > parseFloat(max)) bad = true;
  }
  el.classList.toggle('out-of-range', bad);
}

function bind() {
  $('btn-lang-zh').onclick = () => setLang('zh');
  $('btn-lang-en').onclick = () => setLang('en');
  $('btn-origin-tw').onclick = () => setOrigin('tw');
  $('btn-origin-cn').onclick = () => setOrigin('cn');
  ['basic', 'advanced', 'fbm', 'fbm-tw'].forEach(m => { $('btn-mode-' + m).onclick = () => setMode(m); });
  ['g', 'kg', 'lb'].forEach(u => { $('btn-wt-' + u).onclick = () => setWeightUnit(u); });
  ['cm', 'in'].forEach(u => { $('btn-dim-' + u).onclick = () => setDimUnit(u); });
  $('btn-offpeak').onclick = () => setSeason('offpeak');
  $('btn-peak').onclick = () => setSeason('peak');
  ['off', '10', '5'].forEach(l => { $('btn-rebate-' + l).onclick = () => setBrandRebate(l); });
  $('btn-shipmode-rate').onclick = () => setShipMode('rate');
  $('btn-shipmode-piece').onclick = () => setShipMode('piece');
  $('shipMethod').onchange = onShipMethodChange;
  $('fbmMethod').onchange = onFbmMethodChange;

  $('btn-share').onclick = doShare;
  $('btn-csv').onclick = doCsv;
  $('btn-print').onclick = () => window.print();
  $('btn-reset').onclick = doReset;

  // 所有數值 / 下拉變動都重算
  FIELD_IDS.forEach(id => {
    const el = $(id);
    if (!el) return;
    const ev = el.tagName === 'SELECT' ? 'change' : 'input';
    if (id === 'shipMethod' || id === 'fbmMethod') return;   // 已單獨綁
    el.addEventListener(ev, () => { if (el.tagName !== 'SELECT') clampInput(el); recalc(); });
  });
  CHECK_IDS.forEach(id => { const el = $(id); if (el) el.addEventListener('change', recalc); });

  // 重量改變時，SEND 費率依級距會變 → 重新套費率
  $('weightInput').addEventListener('input', () => {
    if ($('shipMethod').value.startsWith('send-')) onShipMethodChange();
  });

  // tooltip：桌機 hover 由 CSS 處理，這裡負責點擊 / 鍵盤
  document.addEventListener('click', (e) => {
    const tip = e.target.closest('.tip');
    document.querySelectorAll('.tip.open').forEach(el => { if (el !== tip) el.classList.remove('open'); });
    if (tip) {
      tip.classList.toggle('open');
      // 靠右邊時翻轉，避免溢出
      const rect = tip.getBoundingClientRect();
      tip.classList.toggle('flip-left', rect.left > window.innerWidth - 200);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.tip.open').forEach(el => el.classList.remove('open'));
  });
}

function init() {
  applyI18n();
  bind();

  const fromUrl = loadFromUrl();
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { stored = null; }

  // 預設值來自 rates.js（匯率、月銷量），沒有存檔時套用
  if (!fromUrl && !stored) {
    $('twExRate').value = R.twMode.defaultExchangeRate;
    $('twMonthlySales').value = R.twMode.defaultMonthlySales;
    $('monthlySales').value = R.twMode.defaultMonthlySales;
  }

  // URL 優先於 localStorage（分享連結要能覆蓋收件人自己的存檔）
  if (!restore(fromUrl || stored)) {
    setShipMode('rate');
    setMode('basic');
    onShipMethodChange();
  }
  recalc();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

})();
