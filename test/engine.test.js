/* =============================================================================
 * engine.test.js — 用 node 直接跑，不需要任何 npm 套件
 *
 *   node test/engine.test.js
 *
 * 目的：
 *   1. 驗證重構後的 Engine 與原版 v1.1 計算結果逐項一致（parity）
 *   2. 驗證刻意修掉的 bug 真的修好了（regression）
 * ===========================================================================*/

const path = require('path');
const fs = require('fs');
const vm = require('vm');

/* ---- 載入 rates.js + app.js（模擬瀏覽器的 window，但沒有 document）------ */
const root = path.join(__dirname, '..');
const sandbox = { window: {}, console, module: { exports: {} } };
sandbox.exports = sandbox.module.exports;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'rates.js'), 'utf8'), sandbox, { filename: 'rates.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), sandbox, { filename: 'app.js' });

const R = sandbox.window.AMZ_RATES;
const { Engine, I18N, INSIGHTS } = sandbox.module.exports;

/* ---- 迷你測試框架 ------------------------------------------------------- */
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (extra ? '  →  ' + extra : '')); }
}
function near(name, a, b, tol = 0.005) {
  ok(name, Math.abs(a - b) <= tol, `got ${a}, expected ${b}`);
}

/* =============================================================================
 * 原版 v1.1 的函式，原封不動抄過來當作對照基準
 *
 * ⚠️ 這一段寫死的是「2026.04 那批費率」。
 *    A / B-1 區塊只在 rates.js 的 meta.version 仍為 BASELINE_VERSION 時執行 ——
 *    你更新費率後這些比對自動跳過，不會產生假失敗。
 *    其餘區塊（B-2 之後）全部從 rates.js 讀值，任何費率版本都會跑。
 * ===========================================================================*/
const BASELINE_VERSION = '2026.04';
const isBaseline = R.meta.version === BASELINE_VERSION;

const ORIG_CATEGORIES = {
  home: { pct: 15, tiered: false }, sports: { pct: 15, tiered: false }, toys: { pct: 15, tiered: false },
  pet: { pct: 15, tiered: false }, health: { pct: 15, tiered: false }, office: { pct: 15, tiered: false },
  lawn: { pct: 15, tiered: false },
  beauty: { pct: 15, tiered: true, threshold: 10, lowPct: 8 },
  baby: { pct: 15, tiered: true, threshold: 10, lowPct: 8 },
  clothing: { pct: 17, tiered: false }, electronics: { pct: 8, tiered: false },
  camera: { pct: 8, tiered: false }, auto: { pct: 12, tiered: false },
  furniture: { pct: 15, tiered: true, threshold: 200, lowPct: 10, above: true },
  jewelry: { pct: 20, tiered: true, threshold: 250, lowPct: 5, above: true },
  videogames: { pct: 15, tiered: false }, musical: { pct: 15, tiered: false },
  books: { pct: 15, tiered: false, extraPerItem: 1.80 }
};

