/* ============================================================
   涟帆祈雨手写生成器 · app.js
   界面、状态、字体、导入导出
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = HW.clamp;
  const STORE_KEY = 'lianfan.state.v3';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------- 字体目录 ---------------- */
  const FONT_DEFS = [
    { id: 'chenyu', name: '辰宇落雁', tag: '细笔 · 清瘦行写', lang: 'zh', file: 'ChenYuluoyan-Thin.ttf', desc: '细硬笔，笔画清瘦，收笔利落。' },
    { id: 'wenkai', name: '霞鹜文楷', tag: '楷体 · 工整', lang: 'zh', file: 'LXGWWenKaiLite-Regular.ttf', desc: '手写楷书，结构端正，适合长篇。' },
    { id: 'zhimang', name: '志莽行书', tag: '毛笔 · 飞白', lang: 'zh', file: 'ZhiMangXing-Regular.ttf', desc: '毛笔行书，提按明显，有飞白。' },
    { id: 'mashanzheng', name: '马善政', tag: '毛笔 · 厚重', lang: 'zh', file: 'MaShanZheng-Regular.ttf', desc: '粗重毛笔字，收笔有力。' },
    { id: 'longcang', name: '龙藏', tag: '毛笔 · 狂放', lang: 'zh', file: 'LongCang-Regular.ttf', desc: '字势舒展，墨色浓重，适合短句。' },
    { id: 'liujian', name: '刘建毛草', tag: '草书 · 奔放', lang: 'zh', file: 'LiuJianMaoCao-Regular.ttf', desc: '草书，连笔多，辨识度较低。' },
    { id: 'kai', name: '系统楷体', tag: '系统 · 楷书', lang: 'zh', file: '', css: "'KaiTi','KaiTi_GB2312','STKaiti','楷体',serif", desc: '调用本机楷体，无需加载字体文件。' },
    { id: 'xingkai', name: '系统行楷', tag: '系统 · 行书', lang: 'zh', file: '', css: "'STXingkai','华文行楷','KaiTi','楷体',serif", desc: '需本机装有华文行楷，否则回退楷体。' },
    { id: 'kalam', name: 'Kalam', tag: 'English · ink', lang: 'en', file: 'Kalam-Regular.ttf', desc: '英文手写，墨迹有粗细起伏。' },
    { id: 'indie', name: 'Indie Flower', tag: 'English · doodle', lang: 'en', file: 'IndieFlower-Regular.ttf', desc: '涂鸦感的英文手写。' },
    { id: 'patrick', name: 'Patrick Hand', tag: 'English · friendly', lang: 'en', file: 'PatrickHand-Regular.ttf', desc: '英文笔记体，字迹圆钝。' },
    { id: 'handlee', name: 'Handlee', tag: 'English · casual', lang: 'en', file: 'Handlee-Regular.ttf', desc: '窄体英文手写。' },
    { id: 'shadows', name: 'Shadows Into Light', tag: 'English · rounded', lang: 'en', file: 'ShadowsIntoLight-Regular.ttf', desc: '圆润、略右倾的英文手写。' },
  ];

  const PAPERS = [
    { id: 'photo', name: '实拍横线纸', badge: '实拍', paperColor: '#fdfbf3', lineColor: '#93b7c9' },
    { id: 'blank', name: 'A4 纯白', badge: '纯白', paperColor: '#ffffff', lineColor: '#cfc9bb' },
    { id: 'lined', name: '米色横线', paperColor: '#fbf6ea', lineColor: '#bd5f4d' },
    { id: 'grid', name: '方格稿纸', paperColor: '#fdfaf1', lineColor: '#7d9f89' },
    { id: 'tian', name: '田字格', paperColor: '#fdfaf1', lineColor: '#a3b19b' },
    { id: 'letter', name: '双线信纸', paperColor: '#fcf9f5', lineColor: '#c9a1a1' },
    { id: 'dot', name: '点阵笔记', paperColor: '#fbfaf5', lineColor: '#98a198' },
    { id: 'kraft', name: '牛皮纸', paperColor: '#e8d5b5', lineColor: '#a9825a' },
  ];

  const THEMES = [
    { id: 'ocean', name: '深蓝 · 白', desc: '#004082 渐变蓝 + 白面板（默认）', c1: '#001d3d', c2: '#004082', c3: '#0a5cab', c4: '#1e7ac0', accent: '#004082', accent2: '#0a5cab', weak: '#e8f1fb', line: '#bcd6ee', surface: '#f2f7fd', dot: '#bcd6ee' },
    { id: 'indigo', name: '靛蓝 · 雾', desc: '更深靛青，对比更强', c1: '#061a33', c2: '#123a6b', c3: '#1d518c', c4: '#2a6aa8', accent: '#123a6b', accent2: '#1d518c', weak: '#e9f0f8', line: '#c3d5e8', surface: '#f3f7fb', dot: '#c3d5e8' },
    { id: 'azure', name: '湖蓝 · 雪', desc: '偏青湖蓝，明度更高', c1: '#06324f', c2: '#0f6fae', c3: '#1a8ac9', c4: '#37a3d8', accent: '#0f6fae', accent2: '#1a8ac9', weak: '#e6f4fb', line: '#b9dcf0', surface: '#f2f9fd', dot: '#b9dcf0' },
    { id: 'midnight', name: '墨蓝 · 夜', desc: '深色界面，纸张保持原色', c1: '#010a15', c2: '#04203a', c3: '#062d4f', c4: '#0a3a63', accent: '#3f9ae0', accent2: '#5cb0ee', weak: '#0f2b45', line: '#2a557c', surface: '#061627', dot: '#1c3b5a', dark: true },
  ];

  const INK_COLORS = [
    { name: '墨蓝', color: '#1b2b3d' },
    { name: '纯黑', color: '#17171a' },
    { name: '靛青', color: '#213b58' },
    { name: '墨绿', color: '#1f3d33' },
    { name: '赭石', color: '#5a3427' },
    { name: '紫墨', color: '#3a2f46' },
    { name: '批改红', color: '#a3352c' },
  ];

  const CORRECTION_LABELS = {
    strike: '划线', scribble: '乱线涂抹', circle: '画圈', blackout: '涂黑', erase: '擦除重写', mixed: '混合',
  };

  const SAMPLE_ZH = [
    '从明天起，做一个幸福的人',
    '喂马，劈柴，周游世界',
    '从明天起，关心粮食和蔬菜',
    '我有一所房子，面朝大海，春暖花开',
    '',
    '从明天起，和每一个亲人通信',
    '告诉他们我的幸福',
    '那幸福的闪电告诉我的',
    '我将告诉每一个人',
    '',
    '给每一条河每一座山取一个温暖的名字',
    '陌生人，我也为你祝福',
    '愿你有一个灿烂的前程',
    '愿你有情人终成眷属',
    '愿你在尘世获得幸福',
    '我只愿面朝大海，春暖花开',
  ].join('\n');

  const SAMPLE_EN = [
    'The quiet hours are the ones I remember best.',
    'Somewhere between the last train and the first birds, the city seems to hold its breath. Windows go dark one by one, and the street becomes a river of soft yellow light. I used to walk home along that river, notebook in hand, writing down small things: the smell of rain on warm pavement, a dog asleep in a doorway, the way the moon looked through the wires above the road.',
    'We grow up believing that these things will wait for us. Then one evening we look up and the street is different, and even the light seems to fall at another angle. Still, the notebook remembers.',
  ].join('\n');

  /* ---------------- 默认状态 ---------------- */
  function defaultSettings() {
    return {
      paperSize: 'A4', landscape: false, paperKind: 'photo',
      paperColor: '#fdfbf3', lineColor: '#93b7c9',
      fontSize: 23, lineHeight: 39, letterSpacing: 1.5, indent: 0, randomIndent: true,
      marginTop: 20, marginBottom: 20, marginLeft: 22, marginRight: 20,
      align: 'left', titleSize: 32,
      inkColor: '#1b2b3d', inkOpacity: 0.92, inkVariation: 0.22, inkBoost: 1,
      penWidth: 0.12, inkGrain: 0.22, inkDisturbanceRate: 0.25, inkDisturbanceStrength: 0.3,
      jitter: 1.3, rotation: 1.2, sizeVariation: 3, baselineWave: 2, lineTilt: 0, spacingVariation: 0.2,
      strokeMessiness: 0.42, looseness: 0.35, strokeVariation: 0.45,
      texture: 0.32, photoLight: true,
      correctionProbability: 0.008, correctionStyle: 'mixed',
      correctionMix: ['strike', 'scribble', 'circle', 'erase'],
      seed: 20240917, showPageNumber: true, theme: 'ocean',
    };
  }

  let state = {
    title: '面朝大海，春暖花开',
    text: SAMPLE_ZH,
    settings: defaultSettings(),
    fontId: 'chenyu',
    version: 2,
  };

  const ui = {
    tab: 'content', inkTab: 'shape', fontLang: 'zh', zoom: 100, page: 0,
    fonts: new Map(), fontSeq: 0, exportFormat: 'png', exportDpi: 300, exportRange: 'all',
  };

  /* ---------------- 历史与持久化 ---------------- */
  let history = [], redoStack = [];
  let currentSnap = '';
  let commitTimer = 0;
  let saveTimer = 0;

  const snapshot = () => JSON.stringify({ t: state.title, x: state.text, s: state.settings, f: state.fontId });

  function commit(delay = 0) {
    clearTimeout(commitTimer);
    commitTimer = setTimeout(() => {
      const snap = snapshot();
      if (snap === currentSnap) return;
      if (currentSnap) {
        history.push(currentSnap);
        if (history.length > 80) history.shift();
      }
      currentSnap = snap;
      redoStack.length = 0;
      updateHistoryButtons();
    }, delay);
  }

  function restore(snap) {
    const o = JSON.parse(snap);
    state.title = o.t; state.text = o.x; state.settings = o.s; state.fontId = o.f;
    syncTitleInputs();
    renderPanel();
    scheduleRender();
    saveLocal(400);
  }

  function undo() {
    if (!history.length) return toast('没有可撤销的操作');
    redoStack.push(snapshot());
    const prev = history.pop();
    restore(prev);
    currentSnap = prev;
    updateHistoryButtons();
    toast('已撤销');
  }
  function redo() {
    if (!redoStack.length) return toast('没有可重做的操作');
    history.push(snapshot());
    const next = redoStack.pop();
    restore(next);
    currentSnap = next;
    updateHistoryButtons();
    toast('已重做');
  }
  function updateHistoryButtons() {
    const u = $('#btnUndo'), r = $('#btnRedo');
    if (u) u.disabled = !history.length;
    if (r) r.disabled = !redoStack.length;
  }

  function saveLocal(delay = 700) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
        const el = $('#saveState');
        if (el) {
          el.textContent = '已保存到本机';
          el.classList.add('flash');
          setTimeout(() => el.classList.remove('flash'), 900);
        }
      } catch (e) { /* 忽略配额错误 */ }
    }, delay);
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return false;
      const o = JSON.parse(raw);
      if (!o || !o.settings) return false;
      state = {
        title: o.title ?? '', text: o.text ?? '', fontId: o.fontId || 'chenyu',
        settings: { ...defaultSettings(), ...o.settings }, version: 2,
      };
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- 字体加载 ---------------- */
  const FALLBACK_ORDER = ['wenkai', 'chenyu', 'kai'];

  async function loadFontDef(def) {
    if (ui.fonts.has(def.id) && ui.fonts.get(def.id).status === 'ready') return ui.fonts.get(def.id);
    const rec = {
      id: def.id, name: def.name, tag: def.tag, lang: def.lang,
      cssFamily: def.css || "'KaiTi','楷体',serif",
      otf: null, status: 'loading', def,
    };
    if (!def.file) { rec.status = 'ready'; ui.fonts.set(def.id, rec); return rec; }
    ui.fonts.set(def.id, rec);

    try {
      const res = await fetch('assets/fonts/' + def.file);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 4096) throw new Error('文件不完整');

      const family = 'ink-' + def.id;
      let cssOk = false;
      try {
        const face = new FontFace(family, buf.slice(0));
        await face.load();
        document.fonts.add(face);
        rec.cssFamily = `'${family}', 'KaiTi', serif`;
        cssOk = true;
      } catch (e) { /* 预览字体失败不影响路径渲染 */ }

      let parsed = false;
      if (typeof opentype !== 'undefined') {
        try { rec.otf = opentype.parse(buf); parsed = !!rec.otf; } catch (e) { rec.parseError = e.message; }
      }
      if (!cssOk && !parsed) throw new Error('字体文件无法解析');
      rec.status = 'ready';
    } catch (e) {
      rec.status = 'error';
      rec.error = e.message;
    }
    ui.fontSeq++;
    return rec;
  }

  async function ensureFonts() {
    const def = FONT_DEFS.find(f => f.id === state.fontId) || FONT_DEFS[0];
    await loadFontDef(def);
    // 后台逐个加载，不阻塞首屏
    setTimeout(async () => {
      for (const d of FONT_DEFS) {
        if (d.id === def.id) continue;
        await loadFontDef(d);
        if (ui.tab === 'font') renderPanel();
        scheduleRender(false);
        await new Promise(r => setTimeout(r, 60));
      }
      prefetchLayout();
    }, 300);
  }

  const glyphLookupCache = new Map();
  function fontHas(rec, ch) {
    if (!rec.otf) return false;
    const key = rec.id + '|' + ch;
    if (glyphLookupCache.has(key)) return glyphLookupCache.get(key);
    let has = false;
    try {
      const g = rec.otf.charToGlyph(ch);
      has = !!g && (g.index !== 0 || ch === '\u0000' || ch === ' ');
    } catch (e) { has = false; }
    glyphLookupCache.set(key, has);
    return has;
  }

  const SYS_FONT = { id: 'sys-kai', name: '系统楷体', cssFamily: "'KaiTi','KaiTi_GB2312','STKaiti','楷体',serif", otf: null, status: 'ready' };
  function resolveFont(ch) {
    const primary = ui.fonts.get(state.fontId);
    if (primary && primary.status === 'ready') {
      if (!primary.otf) return primary;
      if (fontHas(primary, ch)) return primary;
    }
    for (const id of FALLBACK_ORDER) {
      const rec = ui.fonts.get(id);
      if (rec && rec.status === 'ready' && (!rec.otf || fontHas(rec, ch))) return rec;
    }
    for (const rec of ui.fonts.values()) {
      if (rec.status === 'ready' && rec.otf && fontHas(rec, ch)) return rec;
    }
    return SYS_FONT;
  }

  /* ---------------- 预览渲染 ---------------- */
  let layoutData = null;
  let layoutKey = '';
  let renderTimer = 0;
  let rendering = false;

  function computeLayout() {
    const key = JSON.stringify([state.text, state.title, state.settings, state.fontId, ui.fontSeq]);
    if (key === layoutKey && layoutData) return layoutData;
    layoutKey = key;
    layoutData = HW.layout(state, HW.pageGeometry(state.settings), resolveFont);
    return layoutData;
  }

  function prefetchLayout() { computeLayout(); }

  function scheduleRender(showLoader = true) {
    clearTimeout(renderTimer);
    const loader = $('#pageLoading');
    if (showLoader && loader) loader.classList.add('show');
    renderTimer = setTimeout(() => { renderPreview(); if (loader) loader.classList.remove('show'); }, 90);
  }

  let rafId = 0;
  function renderPreview() {
    const lay = computeLayout();
    ui.page = clamp(ui.page, 0, lay.pages.length - 1);
    const canvas = $('#pageCanvas');
    if (!canvas) return;
    const zoom = ui.zoom / 100;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    HW.render(canvas, state, ui.page, { scale: zoom * dpr, layout: lay, resolveFont });
    canvas.style.width = Math.round(lay.geo.W * zoom) + 'px';
    canvas.style.height = Math.round(lay.geo.H * zoom) + 'px';
    updateStatus(lay);
  }

  function updateStatus(lay) {
    if (!lay) lay = computeLayout();
    const total = lay.pages.length;
    $('#pageLabel').textContent = `${ui.page + 1} / ${total}`;
    $('#footPage').textContent = `第 ${ui.page + 1} 页 / 共 ${total} 页`;
    $('#footChars').textContent = `${lay.totalChars.toLocaleString()} 书写字符`;
    const s = state.settings;
    const dim = HW.PAGE_SIZES[s.paperSize] || HW.PAGE_SIZES.A4;
    const w = s.landscape ? dim[1] : dim[0], h = s.landscape ? dim[0] : dim[1];
    $('#stageMeta').textContent = `${s.paperSize} · ${s.landscape ? '横版' : '竖版'} · ${w}×${h}mm`;
    const prev = $('#pagePrev'), next = $('#pageNext');
    if (prev) prev.disabled = ui.page <= 0;
    if (next) next.disabled = ui.page >= total - 1;
    const chars = (state.text || '').replace(/\s/g, '').length;
    const counter = $('#charCount');
    if (counter) counter.textContent = chars.toLocaleString();
  }

  function setZoom(z, opts = {}) {
    ui.zoom = clamp(Math.round(z), 20, 140);
    ui.autoFit = opts.manual ? false : true;
    const r = $('#zoomRange');
    if (r) r.value = ui.zoom;
    const l = $('#zoomLabel');
    if (l) l.textContent = ui.zoom + '%';
    renderPreview();
  }

  function fitZoom() {
    const stage = $('#stageCanvas');
    const geo = HW.pageGeometry(state.settings);
    if (!stage) return;
    const availW = stage.clientWidth - 70;
    const availH = stage.clientHeight - 40;
    const z = Math.min(availW / geo.W, availH / geo.H) * 100;
    setZoom(clamp(z, 20, 140));
  }

  /* ---------------- Toast / Modal ---------------- */
  function toast(msg, type = '') {
    const stack = $('#toastStack');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 260);
    }, 2200);
  }

  function openModal(html, onMount) {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="modal-backdrop" data-close></div><div class="modal">${html}</div>`;
    root.classList.add('show');
    root.onclick = (e) => {
      if (e.target.dataset.close !== undefined || e.target.closest('[data-close]')) closeModal();
    };
    $('.modal').addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) { closeModal(); return; }
      e.stopPropagation();
    });
    if (onMount) onMount(root);
  }
  function closeModal() {
    const root = $('#modalRoot');
    root.classList.remove('show');
    root.innerHTML = '';
  }

  /* ---------------- 面板 ---------------- */
  const TABS = [
    { id: 'content', name: '文稿', icon: 'i-doc', title: '书写内容', desc: '粘贴或导入正文，设置标题、对齐、缩进与页码。' },
    { id: 'font', name: '字体', icon: 'i-font', title: '字体与字号', desc: '13 款手写字体，支持自行导入。' },
    { id: 'paper', name: '背景', icon: 'i-paper', title: '背景设置', desc: '8 种纸张，可调规格、方向、纸色、线色、颗粒与页边距。' },
    { id: 'ink', name: '笔迹', icon: 'i-ink', title: '笔迹参数', desc: '位置凌乱度、笔画凌乱度、墨水与随机涂改。' },
    { id: 'theme', name: '外观', icon: 'i-theme', title: '界面与外观', desc: '切换工作台配色与页脚页码。' },
    { id: 'help', name: '说明', icon: 'i-help', title: '使用说明', desc: '操作步骤、快捷键、字体许可与工程文件。' },
  ];

  function buildTabs() {
    const tabs = $('#tabs');
    tabs.innerHTML = TABS.map(t => `
      <button class="tab-btn ${t.id === ui.tab ? 'active' : ''}" data-tab="${t.id}" type="button">
        <svg class="ico"><use href="#${t.icon}"/></svg><span>${t.name}</span>
      </button>`).join('');
    tabs.onclick = (e) => {
      const btn = e.target.closest('[data-tab]');
      if (btn) setTab(btn.dataset.tab);
    };
  }

  function setTab(id) {
    ui.tab = id;
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    renderPanel();
  }

  function slider(cfg) {
    const { key, label, min, max, step, unit = '', dec = 1, pct = false, value } = cfg;
    const v = value !== undefined ? value : state.settings[key];
    const shown = pct ? Math.round(v * 100) + '%' : (dec === 0 ? Math.round(v) : Number(v).toFixed(dec)) + (unit ? ' ' + unit : '');
    const fill = ((v - min) / (max - min)) * 100;
    return `
      <div class="field"><label for="f-${key}">${label}</label><span class="val" data-out="${key}">${shown}</span></div>
      <input type="range" id="f-${key}" data-key="${key}" min="${min}" max="${max}" step="${step}" value="${v}"
             data-dec="${dec}" data-pct="${pct ? 1 : 0}" data-unit="${unit}" style="--p:${fill}%">`;
  }

  function seg(key, options, current) {
    return `<div class="seg">${options.map(o => `
      <button type="button" data-set="${key}" data-value="${o.v}" class="${String(current) === String(o.v) ? 'active' : ''}">${o.t}</button>`).join('')}</div>`;
  }

  function toggle(key, label, current) {
    return `<div class="switch-row"><label>${label}</label>
      <span class="switch"><input type="checkbox" data-key="${key}" ${current ? 'checked' : ''}><i></i></span></div>`;
  }

  function paperGridHTML() {
    const s = state.settings;
    return `<div class="paper-grid">${PAPERS.map(p => `
      <button type="button" class="paper-card ${s.paperKind === p.id ? 'active' : ''}" data-paper="${p.id}">
        <canvas data-thumb="${p.id}"></canvas>
        <span class="pc-label"><span>${p.name}</span>${p.badge ? `<span class="pc-badge">${p.badge}</span>` : ''}</span>
      </button>`).join('')}</div>`;
  }

  function panelContent() {
    const s = state.settings;
    return `
      <div class="section">
        <button class="btn-block" type="button" data-action="import-text"><svg class="ico"><use href="#i-upload"/></svg>导入 Word / TXT</button>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn-block" type="button" data-action="sample-zh">载入中文示例</button>
          <button class="btn-block" type="button" data-action="sample-en">载入英文示例</button>
        </div>
      </div>
      <div class="section">
        <div class="field"><label>文档标题</label><span class="val">${esc(state.title).length} 字</span></div>
        <input type="text" id="titleInput" maxlength="40" value="${esc(state.title)}" placeholder="给这篇文稿起个名字">
        <div class="hint">标题以较大字号排在首页顶部，留空则不显示。</div>
      </div>
      <div class="section">
        <div class="section-title"><h3>正文内容</h3><small><span id="charCount">0</span> 字</small></div>
        <textarea id="mainText" placeholder="在这里粘贴或输入正文…">${esc(state.text)}</textarea>
        <div class="hint">换行即分段；中文避头尾，英文按词折行；超出页面自动分页。</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title"><h3>段落对齐</h3></div>
        ${seg('align', [{ v: 'left', t: '左对齐' }, { v: 'center', t: '居中' }, { v: 'right', t: '右对齐' }], s.align)}
        <div class="field" style="margin-top:14px"><label>首行缩进</label><span class="val" data-out="indent">${s.indent} 字</span></div>
        <input type="range" data-key="indent" min="0" max="4" step="1" value="${s.indent}" data-dec="0" data-pct="0" data-unit="字" style="--p:${(s.indent / 4) * 100}%">
        ${toggle('randomIndent', '每段首行随机缩进', s.randomIndent)}
        ${toggle('showPageNumber', '页脚显示页码', s.showPageNumber)}
      </div>
      <div class="divider"></div>
      <div class="section">
        <button class="btn-block" type="button" data-action="clear-text"><svg class="ico"><use href="#i-trash"/></svg>清空正文</button>
      </div>`;
  }

  function panelFont() {
    const list = FONT_DEFS.filter(f => f.lang === ui.fontLang);
    return `
      <div class="seg font-tabs">
        <button type="button" data-fontlang="zh" class="${ui.fontLang === 'zh' ? 'active' : ''}">中文手写</button>
        <button type="button" data-fontlang="en" class="${ui.fontLang === 'en' ? 'active' : ''}">English</button>
      </div>
      <div class="font-grid">
        ${list.map(f => {
          const rec = ui.fonts.get(f.id);
          const loading = rec && rec.status === 'loading';
          const err = rec && rec.status === 'error';
          return `<button type="button" class="font-card ${state.fontId === f.id ? 'active' : ''}" data-font-id="${f.id}" ${err ? 'data-err="1"' : ''}>
            <span class="fc-top"><span class="fc-name">${f.name}</span><span class="fc-tag">${f.tag}</span></span>
            <span class="fc-sample" style="font-family:${(rec && rec.cssFamily) || 'inherit'}">轻舟已过万重山，风来墨韵自然。</span>
            <span class="fc-meta"><span>${err ? '字体文件缺失 · 使用系统楷体代替' : (loading ? '加载中…' : f.desc)}</span>${f.id.startsWith('user-') ? `<span class="fc-del" data-del-font="${f.id}">删除</span>` : `<span>${f.lang === 'zh' ? '中文' : 'EN'}</span>`}</span>
          </button>`;
        }).join('')}
      </div>
      <div class="section" style="margin-top:16px">
        <button class="btn-block" type="button" data-action="import-font"><svg class="ico"><use href="#i-upload"/></svg>导入自己的字体</button>
        <input type="file" id="fileFont" accept=".ttf,.otf,.woff,.woff2" hidden>
        <div class="hint">支持 TTF / OTF / WOFF，保存在本机浏览器；缺字自动用霞鹜文楷补写。</div>
      </div>
      <div class="section">
        <div class="section-title"><h3>字号与行距</h3></div>
        ${slider({ key: 'fontSize', label: '字号', min: 14, max: 40, step: 1, unit: 'px', dec: 0 })}
        ${slider({ key: 'lineHeight', label: '行高', min: 22, max: 64, step: 1, unit: 'px', dec: 0 })}
        ${slider({ key: 'letterSpacing', label: '字间距', min: -2, max: 8, step: 0.5, unit: 'px', dec: 1 })}
      </div>`;
  }

  function panelPaper() {
    const s = state.settings;
    return `
      <div class="section">
        <div class="section-title"><h3>选择背景</h3><small>8 种纸张</small></div>
        ${paperGridHTML()}
        <div class="hint">实拍横线纸带纸面质感与装订孔；A4 纯白无格线，适合打印。</div>
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title"><h3>纸张尺寸</h3></div>
        <div class="field"><label>规格</label></div>
        <select data-key="paperSize">
          ${Object.keys(HW.PAGE_SIZES).map(k => `<option value="${k}" ${s.paperSize === k ? 'selected' : ''}>${k}　${HW.PAGE_SIZES[k][0]}×${HW.PAGE_SIZES[k][1]} mm</option>`).join('')}
        </select>
        <div class="field" style="margin-top:12px"><label>方向</label></div>
        ${seg('landscape', [{ v: 'false', t: '竖版' }, { v: 'true', t: '横版' }], String(s.landscape))}
      </div>
      <div class="section">
        <div class="section-title"><h3>纸色与线色</h3></div>
        <div class="swatches">
          <label class="swatch custom" title="纸张底色" style="background:${s.paperColor}">
            <input type="color" data-color="paperColor" value="${s.paperColor}">
          </label>
          <label class="swatch custom" title="格线颜色" style="background:${s.lineColor}">
            <input type="color" data-color="lineColor" value="${s.lineColor}">
          </label>
          <span style="align-self:center;font-size:10.5px;color:var(--muted-2);margin-left:2px">纸色 · 线色</span>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h3>质感</h3></div>
        ${slider({ key: 'texture', label: '纸张颗粒', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${toggle('photoLight', '实拍光照（暗角与高光）', s.photoLight)}
      </div>
      <div class="divider"></div>
      <div class="section">
        <div class="section-title"><h3>页边距</h3><small>单位 mm</small></div>
        ${slider({ key: 'marginTop', label: '上', min: 6, max: 45, step: 1, unit: 'mm', dec: 0 })}
        ${slider({ key: 'marginBottom', label: '下', min: 6, max: 45, step: 1, unit: 'mm', dec: 0 })}
        ${slider({ key: 'marginLeft', label: '左', min: 6, max: 45, step: 1, unit: 'mm', dec: 0 })}
        ${slider({ key: 'marginRight', label: '右', min: 6, max: 45, step: 1, unit: 'mm', dec: 0 })}
      </div>`;
  }

  function panelInk() {
    const s = state.settings;
    const presets = [
      { id: 'neat', name: '工整', sub: '誊抄' },
      { id: 'natural', name: '自然', sub: '日常' },
      { id: 'casual', name: '随性', sub: '随手写' },
      { id: 'wild', name: '潦草', sub: '草稿' },
    ];
    const head = `
      <div class="messiness-card">
        <div class="mc-head"><b>凌乱度</b><span style="font-size:9.5px;color:var(--muted-2)">控制手写不规则程度</span></div>
        ${slider({ key: 'jitter', label: '文字位置凌乱度', min: 0, max: 6, step: 0.1, unit: 'px', dec: 1 })}
        ${slider({ key: 'strokeMessiness', label: '字体笔画凌乱度', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        <div class="mc-note">位置凌乱度：单字落笔位置的前后左右错动距离。笔画凌乱度：字形轮廓的弯折程度。</div>
      </div>
      <div class="preset-row">
        ${presets.map(p => `<button type="button" class="preset-btn ${(s.preset === p.id) ? 'active' : ''}" data-preset="${p.id}">${p.name}<small>${p.sub}</small></button>`).join('')}
      </div>`;

    let body = '';
    if (ui.inkTab === 'shape') {
      body = `
        ${slider({ key: 'rotation', label: '字形倾斜', min: 0, max: 6, step: 0.1, unit: '°', dec: 1 })}
        ${slider({ key: 'sizeVariation', label: '大小变化', min: 0, max: 16, step: 0.5, unit: '%', dec: 1 })}
        ${slider({ key: 'baselineWave', label: '行内起伏', min: 0, max: 8, step: 0.1, unit: 'px', dec: 1 })}
        ${slider({ key: 'lineTilt', label: '整行倾斜', min: -3, max: 3, step: 0.1, unit: '°', dec: 1 })}
        ${slider({ key: 'spacingVariation', label: '字距变化', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'looseness', label: '结构松散度', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        <div class="hint">控制字内笔画间距与重心的散开程度，数值越大越松散。</div>`;
    } else if (ui.inkTab === 'ink') {
      body = `
        <div class="section-title"><h3>墨水颜色</h3></div>
        <div class="swatches" style="margin-bottom:14px">
          ${INK_COLORS.map(c => `<button type="button" class="swatch ${s.inkColor.toLowerCase() === c.color ? 'active' : ''}" title="${c.name}" style="background:${c.color}" data-ink="${c.color}" aria-label="${c.name}"></button>`).join('')}
          <label class="swatch custom" title="自定义墨色"><input type="color" data-color="inkColor" value="${s.inkColor}"></label>
        </div>
        ${slider({ key: 'inkOpacity', label: '墨水不透明度', min: 0.3, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'inkVariation', label: '笔画深浅变化', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'penWidth', label: '笔画加粗', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'inkGrain', label: '墨迹颗粒', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'inkDisturbanceRate', label: '墨点飞溅概率', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        ${slider({ key: 'inkDisturbanceStrength', label: '墨点浓度', min: 0, max: 1, step: 0.02, pct: true, dec: 2 })}
        <div class="divider" style="margin:16px -24px"></div>
        ${slider({ key: 'correctionProbability', label: '随机勾画涂改概率', min: 0, max: 0.25, step: 0.005, pct: true, dec: 3 })}
        <div class="chips" style="margin-top:8px">
          ${['mixed', 'strike', 'scribble', 'circle', 'blackout', 'erase'].map(k => `
            <button type="button" class="chip ${s.correctionStyle === k ? 'active' : ''}" data-corr="${k}">${CORRECTION_LABELS[k]}</button>`).join('')}
        </div>
        <div class="hint">按概率随机挑字，按所选样式划线、涂抹或擦除；位置与力度由 seed 决定。</div>`;
    } else {
      body = `
        ${slider({ key: 'fontSize', label: '字号', min: 14, max: 40, step: 1, unit: 'px', dec: 0 })}
        ${slider({ key: 'lineHeight', label: '行高', min: 22, max: 64, step: 1, unit: 'px', dec: 0 })}
        ${slider({ key: 'letterSpacing', label: '字间距', min: -2, max: 8, step: 0.5, unit: 'px', dec: 1 })}
        ${slider({ key: 'titleSize', label: '标题字号', min: 18, max: 48, step: 1, unit: 'px', dec: 0 })}
        ${slider({ key: 'indent', label: '首行缩进', min: 0, max: 4, step: 1, unit: '字', dec: 0 })}
        <div class="hint">方格纸与田字格按字格对齐；横线纸文字贴在线上方。</div>`;
    }

    return `
      ${head}
      <div class="subtabs" style="margin-top:16px">
        <button type="button" data-inktab="shape" class="${ui.inkTab === 'shape' ? 'active' : ''}">字形姿态</button>
        <button type="button" data-inktab="ink" class="${ui.inkTab === 'ink' ? 'active' : ''}">墨水与涂改</button>
        <button type="button" data-inktab="size" class="${ui.inkTab === 'size' ? 'active' : ''}">字号与间距</button>
      </div>
      <div class="section">${body}</div>`;
  }

  function panelTheme() {
    const s = state.settings;
    return `
      <div class="section">
        <div class="section-title"><h3>配色主题</h3></div>
        <div class="font-grid">
          ${THEMES.map(t => `
            <button type="button" class="theme-card ${s.theme === t.id ? 'active' : ''}" data-theme-id="${t.id}"
              style="display:flex;align-items:center;gap:11px;border:1px solid ${s.theme === t.id ? 'var(--accent)' : 'var(--border)'};border-radius:11px;padding:9px 11px;background:${s.theme === t.id ? 'var(--accent-weak)' : 'var(--panel)'};text-align:left">
              <span style="width:38px;height:30px;border-radius:6px;flex:none;background:${t.surface};border:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;justify-content:center;gap:3px;padding:4px">
                <i style="display:block;height:2px;width:70%;background:${t.accent};border-radius:2px"></i>
                <i style="display:block;height:2px;width:90%;background:${t.dot};border-radius:2px"></i>
                <i style="display:block;height:2px;width:55%;background:${t.dot};border-radius:2px"></i>
              </span>
              <span style="flex:1">
                <b style="display:block;font-size:12px">${t.name}</b>
                <small style="font-size:10px;color:var(--muted-2)">${t.desc}</small>
              </span>
              ${s.theme === t.id ? '<svg class="ico" style="color:var(--accent)"><use href="#i-check"/></svg>' : ''}
            </button>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h3>工作台</h3></div>
        ${toggle('showPageNumber', '页脚显示页码', s.showPageNumber)}
        <div class="hint">只改工作台配色；导出的纸张与墨色保持不变。</div>
      </div>`;
  }

  function panelHelp() {
    return `
      <div class="section">
        <div class="section-title"><h3>操作步骤</h3></div>
        <div class="guide-steps">
          <div class="guide-step"><b>1</b><span>在「文稿」粘贴文字或导入 TXT / Word，设置标题。</span></div>
          <div class="guide-step"><b>2</b><span>在「字体」选字体，在「背景」选纸，在「笔迹」调凌乱度与涂改。</span></div>
          <div class="guide-step"><b>3</b><span>点右上角「导出手写稿」，选 DPI 导出 PNG 或 PDF。</span></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h3>快捷键</h3></div>
        <div class="license-list" style="max-height:none">
          <div><span class="kbd">Ctrl</span> + <span class="kbd">Z</span> 撤销　<span class="kbd">Ctrl</span> + <span class="kbd">Y</span> 重做</div>
          <div><span class="kbd">Ctrl</span> + <span class="kbd">S</span> 保存工程文件</div>
          <div><span class="kbd">Ctrl</span> + <span class="kbd">E</span> 打开导出窗口</div>
          <div><span class="kbd">←</span> / <span class="kbd">→</span> 上一页 / 下一页</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h3>工程</h3></div>
        <div class="btn-row">
          <button class="btn-block" type="button" data-action="save-project">保存工程</button>
          <button class="btn-block" type="button" data-action="open-project">打开工程</button>
        </div>
        <input type="file" id="fileProject" accept=".json" hidden>
        <div class="hint">包含正文、标题与全部参数，可再次打开继续编辑。</div>
      </div>
      <div class="section">
        <div class="section-title"><h3>字体来源与许可</h3></div>
        <div class="license-list">
          <div><b>马善政 / 志莽行书 / 龙藏 / 刘建毛草</b>：Google Fonts，SIL Open Font License 1.1。</div>
          <div><b>Kalam / Indie Flower / Patrick Hand / Handlee / Shadows Into Light</b>：Google Fonts，OFL 1.1。</div>
          <div><b>辰宇落雁体</b>：Chenyu-otf / chenyuluoyan_thin，SIL Open Font License 1.1。</div>
          <div><b>霞鹜文楷 Lite</b>：lxgw / LxgwWenKai-Lite，SIL Open Font License 1.1。</div>
          <div style="margin-top:6px;color:var(--muted-2)">字体文件随站点分发，商用或再分发前请自行核对上游许可证。</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><h3>关于</h3></div>
        <div class="hint" style="margin-top:0">
          涟帆祈雨手写生成器<br>
          Lianfan Qiyu Writing Studio · v1.3
        </div>
        <button class="btn-block" style="margin-top:10px" type="button" data-action="reset-all"><svg class="ico"><use href="#i-redo"/></svg>恢复初始文稿与默认参数</button>
      </div>`;
  }

  function renderPanel() {
    const tab = TABS.find(t => t.id === ui.tab) || TABS[0];
    $('#panelTitle').textContent = tab.title;
    $('#panelDesc').textContent = tab.desc;
    const scroll = $('#panelScroll');
    let html = '';
    if (ui.tab === 'content') html = panelContent();
    else if (ui.tab === 'font') html = panelFont();
    else if (ui.tab === 'paper') html = panelPaper();
    else if (ui.tab === 'ink') html = panelInk();
    else if (ui.tab === 'theme') html = panelTheme();
    else html = panelHelp();
    scroll.innerHTML = html;
    scroll.scrollTop = 0;

    if (ui.tab === 'paper') {
      $$('canvas[data-thumb]', scroll).forEach(cv => {
        const kind = cv.dataset.thumb;
        const def = PAPERS.find(p => p.id === kind) || PAPERS[0];
        const active = state.settings.paperKind === kind;
        HW.renderThumb(cv, kind, {
          ...state.settings,
          paperColor: active ? state.settings.paperColor : def.paperColor,
          lineColor: active ? state.settings.lineColor : def.lineColor,
        });
      });
    }
    updateStatus();
    updateBottomAction();
  }

  function updateBottomAction() {
    const bottom = $('#panelBottom');
    if (ui.tab === 'ink') {
      bottom.innerHTML = `<button class="btn-block" type="button" data-action="random-ink"><svg class="ico"><use href="#i-shuffle"/></svg>换一组笔迹</button>`;
    } else if (ui.tab === 'font') {
      bottom.innerHTML = `<button class="btn-block" type="button" data-action="next-font"><svg class="ico"><use href="#i-shuffle"/></svg>换个字体试试</button>`;
    } else if (ui.tab === 'paper') {
      bottom.innerHTML = `<button class="btn-block" type="button" data-action="fit"><svg class="ico"><use href="#i-paper"/></svg>整页预览</button>`;
    } else if (ui.tab === 'content') {
      bottom.innerHTML = `<button class="btn-block primary" type="button" data-action="export">导出手写稿</button>`;
    } else {
      bottom.innerHTML = '';
    }
  }

  /* ---------------- 设置更新 ---------------- */
  function valueText(key, v) {
    const map = {
      jitter: [1, 'px'], rotation: [1, '°'], sizeVariation: [1, '%'], baselineWave: [1, 'px'],
      lineTilt: [1, '°'], fontSize: [0, 'px'], lineHeight: [0, 'px'], letterSpacing: [1, 'px'],
      indent: [0, '字'], inkOpacity: [2, ''], inkVariation: [2, ''], penWidth: [2, ''],
      inkGrain: [2, ''], inkDisturbanceRate: [2, ''], inkDisturbanceStrength: [2, ''],
      strokeMessiness: [2, ''], looseness: [2, ''], strokeVariation: [2, ''], texture: [2, ''],
      correctionProbability: [3, ''], spacingVariation: [2, ''], titleSize: [0, 'px'],
      marginTop: [0, 'mm'], marginBottom: [0, 'mm'], marginLeft: [0, 'mm'], marginRight: [0, 'mm'],
    };
    const [dec, unit] = map[key] || [1, ''];
    const pct = ['jitter', 'strokeMessiness', 'looseness', 'strokeVariation', 'texture', 'correctionProbability',
      'inkOpacity', 'inkVariation', 'penWidth', 'inkGrain', 'inkDisturbanceRate', 'inkDisturbanceStrength', 'spacingVariation'].includes(key);
    if (pct) return Math.round(v * 100) + '%';
    return Number(v).toFixed(dec) + (unit ? ' ' + unit : '');
  }

  function updateSetting(key, value, opts = {}) {
    const s = state.settings;
    if (key === 'landscape') value = String(value) === 'true';
    if (key === 'align' || key === 'correctionStyle') { s[key] = value; }
    else if (key === 'paperSize') {
      s.paperSize = value;
    } else if (key === 'paperKind') {
      const p = PAPERS.find(x => x.id === value);
      s.paperKind = value;
      if (p) { s.paperColor = p.paperColor; s.lineColor = p.lineColor; }
    } else if (key === 'theme') {
      s.theme = value; applyTheme(value);
    } else if (key === 'randomIndent' || key === 'showPageNumber' || key === 'photoLight') {
      s[key] = !!value;
    } else if (key === 'inkColor') {
      s.inkColor = value;
    } else if (key === 'paperColor' || key === 'lineColor') {
      s[key] = value;
    } else {
      s[key] = value;
    }
    if (key === 'fontSize' || key === 'lineHeight' || key === 'letterSpacing') {
      // 字号变化时略微跟随行高
      if (key === 'fontSize' && opts.followLineHeight) s.lineHeight = Math.round(value * 1.58);
    }
    s.preset = opts.preset || null;
    scheduleRender();
    saveLocal();
    commit(opts.immediate ? 0 : 350);
    updateStatus();
    if (key === 'paperSize' || key === 'landscape') setTimeout(fitZoom, 50);
  }

  /* ---------------- 外观主题 ---------------- */
  function applyTheme(id) {
    const t = THEMES.find(x => x.id === id) || THEMES[0];
    const root = document.documentElement;
    root.dataset.theme = t.dark ? 'night' : '';
    root.style.setProperty('--brand-1', t.c1);
    root.style.setProperty('--brand-2', t.c2);
    root.style.setProperty('--brand-3', t.c3);
    root.style.setProperty('--brand-4', t.c4);
    root.style.setProperty('--accent', t.accent);
    root.style.setProperty('--accent-2', t.accent2);
    root.style.setProperty('--accent-weak', t.weak);
    root.style.setProperty('--accent-line', t.line);
    document.body.classList.toggle('is-night', !!t.dark);
    state.settings.theme = t.id;
  }

  /* ---------------- 预设 ---------------- */
  const PRESETS = {
    neat: { jitter: 0.4, rotation: 0.4, sizeVariation: 1.5, strokeMessiness: 0.12, baselineWave: 0.8, spacingVariation: 0.06, looseness: 0.12, strokeVariation: 0.22, correctionProbability: 0 },
    natural: { jitter: 1.3, rotation: 1.2, sizeVariation: 3, strokeMessiness: 0.42, baselineWave: 2, spacingVariation: 0.2, looseness: 0.35, strokeVariation: 0.45, correctionProbability: 0.008 },
    casual: { jitter: 3.1, rotation: 2.4, sizeVariation: 7, strokeMessiness: 0.68, baselineWave: 4.2, spacingVariation: 0.36, looseness: 0.55, strokeVariation: 0.6, correctionProbability: 0.03 },
    wild: { jitter: 4.6, rotation: 3.6, sizeVariation: 11, strokeMessiness: 0.95, baselineWave: 6, spacingVariation: 0.52, looseness: 0.75, strokeVariation: 0.75, correctionProbability: 0.06 },
  };

  function applyPreset(id) {
    const p = PRESETS[id];
    if (!p) return;
    Object.assign(state.settings, p, { preset: id });
    renderPanel();
    scheduleRender();
    saveLocal();
    commit(0);
    toast(`已切换到「${({ neat: '工整', natural: '自然', casual: '随性', wild: '潦草' })[id]}」笔迹`);
  }

  function randomInk() {
    const s = state.settings;
    const rnd = HW.mulberry32((Date.now() ^ (s.seed * 2654435761)) >>> 0);
    const pick = (a, b) => a + rnd() * (b - a);
    s.seed = Math.floor(rnd() * 1e9);
    s.jitter = +pick(0.8, 3.2).toFixed(1);
    s.rotation = +pick(0.6, 2.8).toFixed(1);
    s.sizeVariation = +pick(1.5, 8).toFixed(1);
    s.strokeMessiness = +pick(0.2, 0.8).toFixed(2);
    s.baselineWave = +pick(1, 5).toFixed(1);
    s.spacingVariation = +pick(0.1, 0.42).toFixed(2);
    s.lineTilt = +pick(-0.8, 0.8).toFixed(1);
    s.looseness = +pick(0.15, 0.6).toFixed(2);
    s.correctionProbability = +pick(0, 0.03).toFixed(3);
    s.preset = null;
    renderPanel();
    scheduleRender();
    saveLocal();
    commit(0);
    toast('换了一组笔迹：随机抖动、倾斜与涂改');
  }

  /* ---------------- 交互绑定 ---------------- */
  function bindPanelEvents() {
    const scroll = $('#panelScroll');
    const bottom = $('#panelBottom');

    const onRange = (el) => {
      const key = el.dataset.key;
      if (!key) return;
      const v = el.type === 'checkbox' ? el.checked : Number(el.value);
      updateSetting(key, v, { followLineHeight: key === 'fontSize' ? false : false });
      const out = $(`[data-out="${key}"]`, scroll);
      if (out) out.textContent = valueText(key, v);
      el.style.setProperty('--p', ((v - el.min) / (el.max - el.min)) * 100 + '%');
      if (key === 'paperColor' || key === 'lineColor') {
        const box = el.closest('.swatch');
        if (box) box.style.background = el.value;
      }
    };

    scroll.addEventListener('input', (e) => {
      const el = e.target;
      if (el.matches('input[type="range"][data-key], input[type="checkbox"][data-key]')) onRange(el);
      else if (el.matches('textarea#mainText')) {
        state.text = el.value;
        updateStatus();
        scheduleRender();
        saveLocal(500);
        commit(700);
      } else if (el.matches('input#titleInput')) {
        state.title = el.value;
        syncTitleInputs(true);
        scheduleRender();
        saveLocal(500);
        commit(700);
      } else if (el.matches('input[type="color"]')) {
        const key = el.dataset.color;
        if (!key) return;
        updateSetting(key, el.value, { immediate: true });
        const box = el.closest('.swatch');
        if (box) box.style.background = el.value;
        if (ui.tab === 'paper') renderPanel();
      } else if (el.matches('select[data-key]')) {
        updateSetting(el.dataset.key, el.value, { immediate: true });
        renderPanel();
      }
    });

    scroll.addEventListener('change', (e) => {
      const el = e.target;
      if (el.matches('input[type="checkbox"][data-key]')) {
        updateSetting(el.dataset.key, el.checked, { immediate: true });
        scheduleRender();
      }
      if (el.matches('input[type="range"][data-key]')) {
        commit(0);
        const key = el.dataset.key;
        if (['paperColor', 'lineColor'].includes(key)) renderPanel();
      }
      if (el.matches('select[data-key]')) renderPanel();
    });

    scroll.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-del-font]');
      if (delBtn) {
        e.preventDefault();
        e.stopPropagation();
        deleteFont(delBtn.dataset.delFont);
        return;
      }
      const el = e.target.closest('button, [data-set]');
      if (!el) return;
      if (el.dataset.set) {
        const key = el.dataset.set;
        let val = el.dataset.value;
        updateSetting(key, val, { immediate: true });
        renderPanel();
        return;
      }
      if (el.dataset.fontId) { selectFont(el.dataset.fontId); return; }
      if (el.dataset.paper) {
        updateSetting('paperKind', el.dataset.paper, { immediate: true });
        renderPanel();
        scheduleRender();
        toast(`已换成「${PAPERS.find(p => p.id === el.dataset.paper).name}」`);
        return;
      }
      if (el.dataset.ink) {
        updateSetting('inkColor', el.dataset.ink, { immediate: true });
        renderPanel();
        return;
      }
      if (el.dataset.corr) {
        updateSetting('correctionStyle', el.dataset.corr, { immediate: true });
        renderPanel();
        return;
      }
      if (el.dataset.themeId) {
        updateSetting('theme', el.dataset.themeId, { immediate: true });
        renderPanel();
        return;
      }
      if (el.dataset.preset) { applyPreset(el.dataset.preset); return; }
      if (el.dataset.inktab) {
        ui.inkTab = el.dataset.inktab;
        renderPanel();
        return;
      }
      if (el.dataset.fontlang) {
        ui.fontLang = el.dataset.fontlang;
        if (ui.fontLang === 'en' && state.fontId === 'chenyu') {
          // 保持当前字体，用户可自由选择
        }
        renderPanel();
        return;
      }
      if (el.dataset.action) handleAction(el.dataset.action);
    });

    bottom.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) handleAction(btn.dataset.action);
    });

    $('#btnFit') && ($('#btnFit').onclick = fitZoom);
  }

  function handleAction(action) {
    switch (action) {
      case 'import-text': $('#fileText').click(); break;
      case 'sample-zh':
        state.title = '面朝大海，春暖花开'; state.text = SAMPLE_ZH;
        syncTitleInputs(); renderPanel(); scheduleRender(); commit(0); toast('已载入中文示例');
        break;
      case 'sample-en':
        state.title = 'The Quiet Hours'; state.text = SAMPLE_EN;
        if (ui.fontLang !== 'en') { ui.fontLang = 'en'; }
        if (!['kalam', 'indie', 'patrick', 'handlee', 'shadows'].includes(state.fontId)) state.fontId = 'kalam';
        syncTitleInputs(); renderPanel(); scheduleRender(); commit(0); toast('已载入英文示例');
        break;
      case 'clear-text':
        state.text = ''; state.title = '未命名文稿';
        syncTitleInputs(); renderPanel(); scheduleRender(); commit(0); toast('已清空正文');
        break;
      case 'import-font': $('#fileFont').click(); break;
      case 'random-ink': randomInk(); break;
      case 'next-font': {
        const list = FONT_DEFS.filter(f => f.lang === ui.fontLang);
        const i = Math.max(0, list.findIndex(f => f.id === state.fontId));
        selectFont(list[(i + 1) % list.length].id);
        break;
      }
      case 'export': openExport(); break;
      case 'fit': fitZoom(); break;
      case 'save-project': saveProject(); break;
      case 'open-project': $('#fileProject').click(); break;
      case 'reset-all':
        if (!confirm('恢复初始文稿与全部默认参数？当前内容会被覆盖。')) return;
        state = { title: '面朝大海，春暖花开', text: SAMPLE_ZH, settings: defaultSettings(), fontId: 'chenyu', version: 2 };
        applyTheme(state.settings.theme);
        syncTitleInputs(); renderPanel(); scheduleRender(); commit(0); toast('已恢复初始文稿');
        break;
    }
  }

  function selectFont(id) {
    state.fontId = id;
    glyphLookupCache.clear();
    layoutData = null;
    layoutKey = '';
    const def = FONT_DEFS.find(f => f.id === id);
    if (def && def.lang && def.lang !== ui.fontLang && !id.startsWith('user-')) ui.fontLang = def.lang;
    const rec = ui.fonts.get(id);
    if (!rec) loadFontDef(def);
    ui.page = 0;
    renderPanel();
    scheduleRender();
    saveLocal();
    commit(0);
    if (rec && rec.status === 'error') toast('这款字体文件缺失，暂时用系统楷体代替', 'error');
    else toast(`已换用「${(def && def.name) || id}」`);
  }

  async function deleteFont(id) {
    const rec = ui.fonts.get(id);
    if (!confirm(`从本机删除字体「${(rec && rec.name) || id}」？已导出的文件不受影响。`)) return;
    ui.fonts.delete(id);
    const i = FONT_DEFS.findIndex(f => f.id === id);
    if (i >= 0) FONT_DEFS.splice(i, 1);
    glyphLookupCache.clear();
    layoutData = null;
    layoutKey = '';
    if (state.fontId === id) state.fontId = 'chenyu';
    try { await idbDel(id); } catch (e) { /* 忽略 */ }
    renderPanel();
    scheduleRender();
    commit(0);
    toast('已删除本机字体');
  }

  function syncTitleInputs(fromPanel) {
    const inp = $('#titleInput');
    if (inp && document.activeElement !== inp) inp.value = state.title;
  }

  /* ---------------- 字体导入 ---------------- */
  function bytesToHex(buf) {
    const arr = new Uint8Array(buf.slice(0, 8));
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function importFontFile(file) {
    const buf = await file.arrayBuffer();
    const id = 'user-' + bytesToHex(buf) + '-' + (file.size % 9999);
    const family = 'ink-' + id;
    try {
      const face = new FontFace(family, buf.slice(0));
      await face.load();
      document.fonts.add(face);
    } catch (e) {
      toast('这个字体文件无法被浏览器加载', 'error');
      return;
    }
    let otf = null;
    if (typeof opentype !== 'undefined') {
      try { otf = opentype.parse(buf); } catch (e) { /* 预览可用即可 */ }
    }
    const rec = {
      id, name: file.name.replace(/\.(ttf|otf|woff2?)$/i, ''), tag: '我的字体',
      lang: 'zh', cssFamily: `'${family}', 'KaiTi', serif`, otf, status: 'ready', custom: true,
    };
    ui.fonts.set(id, rec);
    FONT_DEFS.push({ id, name: rec.name, tag: '我的字体 · 本机', lang: 'zh', file: '', desc: '导入的字体，仅保存在本机。' });
    try { await idbPut({ id, name: rec.name, data: buf, addedAt: Date.now() }); } catch (e) {}
    selectFont(id);
    toast(`已导入「${rec.name}」`);
  }

  /* ---------------- IndexedDB ---------------- */
  function idbOpen() {
    return new Promise((res, rej) => {
      if (!('indexedDB' in window)) return rej(new Error('no idb'));
      const req = indexedDB.open('lianfan-fonts', 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('fonts', { keyPath: 'id' }); };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }
  async function idbPut(rec) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const tx = db.transaction('fonts', 'readwrite');
      tx.objectStore('fonts').put(rec);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }
  async function idbAll() {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const tx = db.transaction('fonts', 'readonly');
      const req = tx.objectStore('fonts').getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
  }
  async function idbDel(id) {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const tx = db.transaction('fonts', 'readwrite');
      tx.objectStore('fonts').delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async function restoreUserFonts() {
    try {
      const list = await idbAll();
      for (const item of list) {
        const family = 'ink-' + item.id;
        try {
          const face = new FontFace(family, item.data.slice(0));
          await face.load();
          document.fonts.add(face);
        } catch (e) { continue; }
        let otf = null;
        try { otf = opentype.parse(item.data); } catch (e) {}
        ui.fonts.set(item.id, {
          id: item.id, name: item.name, tag: '我的字体', lang: 'zh',
          cssFamily: `'${family}', 'KaiTi', serif`, otf, status: 'ready', custom: true,
        });
        if (!FONT_DEFS.find(f => f.id === item.id)) {
          FONT_DEFS.push({ id: item.id, name: item.name, tag: '我的字体 · 本机', lang: 'zh', file: '', desc: '导入的字体，仅保存在本机。' });
        }
      }
    } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 导入文本 ---------------- */
  async function importTextFile(file) {
    const buf = await file.arrayBuffer();
    let text = '';
    if (/\.docx$/i.test(file.name) && typeof JSZip !== 'undefined') {
      try {
        const zip = await JSZip.loadAsync(buf);
        const doc = zip.file('word/document.xml');
        if (!doc) throw new Error('没有找到 document.xml');
        const xml = await doc.async('string');
        text = xml
          .replace(/<w:tab[^>]*\/>/g, '\t')
          .replace(/<w:br[^>]*\/>/g, '\n')
          .replace(/<\/w:p>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      } catch (e) {
        toast('Word 解析失败：' + e.message, 'error');
        return;
      }
    } else {
      text = new TextDecoder('utf-8').decode(buf);
      if (/\uFFFD/.test(text)) {
        try { text = new TextDecoder('gbk').decode(buf); } catch (e) {}
      }
    }
    text = text.replace(/\r\n?/g, '\n').trim();
    if (!text) { toast('文件里没有可用的文字', 'error'); return; }
    state.text = text.slice(0, 60000);
    if (!state.title || state.title === '未命名文稿') {
      state.title = file.name.replace(/\.(txt|md|docx)$/i, '');
    }
    ui.tab = 'content';
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'content'));
    syncTitleInputs();
    renderPanel();
    scheduleRender();
    commit(0);
    toast(`已导入 ${text.length.toLocaleString()} 个字符`);
  }

  /* ---------------- 导出 ---------------- */
  function openExport() {
    openModal(`
      <button class="modal-close" data-close><svg class="ico"><use href="#i-close"/></svg></button>
      <h2>导出手写稿</h2>
      <p class="sub">PNG 逐页导出；PDF 多页合并，按纸张实际尺寸输出。</p>
      <div class="modal-body">
        <div class="section-title"><h3>格式</h3></div>
        <div class="export-grid">
          <button class="export-opt ${ui.exportFormat === 'png' ? 'active' : ''}" data-exp="png"><b>PNG 图片</b><small>逐页导出，300 DPI 高清</small></button>
          <button class="export-opt ${ui.exportFormat === 'pdf' ? 'active' : ''}" data-exp="pdf"><b>PDF 文档</b><small>多页合并，方便打印</small></button>
        </div>
        <div class="modal-row"><span>清晰度</span>
          <div class="seg">
            <button data-dpi="150" class="${ui.exportDpi === 150 ? 'active' : ''}">标准 150</button>
            <button data-dpi="300" class="${ui.exportDpi === 300 ? 'active' : ''}">高清 300</button>
          </div>
        </div>
        <div class="modal-row"><span>范围</span>
          <div class="seg">
            <button data-range="current" class="${ui.exportRange === 'current' ? 'active' : ''}">当前页</button>
            <button data-range="all" class="${ui.exportRange === 'all' ? 'active' : ''}">全部页</button>
          </div>
        </div>
        <div class="modal-row"><span>文件名</span>
          <input type="text" id="exportName" value="${esc(state.title || '手写稿')}" style="width:210px">
        </div>
      </div>
      <div class="modal-foot">
        <button data-close>取消</button>
        <button class="primary" id="btnDoExport">开始导出</button>
      </div>`, (root) => {
      root.querySelectorAll('[data-exp]').forEach(b => b.onclick = () => {
        ui.exportFormat = b.dataset.exp;
        root.querySelectorAll('[data-exp]').forEach(x => x.classList.toggle('active', x === b));
      });
      root.querySelectorAll('[data-dpi]').forEach(b => b.onclick = () => {
        ui.exportDpi = Number(b.dataset.dpi);
        root.querySelectorAll('[data-dpi]').forEach(x => x.classList.toggle('active', x === b));
      });
      root.querySelectorAll('[data-range]').forEach(b => b.onclick = () => {
        ui.exportRange = b.dataset.range;
        root.querySelectorAll('[data-range]').forEach(x => x.classList.toggle('active', x === b));
      });
      $('#btnDoExport').onclick = doExport;
    });
  }

  async function doExport() {
    const name = ($('#exportName') && $('#exportName').value.trim()) || '手写稿';
    const lay = computeLayout();
    const pages = ui.exportRange === 'current' ? [ui.page] : lay.pages.map((_, i) => i);
    const scale = ui.exportDpi / 96;
    closeModal();
    toast(`正在渲染 ${pages.length} 页 · ${ui.exportDpi} DPI…`);

    await new Promise(r => setTimeout(r, 60));
    const canvas = document.createElement('canvas');
    const geo = HW.pageGeometry(state.settings);
    const results = [];

    for (const p of pages) {
      HW.render(canvas, state, p, { scale, layout: lay, resolveFont });
      if (ui.exportFormat === 'png') {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = pages.length > 1 ? `${name}-第${p + 1}页.png` : `${name}.png`;
        downloadBlob(blob, file);
        results.push(file);
        await new Promise(r => setTimeout(r, 220));
      } else {
        results.push(canvas.toDataURL('image/jpeg', 0.94));
      }
    }

    if (ui.exportFormat === 'pdf') {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { toast('PDF 组件未加载，请改用 PNG', 'error'); return; }
      const dim = HW.PAGE_SIZES[state.settings.paperSize] || HW.PAGE_SIZES.A4;
      const wmm = state.settings.landscape ? dim[1] : dim[0];
      const hmm = state.settings.landscape ? dim[0] : dim[1];
      const pdf = new jsPDF({ orientation: wmm > hmm ? 'l' : 'p', unit: 'mm', format: [wmm, hmm] });
      results.forEach((url, i) => {
        if (i > 0) pdf.addPage([wmm, hmm], wmm > hmm ? 'l' : 'p');
        pdf.addImage(url, 'JPEG', 0, 0, wmm, hmm);
      });
      pdf.save(`${name}.pdf`);
    }
    toast(`已导出 ${pages.length} 页手写稿`, 'ok');
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  function saveProject() {
    const data = JSON.stringify({ app: 'lianfan', version: 2, state });
    downloadBlob(new Blob([data], { type: 'application/json' }), `${state.title || '手写稿'}.lianfan.json`);
    toast('工程文件已保存', 'ok');
  }

  async function openProjectFile(file) {
    try {
      const o = JSON.parse(await file.text());
      const st = o.state || o;
      if (!st || !st.settings) throw new Error('格式不正确');
      state = {
        title: st.title ?? '', text: st.text ?? '', fontId: st.fontId || 'chenyu',
        settings: { ...defaultSettings(), ...st.settings }, version: 2,
      };
      applyTheme(state.settings.theme);
      syncTitleInputs();
      renderPanel();
      scheduleRender();
      commit(0);
      toast('工程已打开');
    } catch (e) { toast('打开失败：' + e.message, 'error'); }
  }

  /* ---------------- 快捷键 ---------------- */
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
      else if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveProject(); }
      else if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); openExport(); }
      else if (!mod && e.key === 'ArrowRight' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        if (ui.page < computeLayout().pages.length - 1) { ui.page++; renderPreview(); }
      } else if (!mod && e.key === 'ArrowLeft' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        if (ui.page > 0) { ui.page--; renderPreview(); }
      }
    });
  }

  /* ---------------- 引导 ---------------- */
  function showFileWarning() {
    if (document.querySelector('.file-warning')) return;
    const bar = document.createElement('div');
    bar.className = 'file-warning';
    bar.innerHTML = `<span class="fw-icon">!</span>
      <span class="fw-text"><b>当前是直接双击打开的网页</b>，浏览器禁止读取本地字体，手写字体暂时无法显示。
      请关闭本页，双击文件夹里的 <b>启动.bat</b>，然后访问 <b>http://127.0.0.1:8080/</b>。</span>
      <button type="button" class="fw-close" aria-label="关闭提示">×</button>`;
    const workspace = document.querySelector('.workspace');
    workspace.parentNode.insertBefore(bar, workspace);
    bar.querySelector('.fw-close').onclick = () => {
      bar.remove();
      if (ui.autoFit !== false) fitZoom();
    };
    setTimeout(() => { if (ui.autoFit !== false) fitZoom(); }, 60);
  }

  function showGuide() {
    openModal(`
      <button class="modal-close" data-close><svg class="ico"><use href="#i-close"/></svg></button>
      <h2>操作步骤</h2>
      <div class="modal-body guide-steps">
        <div class="guide-step"><b>1</b><span><strong>写内容</strong><br>粘贴正文或导入 TXT / Word，设置标题与段落对齐。</span></div>
        <div class="guide-step"><b>2</b><span><strong>选字体与纸</strong><br>13 款手写字体、8 种纸张；调「文字位置凌乱度」与「字体笔画凌乱度」。</span></div>
        <div class="guide-step"><b>3</b><span><strong>设涂改</strong><br>调「随机勾画涂改概率」（建议 1%–3%）与涂改样式，可叠加擦除重写。</span></div>
        <div class="guide-step"><b>4</b><span><strong>导出</strong><br>150 / 300 DPI 的 PNG 或 PDF；打印时选「实际大小」。</span></div>
      </div>
      <div class="modal-foot"><button class="primary" data-close>开始编辑</button></div>`);
  }

  /* ---------------- 启动 ---------------- */
  async function init() {
    // 启动遮罩
    const boot = document.createElement('div');
    boot.className = 'boot';
    boot.innerHTML = `<div class="boot-inner">
      <p>涟帆祈雨手写生成器</p><div class="bar"><i></i></div></div>`;
    document.body.appendChild(boot);

    loadLocal();
    buildTabs();
    applyTheme(state.settings.theme);
    bindPanelEvents();
    bindKeyboard();

    // 顶栏按钮
    $('#btnUndo').onclick = undo;
    $('#btnRedo').onclick = redo;
    $('#btnRandom').onclick = randomInk;
    $('#btnExport').onclick = openExport;
    $('#btnSaveProject').onclick = saveProject;
    $('#btnTheme').onclick = () => setTab('theme');
    $('#btnGuide').onclick = showGuide;
    $('#btnFit').onclick = fitZoom;

    $('#fileText').onchange = (e) => {
      const f = e.target.files[0];
      if (f) importTextFile(f).catch(err => toast('导入失败：' + err.message, 'error'));
      e.target.value = '';
    };
    // 字体与工程文件输入框在动态面板里，使用文档级委托
    document.addEventListener('change', (e) => {
      const el = e.target;
      if (el.id === 'fileFont' && el.files && el.files[0]) {
        importFontFile(el.files[0]).catch(err => toast('导入失败：' + err.message, 'error'));
        el.value = '';
      }
      if (el.id === 'fileProject' && el.files && el.files[0]) {
        openProjectFile(el.files[0]);
        el.value = '';
      }
    });



    $('#pagePrev').onclick = () => { if (ui.page > 0) { ui.page--; renderPreview(); } };
    $('#pageNext').onclick = () => { if (ui.page < computeLayout().pages.length - 1) { ui.page++; renderPreview(); } };
    $('#zoomRange').oninput = (e) => setZoom(Number(e.target.value), { manual: true });

    // 文档级点击：关闭弹窗
    $('#modalRoot').addEventListener('click', (e) => {
      if (e.target.id === 'modalRoot') closeModal();
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (ui.autoFit !== false) fitZoom(); }, 180);
    });
    window.addEventListener('beforeunload', () => saveLocal(0));

    // 先渲染外壳与占位纸，再等字体
    renderPanel();
    syncTitleInputs();
    renderPreview();
    fitZoom();

    await ensureFonts();
    if (location.protocol === 'file:') {
      showFileWarning();
    }
    renderPanel();
    scheduleRender();
    if (ui.tab === 'font') renderPanel();
    restoreUserFonts().then(() => { if (ui.tab === 'font') renderPanel(); });
    setTimeout(() => boot.classList.add('hide'), 120);
    setTimeout(() => boot.remove(), 600);

    currentSnap = snapshot();
    updateHistoryButtons();

    window.__LIANFAN__ = {
      get state() { return state; },
      get ui() { return ui; },
      computeLayout, renderPreview, setZoom, fitZoom, applyPreset, openExport, saveProject, resolveFont,
      importTextFile, doExport, toast,
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
