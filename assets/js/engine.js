/* ============================================================
   涟帆祈雨手写引擎 · engine.js
   - 页面与纸张（实拍纸 / A4纯白 / 横线 / 方格 / 田字 / 双线 / 点阵 / 牛皮）
   - 文本排版（中英混排、标点禁则、首行缩进、分页）
   - 字形抖动与笔画扭曲（位置凌乱度 / 笔画凌乱度）
   - 墨水、颗粒、飞溅与随机涂改
   ============================================================ */
(function (global) {
  'use strict';

  const PX = 96 / 25.4;
  const PAGE_SIZES = {
    A4: [210, 297], A5: [148, 210], B5: [176, 250], B4: [250, 353],
    Letter: [215.9, 279.4],
  };
  const PAGE_LABELS = {
    photo: '实拍横线纸', blank: 'A4 纯白', lined: '米色横线', grid: '方格稿纸',
    tian: '田字格', letter: '双线信纸', dot: '点阵笔记', kraft: '牛皮纸',
  };
  const CLOSING = '，。、；：？！…—～·」』》）〉】〕”’,.;:?!%';
  const OPENING = '（“‘「『《〈【〔([{';
  const LATIN = /[A-Za-z0-9@#$%&_+=\-'’]/;

  /* ---------------- 随机与颜色 ---------------- */
  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rndAt(seed, i) {
    return mulberry32((Math.imul(i + 1, 2246822519) ^ (seed >>> 0)) >>> 0);
  }
  function hexToRgb(hex) {
    let h = String(hex || '#000').replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function shade(hex, amt) {
    const c = hexToRgb(hex);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + (amt > 0 ? (255 - v) : v) * amt)));
    return '#' + [f(c.r), f(c.g), f(c.b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function rgba(hex, a) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------------- 纸张噪点 ---------------- */
  let noiseTile = null;
  function getNoise() {
    if (noiseTile) return noiseTile;
    const size = 180;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const img = x.createImageData(size, size);
    const rnd = mulberry32(20240607);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 176 + Math.floor(rnd() * 79);
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    // 少许纸纤维
    x.globalAlpha = 0.16;
    x.strokeStyle = '#8d8372';
    x.lineWidth = 0.6;
    for (let i = 0; i < 90; i++) {
      const px = rnd() * size, py = rnd() * size, len = 2 + rnd() * 9, ang = rnd() * Math.PI;
      x.beginPath();
      x.moveTo(px, py);
      x.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len);
      x.stroke();
    }
    noiseTile = c;
    return c;
  }

  function applyGrain(ctx, W, H, amount, mode) {
    if (amount <= 0.004) return;
    const pat = ctx.createPattern(getNoise(), 'repeat');
    ctx.save();
    ctx.globalCompositeOperation = mode || 'multiply';
    ctx.globalAlpha = clamp(amount * 0.5, 0, 0.5);
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---------------- 几何 ---------------- */
  function pageGeometry(settings) {
    const s = settings;
    const dim = PAGE_SIZES[s.paperSize] || PAGE_SIZES.A4;
    const wmm = s.landscape ? dim[1] : dim[0];
    const hmm = s.landscape ? dim[0] : dim[1];
    return {
      wmm, hmm,
      W: wmm * PX,
      H: hmm * PX,
      contentLeft: (s.marginLeft ?? 20) * PX,
      contentRight: (wmm - (s.marginRight ?? 20)) * PX,
      top: (s.marginTop ?? 20) * PX,
      bottom: (hmm - (s.marginBottom ?? 20)) * PX,
    };
  }

  /* ---------------- 字宽 ---------------- */
  let measureCanvas = null;
  function fallbackMeasure(text, size, family) {
    if (!measureCanvas) measureCanvas = document.createElement('canvas');
    const c = measureCanvas.getContext('2d');
    c.font = `${size}px ${family || 'sans-serif'}`;
    return c.measureText(text).width;
  }
  const CJK_RE = /[\u1100-\u11FF\u2E80-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6\u3000-\u303F]/;
  function isCJK(ch) { return CJK_RE.test(ch); }

  function charAdvance(rec, ch, size) {
    let adv = 0;
    let found = false;
    if (rec && rec.otf) {
      try {
        const g = rec.otf.charToGlyph(ch);
        const upm = rec.otf.unitsPerEm || 1000;
        adv = g && g.advanceWidth ? (g.advanceWidth / upm) * size : size * 0.5;
        found = true;
      } catch (e) { /* ignore */ }
    }
    if (!found) {
      if (rec && rec.cssFamily) adv = fallbackMeasure(ch, size, rec.cssFamily);
      else adv = size;
    }
    // 中文按全角计算：手写字体常是比例字宽，直接用会挤在一起
    if (isCJK(ch) && adv < size) adv = size;
    return adv;
  }

  /* ---------------- 排版 ---------------- */
  function tokenize(str) {
    const out = [];
    let i = 0;
    while (i < str.length) {
      const ch = str[i];
      if (LATIN.test(ch)) {
        let j = i;
        while (j < str.length && LATIN.test(str[j])) j++;
        out.push(str.slice(i, j));
        i = j;
      } else {
        out.push(ch);
        i++;
      }
    }
    return out;
  }

  function layout(state, geo, resolve) {
    const s = state.settings;
    const text = (state.text || '').replace(/\r\n?/g, '\n');
    const size = s.fontSize;
    const ls = s.letterSpacing || 0;
    const cellMode = s.paperKind === 'grid' || s.paperKind === 'tian';
    // 方格 / 田字格：一字一格，字格为正方形，字距自动补足到格宽
    const cell = cellMode ? Math.round(size * 1.45) : 0;
    const lh = cellMode ? cell : s.lineHeight;
    const lsEff = cellMode ? Math.max(cell - size, 1) : ls;
    const colW = geo.contentRight - geo.contentLeft;
    const title = (state.title || '').trim();
    const titleSize = s.titleSize || 30;

    let bodyTop = geo.top;
    let titleBaseline = null;
    if (title) {
      titleBaseline = geo.top + titleSize * 1.02;
      bodyTop = titleBaseline + titleSize * 0.62 + lh * 0.42;
    }
    const bottomLimit = geo.bottom - (s.showPageNumber ? size * 0.9 : 0);

    const paragraphs = text.split('\n');
    const pages = [];
    let page = { lines: [] };
    let row = 0;                       // 当前页行序号
    let charIndex = 0;
    let totalChars = 0;

    const rowTop = (idx) => bodyTop + idx * lh;
    const baselineOf = (idx) => {
      const center = ['grid', 'tian', 'blank', 'dot'].includes(s.paperKind);
      return center
        ? rowTop(idx) + lh / 2 + size * 0.36
        : rowTop(idx) + lh - size * 0.2;
    };

    if (title) {
      let tx = 0;
      const chars = Array.from(title).map((ch, i) => {
        const adv = charAdvance(resolve(ch), ch, titleSize);
        const o = { ch, x: tx, adv, idx: i };
        tx += adv;
        return o;
      });
      page.lines.push({
        baseline: titleBaseline, x0: geo.contentLeft, width: tx,
        chars, isTitle: true, row: -1,
      });
    }

    const commit = (ln) => {
      if (ln.baseline + size * 1.12 > bottomLimit && row > 0) {
        pages.push(page);
        page = { lines: [] };
        row = 0;
        ln.baseline = baselineOf(0);
        ln.row = 0;
      }
      page.lines.push(ln);
      row++;
    };
    const newLine = () => ({ baseline: baselineOf(row), row, chars: [] });

    paragraphs.forEach((para, pIdx) => {
      if (para.length === 0) {
        if (row > 0) commit(newLine());
        return;
      }
      let indent = s.indent || 0;
      if (cellMode) {
        // 方格纸必须整格缩进，否则字会落在格线上
        indent = Math.max(0, Math.round(indent));
      } else if (s.randomIndent && indent > 0) {
        const r = rndAt(s.seed ^ (pIdx * 7919), 13)();
        indent = Math.max(0, indent * (0.55 + r * 0.85));
      }
      let line = newLine();
      let lineW = indent * (cellMode ? lh : size);
      line.chars.push({ ch: '', x: 0, adv: lineW, idx: charIndex++, indent: true });

      const tokens = tokenize(para);
      const maxW = colW;
      const breakLine = () => { commit(line); line = newLine(); lineW = 0; };

      for (let t = 0; t < tokens.length; t++) {
        const tok = tokens[t];
        let tokW = 0;
        for (const ch of tok) tokW += charAdvance(resolve(ch), ch, size) + lsEff;
        const isClosing = tok.length === 1 && CLOSING.includes(tok);
        const prev = line.chars.length ? line.chars[line.chars.length - 1].ch : '';

        if (lineW + tokW > maxW + 0.01 && line.chars.length > 0) {
          if (tok === ' ') continue;
          const hang = isClosing && lineW + tokW < maxW + size * 1.25;
          if (!hang) {
            if (OPENING.includes(prev) && line.chars.length > 1) {
              const moved = line.chars.pop();
              breakLine();
              const w0 = charAdvance(resolve(moved.ch), moved.ch, size) + lsEff;
              line.chars.push({ ch: moved.ch, x: lineW, adv: w0, w: w0 - lsEff, idx: moved.idx });
              lineW += w0;
            } else {
              breakLine();
            }
          }
        }
        if (tok === ' ' && lineW === 0) continue;
        for (const ch of tok) {
          const advW = charAdvance(resolve(ch), ch, size) + lsEff;
          line.chars.push({ ch, x: lineW, adv: advW, w: advW - lsEff, idx: charIndex++ });
          lineW += advW;
          if (ch !== ' ' && ch !== '\u3000') totalChars++;
        }
      }
      commit(line);
    });

    if (page.lines.length || pages.length === 0) pages.push(page);

    // 计算每行总宽（用于对齐）
    pages.forEach(pg => pg.lines.forEach(l => {
      let w = 0;
      l.chars.forEach(c => { w = Math.max(w, c.x + c.adv); });
      l.width = w;
    }));

    return {
      pages, totalChars, geo,
      bodyTop, bottomLimit, lineHeight: lh, fontSize: size, titleBaseline,
    };
  }

  /* ---------------- 字形路径 ---------------- */
  const pathCache = new Map();

  function warpedPath(rec, ch, size, variant, mess, shear, spread) {
    const sizeQ = Math.round(size * 2) / 2;
    const mq = Math.round(mess * 10);
    const key = rec.id + '|' + ch + '|' + sizeQ + '|' + variant + '|' + mq + '|' + shear.toFixed(2) + '|' + spread.toFixed(2);
    const hit = pathCache.get(key);
    if (hit) return hit;

    let glyph;
    try { glyph = rec.otf.charToGlyph(ch); } catch (e) { glyph = null; }
    const path = glyph ? glyph.getPath(0, 0, sizeQ) : null;
    if (!path || !path.commands.length) { pathCache.set(key, null); return null; }

    const rnd = mulberry32((rec.id.length * 131 + ch.charCodeAt(0) * 17 + variant * 7919) >>> 0);
    const a1 = 2.0 + rnd() * 2.4;
    const a2 = 3.4 + rnd() * 3.6;
    const p1 = rnd() * Math.PI * 2, p2 = rnd() * Math.PI * 2, p3 = rnd() * Math.PI * 2, p4 = rnd() * Math.PI * 2;
    const amp = mess * sizeQ * 0.055;

    const warp = (x, y) => {
      if (amp <= 0.0001) return [x, y];
      const nx = x / sizeQ, ny = y / sizeQ;
      const dx = amp * (Math.sin(ny * a1 + p1) * 0.72 + Math.sin(ny * a2 + p2) * 0.28);
      const dy = amp * (Math.sin(nx * a1 * 0.9 + p3) * 0.72 + Math.sin(nx * a2 * 0.8 + p4) * 0.28);
      return [x + dx, y + dy];
    };

    const p2d = new Path2D();
    const cmds = path.commands;
    for (let i = 0; i < cmds.length; i++) {
      const c = cmds[i];
      if (c.type === 'M') { const [x, y] = warp(c.x, c.y); p2d.moveTo(x, y); }
      else if (c.type === 'L') { const [x, y] = warp(c.x, c.y); p2d.lineTo(x, y); }
      else if (c.type === 'C') {
        const [x1, y1] = warp(c.x1, c.y1); const [x2, y2] = warp(c.x2, c.y2); const [x, y] = warp(c.x, c.y);
        p2d.bezierCurveTo(x1, y1, x2, y2, x, y);
      } else if (c.type === 'Q') {
        const [x1, y1] = warp(c.x1, c.y1); const [x, y] = warp(c.x, c.y);
        p2d.quadraticCurveTo(x1, y1, x, y);
      } else if (c.type === 'Z') p2d.closePath();
    }
    if (pathCache.size > 4000) pathCache.clear();
    pathCache.set(key, p2d);
    return p2d;
  }

  /* ---------------- 涂改标记 ---------------- */
  function drawCorrection(ctx, x, baseline, size, adv, style, ink, alpha, seed, idx) {
    const r = rndAt(seed ^ 0x5bf03635, idx * 11 + 5);
    const top = baseline - size * 0.78;
    const bot = baseline + size * 0.08;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const wavy = (x1, y1, x2, y2, amp, lw, a) => {
      ctx.globalAlpha = a * alpha;
      ctx.lineWidth = lw;
      const steps = 7;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t + Math.sin(t * 7 + r() * 3) * amp;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    };

    if (style === 'strike') {
      wavy(x - size * 0.12, baseline - size * 0.34, x + adv + size * 0.12, baseline - size * 0.3, size * 0.05, size * 0.05, 0.85);
    } else if (style === 'scribble') {
      const n = 4 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const y = top + (bot - top) * (0.12 + r() * 0.8);
        wavy(x - size * 0.14, y, x + adv + size * 0.14, y + (r() - 0.5) * size * 0.2, size * 0.035, size * 0.038, 0.8);
      }
    } else if (style === 'circle') {
      ctx.globalAlpha = 0.8 * alpha;
      ctx.lineWidth = size * 0.042;
      const cx = x + adv / 2, cy = baseline - size * 0.36;
      const rx = adv * 0.62, ry = size * 0.56;
      ctx.beginPath();
      const start = -0.5;
      for (let i = 0; i <= 26; i++) {
        const t = start + (i / 26) * Math.PI * 2.12;
        const wob = 1 + Math.sin(t * 3.1 + r()) * 0.05;
        const px = cx + Math.cos(t) * rx * wob;
        const py = cy + Math.sin(t) * ry * wob;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    } else if (style === 'blackout') {
      ctx.globalAlpha = 0.88 * alpha;
      const h = size * 0.82;
      const y = baseline - size * 0.7;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const x0 = x - size * 0.1 + (r() - 0.5) * 2;
        const x1 = x + adv + size * 0.1 + (r() - 0.5) * 2;
        ctx.moveTo(x0, y + (r() - 0.5) * 2);
        ctx.lineTo(x1, y + (r() - 0.5) * 2);
        ctx.lineTo(x1, y + h + (r() - 0.5) * 2);
        ctx.lineTo(x0, y + h + (r() - 0.5) * 2);
        ctx.closePath();
        ctx.fill();
      }
    } else if (style === 'erase') {
      ctx.globalAlpha = 0.5 * alpha;
      ctx.strokeStyle = '#f7f2e6';
      ctx.lineWidth = size * 0.16;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const y = top + (bot - top) * (0.2 + r() * 0.7);
        ctx.moveTo(x - size * 0.05, y);
        ctx.lineTo(x + adv * (0.5 + r() * 0.6), y + (r() - 0.5) * size * 0.1);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /* ---------------- 纸张绘制 ---------------- */
  function drawPaper(ctx, W, H, s, info) {
    const kind = s.paperKind || 'photo';
    const base = s.paperColor || '#fffdf7';
    const line = s.lineColor || '#ad4a3b';
    const lh = info.lineHeight || 38;
    const bodyTop = info.bodyTop || 0;
    const bottom = info.bottomLimit || H - 40;
    const cl = info.contentLeft || 76;
    const cr = info.contentRight || W - 76;

    // 底色（近乎垂直的柔和光照）
    const g = ctx.createLinearGradient(W * 0.15, 0, W * 0.75, H);
    g.addColorStop(0, shade(base, 0.05));
    g.addColorStop(0.45, base);
    g.addColorStop(1, shade(base, -0.035));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (kind === 'kraft') {
      ctx.fillStyle = 'rgba(120,86,48,0.14)';
      ctx.fillRect(0, 0, W, H);
    }

    // 纸张颗粒
    applyGrain(ctx, W, H, (s.texture ?? 0.3) * (kind === 'blank' ? 0.7 : 1), 'multiply');

    // 纸张纤维纹理（竖向细纹）
    if ((s.texture ?? 0.3) > 0.05 && kind !== 'blank') {
      ctx.save();
      ctx.globalAlpha = (s.texture ?? 0.3) * 0.05;
      const rnd = mulberry32(77123);
      for (let i = 0; i < 140; i++) {
        ctx.strokeStyle = rnd() > 0.5 ? '#ffffff' : '#8a7c64';
        ctx.lineWidth = 0.5;
        const x = rnd() * W;
        ctx.beginPath();
        ctx.moveTo(x, rnd() * H);
        ctx.lineTo(x + (rnd() - 0.5) * 6, rnd() * H);
        ctx.stroke();
      }
      ctx.restore();
    }

    const rows = [];
    for (let y = bodyTop; y <= bottom + 0.5; y += lh) rows.push(y);
    const fsz = info.fontSize || 24;
    // 文字基线：与排版里的 baselineOf 保持一致（非居中纸张）
    const ruleY = (row) => row + lh - fsz * 0.2 + Math.max(1, fsz * 0.035);

    ctx.save();
    ctx.lineCap = 'butt';

    if (kind === 'blank') {
      // pure A4 white：无格线
    } else if (kind === 'photo') {
      // 实拍活页纸：淡蓝横线 + 竖向分栏线 + 装订孔
      ctx.strokeStyle = rgba(line, 0.62);
      ctx.lineWidth = 1.05;
      rows.forEach((row) => {
        const y = ruleY(row);
        ctx.beginPath();
        ctx.moveTo(cl - 16, y);
        ctx.lineTo(cr + 30, y);
        ctx.stroke();
      });
      // 竖向分栏（淡一些，像纸张本身的印刷线）
      ctx.strokeStyle = rgba(line, 0.2);
      [cl - 12, cr + 20].forEach(x => {
        ctx.beginPath(); ctx.moveTo(x, bodyTop - lh * 0.4); ctx.lineTo(x, bottom + lh * 0.4); ctx.stroke();
      });
      // 装订孔
      ctx.fillStyle = 'rgba(70,58,40,0.10)';
      [0.18, 0.42, 0.66].forEach((p, i) => {
        const cy = bodyTop + (bottom - bodyTop) * p;
        ctx.beginPath(); ctx.arc(cl - 26, cy + 2, 10.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.arc(cl - 26, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(120,105,82,0.16)';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cl - 26, cy, 9, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(70,58,40,0.10)';
      });
      // 左下角翻卷阴影
      const lg = ctx.createLinearGradient(0, H, W * 0.3, H * 0.82);
      lg.addColorStop(0, 'rgba(96,78,52,0.10)');
      lg.addColorStop(1, 'rgba(96,78,52,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, H * 0.8, W * 0.35, H * 0.2);
    } else if (kind === 'lined' || kind === 'letter') {
      ctx.strokeStyle = rgba(line, kind === 'letter' ? 0.5 : 0.62);
      ctx.lineWidth = 1;
      rows.forEach(row => {
        if (kind === 'letter') {
          [row + lh * 0.14, ruleY(row)].forEach(y => {
            ctx.beginPath(); ctx.moveTo(cl - 6, y); ctx.lineTo(cr + 6, y); ctx.stroke();
          });
        } else {
          const y = ruleY(row);
          ctx.beginPath(); ctx.moveTo(cl - 6, y); ctx.lineTo(cr + 6, y); ctx.stroke();
        }
      });
      if (kind === 'letter') {
        ctx.strokeStyle = rgba(line, 0.22);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cl - 12, bodyTop); ctx.lineTo(cl - 12, bottom); ctx.stroke();
      }
    } else if (kind === 'grid' || kind === 'tian') {
      const cell = lh;
      ctx.strokeStyle = rgba(line, 0.42);
      ctx.lineWidth = 1;
      rows.forEach(row => {
        for (let x = cl; x <= cr + cell; x += cell) {
          ctx.beginPath(); ctx.moveTo(x, row); ctx.lineTo(x, row + lh); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(cl, row); ctx.lineTo(cr + cell, row); ctx.stroke();
      });
      if (rows.length) {
        const yEnd = rows[rows.length - 1] + lh;
        ctx.beginPath(); ctx.moveTo(cl, yEnd); ctx.lineTo(cr + cell, yEnd); ctx.stroke();
      }
      if (kind === 'tian') {
        ctx.strokeStyle = rgba(line, 0.28);
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 0.9;
        rows.forEach(row => {
          for (let x = cl; x < cr; x += cell) {
            ctx.beginPath(); ctx.moveTo(x, row); ctx.lineTo(x + cell, row + lh); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + cell, row); ctx.lineTo(x, row + lh); ctx.stroke();
          }
        });
        ctx.setLineDash([]);
      }
    } else if (kind === 'dot') {
      const gap = Math.max(14, lh * 0.7);
      ctx.fillStyle = rgba(line, 0.5);
      for (let y = bodyTop; y <= bottom; y += gap) {
        for (let x = cl - 4; x <= cr + 4; x += gap) {
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();

    // 纸边与暗角
    const edge = ctx.createLinearGradient(0, 0, 14, 0);
    edge.addColorStop(0, 'rgba(90,72,48,0.10)');
    edge.addColorStop(1, 'rgba(90,72,48,0)');
    ctx.fillStyle = edge; ctx.fillRect(0, 0, 14, H);
    const edge2 = ctx.createLinearGradient(W, 0, W - 14, 0);
    edge2.addColorStop(0, 'rgba(90,72,48,0.08)');
    edge2.addColorStop(1, 'rgba(90,72,48,0)');
    ctx.fillStyle = edge2; ctx.fillRect(W - 14, 0, 14, H);

    if (s.photoLight !== false) {
      const v = ctx.createRadialGradient(W * 0.42, H * 0.36, Math.min(W, H) * 0.18, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.62);
      v.addColorStop(0, 'rgba(255,252,240,0.10)');
      v.addColorStop(0.62, 'rgba(120,100,70,0.02)');
      v.addColorStop(1, 'rgba(78,60,36,0.13)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* ---------------- 文字层 ---------------- */
  let layer = null;
  function getLayer(W, H, scale) {
    const cw = Math.max(1, Math.round(W * scale));
    const chh = Math.max(1, Math.round(H * scale));
    if (!layer) layer = document.createElement('canvas');
    if (layer.width !== cw || layer.height !== chh) {
      layer.width = cw;
      layer.height = chh;
    } else {
      const c = layer.getContext('2d');
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, cw, chh);
    }
    return layer;
  }

  function render(canvas, state, pageIndex, opts) {
    opts = opts || {};
    const s = state.settings;
    const scale = opts.scale || 1;
    const geo = pageGeometry(s);
    const W = geo.W, H = geo.H;

    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    canvas.style.width = Math.round(W) + 'px';
    canvas.style.height = Math.round(H) + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const resolve = opts.resolveFont || (() => null);
    const lay = opts.layout || layout(state, geo, resolve);
    const idx = clamp(pageIndex || 0, 0, lay.pages.length - 1);
    const page = lay.pages[idx];

    drawPaper(ctx, W, H, s, lay);

    const tl = getLayer(W, H, scale);
    const tctx = tl.getContext('2d');
    tctx.setTransform(scale, 0, 0, scale, 0, 0);
    tctx.clearRect(0, 0, W, H);
    tctx.textBaseline = 'alphabetic';
    tctx.lineJoin = 'round';
    tctx.lineCap = 'round';

    const ink = s.inkColor || '#1e2b3a';
    const cellMode = s.paperKind === 'grid' || s.paperKind === 'tian';
    const size = s.fontSize;
    const lh = s.lineHeight;
    const jitter = s.jitter || 0;
    const rotAmt = s.rotation || 0;
    const sizeVar = (s.sizeVariation || 0) / 100;
    const wave = s.baselineWave || 0;
    const tilt = (s.lineTilt || 0) * Math.PI / 180;
    const mess = clamp(s.strokeMessiness ?? 0.35, 0, 1);
    const inkAlpha = s.inkOpacity ?? 0.9;
    const inkVar = s.inkVariation ?? 0.2;
    const penW = (s.penWidth ?? 0.1) * size * 0.09;
    const strokeVar = clamp(s.strokeVariation ?? 0.4, 0, 1);
    const grain = s.inkGrain ?? 0.2;
    const corrP = clamp(s.correctionProbability || 0, 0, 0.5);
    const mix = (s.correctionMix && s.correctionMix.length) ? s.correctionMix : ['strike', 'scribble', 'circle', 'blackout'];
    const distRate = clamp(s.inkDisturbanceRate ?? 0.25, 0, 1);
    const distStr = clamp(s.inkDisturbanceStrength ?? 0.3, 0, 1);
    const seed = s.seed || 1234567;
    const spread = clamp(s.looseness ?? 0.35, 0, 1);
    const strokeW = penW;

    let drawCount = 0;

    page.lines.forEach((line, li) => {
      const lineSeed = seed ^ Math.imul(li + 1, 2654435761);
      const cos = Math.cos(tilt), sin = Math.sin(tilt);

      line.chars.forEach((c) => {
        if (!c.ch || c.ch === ' ') return;
        const rec = resolve(c.ch);
        if (!rec && !c.isTitle) return;

        const R = rndAt(lineSeed ^ c.idx, c.idx);
        const r1 = R(), r2 = R(), r3 = R(), r4 = R(), r5 = R(), r6 = R(), r7 = R(), r8 = R();

        let x = geo.contentLeft + c.x;
        // 对齐
        const align = c.isTitle ? 'center' : (s.align || 'left');
        if (align === 'center') x = geo.contentLeft + (line.width < geo.contentRight - geo.contentLeft
          ? (geo.contentRight - geo.contentLeft - line.width) / 2 : 0) + c.x;
        else if (align === 'right') x = geo.contentRight - line.width + c.x;

        // 方格 / 田字格：把字居中放进格子里
        if (cellMode && !c.isTitle && c.w) {
          x += Math.max(0, (c.adv - c.w) / 2);
        }

        let y = line.baseline;

        // 字形抖动
        const jx = (r1 - 0.5) * 2 * jitter;
        const jy = (r2 - 0.5) * 2 * jitter * 0.68;
        const rot = ((r3 - 0.5) * 2 * rotAmt) * Math.PI / 180;
        const sc = 1 + (r4 - 0.5) * 2 * sizeVar * (c.isTitle ? 0.3 : 1);
        const waveY = Math.sin((c.idx + li * 7) * 0.42 + (seed % 100) * 0.017) * wave * 0.55;
        const chSize = (c.isTitle ? (s.titleSize || 30) : size) * 1.08;
        const adv = c.adv;

        const dx = jx, dy = jy + waveY;

        // 整行倾斜（绕内容左边界旋转）
        const px0 = x - geo.contentLeft, py0 = y - line.baseline;
        const rx = geo.contentLeft + px0 * cos - py0 * sin;
        const ry = line.baseline + px0 * sin + py0 * cos;

        const alpha = clamp(
          (c.isTitle ? Math.max(inkAlpha, 0.85) : inkAlpha) * (1 - inkVar * r5 * 0.62) * (0.9 + r6 * 0.14),
          0.12, 1
        );

        const shear = (r7 - 0.5) * 0.14 * spread;
        const variant = Math.floor(r8 * 4);
        const erase = c.corrected === 'erase';
        const a = erase ? alpha * 0.22 : alpha;

        tctx.save();
        tctx.translate(rx + dx, ry + dy);
        tctx.rotate(rot + tilt * (c.isTitle ? 0 : 1));
        tctx.scale(sc, sc);
        tctx.globalAlpha = a;

        const recFont = rec && rec.otf ? rec : null;
        if (recFont) {
          const path = warpedPath(recFont, c.ch, chSize, variant, mess, shear, spread);
          if (path) {
            tctx.fillStyle = ink;
            tctx.fill(path);
            // 墨迹晕染
            if (inkAlpha > 0.5) {
              tctx.globalAlpha = a * 0.26;
              tctx.save();
              tctx.translate(0.45, 0.35);
              tctx.fill(path);
              tctx.restore();
            }
            if (strokeW > 0.02) {
              tctx.globalAlpha = a * (0.5 + strokeVar * 0.4);
              tctx.strokeStyle = ink;
              tctx.lineWidth = strokeW * (0.7 + r5 * 0.6);
              tctx.stroke(path);
            }
          }
        } else {
          tctx.font = `${chSize}px ${(rec && rec.cssFamily) || 'sans-serif'}`;
          tctx.fillStyle = ink;
          tctx.fillText(c.ch, 0, 0);
        }

        // 墨点飞溅
        if (distRate > 0 && r6 < distRate) {
          const n = 1 + Math.floor(r7 * 3);
          tctx.fillStyle = ink;
          for (let i = 0; i < n; i++) {
            const ang = r5 * Math.PI * 2 + i;
            const dist = chSize * (0.45 + r8 * 0.55);
            tctx.globalAlpha = a * distStr * (0.25 + r1 * 0.5);
            tctx.beginPath();
            tctx.arc(Math.cos(ang) * dist + chSize * 0.4, Math.sin(ang) * dist - chSize * 0.35,
              chSize * (0.012 + r3 * 0.03), 0, Math.PI * 2);
            tctx.fill();
          }
        }
        tctx.restore();

        // 涂改
        if (corrP > 0 && r4 < corrP) {
          let style = s.correctionStyle || 'mixed';
          if (style === 'mixed') style = mix[Math.floor(r2 * mix.length)] || 'strike';
          drawCorrection(tctx, rx + dx, ry + dy, chSize, adv, style, ink, clamp(a + 0.1, 0, 1), seed, c.idx);
        }
        drawCount++;
      });
    });

    // 页码
    if (s.showPageNumber) {
      const num = String(idx + 1);
      const y = H - (s.marginBottom ?? 20) * PX * 0.42;
      tctx.save();
      tctx.globalAlpha = 0.5;
      tctx.fillStyle = ink;
      tctx.font = `${Math.max(9, size * 0.42)}px ${(resolve('1') && resolve('1').cssFamily) || 'sans-serif'}`;
      tctx.textAlign = 'center';
      tctx.fillText(`— ${num} —`, W / 2, y);
      tctx.restore();
    }

    // 墨迹颗粒（颗粒侵蚀）
    if (grain > 0.02) {
      tctx.save();
      tctx.setTransform(1, 0, 0, 1, 0, 0);
      tctx.globalCompositeOperation = 'destination-out';
      tctx.globalAlpha = clamp(grain * 0.42, 0, 0.5);
      const pat = tctx.createPattern(getNoise(), 'repeat');
      tctx.fillStyle = pat;
      tctx.fillRect(0, 0, tl.width, tl.height);
      tctx.restore();
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(tl, 0, 0);
    ctx.restore();

    return { layout: lay, page, pageCount: lay.pages.length, geo };
  }

  /* ---------------- 纸张缩略图 ---------------- */
  function renderThumb(canvas, kind, settings) {
    const s = { ...settings, paperKind: kind };
    const W = 150, H = 76;
    const dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const lh = 10;
    const info = {
      lineHeight: lh,
      bodyTop: 5,
      bottomLimit: H - 4,
      contentLeft: 12,
      contentRight: W - 8,
    };
    const small = { ...s, fontSize: 9, letterSpacing: 0, texture: Math.max(0.12, s.texture || 0), photoLight: kind === 'photo' };
    drawPaper(ctx, W, H, small, info);
  }

  global.HW = {
    PX, PAGE_SIZES, PAGE_LABELS,
    pageGeometry, layout, render, renderThumb,
    mulberry32, rndAt, shade, rgba, clamp,
  };
})(window);