function origCalcFbaFee(weightOz, dimLin, dimWin, dimHin, sellPrice) {
  const maxSide = Math.max(dimLin, dimWin, dimHin);
  const sides = [dimLin, dimWin, dimHin].sort((a, b) => a - b);
  const minSide = sides[0], medSide = sides[1];
  const girth = 2 * (medSide + minSide);
  const lengthGirth = maxSide + girth;
  const weightLb = weightOz / 16;
  const effW = Math.max(dimWin, 2), effH = Math.max(dimHin, 2);
  const dimWeight = (dimLin * effW * effH) / 139;
  const isSmallStd = maxSide <= 15 && medSide <= 12 && minSide <= 0.75 && weightOz <= 16;
  const fitsStandard = maxSide <= 18 && medSide <= 14 && minSide <= 8;
  let tier = '', baseFee = 0;
  const priceRange = (sellPrice || 25) < 10 ? 'low' : (sellPrice || 25) > 50 ? 'high' : 'mid';

  if (isSmallStd) {
    tier = 'Small Standard';
    const w = weightOz;
    const rates_mid = [[2, 3.06], [4, 3.15], [6, 3.24], [8, 3.33], [10, 3.43], [12, 3.53], [14, 3.60], [16, 3.65]];
    const rates_low = [[2, 2.29], [4, 2.38], [6, 2.47], [8, 2.56], [10, 2.66], [12, 2.76], [14, 2.83], [16, 2.88]];
    const rates_high = [[2, 3.32], [4, 3.42], [6, 3.45], [8, 3.54], [10, 3.68], [12, 3.78], [14, 3.91], [16, 3.96]];
    const rates = priceRange === 'low' ? rates_low : priceRange === 'high' ? rates_high : rates_mid;
    for (const [maxW, fee] of rates) { if (w <= maxW) { baseFee = fee; break; } }
  } else if (fitsStandard && Math.max(weightLb, dimWeight) <= 20) {
    tier = 'Large Standard';
    const sw = Math.max(weightLb, dimWeight);
    const wOzEff = sw * 16;
    if (wOzEff <= 4) baseFee = priceRange === 'low' ? 2.91 : priceRange === 'high' ? 3.73 : 3.68;
    else if (wOzEff <= 8) baseFee = priceRange === 'low' ? 3.13 : priceRange === 'high' ? 3.95 : 3.90;
    else if (wOzEff <= 12) baseFee = priceRange === 'low' ? 3.38 : priceRange === 'high' ? 4.20 : 4.15;
    else if (wOzEff <= 16) baseFee = priceRange === 'low' ? 3.78 : priceRange === 'high' ? 4.60 : 4.55;
    else if (sw <= 1.25) baseFee = priceRange === 'low' ? 4.22 : priceRange === 'high' ? 5.04 : 4.99;
    else if (sw <= 1.5) baseFee = priceRange === 'low' ? 4.60 : priceRange === 'high' ? 5.42 : 5.37;
    else if (sw <= 1.75) baseFee = priceRange === 'low' ? 4.75 : priceRange === 'high' ? 5.57 : 5.52;
    else if (sw <= 2) baseFee = priceRange === 'low' ? 5.00 : priceRange === 'high' ? 5.82 : 5.77;
    else if (sw <= 2.25) baseFee = priceRange === 'low' ? 5.10 : priceRange === 'high' ? 5.92 : 5.87;
    else if (sw <= 2.5) baseFee = priceRange === 'low' ? 5.28 : priceRange === 'high' ? 6.10 : 6.05;
    else if (sw <= 2.75) baseFee = priceRange === 'low' ? 5.44 : priceRange === 'high' ? 6.26 : 6.21;
    else if (sw <= 3) baseFee = priceRange === 'low' ? 5.85 : priceRange === 'high' ? 6.67 : 6.62;
    else {
      const base = priceRange === 'low' ? 6.15 : priceRange === 'high' ? 6.97 : 6.92;
      const extraLb = sw - 3;
      const intervals = Math.ceil(extraLb * 4);
      baseFee = base + intervals * 0.08;
    }
  } else if (lengthGirth <= 130 && maxSide <= 59 && Math.max(weightLb, dimWeight) <= 50) {
    const sw = Math.max(weightLb, dimWeight);
    if (maxSide <= 26 && medSide <= 18 && minSide <= 14) {
      tier = 'Small Bulky';
      baseFee = (priceRange === 'high' ? 7.55 : 9.61) + Math.max(0, sw - 1) * 0.38;
    } else {
      tier = 'Large Bulky';
      baseFee = (priceRange === 'high' ? 9.35 : 9.61) + Math.max(0, sw - 1) * 0.38;
    }
  } else {
    const sw = Math.max(weightLb, dimWeight);
    tier = 'Extra Large';
    if (sw <= 50) baseFee = 26.33 + Math.max(0, sw - 1) * 0.38;
    else if (sw <= 70) baseFee = 40.12 + Math.max(0, sw - 51) * 0.75;
    else if (sw <= 150) baseFee = 54.81 + Math.max(0, sw - 71) * 0.75;
    else baseFee = 194.95 + Math.max(0, weightLb - 151) * 0.19;
  }
  const total = baseFee + baseFee * 0.035;
  return { fee: Math.round(total * 100) / 100, tier };
}

function origReferral(price, catKey) {
  const cat = ORIG_CATEGORIES[catKey];
  if (!cat) return price * 0.15;
  if (!cat.tiered) return price * (cat.pct / 100);
  if (cat.above) {
    if (price <= cat.threshold) return price * (cat.pct / 100);
    return cat.threshold * (cat.pct / 100) + (price - cat.threshold) * (cat.lowPct / 100);
  }
  if (price <= cat.threshold) return price * (cat.lowPct / 100);
  return price * (cat.pct / 100);
}

