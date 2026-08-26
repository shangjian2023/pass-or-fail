'use strict';

const test = require('node:test');
const assert = require('node:assert');
const Calc = require('../js/calc.js');

// ── computeNeeded:正常路径 ───────────────────────────────────────
test('三段制:平时85×30% + 期中72×20%,目标60 → 期末≥41', () => {
  const r = Calc.computeNeeded({ usual: 85, usualWeight: 30, midterm: 72, midtermWeight: 20, goal: 60 });
  assert.strictEqual(r.ok, true);
  // (60 − 85×0.3 − 72×0.2) / 0.5 = 20.1 / 0.5 = 40.2 → 向上取整 41
  assert.strictEqual(r.needed, 41);
  assert.strictEqual(r.status, 'normal');
});

test('两段制:平时80×40%,目标60 → (60−32)/0.6 = 46.67 → 47', () => {
  const r = Calc.computeNeeded({ usual: 80, usualWeight: 40, goal: 60 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.needed, 47);
});

test('已稳过:平时95×70%,目标60 → 需求为负 → easy 且展示 0', () => {
  const r = Calc.computeNeeded({ usual: 95, usualWeight: 70, goal: 60 });
  // (60 − 66.5) / 0.3 = −21.67 → 向上取整 −21
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.status, 'easy');
  assert.strictEqual(r.needed, 0);
  assert.ok(r.rawNeeded < 0);
});

test('恰好整除时不虚高:平时60×50%,目标60 → (60−30)/0.5 = 60', () => {
  const r = Calc.computeNeeded({ usual: 60, usualWeight: 50, goal: 60 });
  assert.strictEqual(r.needed, 60);
  assert.strictEqual(r.status, 'normal');
});

test('神仙难救:平时10×20%,目标90 → 需要110 → impossible', () => {
  const r = Calc.computeNeeded({ usual: 10, usualWeight: 20, goal: 90 });
  // (90 − 2) / 0.8 = 110
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.status, 'impossible');
  assert.strictEqual(r.rawNeeded, 110);
  assert.strictEqual(r.needed, 110); // needed 只是防负数下限,不为 impossible 封顶
});

test('临界区间:平时30×25%,目标80 → 96.67 → 97 → extreme 而非 impossible', () => {
  const r = Calc.computeNeeded({ usual: 30, usualWeight: 25, goal: 80 });
  assert.strictEqual(r.status, 'extreme');
  assert.strictEqual(r.needed, 97);
});

// ── computeNeeded:边界与非法输入 ─────────────────────────────────
test('平时占比100% → 明确报错(修复:原版除零产生 Infinity 导致动画死循环)', () => {
  const r = Calc.computeNeeded({ usual: 85, usualWeight: 100, goal: 60 });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /期末占比已是 0/);
});

test('平时+期中占比 ≥ 100% → 报错', () => {
  const r = Calc.computeNeeded({ usual: 85, usualWeight: 60, midterm: 90, midtermWeight: 40, goal: 60 });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /≥ 100%/);
});

test('期中占比>0 但期中成绩为空 → 报错', () => {
  const r = Calc.computeNeeded({ usual: 85, usualWeight: 40, midterm: '', midtermWeight: 20, goal: 60 });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /期中成绩/);
});

test('期中有分但没填占比 → 报错,不允许半个期中', () => {
  const r = Calc.computeNeeded({ usual: 85, usualWeight: 40, midterm: 72, midtermWeight: '', goal: 60 });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /期中占比/);
});

test('越界数值:平时分 101 / 权重 -5 / 目标 150 → 报错', () => {
  assert.strictEqual(Calc.computeNeeded({ usual: 101, usualWeight: 40, goal: 60 }).ok, false);
  assert.strictEqual(Calc.computeNeeded({ usual: 85, usualWeight: -5, goal: 60 }).ok, false);
  assert.strictEqual(Calc.computeNeeded({ usual: 85, usualWeight: 40, goal: 150 }).ok, false);
});

test('非数字字符串 → 报错而非 NaN 传播', () => {
  assert.strictEqual(Calc.computeNeeded({ usual: 'abc', usualWeight: 40, goal: 60 }).ok, false);
  assert.strictEqual(Calc.computeNeeded({ usual: '', usualWeight: 40, goal: 60 }).ok, false);
});

test('字符串数字(输入框原始值)可用:85×40% + 72×20%,目标80 → 79', () => {
  const r = Calc.computeNeeded({ usual: '85', usualWeight: '40', midterm: '72', midtermWeight: '20', goal: '80' });
  // (80 − 34 − 14.4) / 0.4 = 79
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.needed, 79);
});

// ── encodeState / decodeHash:分享链接 ───────────────────────────
test('encode→decode 往返一致', () => {
  const s = { usual: '85', usualWeight: 40, midterm: '72', midtermWeight: '20', goal: 80 };
  const back = Calc.decodeHash(Calc.encodeState(s));
  assert.deepStrictEqual(back, { usual: '85', usualWeight: 40, midterm: '72', midtermWeight: '20', goal: 80 });
});

test('两段制编码省略期中字段', () => {
  const h = Calc.encodeState({ usual: '90', usualWeight: 30, midterm: '', midtermWeight: '', goal: 60 });
  assert.strictEqual(h, '#u=90&w=30&g=60');
  const back = Calc.decodeHash(h);
  assert.strictEqual(back.midterm, '');
});

test('decodeHash 容错:坏值忽略、缺字段补默认、空 hash 返回 null', () => {
  const r = Calc.decodeHash('#u=999&w=-3&g=60&x=1');
  assert.strictEqual(r.usual, '');
  assert.strictEqual(r.usualWeight, 40);
  assert.strictEqual(r.goal, 60);
  assert.strictEqual(Calc.decodeHash(''), null);
  assert.strictEqual(Calc.decodeHash('#nope'), null);
});

// ── formatShareText ─────────────────────────────────────────────
test('分享文案:普通需求带分数,impossible 带补考提示,easy 是躺平', () => {
  const n = Calc.computeNeeded({ usual: 80, usualWeight: 40, goal: 60 });
  assert.match(Calc.formatShareText(n), /47 分/);
  const imp = Calc.computeNeeded({ usual: 10, usualWeight: 20, goal: 90 });
  assert.match(Calc.formatShareText(imp), /110 分/);
  assert.match(Calc.formatShareText(imp), /补考/);
  const easy = Calc.computeNeeded({ usual: 95, usualWeight: 70, goal: 60 });
  assert.match(Calc.formatShareText(easy), /躺平/);
});
