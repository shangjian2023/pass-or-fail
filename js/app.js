/*
 * 期末急救计算器 — DOM 交互层
 * 计算逻辑全部在 calc.js(纯函数,有单测),这里只负责取值、渲染和事件。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'pof:state';
  var RESCUE_KEY = 'pof:rescues';

  var state = {
    usualScore: '',      // 平时分(数字字符串)
    weight: 40,          // 平时分占比 %
    midtermScore: '',    // 期中分(可空)
    midtermWeight: '',   // 期中占比 %(可空)
    goalScore: 60,       // 目标总分
    calcCount: parseInt(localStorage.getItem('calcCount') || '0', 10),
    lastCalcDate: localStorage.getItem('lastCalcDate') || ''
  };

  // ── 每日计算次数(彩蛋用)──────────────────────────────────────
  var today = new Date().toDateString();
  if (state.lastCalcDate !== today) {
    state.calcCount = 0;
    state.lastCalcDate = today;
    localStorage.setItem('calcCount', '0');
    localStorage.setItem('lastCalcDate', today);
  }

  // ── 持久化:记住上次输入,下次打开免重填 ───────────────────────
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        usualScore: state.usualScore,
        weight: state.weight,
        midtermScore: state.midtermScore,
        midtermWeight: state.midtermWeight,
        goalScore: state.goalScore
      }));
    } catch (e) { /* 隐私模式下 localStorage 可能不可用,静默降级 */ }
  }

  function restoreState() {
    var shared = Calc.decodeHash(location.hash);
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { /* 忽略坏数据 */ }

    // 分享链接优先于本机记忆
    var src = shared || saved;
    if (!src) return;
    if (src.usual !== undefined && src.usual !== '') state.usualScore = String(Math.round(Number(src.usual)));
    if (isFinite(Number(src.usualWeight))) state.weight = Math.min(100, Math.max(0, Math.round(Number(src.usualWeight))));
    if (src.midterm !== undefined && src.midterm !== '') state.midtermScore = String(Math.round(Number(src.midterm)));
    if (src.midtermWeight !== undefined && src.midtermWeight !== '') state.midtermWeight = String(Math.round(Number(src.midtermWeight)));
    if (isFinite(Number(src.goal))) state.goalScore = Math.min(100, Math.max(0, Math.round(Number(src.goal))));
  }

  // ── 小工具 ────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function showError(message) {
    var toast = $('errorToast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showError.timer);
    showError.timer = setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }

  function shakeElement(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 300);
  }

  // ── 平时分数字键盘 ────────────────────────────────────────────
  function inputNumber(num) {
    if (state.usualScore.length >= 3) return;
    state.usualScore += num;
    if (parseInt(state.usualScore, 10) > 100) {
      showError('平时分不能超过100分');
      state.usualScore = state.usualScore.slice(0, -1);
      shakeElement('.score-display');
      return;
    }
    updateScoreDisplay();
    saveState();
  }

  function clearScore() {
    state.usualScore = '';
    updateScoreDisplay();
    saveState();
  }

  function deleteLast() {
    state.usualScore = state.usualScore.slice(0, -1);
    updateScoreDisplay();
    saveState();
  }

  function updateScoreDisplay() {
    var display = $('scoreDisplay');
    if (state.usualScore === '') {
      display.textContent = '--';
      display.classList.add('placeholder');
    } else {
      display.textContent = state.usualScore;
      display.classList.remove('placeholder');
    }
  }

  // ── 平时分权重 ────────────────────────────────────────────────
  function selectWeight(weight) {
    state.weight = weight;
    $('customWeight').value = '';
    document.querySelectorAll('.weight-bubble').forEach(function (bubble) {
      bubble.classList.remove('selected');
      if (parseInt(bubble.dataset.weight, 10) === weight) bubble.classList.add('selected');
    });
    var hints = {
      30: '30%: 期末考占主导,需要重点准备',
      40: '40%: 平时作业与期末考平衡配比',
      50: '50%: 平时分占比较高,基础扎实'
    };
    $('weightHint').textContent = hints[weight] || '自定义: 平时分占比' + weight + '%';
    saveState();
    updateFinalWeightHint();
  }

  function setCustomWeight(value) {
    var weight = parseInt(value, 10);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      showError('请输入0-100之间的数字');
      return;
    }
    state.weight = weight;
    document.querySelectorAll('.weight-bubble').forEach(function (bubble) {
      bubble.classList.remove('selected');
    });
    $('weightHint').textContent = '自定义: 平时分占比' + weight + '%';
    saveState();
    updateFinalWeightHint();
  }

  // ── 期中成绩(可选)────────────────────────────────────────────
  function setMidtermScore(value) {
    var n = parseInt(value, 10);
    if (value !== '' && (isNaN(n) || n < 0 || n > 100)) {
      showError('期中成绩需在 0-100 之间');
      $('midtermScore').value = state.midtermScore;
      return;
    }
    state.midtermScore = value === '' ? '' : String(n);
    saveState();
  }

  function setMidtermWeight(value) {
    var n = parseInt(value, 10);
    if (value !== '' && (isNaN(n) || n < 0 || n > 100)) {
      showError('期中占比需在 0-100 之间');
      $('midtermWeight').value = state.midtermWeight;
      return;
    }
    state.midtermWeight = value === '' ? '' : String(n);
    saveState();
    updateFinalWeightHint();
  }

  function updateFinalWeightHint() {
    var w2 = state.midtermWeight === '' ? 0 : parseInt(state.midtermWeight, 10) || 0;
    var fin = 100 - state.weight - w2;
    var hint = $('finalWeightHint');
    if (!hint) return;
    if (fin > 0) {
      hint.textContent = '当前期末占比:' + fin + '%';
      hint.classList.remove('bad');
    } else {
      hint.textContent = '期末占比:' + fin + '%——占比不合法,期末已无法影响总评';
      hint.classList.add('bad');
    }
  }

  // ── 目标分数 ──────────────────────────────────────────────────
  function selectGoal(score, type) {
    state.goalScore = score;
    $('goalSlider').value = score;
    $('sliderValue').textContent = score + '分';
    document.querySelectorAll('.goal-card').forEach(function (card) {
      card.classList.remove('selected');
    });
    var card = document.querySelector('.goal-card.' + type);
    if (card) card.classList.add('selected');
    saveState();
  }

  function updateSliderValue(value) {
    state.goalScore = parseInt(value, 10);
    $('sliderValue').textContent = value + '分';
    document.querySelectorAll('.goal-card').forEach(function (card) {
      card.classList.remove('selected');
    });
    saveState();
  }

  // ── 计算 ──────────────────────────────────────────────────────
  var lastResult = null;

  function calculate() {
    if (state.usualScore === '') {
      showError('请输入平时分');
      shakeElement('.score-display');
      return;
    }
    var r = Calc.computeNeeded({
      usual: state.usualScore,
      usualWeight: state.weight,
      midterm: state.midtermScore,
      midtermWeight: state.midtermWeight,
      goal: state.goalScore
    });
    if (!r.ok) {
      showError(r.error);
      return;
    }

    state.calcCount++;
    localStorage.setItem('calcCount', String(state.calcCount));
    var rescues = (parseInt(localStorage.getItem(RESCUE_KEY) || '0', 10) || 0) + 1;
    try { localStorage.setItem(RESCUE_KEY, String(rescues)); } catch (e) { /* 隐私模式 */ }
    updateRescueCount();

    lastResult = r;
    showResult(r);
  }

  // ── 彩带(canvas-confetti v1.9,MIT,vendor 于 js/vendor/)─────
  function fireConfetti(kind) {
    if (typeof window.confetti !== 'function') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var colors = ['#D97757', '#C4633F', '#FAF9F5', '#6C8F6A', '#1F1E1D'];
    try {
      if (kind === 'easy') {
        // 稳了:两侧礼炮 + 中央散花
        window.confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors: colors });
        window.confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors: colors });
        window.confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, colors: colors });
      } else if (kind === 'normal') {
        // 问题不大:小规模庆祝
        window.confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 }, colors: colors });
      } else if (kind === 'lucky') {
        // 彩蛋"领取好运"
        window.confetti({ particleCount: 60, spread: 75, origin: { y: 0.55 }, colors: colors, scalar: 0.9 });
      }
    } catch (e) { /* 彩带失败不影响功能 */ }
  }

  // ── 结果渲染 ──────────────────────────────────────────────────
  function showResult(r) {
    var resultCard = $('resultCard');
    var icon, title, subtitle, action, meme;
    var displayScore = r.status === 'impossible' ? r.rawNeeded : r.needed;

    if (r.status === 'easy') {
      icon = '🎉'; title = '稳了!已经稳了!(๑•̀ㅂ•́)و✧';
      subtitle = '期末考个寂寞都能过~'; action = '躺平模式已开启'; meme = '这就是学霸的世界吗.jpg';
    } else if (r.status === 'normal') {
      icon = '😌'; title = '问题不大,稳如老狗(｡•̀ᴗ-)✧';
      subtitle = '稍微看看书就过了,别慌~'; action = '正常复习,该吃吃该喝喝'; meme = '这波不亏,甚至血赚';
    } else if (r.status === 'hard') {
      icon = '💪'; title = '有点东西,但东西不多(；′⌒`)';
      subtitle = '需要加把劲了,兄弟!'; action = '开启爆肝模式,冲鸭!'; meme = '我命由我不由天!';
    } else if (r.status === 'extreme') {
      icon = '🚑'; title = '危!建议直接准备补考Σ(っ°Д°;)っ';
      subtitle = '这...这真的能考出来吗?'; action = '转发锦鲤,求老师捞捞'; meme = '老师,楼上的风好大,我好害怕';
    } else {
      icon = '☠️'; title = '神仙难救,准备补考吧(っ˘̩╭╮˘̩)っ';
      subtitle = '就算期末考满分也差 ' + (r.rawNeeded - 100) + ' 分,看看别的路吧';
      action = '平时分满分也补不回来了'; meme = '成绩单,我一时间竟不知该藏在哪';
    }

    resultCard.className = 'card result-card ' + (r.status === 'impossible' ? 'extreme' : r.status);
    $('resultIcon').textContent = icon;
    $('resultTitle').textContent = title;
    $('resultSubtitle').textContent = subtitle;
    $('resultAction').textContent = action;
    $('resultMeme').textContent = meme;

    animateNumber($('resultScore'), displayScore);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        resultCard.classList.add('show');
      });
    });

    setTimeout(function () {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);

    playSound();
    fireConfetti(r.status);
    buildTargetQuick(r);
    initSim(r);
  }

  var animTimer = null;
  function animateNumber(element, target) {
    // 防御:目标必须是有限数,且先停掉上一次未完成的动画
    if (!isFinite(target) || target < 0) { element.textContent = '?'; return; }
    clearInterval(animTimer);
    var duration = 500, steps = 20;
    var increment = target / steps, current = 0;
    animTimer = setInterval(function () {
      current += increment;
      if (current >= target) { current = target; clearInterval(animTimer); }
      element.textContent = Math.round(current);
    }, duration / steps);
  }

  // ── 期末模拟器:拖动「假设期末考 X 分」,实时算总评 ─────────
  function initSim(r) {
    var s = $('simSlider');
    s.value = Math.min(100, Math.max(0, r.needed));
    updateSim(s.value);
  }

  function updateSim(v) {
    var fin = parseInt(v, 10);
    $('simSliderValue').textContent = fin + '分';
    var el = $('simTotal');
    var t = Calc.computeTotal({
      usual: state.usualScore,
      usualWeight: state.weight,
      midterm: state.midtermScore,
      midtermWeight: state.midtermWeight,
      final: fin
    });
    if (!t.ok) { el.className = 'sim-total bad'; el.textContent = t.error; return; }
    var pass = t.total >= 60;
    el.className = 'sim-total ' + (pass ? 'good' : 'bad');
    el.textContent = '总评 ' + t.total + ' 分 · ' + (pass ? '稳过 ✓' : '挂科 ✗');
  }

  // ── 多目标速览:及格/优秀/满绩一次算清,不用来回拖滑杆 ────────
  function buildTargetQuick(r) {
    var host = $('targetQuick');
    if (!host) return;
    var labels = { 60: '及格', 80: '优秀', 90: '满绩' };
    var html = '';
    [60, 80, 90].forEach(function (g) {
      var q = Calc.computeNeeded({
        usual: state.usualScore,
        usualWeight: state.weight,
        midterm: state.midtermScore,
        midtermWeight: state.midtermWeight,
        goal: g
      });
      var dot = !q.ok || q.status === 'impossible' ? 'bad' : (q.status === 'easy' ? 'ok' : 'warn');
      var txt = !q.ok ? q.error
        : q.status === 'easy' ? '已经稳过,躺平'
        : q.status === 'impossible' ? '需期末 ' + q.rawNeeded + ' 分,神仙难救'
        : '期末 ≥ ' + q.needed + ' 分';
      html += '<div class="tq-row"><span class="tq-dot ' + dot + '"></span>'
        + '<span class="tq-goal">' + labels[g] + ' ' + g + '</span>'
        + '<span class="tq-txt">' + txt + '</span></div>';
    });
    host.innerHTML = html;
  }

  // ── 考试倒计时:日期存本地,徽章实时显示,临期 7 天转红脉冲 ────
  var EXAM_KEY = 'pof:examDate';

  function setExamDate(v) {
    try { localStorage.setItem(EXAM_KEY, v || ''); } catch (e) { /* 隐私模式 */ }
    $('examDate').value = v || '';
    updateExamBadge();
  }

  function updateExamBadge() {
    var badge = document.querySelector('.countdown-text');
    var pill = document.querySelector('.countdown-badge');
    var hint = $('examHint');
    var v = '';
    try { v = localStorage.getItem(EXAM_KEY) || ''; } catch (e) { /* 忽略 */ }
    if (!v) {
      if (badge) badge.textContent = '急救模式';
      if (hint) hint.textContent = '';
      if (pill) pill.classList.remove('urgent');
      return;
    }
    var days = Math.ceil((new Date(v + 'T23:59:59') - new Date()) / 86400000);
    var label = days > 0 ? '距考试 ' + days + ' 天' : days === 0 ? '今天考试!' : '考完 ' + (-days) + ' 天';
    if (badge) badge.textContent = label;
    if (hint) hint.textContent = label;
    if (pill) pill.classList.toggle('urgent', days >= 0 && days <= 7);
  }

  // ── 分享 ──────────────────────────────────────────────────────
  function showShareModal() {
    if (!lastResult) {
      showError('先点一次「启动急救计算」');
      return;
    }
    $('shareScore').textContent = lastResult.status === 'impossible' ? lastResult.rawNeeded : lastResult.needed;
    var messages = [
      '转发这张急救符,考试必过!',
      '考神附体,逢考必过!',
      '急救方案已生成,期末有救了!',
      '锦鲤附体,高分通过!'
    ];
    $('shareMessage').textContent = messages[Math.floor(Math.random() * messages.length)];
    $('shareModal').classList.add('show');
  }

  function hideShareModal() {
    $('shareModal').classList.remove('show');
  }

  function shareLink() {
    return location.origin + location.pathname + Calc.encodeState({
      usual: state.usualScore,
      usualWeight: state.weight,
      midterm: state.midtermScore,
      midtermWeight: state.midtermWeight,
      goal: state.goalScore
    });
  }

  // navigator.share(手机上直接拉起微信等),没有就退化为复制
  function shareNative() {
    var text = Calc.formatShareText(lastResult);
    if (navigator.share) {
      navigator.share({ title: '期末急救计算器', text: text, url: shareLink() })
        .catch(function () { /* 用户取消 */ });
    } else {
      copyToClipboard(text + ' ' + shareLink()) ? showError('已复制文案和链接') : showError('复制失败,请手动复制');
    }
  }

  function copyResult() {
    if (copyToClipboard(Calc.formatShareText(lastResult))) showError('已复制到剪贴板');
    else showError('复制失败,请手动复制');
  }

  function copyLink() {
    if (copyToClipboard(shareLink())) showError('链接已复制,发给同学直接打开就是你的场景');
    else showError('复制失败,请手动复制');
  }

  // clipboard API 只在安全上下文可用;file:// 或旧浏览器走 execCommand 兜底
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  // ── 彩蛋 ──────────────────────────────────────────────────────
  function showEasterEgg() {
    $('calcCount').textContent = state.calcCount;
    var luckValue = Math.min(100, 30 + Math.floor(Math.random() * 71));
    $('luckValue').textContent = luckValue + '%';
    $('easterEggModal').classList.add('show');
    setTimeout(function () { $('luckFill').style.width = luckValue + '%'; }, 100);
  }

  function hideEasterEgg() {
    $('easterEggModal').classList.remove('show');
    $('luckFill').style.width = '0%';
    fireConfetti('lucky'); // 领好运,来一发
  }

  function closeModal(event) {
    if (event.target.classList.contains('modal-overlay')) {
      event.target.classList.remove('show');
    }
  }

  // ── 声音(单例,避免每次计算泄漏一个 AudioContext)────────────
  var audioCtx = null;
  function playSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var oscillator = audioCtx.createOscillator();
      var gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) { /* 音频失败不影响功能 */ }
  }

  // ── 诚实的计数:显示"你自己"算过多少次,不再伪造在线人数 ──────
  function updateRescueCount() {
    var el = $('userCount');
    if (!el) return;
    var n = parseInt(localStorage.getItem(RESCUE_KEY) || '0', 10) || 0;
    el.textContent = n;
  }

  // ── 初始化 ────────────────────────────────────────────────────
  function applyRestoredState() {
    updateScoreDisplay();

    if (state.weight === 30 || state.weight === 40 || state.weight === 50) {
      selectWeight(state.weight);
    } else {
      document.querySelectorAll('.weight-bubble').forEach(function (b) { b.classList.remove('selected'); });
      $('customWeight').value = state.weight;
      $('weightHint').textContent = '自定义: 平时分占比' + state.weight + '%';
    }

    $('midtermScore').value = state.midtermScore;
    $('midtermWeight').value = state.midtermWeight;

    if (state.goalScore === 60 || state.goalScore === 80 || state.goalScore === 90) {
      selectGoal(state.goalScore, state.goalScore === 60 ? 'pass' : state.goalScore === 80 ? 'gpa' : 'master');
    } else {
      $('goalSlider').value = state.goalScore;
      $('sliderValue').textContent = state.goalScore + '分';
    }
    updateFinalWeightHint();
  }

  var savedDate = '';
  try { savedDate = localStorage.getItem(EXAM_KEY) || ''; } catch (e) {}
  $('examDate').value = savedDate;
  updateExamBadge();

  document.addEventListener('keydown', function (e) {
    // 正在输入框里打字时不要抢按键(否则自定义权重里输 40 会同时填进平时分)
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var modalOpen = document.querySelector('.modal-overlay.show');
    if (modalOpen) {
      if (e.key === 'Escape') modalOpen.classList.remove('show');
      return;
    }
    if (e.key >= '0' && e.key <= '9') inputNumber(parseInt(e.key, 10));
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape') clearScore();
    else if (e.key === 'Enter') calculate();
  });

  restoreState();
  applyRestoredState();
  updateRescueCount();

  // PWA:离线缓存(仅 https 生产环境,file:// 下静默跳过)
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* 离线缓存失败不影响使用 */ });
  }
})();