const ORIG_TIER_MAP = {
  'Small Standard': 'smallStandard', 'Large Standard': 'largeStandard',
  'Small Bulky': 'smallBulky', 'Large Bulky': 'largeBulky', 'Extra Large': 'extraLarge'
};

/* =============================================================================
 * A. PARITY — FBA 配送費
 * ===========================================================================*/
console.log('\n── A. FBA 配送費 parity（新引擎 vs 原版 v1.1）──');

const weightsOz = [0.5, 1.9, 2, 2.1, 5.5, 8, 12, 15.9, 16, 16.1, 20, 24, 32, 40, 48,
                   60, 80, 100, 160, 320, 480, 800, 1200, 2400, 2560];
const dimSets = [
  [10, 8, 0.5], [14, 11, 0.7], [15, 12, 0.75], [15.1, 12, 0.75],
  [12, 9, 3], [17, 13, 7], [18, 14, 8], [18.1, 14, 8],
  [24, 17, 12], [26, 18, 14], [30, 20, 16], [40, 25, 20], [58, 32, 32], [70, 40, 30]
];
const prices = [5, 9.99, 10, 25.99, 50, 50.01, 120];

if (!isBaseline) {
  console.log(`   ⏭  跳過：rates.js 已更新到 ${R.meta.version}（基準為 ${BASELINE_VERSION}），`);
  console.log('      與 v1.1 寫死費率表的比對不再適用。這是預期行為，不是失敗。');
} else {
  let feeChecks = 0, feeMismatch = 0, tierMismatch = 0;
  for (const oz of weightsOz) {
    for (const [l, w, h] of dimSets) {
      for (const p of prices) {
        const o = origCalcFbaFee(oz, l, w, h, p);
        const n = Engine.fbaFee(oz, { l, w, h }, p, R);
        feeChecks++;
        if (Math.abs(o.fee - n.fee) > 0.005) {
          feeMismatch++;
          if (feeMismatch <= 5) {
            failures.push(`FBA fee 不一致 oz=${oz} dims=${l}x${w}x${h} p=${p}: orig ${o.fee} vs new ${n.fee}`);
          }
        }
        if (ORIG_TIER_MAP[o.tier] !== n.tier) {
          tierMismatch++;
          if (tierMismatch <= 5) {
            failures.push(`size tier 不一致 oz=${oz} dims=${l}x${w}x${h}: orig ${o.tier} vs new ${n.tier}`);
          }
        }
      }
    }
  }
  ok(`FBA 配送費 ${feeChecks} 組全部相符`, feeMismatch === 0, `${feeMismatch} 組不符`);
  ok(`Size tier ${feeChecks} 組全部相符`, tierMismatch === 0, `${tierMismatch} 組不符`);
  console.log(`   共比對 ${feeChecks} 組組合，費用不符 ${feeMismatch} 組、tier 不符 ${tierMismatch} 組`);
}

/* =============================================================================
 * B. 佣金 / 倉儲 / 退款管理費
 *    B-1 是與 v1.1 的費率 parity（會依版本跳過）
 *    B-2 之後是「公式」測試，費率一律從 rates.js 讀，改費率也不會壞
 * ===========================================================================*/
console.log('\n── B. 佣金 / 倉儲 / 退款管理費 ──');

if (isBaseline) {
  let refMismatch = 0;
  for (const cat of Object.keys(ORIG_CATEGORIES)) {
    for (const p of [0.01, 5, 9.99, 10, 10.01, 25, 199, 200, 200.01, 249, 250, 250.01, 500, 1000]) {
      const a = origReferral(p, cat), b = Engine.referralFee(p, cat, R);
      if (Math.abs(a - b) > 1e-9) { refMismatch++; failures.push(`referral ${cat} @ $${p}: ${a} vs ${b}`); }
    }
  }
  ok('銷售佣金與 v1.1 完全相符（含階梯費率）', refMismatch === 0, `${refMismatch} 組不符`);
} else {
  console.log('   ⏭  跳過與 v1.1 的佣金 parity 比對');
}

