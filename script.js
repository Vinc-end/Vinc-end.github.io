// cursor glow
const glow = document.getElementById('glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});
// nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});
// scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      if (el.classList.contains('skill-item')) {
        const siblings = [...el.parentElement.children];
        const idx = siblings.indexOf(el);
        el.style.animationDelay = (idx * 60) + 'ms';
      }
      el.classList.add('visible');
      observer.unobserve(el);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.skill-item, .project-item, .contact-block').forEach(el => {
  observer.observe(el);
});
// ── links tree ──
(function () {
  const root = document.getElementById('dtRoot');
  const trigger = document.getElementById('dtTrigger');
  const tree = document.getElementById('dtTree');
  const list = document.getElementById('dtList');
  const NODES = [
    {
      id: 'contact', label: 'Contact', angle: 220, dist: 200,
      subs: [
        { label: 'Email',  href: 'mailto:',                     angle: 220, dist: 145 },
        { label: 'Github', href: 'https://github.com/Vinc-end', angle: -40, dist: 145 }
      ]
    },
    {
      id: 'websites', label: 'Websites', angle: -50, dist: 160,
      subs: [
        { label: 'Portfolio',   href: '#',                    angle: -100, dist: 140 },
        { label: 'Gatemedia',   href: 'https://gatemedia.pl', angle: -55,  dist: 145 },
        { label: 'Placeholder', href: '#',                    angle: -10,  dist: 140 }
      ]
    },
    {
      id: 'python', label: 'Python', angle: 50, dist: 160,
      subs: [
        { label: 'Game',   href: '#', angle: 10,  dist: 145 },
        { label: 'Placeholder', href: '#', angle: 55,  dist: 145 },
        { label: 'Placeholder', href: '#', angle: 100, dist: 140 }
      ]
    }
  ];
  let open = false;
  let activeNode = null;
  let hideTimer = null;
  let resizeTimer = null;
  const compactMq = window.matchMedia('(max-width: 760px)');
  const isCompact = () => compactMq.matches;
  let wasCompact = isCompact();
  const degToRad = d => d * Math.PI / 180;
  // Geometry scales down on smaller (non-compact) screens so the
  // radial nodes never overflow the viewport.
  function scaleFactor() {
    const w = window.innerWidth;
    if (w >= 1100) return 1;
    return Math.max(0.6, w / 1100);
  }
  /* ---------- radial connectors ---------- */
  function drawConnector(x1, y1, x2, y2, delay, parentId) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const line = document.createElement('div');
    line.className = 'dt-line';
    if (parentId) line.dataset.parentId = parentId;
    line.style.width = len + 'px';
    line.style.transform = `translate(${x1}px, ${y1}px) rotate(${ang}deg) scaleX(0)`;
    tree.appendChild(line);
    setTimeout(() => {
      line.style.transition = 'transform 0.35s ease, opacity 0.2s ease';
      line.style.transform = `translate(${x1}px, ${y1}px) rotate(${ang}deg) scaleX(1)`;
      line.style.opacity = '1';
    }, Math.max(0, delay - 20));
  }
  /* ---------- radial nodes ---------- */
  function openRadial() {
    tree.innerHTML = '';
    const s = scaleFactor();
    NODES.forEach((nd, i) => {
      const rad = degToRad(nd.angle);
      const x = Math.cos(rad) * nd.dist * s;
      const y = Math.sin(rad) * nd.dist * s;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'dt-node';
      el.textContent = nd.label;
      el.dataset.id = nd.id;
      el.dataset.base = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
      el.style.transform = el.dataset.base + ' scale(0.4)';
      el.style.left = '0';
      el.style.top = '0';
      el.style.pointerEvents = 'auto';
      tree.appendChild(el);
      el.addEventListener('mouseenter', () => { clearTimeout(hideTimer); if (open) showSubs(nd, x, y, s); });
      el.addEventListener('mouseleave', () => { hideTimer = setTimeout(hideSubs, 3000); });
      el.addEventListener('click', e => {
        e.stopPropagation();
        clearTimeout(hideTimer);
        activeNode === nd.id ? hideSubs() : showSubs(nd, x, y, s);
      });
      const delay = 60 + i * 80;
      setTimeout(() => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease';
        el.style.transform = el.dataset.base + ' scale(1)';
        el.style.opacity = '1';
      }, delay);
      drawConnector(0, 0, x, y, delay, null);
    });
  }
  function showSubs(nd, px, py, s) {
    hideSubs();
    activeNode = nd.id;
    nd.subs.forEach((sub, i) => {
      const rad = degToRad(sub.angle);
      const sx = px + Math.cos(rad) * sub.dist * s;
      const sy = py + Math.sin(rad) * sub.dist * s;
      const el = document.createElement('a');
      el.className = 'dt-sub';
      el.href = sub.href || '#';
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.innerHTML = sub.label.replace('\n', '<br>');
      el.dataset.parentId = nd.id;
      el.dataset.base = `translate(calc(${sx}px - 50%), calc(${sy}px - 50%))`;
      el.style.transform = el.dataset.base + ' scale(0.3)';
      el.style.left = '0';
      el.style.top = '0';
      el.style.pointerEvents = 'auto';
      tree.appendChild(el);
      const delay = i * 55;
      setTimeout(() => {
        el.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease, border-color 0.2s, color 0.2s, background 0.2s';
        el.style.transform = el.dataset.base + ' scale(1)';
        el.style.opacity = '1';
      }, delay);
      drawConnector(px, py, sx, sy, delay, nd.id);
    });
  }
  function hideSubs() {
    activeNode = null;
    tree.querySelectorAll('[data-parent-id]').forEach(el => {
      el.style.transition = 'transform 0.2s ease, opacity 0.15s ease';
      el.style.opacity = '0';
      if (el.classList.contains('dt-sub')) {
        el.style.transform = (el.dataset.base || '') + ' scale(0.3)';
      }
      setTimeout(() => el.remove(), 220);
    });
  }
  function closeRadial() {
    [...tree.children].forEach(el => {
      el.style.transition = 'transform 0.25s ease, opacity 0.2s ease';
      el.style.opacity = '0';
      if (el.classList.contains('dt-node') || el.classList.contains('dt-sub')) {
        el.style.transform = (el.dataset.base || '') + ' scale(0.4)';
      }
    });
    setTimeout(() => { if (!open) tree.innerHTML = ''; }, 260);
  }
  /* ---------- compact list mode ---------- */
  function buildList() {
    list.innerHTML = '';
    NODES.forEach(nd => {
      const group = document.createElement('div');
      group.className = 'dt-list-group';
      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'dt-list-head';
      head.innerHTML = `<span>${nd.label.replace('\n', ' ')}</span><span class="dt-caret">+</span>`;
      const subs = document.createElement('div');
      subs.className = 'dt-list-subs';
      nd.subs.forEach(sub => {
        const a = document.createElement('a');
        a.className = 'dt-list-link';
        a.href = sub.href || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = sub.label.replace('\n', ' ');
        subs.appendChild(a);
      });
      head.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = group.classList.toggle('open');
        head.querySelector('.dt-caret').textContent = isOpen ? '–' : '+';
      });
      group.appendChild(head);
      group.appendChild(subs);
      list.appendChild(group);
    });
  }
  function openList() {
    if (!list.children.length) buildList();
    requestAnimationFrame(() => list.classList.add('open'));
  }
  function closeList() {
    list.classList.remove('open');
    list.querySelectorAll('.dt-list-group.open').forEach(g => {
      g.classList.remove('open');
      const c = g.querySelector('.dt-caret');
      if (c) c.textContent = '+';
    });
  }
  /* ---------- open / close ---------- */
  function openTree() {
    open = true;
    trigger.classList.add('active');
    trigger.setAttribute('aria-expanded', 'true');
    if (isCompact()) openList();
    else openRadial();
  }
  function closeTree() {
    open = false;
    activeNode = null;
    trigger.classList.remove('active');
    trigger.setAttribute('aria-expanded', 'false');
    closeList();
    closeRadial();
  }
  trigger.addEventListener('click', e => {
    e.stopPropagation();
    open ? closeTree() : openTree();
  });
  document.addEventListener('click', e => {
    if (open && !root.contains(e.target)) closeTree();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) closeTree();
  });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const c = isCompact();
      if (open && c !== wasCompact) {
        // layout changed while open – rebuild in the new mode
        tree.innerHTML = '';
        list.classList.remove('open');
        if (c) openList(); else openRadial();
      } else if (open && !c) {
        // re-scale radial geometry to the new width
        openRadial();
      }
      wasCompact = c;
    }, 150);
  });
})();
// vvvvv particle constellation vvvvv
(function () {
  const canvas = document.getElementById('fx');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ACCENT = '200,240,110';
  const LINK_DIST = 130;   // px — neighbour link range
  const MOUSE_DIST = 190;  // px — cursor link / repel range

  let w = 0, h = 0, dpr = 1, raf = 0;
  let particles = [];
  const mouse = { x: -9999, y: -9999 };

  function seed() {
    // particle count scales with viewport area, capped for perf
    const count = Math.min(140, Math.max(36, Math.round((w * h) / 13000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8,
      hot: Math.random() < 0.35 // a few accent-coloured dots
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      // wrap around edges
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

      // cursor: link + gentle repel
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < MOUSE_DIST) {
        const t = 1 - md / MOUSE_DIST;
        ctx.strokeStyle = `rgba(${ACCENT},${t * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        if (md > 0.1) {
          const push = t * 0.7;
          p.x += (mdx / md) * push;
          p.y += (mdy / md) * push;
        }
      }

      // neighbour links
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK_DIST) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // the dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hot ? `rgba(${ACCENT},0.7)` : 'rgba(255,255,255,0.45)';
      ctx.fill();
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = mouse.y = -9999; });
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });

  resize();
  draw(); //rendera single static frame, no loop
})();