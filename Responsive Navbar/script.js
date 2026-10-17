(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, fine = matchMedia("(pointer:fine)").matches;
  const st = { get: k => { try { return localStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { localStorage.setItem(k, v) } catch { } } };
  const toast = m => { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2200) };
  const root = document.documentElement;
  root.dataset.theme = st.get("theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  $("#themeBtn")?.addEventListener("click", () => { const n = root.dataset.theme === "dark" ? "light" : "dark"; root.dataset.theme = n; st.set("theme", n) });

  /* mobile menu (click, Esc, outside) */
  const nav = $("#nav"), mb = $("#menuBtn");
  if (nav && mb) {
    const set = o => { nav.classList.toggle("open", o); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "✕" : "☰" };
    mb.onclick = () => set(!nav.classList.contains("open"));
    $$("a", nav).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => e.key === "Escape" && set(false));
    document.addEventListener("click", e => { if (!e.target.closest(".bar")) set(false) });
  }
  if (!CSS.supports("animation-timeline: scroll()")) { const p = $("#progress"); addEventListener("scroll", () => p && (p.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`), { passive: true }) }

  /* typing code card: <pre data-code="line1|line2"> */
  const pre = $("[data-code]");
  if (pre) {
    const tag = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/(&lt;\/?[\w-]+)/g, '<span class="k">$1</span>').replace(/"([^"]*)"/g, '<span class="s">"$1"</span>');
    const ls = pre.dataset.code.split("|").map(tag);
    const out = $("code", pre);
    ls.forEach((l, i) => reduce ? out.insertAdjacentHTML("beforeend", `<span class="ln">${l}</span>`) : setTimeout(() => out.insertAdjacentHTML("beforeend", `<span class="ln">${l}</span>`), 500 + i * 260));
  }

  /* reveal + scroll-spy */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }), { threshold: .1 });
  $$(".sec h2,.spot,.page-head,.contact .lead").forEach(el => { el.classList.add("rv"); io.observe(el) });
  if (nav && $$("a[href^='#']", nav).length) {
    const so = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && $$("a", nav).forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id))), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(s => so.observe(s));
  }

  /* contact form -> mailto (no backend) */
  $("#form")?.addEventListener("submit", e => {
    e.preventDefault();
    const n = $("#name").value.trim(), m = $("#email").value.trim(), t = $("#msg").value.trim(), er = $("#err");
    if (!n || !/^\S+@\S+\.\S+$/.test(m) || !t) { er.textContent = "Enter your name, a valid email and a message."; return }
    er.textContent = ""; toast("Opening your email app…");
    location.href = `mailto:hs0721507@gmail.com?subject=${encodeURIComponent("Message from " + n)}&body=${encodeURIComponent(`Name: ${n}\nEmail: ${m}\n\n${t}`)}`;
  });
  const y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* cursor glow + particles */
  const mouse = { x: -999, y: -999 };
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY }, { passive: true });
  const glow = $("#glow");
  if (glow && fine && !reduce) { let gx = innerWidth / 2, gy = innerHeight / 3; (function l() { gx += (mouse.x - gx) * .08; gy += (mouse.y - gy) * .08; glow.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(l) })() }
  const cv = $("#fx");
  if (cv && !reduce) {
    const ctx = cv.getContext("2d"); let W, H, pts = [], raf;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); pts = Array.from({ length: Math.min(70, Math.floor(W * H / 22000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })) };
    const draw = () => {
      ctx.clearRect(0, 0, W, H); const c = getComputedStyle(root).getPropertyValue("--ac").trim() || "#6c8cff";
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dm = Math.hypot(dx, dy); if (dm < 140) { p.x += dx / dm * 1.2; p.y += dy / dm * 1.2 }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fillStyle = c; ctx.globalAlpha = .7; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) { const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y); if (d < 130) { ctx.globalAlpha = (1 - d / 130) * .28; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke() } }
      });
      raf = requestAnimationFrame(draw);
    };
    size(); draw(); addEventListener("resize", size);
    document.addEventListener("visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden) draw() });
  }

  /* spotlight, 3D tilt, magnetic buttons */
  document.addEventListener("pointermove", e => {
    const c = e.target.closest?.(".spot,.editor"); if (!c) return; const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
    if (fine && !reduce && c.tagName !== "FORM") { c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 9 + "deg"); c.style.setProperty("--rx", (.5 - (e.clientY - r.top) / r.height) * 9 + "deg") }
  });
  document.addEventListener("pointerout", e => { const c = e.target.closest?.(".spot,.editor"); if (c && !c.contains(e.relatedTarget)) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg") } });
  if (fine && !reduce) $$(".btn,.chip,.icon").forEach(b => { b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)` }); b.addEventListener("pointerleave", () => b.style.transform = "") });
})();