// 階梯佣金的公式行為（不綁任何具體費率，永遠有效）
for (const catKey of Object.keys(R.categories).filter(k => !k.startsWith('_'))) {
  const c = R.categories[catKey];
  if (!c.tiered) {
    near(`${catKey}：非階梯，$100 收 ${c.pct}%`, Engine.referralFee(100, catKey, R), 100 * c.pct / 100, 1e-9);
    continue;
  }
  const th = c.threshold;
  if (c.above) {
    // 門檻以下用高費率；超過的部分才降到 lowPct
    near(`${catKey}：$${th}（門檻）收 ${c.pct}%`, Engine.referralFee(th, catKey, R), th * c.pct / 100, 1e-9);
    near(`${catKey}：$${th * 2} = 門檻內 ${c.pct}% + 超出 ${c.lowPct}%`,
      Engine.referralFee(th * 2, catKey, R), th * c.pct / 100 + th * c.lowPct / 100, 1e-9);
  } else {
    // 門檻以下整筆用低費率，超過就整筆跳高費率
    near(`${catKey}：$${th}（門檻）整筆收 ${c.lowPct}%`, Engine.referralFee(th, catKey, R), th * c.lowPct / 100, 1e-9);
    near(`${catKey}：$${th + 1} 整筆跳到 ${c.pct}%`,
      Engine.referralFee(th + 1, catKey, R), (th + 1) * c.pct / 100, 1e-9);
  }
}

// 倉儲費公式：體積(cuft) × 當季費率，費率從 rates.js 讀
for (const [l, w, h] of dimSets) {
  const cuft = (l * w * h) / R.storage.cubicInchesPerCuFt;
  near(`倉儲費 ${l}x${w}x${h} 淡季 = ${R.storage.offpeak}/cuft`,
    Engine.storageFee({ l, w, h }, 'offpeak', R).fee, Math.round(cuft * R.storage.offpeak * 100) / 100);
}
near(`倉儲費旺季 = 體積 × ${R.storage.peak}/cuft`,
  Engine.storageFee({ l: 18, w: 14, h: 8 }, 'peak', R).fee,
  Math.round(((18 * 14 * 8) / R.storage.cubicInchesPerCuFt) * R.storage.peak * 100) / 100);
ok('旺季倉儲費高於淡季',
  Engine.storageFee({ l: 18, w: 14, h: 8 }, 'peak', R).fee >
  Engine.storageFee({ l: 18, w: 14, h: 8 }, 'offpeak', R).fee);

// 退款管理費公式 = min(佣金 × pct, cap)，兩個參數都從 rates.js 讀
for (const p of [5, 25, 100, 200, 500, 5000]) {
  const expect = Math.min(Engine.referralFee(p, 'home', R) * (R.refundAdmin.pct / 100), R.refundAdmin.cap);
  near(`退款管理費 @ $${p} = min(佣金×${R.refundAdmin.pct}%, $${R.refundAdmin.cap})`,
    Engine.refundAdminFee(p, 'home', R), expect);
}
ok(`退款管理費有上限 $${R.refundAdmin.cap}`,
  Engine.refundAdminFee(100000, 'home', R) === R.refundAdmin.cap);

// 燃油附加費：FBA 費用必須 = 基本費 × (1 + pct/100)
{
  const f = Engine.fbaFee(280 * 0.03527396, { l: 9.8, w: 5.9, h: 2.0 }, 25.99, R);
  near(`FBA 費用 = 基本費 × (1 + ${R.fuelSurcharge.pct}%)`,
    f.fee, Math.round(f.baseFee * (1 + R.fuelSurcharge.pct / 100) * 100) / 100, 0.011);
}

/* =============================================================================
 * C. REGRESSION — 修掉的 bug
 * ===========================================================================*/
console.log('\n── C. Bug 修復驗證 ──');

// C1. 原版 estimateInboundFee 用 tier.includes('Small')，Small Bulky 會誤判成 $0.15
ok('C1 Small Bulky 的 Inbound Placement 不再誤判為 Small Standard 的 $0.15',
  Engine.inboundFee('smallBulky', R) === 0.79,
  `got ${Engine.inboundFee('smallBulky', R)}`);
