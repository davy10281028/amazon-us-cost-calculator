/* =============================================================================
 * rates.js — Amazon 美國站成本計算機：全部費率資料
 * =============================================================================
 *
 *  ▸ 這是唯一需要定期更新的檔案。index.html 不含任何硬編碼費率。
 *  ▸ 每一組資料都帶 _source（官方頁面 URL）和 _verified（人工核對日期）。
 *  ▸ 改完記得同步更新最上面的 meta.version / meta.lastUpdated / meta.nextReviewDue。
 *  ▸ 更新流程與逐項對照清單：見 docs/UPDATING-RATES.md
 *
 *  用 <script src="rates.js"> 載入（不是 fetch），所以 file:// 直接開也能跑，
 *  不需要起 local server、不會有 CORS 問題。
 * ===========================================================================*/

window.AMZ_RATES = {

  /* ---------------------------------------------------------------------------
   * META — UI 右上角的「費率版本」徽章會讀這裡
   * -------------------------------------------------------------------------*/
  meta: {
    version: '2026.04',           // 費率基準期（不是程式版本）
    lastUpdated: '2026-04-22',    // 這批費率最後一次人工核對的日期
    nextReviewDue: '2026-10-01',  // 下次該複查的日期；過期 UI 會轉紅色警示
    staleAfterDays: 120,          // 超過這個天數沒更新就顯示警示
    note: {
      zh: '費率沿用 2026-04 官方擷取版本，尚未針對 2026 下半年重新核對。',
      en: 'Rates carried over from the 2026-04 official capture; not yet re-verified for H2 2026.'
    }
  },

  /* ---------------------------------------------------------------------------
   * 帳戶月費
   * -------------------------------------------------------------------------*/
  accountFee: {
    professional: 39.99,
    _source: 'https://gs.amazon.com.tw/pricing',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * FBA 燃油附加費 — 2026/4/17 起加收，套用在 FBA 配送費上
   * -------------------------------------------------------------------------*/
  fuelSurcharge: {
    pct: 3.5,
    effectiveFrom: '2026-04-17',
    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * 品類銷售佣金 (Referral Fee)
   *   pct         : 標準費率 (%)
   *   tiered      : 是否階梯費率
   *   threshold   : 階梯門檻 (USD)
   *   lowPct      : 較低的那一段費率 (%)
   *   above       : true  → 門檻「以上」的部分才降到 lowPct（家具、珠寶）
   *                 false → 門檻「以下」整筆用 lowPct（美妝、嬰兒）
   *   extraPerItem: 每件額外固定手續費 (USD)，如書籍
   * -------------------------------------------------------------------------*/
  categories: {
    home:        { pct: 15, tiered: false, label: { zh: 'Home & Kitchen 居家生活',            en: 'Home & Kitchen' },        note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    sports:      { pct: 15, tiered: false, label: { zh: 'Sports & Outdoors 運動戶外',          en: 'Sports & Outdoors' },     note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    toys:        { pct: 15, tiered: false, label: { zh: 'Toys & Games 玩具',                  en: 'Toys & Games' },          note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    pet:         { pct: 15, tiered: false, label: { zh: 'Pet Supplies 寵物用品',              en: 'Pet Supplies' },          note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    health:      { pct: 15, tiered: false, label: { zh: 'Health & Household 健康家用',        en: 'Health & Household' },    note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    office:      { pct: 15, tiered: false, label: { zh: 'Office Products 辦公用品',           en: 'Office Products' },       note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    lawn:        { pct: 15, tiered: false, label: { zh: 'Lawn & Garden 庭院園藝',             en: 'Lawn & Garden' },         note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    beauty:      { pct: 15, tiered: true, threshold: 10,  lowPct: 8,  above: false,
                                          label: { zh: 'Beauty & Personal Care 美妝個護',     en: 'Beauty & Personal Care' }, note: { zh: '≤$10 收 8%，>$10 收 15%',      en: '8% if ≤$10, else 15%' } },
    baby:        { pct: 15, tiered: true, threshold: 10,  lowPct: 8,  above: false,
                                          label: { zh: 'Baby Products 嬰兒用品',              en: 'Baby Products' },         note: { zh: '≤$10 收 8%，>$10 收 15%',      en: '8% if ≤$10, else 15%' } },
    clothing:    { pct: 17, tiered: false, label: { zh: 'Clothing & Accessories 服飾',        en: 'Clothing & Accessories' }, note: { zh: '固定 17%（退貨率高，注意）',    en: 'Flat 17% (high return rate)' } },
    electronics: { pct: 8,  tiered: false, label: { zh: 'Electronics 電子產品',               en: 'Electronics' },           note: { zh: '固定 8%（最低標準費率）',       en: 'Flat 8% (lowest standard rate)' } },
    camera:      { pct: 8,  tiered: false, label: { zh: 'Camera & Photo 相機攝影',            en: 'Camera & Photo' },        note: { zh: '固定 8%',                       en: 'Flat 8%' } },
    auto:        { pct: 12, tiered: false, label: { zh: 'Automotive 汽車用品',                en: 'Automotive' },            note: { zh: '固定 12%',                      en: 'Flat 12%' } },
    furniture:   { pct: 15, tiered: true, threshold: 200, lowPct: 10, above: true,
                                          label: { zh: 'Furniture 家具',                      en: 'Furniture' },             note: { zh: '≤$200 收 15%，超過部分收 10%',  en: '15% up to $200, 10% above' } },
    jewelry:     { pct: 20, tiered: true, threshold: 250, lowPct: 5,  above: true,
                                          label: { zh: 'Jewelry 珠寶首飾',                    en: 'Jewelry' },               note: { zh: '≤$250 收 20%，超過部分收 5%',   en: '20% up to $250, 5% above' } },
    videogames:  { pct: 15, tiered: false, label: { zh: 'Video Games 電玩遊戲',               en: 'Video Games' },           note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    musical:     { pct: 15, tiered: false, label: { zh: 'Musical Instruments 樂器',           en: 'Musical Instruments' },   note: { zh: '固定 15%',                      en: 'Flat 15%' } },
    books:       { pct: 15, tiered: false, extraPerItem: 1.80,
                                          label: { zh: 'Books 書籍',                          en: 'Books' },                 note: { zh: '固定 15% + $1.80 交易手續費',   en: 'Flat 15% + $1.80 closing fee' } },
    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/GTG4BAWSY39Z98EN',
    _source2: 'https://gs.amazon.com.tw/pricing',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * 退款管理費 = min(佣金 × pct, cap)
   * -------------------------------------------------------------------------*/
  refundAdmin: {
    pct: 20,
    cap: 5.00,
    _source: 'https://gs.amazon.com.tw/pricing',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * FBA 尺寸分級 (Product Size Tiers) — 單位：英吋 / 磅 / 盎司
   * -------------------------------------------------------------------------*/
  sizeTiers: {
    dimWeightDivisor: 139,   // 體積重 = L×W×H / 139 (立方英吋 → 磅)
    dimWeightMinSideIn: 2,   // Large Standard 以上，寬高低於 2 吋以 2 吋計
    smallStandard: { maxLongestIn: 15, maxMedianIn: 12, maxShortestIn: 0.75, maxUnitOz: 16 },
    largeStandard: { maxLongestIn: 18, maxMedianIn: 14, maxShortestIn: 8,    maxShipLb: 20 },
    smallBulky:    { maxLongestIn: 26, maxMedianIn: 18, maxShortestIn: 14 },
    bulky:         { maxLongestIn: 59, maxLengthGirthIn: 130, maxShipLb: 50 },
    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * FBA 配送費 (Fulfillment Fee) — 非服裝、非旺季
   *
   *   費率依「售價」分三個 band：
   *     low  = 售價 < $10
   *     mid  = 售價 $10–$50
   *     high = 售價 > $50
   *
   *   Small Standard 依「實際重量 (oz)」查表。
   *   Large Standard 以上依「計費重量 = max(實際重量, 體積重)」查表。
   *   Extra Large 150 lb 以上回頭用「實際重量」。
   *
   *   ⚠️ 已知待複查項目（見 docs/UPDATING-RATES.md）：
   *      bulky.small 的 high band ($7.55) 低於 mid band ($9.61)，
   *      這在官方費率表上不合直覺，下次更新請優先對照。
   * -------------------------------------------------------------------------*/
  fba: {
    priceBands: { lowMax: 10, highMin: 50 },

    smallStandard: {
      basis: 'unitWeight',
      bands: [
        { maxOz: 2,  low: 2.29, mid: 3.06, high: 3.32 },
        { maxOz: 4,  low: 2.38, mid: 3.15, high: 3.42 },
        { maxOz: 6,  low: 2.47, mid: 3.24, high: 3.45 },
        { maxOz: 8,  low: 2.56, mid: 3.33, high: 3.54 },
        { maxOz: 10, low: 2.66, mid: 3.43, high: 3.68 },
        { maxOz: 12, low: 2.76, mid: 3.53, high: 3.78 },
        { maxOz: 14, low: 2.83, mid: 3.60, high: 3.91 },
        { maxOz: 16, low: 2.88, mid: 3.65, high: 3.96 }
      ]
    },

    largeStandard: {
      basis: 'shipWeight',
      bands: [
        { maxLb: 0.25, low: 2.91, mid: 3.68, high: 3.73 },   //  4 oz
        { maxLb: 0.50, low: 3.13, mid: 3.90, high: 3.95 },   //  8 oz
        { maxLb: 0.75, low: 3.38, mid: 4.15, high: 4.20 },   // 12 oz
        { maxLb: 1.00, low: 3.78, mid: 4.55, high: 4.60 },   // 16 oz
        { maxLb: 1.25, low: 4.22, mid: 4.99, high: 5.04 },
        { maxLb: 1.50, low: 4.60, mid: 5.37, high: 5.42 },
        { maxLb: 1.75, low: 4.75, mid: 5.52, high: 5.57 },
        { maxLb: 2.00, low: 5.00, mid: 5.77, high: 5.82 },
        { maxLb: 2.25, low: 5.10, mid: 5.87, high: 5.92 },
        { maxLb: 2.50, low: 5.28, mid: 6.05, high: 6.10 },
        { maxLb: 2.75, low: 5.44, mid: 6.21, high: 6.26 },
        { maxLb: 3.00, low: 5.85, mid: 6.62, high: 6.67 }
      ],
      // 3 lb 以上：base + 每滿 4 oz 加 $0.08
      over: { fromLb: 3, base: { low: 6.15, mid: 6.92, high: 6.97 }, perIntervalUsd: 0.08, intervalOz: 4 }
    },

    bulky: {
      basis: 'shipWeight',
      small: { base: { low: 9.61, mid: 9.61, high: 7.55 }, freeLb: 1, perLbUsd: 0.38 },
      large: { base: { low: 9.61, mid: 9.61, high: 9.35 }, freeLb: 1, perLbUsd: 0.38 }
    },

    extraLarge: {
      basis: 'shipWeight',
      bands: [
        { maxLb: 50,       base: 26.33,  freeLb: 1,   perLbUsd: 0.38 },
        { maxLb: 70,       base: 40.12,  freeLb: 51,  perLbUsd: 0.75 },
        { maxLb: 150,      base: 54.81,  freeLb: 71,  perLbUsd: 0.75 },
        { maxLb: Infinity, base: 194.95, freeLb: 151, perLbUsd: 0.19, basis: 'unitWeight' }
      ]
    },

    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * FBA 月倉儲費 (USD / 立方英尺 / 月)
   * -------------------------------------------------------------------------*/
  storage: {
    offpeak: 0.78,   // 1–9 月
    peak: 2.40,      // 10–12 月
    cubicInchesPerCuFt: 1728,
    agedSurchargeFromDays: 181,
    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/G200612770',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * Inbound Placement Service 費 (每件，依 size tier)
   * -------------------------------------------------------------------------*/
  inboundPlacement: {
    smallStandard: 0.15,
    largeStandard: 0.27,
    smallBulky: 0.79,
    largeBulky: 0.79,
    extraLarge: 1.58,
    _source: 'https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8SQ2DEN',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * 頭程運費 — 一般貨代行情 (USD/kg，不含美國進口關稅)
   *   依出貨地 (tw / cn) 分開；hint 是顯示在輸入框下方的參考文字。
   * -------------------------------------------------------------------------*/
  freight: {
    tw: {
      sea:     { rate: 1.0, label: { zh: '海運 (~$0.8-1.5/kg，30-45天)', en: 'Sea freight (~$0.8-1.5/kg, 30-45d)' } },
      air:     { rate: 4.5, label: { zh: '空運 (~$3-6/kg，7-10天)',      en: 'Air freight (~$3-6/kg, 7-10d)' } },
      express: { rate: 8.0, label: { zh: '快遞 (~$6-10/kg，3-5天)',      en: 'Courier (~$6-10/kg, 3-5d)' } },
      hint: {
        zh: '費率為台灣→美國 FBA 倉庫的每公斤費用（含報關手續費、派送）。<br>海運：整櫃 FCL 約 $0.5-0.8/kg，散貨 LCL 約 $1.0-1.5/kg。<br>空運：一般空運 $3-5/kg，快遞 DDP $6-10/kg。',
        en: 'Per-kg rate for Taiwan → US FBA warehouse (incl. customs clearance & delivery).<br>Sea: FCL ~$0.5-0.8/kg, LCL ~$1.0-1.5/kg.<br>Air: ~$3-5/kg, courier DDP $6-10/kg.'
      }
    },
    cn: {
      sea:     { rate: 0.7, label: { zh: '海運 (~$0.5-1.2/kg，25-40天)', en: 'Sea freight (~$0.5-1.2/kg, 25-40d)' } },
      air:     { rate: 3.5, label: { zh: '空運 (~$2.5-5/kg，7-10天)',    en: 'Air freight (~$2.5-5/kg, 7-10d)' } },
      express: { rate: 6.0, label: { zh: '快遞 (~$5-8/kg，3-5天)',       en: 'Courier (~$5-8/kg, 3-5d)' } },
      hint: {
        zh: '費率為中國→美國 FBA 倉庫的每公斤費用（含報關手續費、派送）。<br>海運：整櫃 FCL 約 $0.3-0.6/kg，散貨 LCL 約 $0.7-1.2/kg。<br>空運：$2.5-4/kg，快遞 DDP $5-8/kg。',
        en: 'Per-kg rate for China → US FBA warehouse (incl. customs clearance & delivery).<br>Sea: FCL ~$0.3-0.6/kg, LCL ~$0.7-1.2/kg.<br>Air: $2.5-4/kg, courier DDP $5-8/kg.'
      }
    },
    _note: {
      zh: '⚠️ 一般貨代費率<b>不含</b>美國進口關稅，關稅需在「營運成本」區塊另外估算。實際費率請向 <a href="https://gs.amazon.com.tw/service-provider" target="_blank" rel="noopener">Amazon 認證第三方服務商</a> 取得報價。',
      en: '⚠️ Standard forwarder rates <b>exclude</b> US import duty — estimate it separately under Operating Costs. Get quotes from <a href="https://gs.amazon.com.tw/service-provider" target="_blank" rel="noopener">Amazon certified service providers</a>.'
    },
    _verified: '2025-Q4 市場行情估算（非官方固定費率）'
  },

  /* ---------------------------------------------------------------------------
   * Amazon SEND 頭程 — 官方跨境物流，DDP 含關稅到門，僅台灣出貨
   *   費率依重量級距 (USD/kg)。海運實際按 CBM 計費，這裡給每公斤近似值。
   * -------------------------------------------------------------------------*/
  send: {
    availableFor: ['tw'],
    services: {
      'send-express': {
        label: { zh: 'SEND UPS 快遞 Expedited (5-7 工作天)', en: 'SEND UPS Expedited (5-7 business days)' },
        bands: [ { maxKg: 10, rate: 9.43 }, { maxKg: 30, rate: 7.86 }, { maxKg: 50, rate: 7.81 }, { maxKg: 100, rate: 7.25 }, { maxKg: Infinity, rate: 7.27 } ],
        transit: { zh: '5-7 工作天', en: '5-7 business days' }
      },
      'send-express-saver': {
        label: { zh: 'SEND UPS Express Saver (2-3 工作天)', en: 'SEND UPS Express Saver (2-3 business days)' },
        bands: [ { maxKg: 10, rate: 9.93 }, { maxKg: 30, rate: 8.26 }, { maxKg: 50, rate: 8.21 }, { maxKg: 100, rate: 7.62 }, { maxKg: Infinity, rate: 7.64 } ],
        transit: { zh: '2-3 工作天', en: '2-3 business days' }
      },
      'send-air': {
        label: { zh: 'SEND 空運 (7-12 天)', en: 'SEND Air (7-12 days)' },
        // 預設用中部費率；west / east 供 UI 顯示區域差異
        bands: [ { maxKg: 24, rate: 8.96 }, { maxKg: 49, rate: 8.38 }, { maxKg: 99, rate: 7.05 }, { maxKg: Infinity, rate: 6.87 } ],
        regions: {
          west:    [ { maxKg: 24, rate: 8.32 }, { maxKg: 49, rate: 7.85 }, { maxKg: 99, rate: 6.87 }, { maxKg: Infinity, rate: 6.64 } ],
          central: [ { maxKg: 24, rate: 8.96 }, { maxKg: 49, rate: 8.38 }, { maxKg: 99, rate: 7.05 }, { maxKg: Infinity, rate: 6.87 } ],
          east:    [ { maxKg: 24, rate: 9.23 }, { maxKg: 49, rate: 8.53 }, { maxKg: 99, rate: 7.16 }, { maxKg: Infinity, rate: 6.93 } ]
        },
        transit: { zh: '7-12 天', en: '7-12 days' },
        provider: '金匯國際物流 (Amazon SPN)',
        effectiveFrom: '2026-04-02'
      },
      'send-sea': {
        label: { zh: 'SEND 海運 (34-62 天)', en: 'SEND Sea (34-62 days)' },
        // 實際按 CBM 計費。approxKgPerCbm 用來換算每公斤近似值供比較。
        cbmRates: { west: 132, central: 220, east: 241 },
        approxKgPerCbm: 1363,
        minCbm: 1,
        bands: [ { maxKg: Infinity, rate: 0.16 } ],   // ≈ $220/cbm ÷ 1363 kg/cbm
        transit: { zh: '34-62 天', en: '34-62 days' },
        provider: '金匯國際物流 (Amazon SPN)',
        effectiveFrom: '2026-04-02'
      }
    },
    ddpNote: {
      zh: '✅ SEND 費率為 DDP（含關稅到門），無需另外估算進口關稅。',
      en: '✅ SEND rates are DDP (duty included), no separate import duty needed.'
    },
    _source: 'Amazon SEND 官方費率表',
    _verified: '2026-04（UPS 快遞為 2025 Q4 費率，含燃油費及旺季附加費）'
  },

  /* ---------------------------------------------------------------------------
   * FBM 自配送 — 每件成本預設值 (USD)
   * -------------------------------------------------------------------------*/
  fbm: {
    volumetricDivisor: 5000,   // 國際快遞材積重：L×W×H(cm) / 5000 = kg
    methods: {
      'express-ddp': {
        label: { zh: '國際快遞 DDP（DHL/FedEx/UPS 含稅到門）', en: 'Express DDP (DHL/FedEx/UPS, duty included)' },
        tw: { ship: 12.00, duty: 0, pack: 0.50, cs: 1.00, baseUsd: 8, perKgUsd: 8,
              note: { zh: '國際快遞 DDP 市場行情：0.5kg 約 $8-15，1kg 約 $12-20', en: 'Express DDP market rate: ~$8-15 at 0.5kg, ~$12-20 at 1kg' } },
        cn: { ship: 10.00, duty: 0, pack: 0.50, cs: 1.00, baseUsd: 6, perKgUsd: 7,
              note: { zh: '國際快遞 DDP：0.5kg 約 $6-12，1kg 約 $10-18（中國出貨）', en: 'Express DDP from China: ~$6-12 at 0.5kg, ~$10-18 at 1kg' } }
      },
      'overseas-wh': {
        label: { zh: '海外倉代發（先批量入倉，逐件出貨）', en: 'Overseas warehouse (bulk inbound, per-order ship)' },
        tw: { ship: 5.50, duty: 0.50, pack: 0.30, cs: 1.00, baseUsd: 4, perKgUsd: 3, dutyPctOfPrice: 5,
              note: { zh: '海外倉代發：頭程分攤 + 美國境內配送，0.5kg 約 $4-7', en: 'Overseas WH: inbound share + US domestic delivery, ~$4-7 at 0.5kg' } },
        cn: { ship: 4.50, duty: 0.50, pack: 0.30, cs: 1.00, baseUsd: 3, perKgUsd: 2.5, dutyPctOfPrice: 5,
              note: { zh: '海外倉代發：0.5kg 約 $3-6（中國出貨，可用 AGL）', en: 'Overseas WH from China: ~$3-6 at 0.5kg (AGL available)' } }
      },
      'custom-fbm': {
        label: { zh: '自訂費率', en: 'Custom rates' },
        tw: { ship: null, duty: null, pack: null, cs: null, note: { zh: '請自行填入實際費率', en: 'Enter your actual rates' } },
        cn: { ship: null, duty: null, pack: null, cs: null, note: { zh: '請自行填入實際費率', en: 'Enter your actual rates' } }
      }
    },
    referenceTable: [
      { method: { zh: '快遞 DDP (0.5kg)',    en: 'Express DDP (0.5kg)' },   cost: '$8 - $15',  transit: { zh: '5-10 天', en: '5-10 days' } },
      { method: { zh: '快遞 DDP (1kg)',      en: 'Express DDP (1kg)' },     cost: '$12 - $20', transit: { zh: '5-10 天', en: '5-10 days' } },
      { method: { zh: '快遞 DDP (2kg)',      en: 'Express DDP (2kg)' },     cost: '$18 - $30', transit: { zh: '5-10 天', en: '5-10 days' } },
      { method: { zh: '海外倉代發 (0.5kg)',  en: 'Overseas WH (0.5kg)' },   cost: '$4 - $7',   transit: { zh: '3-5 天*', en: '3-5 days*' } },
      { method: { zh: '海外倉代發 (1kg)',    en: 'Overseas WH (1kg)' },     cost: '$5 - $9',   transit: { zh: '3-5 天*', en: '3-5 days*' } }
    ],
    miscPerUnit: 1.50,   // 台灣電商模式：包裝 + 客服退貨的合併預設值
    _verified: '2025-Q4 市場行情估算（非官方固定費率）'
  },

  /* ---------------------------------------------------------------------------
   * 新賣家優惠 & FBA 新選品計畫
   * -------------------------------------------------------------------------*/
  incentives: {
    amortizeMonths: 3,   // 一次性額度攤提的月數（官方多為 90 天窗口）

    nsi: {
      adsCredit: { tiers: [50, 200, 1000], defaultTier: 200 },
      couponCredit: 50,
      vineCredit: 200,
      inboundCredit: { domestic: 100, crossBorder: 200, default: 100 },
      _source: 'https://gs.amazon.com.tw/new-seller-incentive',
      _verified: '2026-04'
    },

    newSelection: {
      freeStorageDays: 120,
      freeStorageUnits: { standard: 100, oversize: 50 },
      freeReturnsUnits: 20,
      freeReturnsDays: 180,
      rebatePct: 10,
      vineDiscountPct: 25,
      freeInboundUnits: 100,
      _source: 'https://sell.amazon.com/blog/fba-new-selection-program',
      _verified: '2026-04'
    },

    brandBonus: {
      tier1Pct: 10, tier1UpToUsd: 50000,
      tier2Pct: 5,  maxTotalUsd: 52500,
      validMonths: 12,
      _source: 'https://gs.amazon.com.tw/benefits',
      _verified: '2026-04'
    }
  },

  /* ---------------------------------------------------------------------------
   * 台灣電商 → 美國 Amazon 模式的預設值
   * -------------------------------------------------------------------------*/
  twMode: {
    defaultExchangeRate: 32.5,   // TWD per USD — 每次更新費率時順手改這個
    defaultMonthlySales: 200,
    _exchangeRateSource: 'https://rate.bot.com.tw/xrt?Lang=zh-TW（台灣銀行現金賣出）',
    _verified: '2026-04'
  },

  /* ---------------------------------------------------------------------------
   * 資料來源總表 — 直接渲染成頁面下方的「資料來源與參考連結」
   * -------------------------------------------------------------------------*/
  sourceTable: [
    { item: { zh: 'FBA 配送費 (Fulfillment Fee)', en: 'FBA Fulfillment Fee' },
      links: [{ text: { zh: 'Seller Central GABBX6GZPA8MSZGW — 2026 US FBA 配送費調整', en: 'Seller Central GABBX6GZPA8MSZGW — 2026 US FBA fulfillment fee changes' }, url: 'https://sellercentral.amazon.com/help/hub/reference/external/GABBX6GZPA8MSZGW' }],
      detail: { zh: '費率依售價分三檔（&lt;$10 / $10-$50 / &gt;$50），含 3.5% 燃油附加費', en: 'Three price bands (&lt;$10 / $10-$50 / &gt;$50), incl. 3.5% fuel surcharge' },
      retrieved: '2026-04' },
    { item: { zh: 'FBA 倉儲費 (Storage Fee)', en: 'FBA Storage Fee' },
      links: [{ text: { zh: 'Seller Central — 月度庫存倉儲費', en: 'Seller Central — Monthly inventory storage fees' }, url: 'https://sellercentral.amazon.com/help/hub/reference/external/G200612770' }],
      detail: { zh: '淡季 $0.78/cuft (1-9月)、旺季 $2.40/cuft (10-12月)', en: 'Off-peak $0.78/cuft (Jan-Sep), peak $2.40/cuft (Oct-Dec)' },
      retrieved: '2026-04' },
    { item: { zh: '銷售佣金 (Referral Fee)', en: 'Referral Fee' },
      links: [{ text: { zh: 'Amazon 全球開店費率頁', en: 'Amazon Global Selling pricing page' }, url: 'https://gs.amazon.com.tw/pricing' },
              { text: { zh: 'Seller Central 佣金費率表', en: 'Seller Central referral fee schedule' }, url: 'https://sellercentral.amazon.com/help/hub/reference/external/GTG4BAWSY39Z98EN' }],
      detail: { zh: '', en: '' }, retrieved: '2026-04' },
    { item: { zh: 'Inbound Placement 費', en: 'Inbound Placement Fee' },
      links: [{ text: { zh: 'Seller Central Inbound Placement 說明', en: 'Seller Central Inbound Placement' }, url: 'https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8SQ2DEN' }],
      detail: { zh: '', en: '' }, retrieved: '2026-04' },
    { item: { zh: '新賣家入門大禮包', en: 'New Seller Incentives' },
      links: [{ text: { zh: 'Amazon 全球開店 新賣家入門大禮包', en: 'Amazon Global Selling New Seller Incentives' }, url: 'https://gs.amazon.com.tw/new-seller-incentive' }],
      detail: { zh: '廣告折價券為階梯式：花費 $50→得 $50、$200→得 $200、$1K+→得 $1,000', en: 'Ads credit is tiered: spend $50→get $50, $200→get $200, $1K+→get $1,000' },
      retrieved: '2026-04' },
    { item: { zh: 'FBA 新選品計畫', en: 'FBA New Selection' },
      links: [{ text: { zh: 'Amazon FBA 新選品計畫', en: 'Amazon FBA New Selection Program' }, url: 'https://sell.amazon.com/blog/fba-new-selection-program' }],
      detail: { zh: '', en: '' }, retrieved: '2026-04' },
    { item: { zh: '退款管理費', en: 'Refund Admin Fee' },
      links: [{ text: { zh: 'Amazon 全球開店費率頁', en: 'Amazon Global Selling pricing page' }, url: 'https://gs.amazon.com.tw/pricing' }],
      detail: { zh: '= min(佣金 × 20%, $5.00)', en: '= min(referral × 20%, $5.00)' }, retrieved: '2026-04' },
    { item: { zh: '帳戶月費', en: 'Account Fee' },
      links: [{ text: { zh: 'Amazon 全球開店費率頁', en: 'Amazon Global Selling pricing page' }, url: 'https://gs.amazon.com.tw/pricing' }],
      detail: { zh: 'Professional $39.99/月', en: 'Professional $39.99/mo' }, retrieved: '2026-04' },
    { item: { zh: 'Amazon SEND 頭程費率 (DDP)', en: 'Amazon SEND Rates (DDP)' },
      links: [{ text: { zh: 'Amazon SEND（僅台灣出貨）', en: 'Amazon SEND (Taiwan origin only)' }, url: 'https://gs.amazon.com.tw/service-provider' }],
      detail: { zh: 'UPS 快遞為 2025 Q4 費率（含燃油費及旺季附加費）；空運／海運 2026/4/2 啟用，金匯國際物流 (Amazon SPN)。所有 SEND 費率為 DDP（含關稅到門）',
                en: 'UPS rates are 2025 Q4 (incl. fuel & peak surcharge); Air/Sea launched 2026-04-02 via Jin Hui Logistics (Amazon SPN). All SEND rates are DDP.' },
      retrieved: '2026-04' },
    { item: { zh: 'FBM 配送費估算', en: 'FBM Shipping Estimate' },
      links: [], detail: { zh: '2025 年市場行情估算（非官方固定費率）。快遞 DDP / 海外倉代發，實際費率依貨代合約而異',
                           en: '2025 market estimates (not official rates). Express DDP / overseas warehouse; actual rates vary by forwarder contract' },
      retrieved: '2025-Q4' }
  ]
};
