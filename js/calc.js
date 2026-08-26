/*
 * 期末急救计算器 — 纯计算模块
 * 无 DOM 依赖:浏览器里挂到 window.Calc,Node 里通过 require() 供测试使用。
 *
 * 核心公式(总评 = 平时×w1 + 期中×w2 + 期末×w3,w1+w2+w3=1):
 *   期末至少需要 = (目标总分 − 平时×w1 − 期中×w2) / w3,向上取整
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api; // Node(测试环境)
  }
  root.Calc = api; // 浏览器经典脚本
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var WEIGHT_MAX = 100;

  function isNum(v) {
    return typeof v === 'number' ? isFinite(v) : v !== '' && v != null && isFinite(Number(v));
  }

  /**
   * 反推期末所需最低分。
   * @param {object} input
   *   usual         平时成绩 0-100
   *   usualWeight   平时占比 0-100(%)
   *   midterm       期中成绩 0-100,可为空(表示无期中)
   *   midtermWeight 期中占比 0-100(%),可为空
   *   goal          目标总分 0-100
   * @returns {{ok:true, needed:number, rawNeeded:number, status:string, finalWeight:number}}
   *          或 {ok:false, error:string}
   *   status: easy(已稳过) / normal(≤60) / hard(≤90) / extreme(≤100) / impossible(>100)
   */
  function computeNeeded(input) {
    var usual = Number(input.usual);
    var w1 = Number(input.usualWeight);
    var hasMid = input.midterm !== '' && input.midterm != null;
    var mid = hasMid ? Number(input.midterm) : 0;
    var w2 = hasMid || (input.midtermWeight !== '' && input.midtermWeight != null)
      ? Number(input.midtermWeight || 0) : 0;
    var goal = Number(input.goal);

    if (!isNum(input.usual) || usual < 0 || usual > WEIGHT_MAX) {
      return { ok: false, error: '平时分需要在 0-100 之间' };
    }
    if (!isNum(input.usualWeight) || w1 < 0 || w1 > WEIGHT_MAX) {
      return { ok: false, error: '平时分占比需要在 0-100 之间' };
    }
    if (w2 > 0 && (!hasMid || !isNum(input.midterm) || mid < 0 || mid > WEIGHT_MAX)) {
      return { ok: false, error: '填了期中占比,请把期中成绩(0-100)也填上' };
    }
    if (hasMid && (!isNum(input.midtermWeight) || w2 < 0 || w2 > WEIGHT_MAX)) {
      return { ok: false, error: '期中占比需要在 0-100 之间' };
    }
    if (!isNum(input.goal) || goal < 0 || goal > WEIGHT_MAX) {
      return { ok: false, error: '目标分数需要在 0-100 之间' };
    }

    var finalWeight = 1 - w1 / WEIGHT_MAX - w2 / WEIGHT_MAX;
    if (finalWeight <= 0) {
      return {
        ok: false,
        error: '期末占比已是 0(平时' + w1 + '% + 期中' + w2 + '% ≥ 100%)——总评已定,期末考多少都不影响'
      };
    }

    // 浮点防护:31.6/0.4 可能算出 79.00000000000001,直接 ceil 会虚高 1 分
    var needRatio = (goal - (usual * w1 + mid * w2) / WEIGHT_MAX) / finalWeight;
    var rawNeeded = Math.ceil(needRatio - 1e-9);

    var status;
    if (rawNeeded <= 0) status = 'easy';
    else if (rawNeeded <= 60) status = 'normal';
    else if (rawNeeded <= 90) status = 'hard';
    else if (rawNeeded <= WEIGHT_MAX) status = 'extreme';
    else status = 'impossible';

    return {
      ok: true,
      needed: Math.max(0, rawNeeded), // 展示用的安全值(不低于 0)
      rawNeeded: rawNeeded, // impossible 状态下用它展示真实需求(可能 >100)
      status: status,
      finalWeight: finalWeight
    };
  }

  /**
   * 把场景编码进 URL hash,用于分享。
   * @returns {string} 形如 "#u=85&w=40&m=72&mw=20&g=60"
   */
  function encodeState(s) {
    var p = [];
    p.push('u=' + encodeURIComponent(s.usual));
    p.push('w=' + encodeURIComponent(s.usualWeight));
    if (s.midterm !== '' && s.midterm != null) p.push('m=' + encodeURIComponent(s.midterm));
    if (s.midtermWeight) p.push('mw=' + encodeURIComponent(s.midtermWeight));
    p.push('g=' + encodeURIComponent(s.goal));
    return '#' + p.join('&');
  }

  /**
   * 解析 URL hash(容错:缺字段补默认,坏值忽略,未知字段丢弃)。
   * @returns {{usual:string, usualWeight:number, midterm:string, midtermWeight:string, goal:number}|null}
   *          hash 里一个有效字段都没有时返回 null。
   */
  function decodeHash(hash) {
    if (!hash || hash.charAt(0) !== '#') return null;
    var q = {};
    hash.slice(1).split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    var seen = false;
    var out = { usual: '', usualWeight: 40, midterm: '', midtermWeight: '', goal: 60 };

    var u = Number(q.u);
    if (isNum(u) && u >= 0 && u <= 100) { out.usual = String(Math.round(u)); seen = true; }
    var w = Number(q.w);
    if (isNum(w) && w >= 0 && w <= 100) { out.usualWeight = Math.round(w); seen = true; }
    if (q.m !== undefined) {
      var m = Number(q.m);
      if (isNum(m) && m >= 0 && m <= 100) { out.midterm = String(Math.round(m)); seen = true; }
    }
    if (q.mw !== undefined) {
      var mw = Number(q.mw);
      if (isNum(mw) && mw >= 0 && mw <= 100) { out.midtermWeight = String(Math.round(mw)); seen = true; }
    }
    var g = Number(q.g);
    if (isNum(g) && g >= 0 && g <= 100) { out.goal = Math.round(g); seen = true; }

    return seen ? out : null;
  }

  /**
   * 生成分享文案。
   * @param {object} r computeNeeded 的成功结果
   */
  function formatShareText(r) {
    if (r.status === 'easy') return '期末急救计算器:躺平了,期末考 0 分也能过 🎉';
    var n = r.status === 'impossible' ? r.rawNeeded : r.needed;
    var suffix = r.status === 'impossible' ? '(神仙难救,准备补考吧)' : '';
    return '期末急救计算器:期末至少要考 ' + n + ' 分' + suffix + '!';
  }

  return { computeNeeded: computeNeeded, encodeState: encodeState, decodeHash: decodeHash, formatShareText: formatShareText };
});