ok('C1 Small Standard 仍為 $0.15', Engine.inboundFee('smallStandard', R) === 0.15);
ok('C1 Large Standard 仍為 $0.27', Engine.inboundFee('largeStandard', R) === 0.27);
ok('C1 Extra Large 仍為 $1.58', Engine.inboundFee('extraLarge', R) === 1.58);
// 確認 Small Bulky 這個 tier 真的會被判出來（不然上面的修復沒意義）
ok('C1 26x18x14 / 30lb 會被判為 Small Bulky',
  Engine.classifyTier({ l: 26, w: 18, h: 14 }, 30 * 16, R).tier === 'smallBulky',
  Engine.classifyTier({ l: 26, w: 18, h: 14 }, 30 * 16, R).tier);

// C2. 售價 0 時不能產生 NaN
const zeroPct = Engine.effectiveReferralPct(0, 'home', R);
ok('C2 售價 $0 的有效佣金率不是 NaN', Number.isFinite(zeroPct), `got ${zeroPct}`);
ok('C2 售價 $0 的美妝有效佣金率回低階費率 8%', Engine.effectiveReferralPct(0, 'beauty', R) === 8);
const zeroAll = Engine.computeAll({
  mode: 'advanced', origin: 'tw', price: 0, cogs: 0, monthlySales: 100, category: 'home',
  brandRebatePct: 0, weightG: 0, useShipPerPiece: false, shipRate: 0, shipPerPiece: 0,
  fbaFee: 0, storageFee: 0, storageMonths: 0, inboundFee: 0,
  fbmShip: 0, fbmDuty: 0, fbmPack: 0, fbmCs: 0,
  tacos: 0, vineFee: 0, returnRate: 0, refundAdminFee: 0, importDuty: 0, otherFee: 0, promos: {}
}, R);
ok('C2 全部為 0 時 margin / roi / effReferralPct 都不是 NaN',
  Number.isFinite(zeroAll.margin) && Number.isFinite(zeroAll.roi) && Number.isFinite(zeroAll.effReferralPct));

// C3. Extra Large 150lb+ 的計費基準應為實際重量，不是體積重
const heavy = Engine.fbaFee(200 * 16, { l: 60, w: 40, h: 40 }, 100, R);
ok('C3 Extra Large 150lb+ 的計費重量用實際重量（200 lb）',
  Math.abs(heavy.basisLb - 200) < 0.01, `basisLb=${heavy.basisLb}`);
const xlDimWeight = (60 * 40 * 40) / 139;
ok('C3 且該體積重（' + xlDimWeight.toFixed(0) + ' lb）確實不同於實際重量，證明分支有效',
  Math.abs(xlDimWeight - 200) > 50);

// C4. 一次性優惠額度要能單獨被拆出來
const promoIn = {
  mode: 'advanced', origin: 'tw', price: 25.99, cogs: 2.5, monthlySales: 200, category: 'home',
  brandRebatePct: 0, weightG: 280, useShipPerPiece: false, shipRate: 1.0, shipPerPiece: 0,
  fbaFee: 3.43, storageFee: 0.02, storageMonths: 3, inboundFee: 0.15,
  fbmShip: 0, fbmDuty: 0, fbmPack: 0, fbmCs: 0,
  tacos: 12, vineFee: 1.00, returnRate: 3, refundAdminFee: 0.78, importDuty: 0, otherFee: 0.5,
  promos: { nsiAds: true, nsiAdsAmount: 200, nsiCoupon: true, fnsStorage: true, fnsVine: true }
};
const pr = Engine.computeAll(promoIn, R);
ok('C4 一次性額度有被單獨累計 (oneTime > 0)', pr.promo.oneTime > 0);
ok('C4 結構性優惠也有被單獨累計 (structural > 0)', pr.promo.structural > 0);
near('C4 oneTime + structural = perUnit', pr.promo.oneTime + pr.promo.structural, pr.promo.perUnit, 1e-9);
ok('C4 扣掉一次性額度後的利潤較低', pr.profitExOneTime < pr.profit);
near('C4 profitExOneTime = profit - oneTime', pr.profitExOneTime, pr.profit - pr.promo.oneTime, 1e-9);
// 原版 fns-vine 是寫死 0.05；現在應為 Vine 費用 × 25%
near('C4 Vine 75 折 = Vine 費用 $1.00 × 25% = $0.25',
  pr.promo.details.find(d => d.key === 'sv.fnsVine').value, 0.25, 1e-9);

