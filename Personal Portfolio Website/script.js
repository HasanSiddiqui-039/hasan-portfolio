(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = { get: k => { try { return localStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch {} } };
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2000) };

  /* Theme */
  const root = document.documentElement;
  root.dataset.theme = store.get("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  $("#themeBtn").onclick = () => { const n = root.dataset.theme === "dark" ? "light" : "dark"; root.dataset.theme = n; store.set("theme", n) };

  /* Mobile menu */
  const nav = $("#nav"), mb = $("#menuBtn");
  const closeMenu = () => { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false") };
  mb.onclick = () => mb.setAttribute("aria-expanded", nav.classList.toggle("open"));
  $$("a", nav).forEach(a => a.addEventListener("click", closeMenu));

  /* Scroll progress fallback */
  if (!CSS.supports("animation-timeline: scroll()")) {
    const p = $("#progress");
    addEventListener("scroll", () => p.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight)})`, { passive: true });
  }

  /* Hero code typing */
  const lines = [
    '<span class="k">const</span> <span class="p">hasan</span> = {',
    '  name: <span class="s">"Muhammad Hasan Siddiqui"</span>,',
    '  role: <span class="s">"Web Developer"</span>,',
    '  city: <span class="s">"Karachi, Pakistan"</span>,',
    '  stack: [<span class="s">"HTML"</span>, <span class="s">"CSS"</span>, <span class="s">"JavaScript"</span>],',
    '  learning: <span class="b">true</span>,',
    '  openTo: <span class="s">"internships, collaboration"</span>',
    '};'
  ];
  const code = $("#code");
  if (reduce) code.innerHTML = lines.map(l => `<span class="ln">${l}</span>`).join("");
  else lines.forEach((l, i) => setTimeout(() => code.insertAdjacentHTML("beforeend", `<span class="ln">${l}</span>`), 500 + i * 260));

  /* 3D tilt on editor */
  const ed = $(".editor");
  if (!reduce && matchMedia("(pointer:fine)").matches) {
    ed.addEventListener("pointermove", e => { const r = ed.getBoundingClientRect(); ed.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 8 + "deg"); ed.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 8 + "deg") });
    ed.addEventListener("pointerleave", () => { ed.style.setProperty("--ry", "0deg"); ed.style.setProperty("--rx", "0deg") });
  }

  /* Spotlight cards (event delegation) */
  document.addEventListener("pointermove", e => {
    const c = e.target.closest?.(".spot"); if (!c) return;
    const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
  });

  /* Reveal + active nav */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), { threshold: .1 });
  const observeRv = () => $$(".sec h2,.spot,.facts,.contact .lead").forEach(el => { if (!el.classList.contains("rv")) { el.classList.add("rv"); io.observe(el) } });
  observeRv();
  const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$("a", nav).forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id)) }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => so.observe(s));

  /* GitHub repos with language filter */
  const USER = "HasanSiddiqui-039", grid = $("#repos"), filters = $("#filters"), count = $("#count");
  const esc = t => Object.assign(document.createElement("div"), { textContent: t ?? "" }).innerHTML;
  async function loadRepos() {
    try {
      const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`);
      if (!res.ok) throw 0;
      const repos = (await res.json()).filter(r => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
      if (!repos.length) { grid.innerHTML = '<p class="muted">No public repositories yet.</p>'; count.textContent = "0 repositories"; return }
      count.textContent = `${repos.length} repositories`;
      grid.innerHTML = repos.map(r => `<a class="spot" data-lang="${esc(r.language || "Other")}" href="${r.html_url}" target="_blank" rel="noopener">
        <h3>${esc(r.name.replace(/[-_]+/g, " "))}</h3><p>${esc(r.description || "No description added yet.")}</p>
        <div class="meta"><span>${esc(r.language || "Repository")}</span><span>★ ${r.stargazers_count} · ${new Date(r.pushed_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span></div></a>`).join("");
      const langs = ["All", ...new Set(repos.map(r => r.language || "Other"))];
      filters.innerHTML = langs.map((l, i) => `<button class="chip" aria-pressed="${!i}" data-l="${l}">${l}</button>`).join("");
      filters.onclick = e => {
        const b = e.target.closest("button"); if (!b) return;
        $$("button", filters).forEach(x => x.setAttribute("aria-pressed", x === b));
        $$("a.spot", grid).forEach(c => c.hidden = b.dataset.l !== "All" && c.dataset.lang !== b.dataset.l);
      };
      observeRv();
    } catch {
      count.textContent = "Unavailable";
      grid.innerHTML = `<p class="muted">Couldn't load repositories right now. <a href="https://github.com/${USER}?tab=repositories" target="_blank" rel="noopener" style="color:var(--ac)">Open GitHub</a></p>`;
    }
  }
  loadRepos();

  /* Copy email */
  $$("[data-copy]").forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast("Email copied") } catch { location.href = "mailto:" + b.dataset.copy } });

  /* Contact form → mailto (no backend) */
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const n = $("#name").value.trim(), m = $("#email").value.trim(), t = $("#msg").value.trim(), err = $("#err");
    if (!n || !/^\S+@\S+\.\S+$/.test(m) || !t) { err.textContent = "Enter your name, a valid email and a message."; return }
    err.textContent = "";
    location.href = `mailto:hs0721507@gmail.com?subject=${encodeURIComponent("Portfolio message from " + n)}&body=${encodeURIComponent(`Name: ${n}\nEmail: ${m}\n\n${t}`)}`;
  });

  /* Command palette (Ctrl/Cmd + K) */
  const dlg = $("#palette"), pq = $("#pq"), pl = $("#pl");
  const cmds = [["Go to Home", "#home"], ["Go to About", "#about"], ["Go to Skills", "#skills"], ["Go to Projects", "#projects"], ["Go to Contact", "#contact"], ["Open GitHub", "https://github.com/" + USER], ["Open LinkedIn", "https://www.linkedin.com/in/hasan-siddiqui-ab7766374"], ["Toggle theme", "theme"]];
  let sel = 0, shown = cmds;
  const draw = () => pl.innerHTML = shown.map((c, i) => `<li class="${i === sel ? "sel" : ""}" data-i="${i}">${c[0]}</li>`).join("");
  const run = i => {
    const c = shown[i]; if (!c) return; dlg.close();
    if (c[1] === "theme") $("#themeBtn").click(); else if (c[1][0] === "#") location.hash = c[1]; else open(c[1], "_blank", "noopener");
  };
  const openPal = () => { pq.value = ""; shown = cmds; sel = 0; draw(); dlg.showModal(); pq.focus() };
  $("#paletteBtn").onclick = openPal;
  addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); dlg.open ? dlg.close() : openPal() } });
  pq.oninput = () => { shown = cmds.filter(c => c[0].toLowerCase().includes(pq.value.toLowerCase())); sel = 0; draw() };
  pq.onkeydown = e => {
    if (e.key === "ArrowDown") { sel = Math.min(sel + 1, shown.length - 1); draw(); e.preventDefault() }
    if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); draw(); e.preventDefault() }
    if (e.key === "Enter") run(sel);
  };
  pl.onclick = e => { const li = e.target.closest("li"); if (li) run(+li.dataset.i) };
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close() });

  $("#topBtn").onclick = () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  $("#year").textContent = new Date().getFullYear();
})();

