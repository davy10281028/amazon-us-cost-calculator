/* =============================================================================
 * lint.js — 靜態交叉檢查，不需要瀏覽器也不需要 npm
 *
 *   node test/lint.js
 *
 * 檢查項目：
 *   1. app.js 用 $('id') 抓的元素，index.html 裡真的有
 *   2. index.html 的 data-i18n / data-tip-i18n key，中英字典都有
 *   3. app.js t('key') 用到的 key，中英字典都有
 *   4. 中英字典鍵完全對齊（避免切英文掉回中文）
 *   5. 沒有沒人用的孤兒字典鍵
 *   6. CSS 定義了所有模式閘門 class
 *   7. rates.js 的每個品類都有對應的市場洞察
 * ===========================================================================*/

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const html = read('index.html');
const appSrc = read('app.js');
const css = read('styles.css');

const sb = { window: {}, console, module: { exports: {} } };
sb.exports = sb.module.exports;
vm.createContext(sb);
vm.runInContext(read('rates.js'), sb, { filename: 'rates.js' });
vm.runInContext(appSrc, sb, { filename: 'app.js' });
const R = sb.window.AMZ_RATES;
const { I18N, INSIGHTS } = sb.module.exports;

let problems = 0;
function check(title, offenders) {
  const list = [...new Set(offenders)];
  if (list.length) {
    problems += list.length;
    console.log(`❌ ${title} (${list.length})`);
    list.forEach(x => console.log('     ' + x));
  } else {
    console.log(`✅ ${title}`);
  }
}

/* ---- 1. element id ------------------------------------------------------ */
const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));

// 只看字面量呼叫 $('x')，排除 $('x' + var) 這種動態組合
const literalIdCalls = [...appSrc.matchAll(/\$\('([^']+)'\)/g)].map(m => m[1]);
check('app.js 用 $() 抓的 id 都存在於 index.html',
  literalIdCalls.filter(id => !htmlIds.has(id)));

// 動態組合：至少要有一個 id 以該前綴開頭
const prefixCalls = [...appSrc.matchAll(/\$\('([a-zA-Z.\-]+)'\s*\+/g)].map(m => m[1]);
check('app.js 動態組出的 id 前綴都有對應元素',
  [...new Set(prefixCalls)]
    .filter(p => ![...htmlIds].some(i => i.startsWith(p)))
    .map(p => `前綴 "${p}" 找不到任何對應 id`));

/* ---- 2 & 3. i18n key --------------------------------------------------- */
const htmlKeys = [
  ...[...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]),
  ...[...html.matchAll(/data-tip-i18n="([^"]+)"/g)].map(m => m[1])
];
check('index.html 的 i18n key 都存在於 I18N.zh', htmlKeys.filter(k => !(k in I18N.zh)));
check('index.html 的 i18n key 都存在於 I18N.en', htmlKeys.filter(k => !(k in I18N.en)));

// t('key') 但排除 t('prefix.' + var) 這種動態組合
const tCalls = [...appSrc.matchAll(/\bt\('([^']+)'\s*([,)])/g)].map(m => m[1]);
check("app.js t('key') 的 key 都存在於 I18N.zh", tCalls.filter(k => !(k in I18N.zh)));
check("app.js t('key') 的 key 都存在於 I18N.en", tCalls.filter(k => !(k in I18N.en)));

/* ---- 4. 中英字典對齊 ---------------------------------------------------- */
const zhKeys = Object.keys(I18N.zh), enKeys = Object.keys(I18N.en);
check('英文字典沒有缺鍵', zhKeys.filter(k => !(k in I18N.en)));
check('英文字典沒有多餘鍵', enKeys.filter(k => !(k in I18N.zh)));

/* ---- 5. 孤兒鍵 ---------------------------------------------------------- */
// 這些是用 t(prefix + var) 或 t(變數) 動態取用的，靜態掃不到，白名單放行
const DYNAMIC_PREFIXES = [
  'modeDesc.', 'app.subtitle.', 'note.rebate.', 'tier.', 'sv.', 'bd.',
  'adv.fbm', 'adv.tw', 'adv.margin', 'badge.rates', 'promo.adsTier',
  'promo.shipDomestic', 'promo.shipCross', 'tw.suggest.',
  'cat.note.tiered',  // 用 t(c.above ? '...Above' : '...Below') 三元傳入
  'storage.cls.'      // 用 t('storage.cls.' + storageClass) 動態組成
];
const used = new Set([...htmlKeys, ...tCalls]);
check('沒有沒人用的孤兒字典鍵',
  zhKeys.filter(k => !used.has(k) && !DYNAMIC_PREFIXES.some(p => k.startsWith(p))));

/* ---- 6. CSS 閘門 -------------------------------------------------------- */
check('styles.css 定義了所有模式閘門 class',
  ['gate', 'g-fba', 'g-fbm', 'g-adv', 'g-twm', 'js-hidden'].filter(c => !css.includes('.' + c)));
check('index.html 有載入 rates.js 與 app.js',
  ['rates.js', 'app.js'].filter(f => !html.includes(`src="${f}"`)));

/* ---- 7. rates.js 一致性 ------------------------------------------------- */
const catKeys = Object.keys(R.categories).filter(k => !k.startsWith('_'));
check('rates.js 每個品類都有市場洞察 (INSIGHTS 的 zh + en)',
  catKeys.filter(k => !(INSIGHTS[k] && INSIGHTS[k].zh && INSIGHTS[k].en))
    .map(k => `品類 "${k}" 缺 INSIGHTS`));
check('rates.js 每個品類都有 zh/en 名稱',
  catKeys.filter(k => {
    const c = R.categories[k];
    return !(c.label && c.label.zh && c.label.en);
  }).map(k => `品類 "${k}" 缺 label 翻譯`));
// 佣金說明文字是自動生成的，但選配的 hint 若存在必須雙語
check('rates.js 品類的 hint（若有）都是雙語',
  catKeys.filter(k => {
    const h = R.categories[k].hint;
    return h && !(h.zh && h.en);
  }).map(k => `品類 "${k}" 的 hint 缺翻譯`));
// 已改為自動生成，rates.js 不該再手寫 note
check('rates.js 的品類沒有手寫的 note（應由數字自動生成）',
  catKeys.filter(k => R.categories[k].note).map(k => `品類 "${k}" 還留著手寫 note`));

console.log(`\n字典鍵數：zh ${zhKeys.length} / en ${enKeys.length}｜品類 ${catKeys.length} 個`);
console.log(problems === 0 ? '✅ 靜態檢查全部通過\n' : `❌ 共 ${problems} 個問題\n`);
process.exit(problems === 0 ? 0 : 1);