// C5. 台灣電商模式：尺寸要真的有影響（原版 twDim* 完全沒被使用）
const twBase = {
  twPrice: 800, twCost: 250, exRate: 32.5, category: 'home', monthlySales: 200,
  weightG: 500, method: 'express-ddp', origin: 'tw'
};
const twSmall = Engine.computeTw({ ...twBase, dimsCm: { l: 10, w: 10, h: 5 } }, R);
const twBig = Engine.computeTw({ ...twBase, dimsCm: { l: 45, w: 35, h: 30 } }, R);
ok('C5 台灣電商模式的尺寸會影響配送費（材積重）',
  twBig.shipCost > twSmall.shipCost,
  `small=${twSmall.shipCost} big=${twBig.shipCost}`);
near('C5 大箱子改以材積重計費', twBig.billableKg, (45 * 35 * 30) / R.fbm.volumetricDivisor, 0.01);
near('C5 小箱子仍以實重計費', twSmall.billableKg, 0.5, 0.01);

// C6. 台灣電商模式：海外倉方式現在可選（原版 select 只有一個選項，分支到不了）
const twWh = Engine.computeTw({ ...twBase, dimsCm: { l: 25, w: 15, h: 8 }, method: 'overseas-wh' }, R);
ok('C6 海外倉代發方式可計算且會產生關稅', twWh.duty > 0, `duty=${twWh.duty}`);
ok('C6 海外倉配送費低於國際快遞 DDP',
  twWh.shipCost < Engine.computeTw({ ...twBase, dimsCm: { l: 25, w: 15, h: 8 }, method: 'express-ddp' }, R).shipCost);

// C7. 建議售價：無解時要回 null 而不是 0
const twImpossible = Engine.computeTw({ ...twBase, twPrice: 1000, twCost: 50, dimsCm: { l: 25, w: 15, h: 8 } }, R);
ok('C7 台灣利潤率 95% + 佣金 15% 時建議售價回 null（無解）',
  twImpossible.suggested === null, `got ${twImpossible.suggested}`);
const twOk = Engine.computeTw({ ...twBase, dimsCm: { l: 25, w: 15, h: 8 } }, R);
ok('C7 正常情況有建議售價', typeof twOk.suggested === 'number' && twOk.suggested > 0);
// 反推的售價代回去，利潤率應該等於台灣利潤率
const back = Engine.computeTw({ ...twBase, dimsCm: { l: 25, w: 15, h: 8 }, twPrice: twOk.suggested * 32.5 }, R);
near('C7 建議售價代回後的利潤率 ≈ 台灣利潤率', back.margin, twOk.twMargin, 0.15);

// C8. FBM 模式下「營運成本」卡片是隱藏的，隱藏的欄位不該偷偷算進總成本
//     原版 isBasic = (mode === 'basic')，所以 FBM 模式仍會加上廣告 / 退貨 / 帳戶費 / 其他費用
const fbmOps = Engine.computeAll({
  ...promoIn, mode: 'fbm', promos: {},
  fbmShip: 12, fbmDuty: 0, fbmPack: 0.5, fbmCs: 1,
  tacos: 12, returnRate: 3, refundAdminFee: 0.78, vineFee: 1.0, importDuty: 2.0, otherFee: 0.5
}, R);
ok('C8 FBM 模式不計入被隱藏的廣告費', fbmOps.adsCost === 0, `got ${fbmOps.adsCost}`);
ok('C8 FBM 模式不計入被隱藏的帳戶月費', fbmOps.accountPerUnit === 0, `got ${fbmOps.accountPerUnit}`);
ok('C8 FBM 模式不計入被隱藏的退貨損失與退款管理費',
  fbmOps.returnCost === 0 && fbmOps.refundAdmin === 0);
ok('C8 FBM 模式不計入被隱藏的 Vine / 關稅 / 其他費用',
  fbmOps.vineFee === 0 && fbmOps.importDuty === 0 && fbmOps.otherFee === 0);
// 基礎版同理（原版這部分本來就對，確認沒被改壞）
const basicOps = Engine.computeAll({ ...promoIn, mode: 'basic', promos: {} }, R);
ok('C8 基礎版同樣不計入營運成本',
  basicOps.adsCost === 0 && basicOps.accountPerUnit === 0 && basicOps.otherFee === 0);
// 進階版要照算
ok('C8 進階版才計入營運成本',
  Engine.computeAll({ ...promoIn, mode: 'advanced', promos: {} }, R).adsCost > 0);

/* =============================================================================
 * D. 資料完整性 — rates.js 有沒有漏東西
 * ===========================================================================*/