/* ===== FX: particles, cursor glow, card tilt, magnetic buttons ===== */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const mouse = { x: -999, y: -999 };
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY }, { passive: true });

  /* Glow follows cursor with easing */
  const glow = document.getElementById("glow");
  if (glow && fine && !reduce) {
    let gx = innerWidth / 2, gy = innerHeight / 3;
    (function loop() { gx += (mouse.x - gx) * .08; gy += (mouse.y - gy) * .08; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop) })();
  }

  /* Particle network */
  const cv = document.getElementById("fx");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d"); let W, H, pts = [], raf;
    const color = () => getComputedStyle(document.documentElement).getPropertyValue("--ac").trim() || "#6c8cff";
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      pts = Array.from({ length: Math.min(70, Math.floor(W * H / 22000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); const c = color();
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dm = Math.hypot(dx, dy);
        if (dm < 140) { p.x += dx / dm * 1.2; p.y += dy / dm * 1.2 }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fillStyle = c; ctx.globalAlpha = .7; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .28; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke() }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    size(); draw(); addEventListener("resize", size);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) draw() });
  }

  if (!fine || reduce) return;

  /* 3D tilt on glass cards (not the form) */
  document.addEventListener("pointermove", e => {
    const c = e.target.closest?.(".spot"); if (!c || c.tagName === "FORM") return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 10 + "deg");
    c.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 10 + "deg");
  });
  document.addEventListener("pointerout", e => { const c = e.target.closest?.(".spot"); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg") } });

  /* Magnetic buttons */
  document.querySelectorAll(".btn,.chip,.icon").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)` });
    b.addEventListener("pointerleave", () => b.style.transform = "");
  });
})();