console.log('\n── D. rates.js 資料完整性 ──');

const catKeys = Object.keys(R.categories).filter(k => !k.startsWith('_'));
ok('D 品類數量 = 18', catKeys.length === 18, `got ${catKeys.length}`);
ok('D 每個品類都有 zh/en 名稱',
  catKeys.every(k => R.categories[k].label?.zh && R.categories[k].label?.en));
ok('D 品類沒有手寫的佣金說明（應由 pct/threshold 自動生成）',
  catKeys.every(k => !R.categories[k].note),
  catKeys.filter(k => R.categories[k].note).join(','));
ok('D 品類的 hint（若有）都是雙語',
  catKeys.every(k => !R.categories[k].hint || (R.categories[k].hint.zh && R.categories[k].hint.en)));
ok('D 每個品類都有對應的市場洞察 (zh + en)',
  catKeys.every(k => INSIGHTS[k]?.zh && INSIGHTS[k]?.en),
  catKeys.filter(k => !(INSIGHTS[k]?.zh && INSIGHTS[k]?.en)).join(','));

const zhKeys = Object.keys(I18N.zh), enKeys = Object.keys(I18N.en);
const missingEn = zhKeys.filter(k => !(k in I18N.en));
const extraEn = enKeys.filter(k => !(k in I18N.zh));
ok('D 英文字典沒有缺鍵（切 EN 不會掉回中文）', missingEn.length === 0, missingEn.join(', '));
ok('D 英文字典沒有多餘的孤兒鍵', extraEn.length === 0, extraEn.join(', '));
console.log(`   字典鍵數：zh ${zhKeys.length} / en ${enKeys.length}`);

ok('D 每個 size tier 都有 Inbound Placement 費率',
  ['smallStandard', 'largeStandard', 'smallBulky', 'largeBulky', 'extraLarge']
    .every(k => typeof R.inboundPlacement[k] === 'number'));
ok('D 每個 SEND 服務都有級距與 zh/en 名稱',
  Object.keys(R.send.services).filter(k => !k.startsWith('_')).every(k => {
    const s = R.send.services[k];
    return Array.isArray(s.bands) && s.bands.length && s.label?.zh && s.label?.en;
  }));
ok('D 每個貨代費率都有 zh/en 名稱',
  ['tw', 'cn'].every(o => ['sea', 'air', 'express'].every(m =>
    R.freight[o][m].label?.zh && R.freight[o][m].label?.en)));
ok('D FBA 費率表每個級距都有 low/mid/high 三檔',
  R.fba.smallStandard.bands.every(b => 'low' in b && 'mid' in b && 'high' in b) &&
  R.fba.largeStandard.bands.every(b => 'low' in b && 'mid' in b && 'high' in b));
ok('D meta 有版本 / 最後更新 / 下次複查日期',
  !!(R.meta.version && R.meta.lastUpdated && R.meta.nextReviewDue));

/* =============================================================================
 * E. 合理性 — 幾個手算得出來的端到端案例
 * ===========================================================================*/
console.log('\n── E. 端到端合理性 ──');

// 預設情境：$25.99 售價、$2.50 成本、280g、25x15x5cm、海運 $1/kg
const dOz = 280 * 0.03527396;
const dIn = { l: 25 * 0.393701, w: 15 * 0.393701, h: 5 * 0.393701 };
const dFba = Engine.fbaFee(dOz, dIn, 25.99, R);
ok('E 預設商品判為 Large Standard', dFba.tier === 'largeStandard', dFba.tier);

const basic = Engine.computeAll({
  mode: 'basic', origin: 'tw', price: 25.99, cogs: 2.50, monthlySales: 200, category: 'home',
  brandRebatePct: 0, weightG: 280, useShipPerPiece: false, shipRate: 1.0, shipPerPiece: 0,
  fbaFee: dFba.fee, storageFee: Engine.storageFee(dIn, 'offpeak', R).fee, storageMonths: 3,
  inboundFee: Engine.inboundFee(dFba.tier, R),
  fbmShip: 0, fbmDuty: 0, fbmPack: 0, fbmCs: 0,
  tacos: 12, vineFee: 0, returnRate: 3, refundAdminFee: 0.78, importDuty: 0, otherFee: 0.5, promos: {}
}, R);
// 基礎版：只有 COGS + 頭程 + FBA + 倉儲 + Inbound + 佣金
const expectBasic = 2.50 + 0.28 + dFba.fee + Engine.storageFee(dIn, 'offpeak', R).fee * 3
  + Engine.inboundFee(dFba.tier, R) + Engine.referralFee(25.99, 'home', R);
near('E 基礎版總成本 = 手算值', basic.totalCost, expectBasic, 0.01);
ok('E 基礎版不含廣告 / 帳戶費 / 退貨',
  basic.adsCost === 0 && basic.accountPerUnit === 0 && basic.returnCost === 0);
near('E 基礎版單件淨利 = 售價 - 總成本', basic.profit, 25.99 - basic.totalCost, 1e-9);
near('E 月營收 = 售價 × 月銷量', basic.monthlyRevenue, 25.99 * 200, 1e-9);

const adv = Engine.computeAll({
  mode: 'advanced', origin: 'tw', price: 25.99, cogs: 2.50, monthlySales: 200, category: 'home',
  brandRebatePct: 0, weightG: 280, useShipPerPiece: false, shipRate: 1.0, shipPerPiece: 0,
  fbaFee: dFba.fee, storageFee: Engine.storageFee(dIn, 'offpeak', R).fee, storageMonths: 3,
  inboundFee: Engine.inboundFee(dFba.tier, R),
  fbmShip: 0, fbmDuty: 0, fbmPack: 0, fbmCs: 0,
  tacos: 12, vineFee: 0, returnRate: 3, refundAdminFee: 0.78, importDuty: 0, otherFee: 0.5, promos: {}
}, R);
ok('E 進階版總成本高於基礎版', adv.totalCost > basic.totalCost);
near('E 進階版帳戶費分攤 = $39.99 / 200', adv.accountPerUnit, 39.99 / 200, 1e-9);
near('E 進階版廣告費 = 售價 × 12%', adv.adsCost, 25.99 * 0.12, 1e-9);

// 品牌退傭應直接抵扣佣金
const reb = Engine.computeAll({ ...promoIn, promos: {}, brandRebatePct: 10 }, R);
const noReb = Engine.computeAll({ ...promoIn, promos: {}, brandRebatePct: 0 }, R);
near('E 品牌退傭 10% 讓總成本減少售價的 10%', noReb.totalCost - reb.totalCost, 25.99 * 0.10, 1e-9);

// FBM 模式不應該有任何 FBA 費用
const fbm = Engine.computeAll({ ...promoIn, mode: 'fbm', fbmShip: 12, fbmDuty: 0, fbmPack: 0.5, fbmCs: 1 }, R);
ok('E FBM 模式沒有 FBA / 倉儲 / Inbound / 頭程 / 品牌退傭',
  fbm.fbaFee === 0 && fbm.storageTotal === 0 && fbm.inboundFee === 0 &&
  fbm.shipCost === 0 && fbm.brandRebate === 0);
near('E FBM 總成本 = COGS + 配送 + 包裝 + 客服 + 佣金',
  fbm.totalCost, 2.5 + 12 + 0.5 + 1 + Engine.referralFee(25.99, 'home', R), 0.01);

// 書籍的 $1.80 交易手續費
const bookCost = Engine.computeAll({ ...promoIn, promos: {}, category: 'books' }, R).totalCost;
const homeCost = Engine.computeAll({ ...promoIn, promos: {}, category: 'home' }, R).totalCost;
near(`E 書籍比居家多 $${R.categories.books.extraPerItem} 交易手續費`,
  bookCost - homeCost, R.categories.books.extraPerItem, 1e-9);

// 每件固定運費模式
const perPiece = Engine.computeAll({ ...promoIn, promos: {}, useShipPerPiece: true, shipPerPiece: 2.00 }, R);
near('E 每件固定運費模式直接採用填入值', perPiece.shipCost, 2.00, 1e-9);

/* =============================================================================
 * 結果
 * ===========================================================================*/
console.log('\n' + '='.repeat(72));
if (fail === 0) {
  console.log(`✅ 全部通過：${pass} 項斷言，0 失敗`);
} else {
  console.log(`❌ ${fail} 項失敗 / 共 ${pass + fail} 項斷言\n`);
  failures.forEach(f => console.log('   ✗ ' + f));
}
console.log('='.repeat(72) + '\n');
process.exit(fail === 0 ? 0 : 1);
