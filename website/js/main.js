/* ==========================================================================
   Drapery Emerald — main.js
   ========================================================================== */
(function () {
  "use strict";

  const W = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = () => typeof window.gsap !== "undefined";

  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------- Derived date data ---------- */
  const eventDate = new Date(W.date);
  const fmt = (opts) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...opts }).format(eventDate);
  const derived = {
    dateYear: fmt({ year: "numeric" }),
    dateMonth: fmt({ month: "long" }).toUpperCase(),
    dateDay: fmt({ day: "2-digit" }),
    dateText: fmt({ day: "numeric", month: "long", year: "numeric" }),
    dateLong: fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dateShort: fmt({ day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " . ")
  };

  /* ==========================================================================
     Render dari config
     ========================================================================== */
  function render() {
    $$("[data-bind]").forEach((n) => {
      const key = n.dataset.bind;
      const v = key in derived ? derived[key] : get(W, key);
      if (v != null) n.textContent = v;
    });
    $$("[data-bind-src]").forEach((n) => {
      const v = get(W, n.dataset.bindSrc);
      if (v) n.src = v;
    });
    // Kutipan di doily: tepat 11 baris, lebar baris mengikuti bentuk oval
    const q = $(".doily__text");
    if (q) {
      const words = String(W.quote.text).trim().split(" ").filter(Boolean);
      const N = 11, total = words.join(" ").length;
      const w = Array.from({ length: N }, (_, i) => Math.max(.55, Math.sqrt(1 - Math.pow((i - (N - 1) / 2) / (N / 2 + .6), 2))));
      const sum = w.reduce((a, b) => a + b, 0);
      const lines = []; let cur = [], used = 0, row = 0, target = total * w[0] / sum;
      words.forEach((word, idx) => {
        const len = word.length + (cur.length ? 1 : 0);
        const left = words.length - idx, rowsLeft = N - row;
        if (cur.length && row < N - 1 && (used + len / 2 > target || left <= rowsLeft - 1)) {
          lines.push(cur.join(" ")); cur = []; used = 0; row++; target = total * w[row] / sum;
        }
        cur.push(word); used += word.length + (cur.length > 1 ? 1 : 0);
      });
      lines.push(cur.join(" "));
      q.textContent = "";
      lines.forEach((l, i) => { if (i) q.appendChild(document.createElement("br")); q.appendChild(document.createTextNode(l)); });
      q.style.whiteSpace = "nowrap";
    }
    document.title = `Pernikahan ${W.bride.nick} & ${W.groom.nick}`;

    // Instagram (opsional)
    $$("[data-ig]").forEach((a) => {
      const handle = W[a.dataset.ig].instagram;
      if (!handle) return;
      a.href = "https://instagram.com/" + encodeURIComponent(handle);
      a.querySelector("span").textContent = handle;
      a.hidden = false;
    });

    // Ringkasan acara
    $("#eventSummary").textContent = W.events.map((e) => `${e.name} Pukul ${e.time}`).join("\n");

    // Kartu acara
    const evWrap = $("#events");
    W.events.forEach((e, i) => {
      const art = el("article", "event reveal-up");
      if (e.image) {
        const img = el("img", "event__img" + (i % 2 ? " event__img--tall" : ""));
        img.src = e.image; img.alt = ""; img.loading = "lazy"; img.setAttribute("aria-hidden", "true");
        art.append(img);
      }
      art.append(
        el("h3", "script script--lg", e.name),
        el("p", "event__when", e.day),
        el("p", "event__when", "Pukul " + e.time)
      );
      if (e.venue) art.append(el("p", "event__venue", e.venue));
      if (e.address) art.append(el("p", "event__addr", e.address));
      evWrap.append(art);
    });
    // Satu tombol Google Maps saja (lokasi acara terakhir yang punya link)
    const mapsUrl = [...W.events].reverse().map((e) => e.maps).find(Boolean);
    if (mapsUrl) {
      const a = el("a", "btn btn--maroon", "Google Maps");
      a.href = mapsUrl; a.target = "_blank"; a.rel = "noopener";
      evWrap.append(a);
    }

    // Dress code
    W.dressCode.colors.forEach((c) => {
      const s = el("span"); s.style.background = c; s.title = c;
      $("#dressColors").append(s);
    });

    // Google Calendar
    const start = eventDate.toISOString().replace(/[-:]|\.\d{3}/g, "");
    const end = new Date(eventDate.getTime() + 5 * 3600e3).toISOString().replace(/[-:]|\.\d{3}/g, "");
    const cal = new URL("https://calendar.google.com/calendar/render");
    cal.searchParams.set("action", "TEMPLATE");
    cal.searchParams.set("text", `Pernikahan ${W.bride.nick} & ${W.groom.nick}`);
    cal.searchParams.set("dates", `${start}/${end}`);
    cal.searchParams.set("location", [(W.events.find((e) => e.venue) || {}).venue, (W.events.find((e) => e.address) || {}).address].filter(Boolean).join(", "));
    $("#addCal").href = cal.toString();

    // Gift
    W.gifts.forEach((g) => {
      const c = el("div", "card card--bank reveal-up");
      const btn = el("button", "btn btn--maroon btn--sm", "Salin Nomor");
      btn.type = "button";
      btn.addEventListener("click", () => copy(g.number.replace(/\s/g, ""), "Nomor rekening disalin"));
      c.append(el("p", "card__bank", g.bank), el("p", "card__num", g.number), el("p", "card__name", "a.n. " + g.name), btn);
      $("#giftCards").append(c);
    });
    $("#giftAddress").textContent = W.giftAddress.text;
    $("#copyAddress").addEventListener("click", () => copy(W.giftAddress.text, "Alamat disalin"));
    const wa = $("#giftWa");
    wa.textContent = W.giftAddress.confirm;
    wa.href = "https://wa.me/" + W.giftAddress.confirm.replace(/\D/g, "").replace(/^0/, "62");

    // Love story
    W.loveStory.forEach((s) => {
      const li = el("li", "reveal-up");
      li.append(el("h3", "script", s.title));
      if (s.date) li.append(el("span", "timeline__date", s.date));
      li.append(el("p", null, s.text));
      $("#timeline").append(li);
    });

    // Video (lite embed: iframe dimuat saat diklik)
    const yt = (W.youtube || "").trim();
    const ytId = (yt.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/) || [])[1];
    if (ytId) {
      $("#video").hidden = false;
      const ph = el("button", "video-ph");
      ph.type = "button";
      ph.setAttribute("aria-label", "Putar video");
      ph.style.backgroundImage = `url(https://i.ytimg.com/vi/${ytId}/hqdefault.jpg)`;
      ph.addEventListener("click", () => {
        pauseMusic();
        const f = document.createElement("iframe");
        f.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
        f.title = "Video pernikahan";
        f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
        f.allowFullscreen = true;
        ph.replaceWith(f);
      });
      $("#videoFrame").append(ph);
    }

    // Gallery
    const pattern = ["wide", "tall", "", "", "tall", "", "", "", "", ""];
    W.gallery.forEach((src, i) => {
      const b = el("button", (pattern[i % pattern.length] || "") + " reveal-zoom");
      b.type = "button";
      b.setAttribute("aria-label", `Buka foto ${i + 1}`);
      const img = el("img"); img.src = src; img.alt = `Foto ${i + 1}`; img.loading = "lazy"; img.decoding = "async";
      b.append(img);
      b.addEventListener("click", () => openLightbox(i));
      $("#galleryGrid").append(b);
    });

    // Jumlah tamu RSVP
    for (let i = 1; i <= (W.maxGuests || 2); i++) {
      const o = el("option", null, i + " orang"); o.value = i;
      $("#rsvpCount").append(o);
    }
  }

  /* ==========================================================================
     Cover
     ========================================================================== */
  function initCover() {
    // Nama tamu dari ?to=
    const to = new URLSearchParams(location.search).get("to");
    const guestName = to && to.trim() ? to.trim().slice(0, 80) : "Tamu Undangan"; // tanpa ?to= → nama umum
    $("#guestName").textContent = guestName;
    $("#guest").hidden = false;
    if (to && to.trim()) { const rn = $("#rsvpName"); if (rn) rn.value = to.trim().slice(0, 60); }

    // Sparkles
    const sp = $(".sparkles");
    for (let i = 0; i < 18; i++) {
      const s = el("span", null, "✦");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.fontSize = 8 + Math.random() * 12 + "px";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";
      sp.append(s);
    }

    // Bintang berkilau juga di ikon hadiah
    const spg = $(".sparkles--gift");
    if (spg) for (let i = 0; i < 14; i++) {
      const s = el("span", null, "✦");
      s.style.left = Math.random() * 96 + "%";
      s.style.top = Math.random() * 96 + "%";
      s.style.fontSize = 8 + Math.random() * 12 + "px";
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
      s.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";
      spg.append(s);
    }

    let opened = false;
    $("#openEnvelope").addEventListener("click", () => {
      if (opened) return;
      opened = true;
      playMusic(); // dipanggil langsung di event klik supaya diizinkan browser
      const cover = $("#cover");

      const finish = () => {
        cover.remove();
        document.body.classList.remove("is-locked");
        $("#fabMusic").hidden = false;
        window.scrollTo(0, 0);
        if (hasGsap() && window.ScrollTrigger) ScrollTrigger.refresh();
      };

      if (!hasGsap() || reduceMotion) {
        cover.style.transition = "opacity .5s";
        cover.style.opacity = "0";
        setTimeout(finish, 500);
        return;
      }
      gsap.timeline({ onComplete: finish })
        .to(".envelope__seal", { scale: 1.4, opacity: 0, duration: .45, ease: "power2.in" })
        .to(".envelope__closed", { opacity: 0, duration: .35 }, "-=.1")
        .to(".envelope__open", { opacity: 1, duration: .35 }, "<")
        .fromTo(".envelope__card", { opacity: 1, yPercent: 10 }, { yPercent: -55, duration: .8, ease: "power2.out" })
        .to(".envelope", { scale: 1.15, duration: .6, ease: "power1.inOut" }, "+=.15")
        .to(".cover__hint, .guest, .cover__inner > .eyebrow, .cover__inner > .script", { opacity: 0, duration: .4 }, "<")
        .to(cover, { yPercent: -100, duration: 1, ease: "power3.inOut" }, "+=.2");
    });
  }

  /* ==========================================================================
     Music player
     ========================================================================== */
  const audio = $("#audio");
  const playlist = (Array.isArray(W.music) ? W.music : [{ title: "Lagu Kami", artist: "", src: W.music }])
    .filter((t) => t && t.src);
  let track = 0, audioBroken = false;

  function loadTrack(i) {
    if (!playlist.length) return;
    track = (i + playlist.length) % playlist.length;
    audio.src = playlist[track].src;
  }
  function setPlayingUI(on) {
    $("#fabMusic").classList.toggle("is-playing", on);
  }
  function playMusic() {
    if (!playlist.length || audioBroken) return;
    if (!audio.src) loadTrack(track);
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
  function pauseMusic() { audio.pause(); }

  function initPlayer() {
    if (playlist.length) loadTrack(0);
    audio.addEventListener("play", () => setPlayingUI(true));
    audio.addEventListener("pause", () => setPlayingUI(false));
    audio.addEventListener("error", () => { audioBroken = true; setPlayingUI(false); });
    audio.addEventListener("ended", () => {
      if (playlist.length > 1) { loadTrack(track + 1); playMusic(); }
      else { audio.currentTime = 0; playMusic(); }
    });
    $("#fabMusic").addEventListener("click", () => (audio.paused ? playMusic() : pauseMusic()));
    // Jeda saat tab disembunyikan, lanjut saat kembali (jika sebelumnya diputar)
    let resume = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { resume = !audio.paused; pauseMusic(); }
      else if (resume) playMusic();
    });
    // Browser/tab ditutup atau halaman ditinggalkan: hentikan suara
    addEventListener("pagehide", () => { resume = false; pauseMusic(); });
  }

  /* ==========================================================================
     Countdown
     ========================================================================== */
  function initCountdown() {
    const ids = ["cdD", "cdH", "cdM", "cdS"].map((id) => $("#" + id));
    const tick = () => {
      let d = Math.max(0, eventDate - Date.now()) / 1000;
      if (d <= 0) {
        $("#countdown").innerHTML = "";
        $("#countdown").append(el("p", "script script--md", "Hari bahagia telah tiba"));
        $("#countdown").style.display = "block";
        clearInterval(timer);
        return;
      }
      const v = [Math.floor(d / 86400), Math.floor((d % 86400) / 3600), Math.floor((d % 3600) / 60), Math.floor(d % 60)];
      v.forEach((n, i) => { ids[i].textContent = String(n).padStart(2, "0"); });
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  /* ==========================================================================
     Clipboard + toast
     ========================================================================== */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2200);
  }
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = el("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.append(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    toast(msg);
  }

  /* ==========================================================================
     RSVP & Guest Wall
     ========================================================================== */
  const LS_KEY = "drapery-rsvp";
  const endpoint = (W.rsvpEndpoint || "").trim();

  async function fetchWishes() {
    if (!endpoint) {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
    }
    const r = await fetch(endpoint + (endpoint.includes("?") ? "&" : "?") + "t=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    return Array.isArray(data) ? data : data.data || [];
  }
  async function postWish(entry) {
    if (!endpoint) {
      const list = await fetchWishes();
      list.unshift(entry);
      try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 200))); } catch { /* ignore */ }
      return;
    }
    // Content-Type text/plain → "simple request", tanpa preflight CORS (cocok untuk Apps Script)
    const r = await fetch(endpoint, { method: "POST", body: JSON.stringify(entry) });
    if (!r.ok) throw new Error("HTTP " + r.status);
  }

  const timeAgo = (iso) => {
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const s = (Date.now() - d) / 1000;
    if (s < 60) return "baru saja";
    if (s < 3600) return Math.floor(s / 60) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 86400 * 7) return Math.floor(s / 86400) + " hari lalu";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  function renderWall(list) {
    const ul = $("#wallList");
    if (!ul) return; // Guest Wall dihapus
    ul.innerHTML = "";
    const withMsg = list.filter((w) => w && w.name);
    const attending = withMsg.filter((w) => w.attend === "Hadir").length;
    $("#wallCount").textContent = withMsg.length
      ? `${withMsg.length} ucapan · ${attending} konfirmasi hadir`
      : "";
    if (!withMsg.length) {
      ul.append(el("li", "wall__empty", "Jadilah yang pertama memberikan ucapan ♥"));
      return;
    }
    withMsg.forEach((w) => {
      const li = el("li", "wall__item");
      const head = el("div", "wall__head");
      head.append(el("span", "wall__name", String(w.name)));
      if (w.attend) head.append(el("span", "wall__badge" + (w.attend === "Hadir" ? "" : " wall__badge--no"), String(w.attend)));
      li.append(head);
      if (w.message) li.append(el("p", "wall__msg", String(w.message)));
      li.append(el("span", "wall__time", timeAgo(w.time)));
      ul.append(li);
    });
  }

  async function refreshWall() {
    if (!$("#wallList")) return;
    try { renderWall(await fetchWishes()); }
    catch { $("#wallCount").textContent = "Gagal memuat ucapan. Coba muat ulang halaman."; }
  }

  function initRsvp() {
    const form = $("#rsvpForm");
    const status = $("#rsvpStatus");
    form.addEventListener("change", (e) => {
      if (e.target.name === "attend") $("#guestCountField").hidden = e.target.value !== "Hadir";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const entry = {
        name: String(fd.get("name") || "").trim().slice(0, 60),
        attend: fd.get("attend") || "",
        count: fd.get("attend") === "Hadir" ? Number(fd.get("count") || 1) : 0,
        message: String(fd.get("message") || "").trim().slice(0, 500),
        time: new Date().toISOString()
      };
      if (!entry.attend) { status.textContent = "Silakan pilih Hadir / Tidak Hadir."; return; }
      if (!entry.name) { status.textContent = "Silakan isi nama Anda."; $("#rsvpName").focus(); return; }

      const btn = $("#rsvpSubmit");
      btn.disabled = true; btn.textContent = "Mengirim…"; status.textContent = "";
      try {
        await postWish(entry);
        status.textContent = "Terima kasih! Konfirmasi & ucapan Anda telah terkirim.";
        form.querySelector("textarea").value = "";
        toast("Terima kasih atas ucapannya ♥");
        await refreshWall();
      } catch {
        status.textContent = "Maaf, gagal mengirim. Periksa koneksi lalu coba lagi.";
      } finally {
        btn.disabled = false; btn.textContent = "Kirim";
      }
    });
    refreshWall();
    if (endpoint) setInterval(() => { if (!document.hidden) refreshWall(); }, 30000);
  }

  /* ==========================================================================
     Lightbox (klik, keyboard, swipe)
     ========================================================================== */
  const lb = $("#lightbox");
  let lbIndex = 0, lastFocus = null;
  function showLb(i) {
    lbIndex = (i + W.gallery.length) % W.gallery.length;
    const img = $(".lightbox__img", lb);
    img.style.opacity = 0;
    img.onload = () => { img.style.opacity = 1; };
    img.src = W.gallery[lbIndex];
    img.alt = `Foto ${lbIndex + 1}`;
    $(".lightbox__count", lb).textContent = `${lbIndex + 1} / ${W.gallery.length}`;
  }
  function openLightbox(i) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    showLb(i);
    $(".lightbox__close", lb).focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function initLightbox() {
    $(".lightbox__close", lb).addEventListener("click", closeLightbox);
    $(".lightbox__prev", lb).addEventListener("click", () => showLb(lbIndex - 1));
    $(".lightbox__next", lb).addEventListener("click", () => showLb(lbIndex + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLb(lbIndex - 1);
      if (e.key === "ArrowRight") showLb(lbIndex + 1);
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ==========================================================================
     Mawar gugur di wallpaper desktop
     ========================================================================== */
  function initPetals() {
    const box = $("#petals");
    if (!box || !matchMedia("(min-width: 900px)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("span");
      p.className = "petal";
      const size = 12 + Math.random() * 14;
      p.style.left = (Math.random() * 100).toFixed(1) + "%";
      p.style.width = size.toFixed(1) + "px";
      p.style.height = (size * 1.3).toFixed(1) + "px";
      p.style.setProperty("--sway", ((Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 70)).toFixed(0) + "px");
      p.style.animationDuration = (9 + Math.random() * 9).toFixed(1) + "s";
      p.style.animationDelay = (-Math.random() * 18).toFixed(1) + "s";
      box.append(p);
    }
  }

  /* ==========================================================================
     Satu section = satu layar: skala konten agar muat tinggi viewport
     ========================================================================== */
  function initFit() {
    const secs = Array.from(document.querySelectorAll("main > .sec"));
    secs.forEach((s) => {
      const wrap = document.createElement("div");
      wrap.className = "sec__fit";
      [...s.children].filter((c) => !c.classList.contains("deco") && !c.classList.contains("sparkles")).forEach((c) => wrap.appendChild(c));
      s.appendChild(wrap);
    });
    let raf = 0;
    const fit = () => {
      raf = 0;
      const vh = window.innerHeight;
      secs.forEach((s) => {
        if (s.hidden) return;
        const w = s.querySelector(":scope > .sec__fit");
        w.style.zoom = 1;
        const cs = getComputedStyle(s);
        const avail = vh - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const nat = w.getBoundingClientRect().height;
        w.style.zoom = nat > avail ? Math.max(.5, avail / nat).toFixed(3) : 1;
      });
      // Section berurutan dengan wallpaper sama dibuat menyambung (satu hamparan)
      let offset = 0;
      secs.forEach((s, i) => {
        if (s.hidden) return;
        const prev = secs.slice(0, i).reverse().find((p) => !p.hidden);
        const same = prev && ["sec--velvet", "sec--olive"].some((k) => s.classList.contains(k) && prev.classList.contains(k));
        offset = same ? offset + prev.offsetHeight : 0;
        s.style.backgroundPosition = same ? "center " + (-offset) + "px" : "";
      });
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(fit); };
    addEventListener("resize", req);
    addEventListener("load", req);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(req);
    if (window.ResizeObserver) { const ro = new ResizeObserver(req); secs.forEach((s) => ro.observe(s.querySelector(":scope > .sec__fit"))); }
    req();
  }

  /* ==========================================================================
     Scroll animations (GSAP + ScrollTrigger)
     ========================================================================== */
  function initAnimations() {
    if (!hasGsap() || !window.ScrollTrigger || reduceMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const st = (t) => ({ trigger: t, start: "top 88%", once: true });

    $$(".reveal-up").forEach((n) => gsap.from(n, { y: 40, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: st(n) }));
    $$(".reveal-zoom").forEach((n) => gsap.from(n, { scale: .9, opacity: 0, duration: 1.1, ease: "power2.out", scrollTrigger: st(n) }));
    $$(".reveal-left").forEach((n) => gsap.from(n, { x: -60, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: st(n) }));
    $$(".reveal-right").forEach((n) => gsap.from(n, { x: 60, opacity: 0, duration: 1, ease: "power2.out", scrollTrigger: st(n) }));
    // Teks script "ditulis": clip-path dari kiri
    $$(".write").forEach((n) => gsap.fromTo(n,
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 -10% 0 0)", duration: 1.6, ease: "power2.inOut", scrollTrigger: st(n) }));
    // Bunga masuk dari samping
    $$(".deco--hang-left").forEach((n) => gsap.from(n, { x: -80, opacity: 0, duration: 1.4, ease: "power2.out", scrollTrigger: st(n.parentElement) }));
    $$(".deco--hang-right").forEach((n) => gsap.from(n, { x: 80, opacity: 0, duration: 1.4, ease: "power2.out", scrollTrigger: st(n.parentElement) }));

    // Animasi masuk cover
    gsap.from(".cover__inner > *", { y: 24, opacity: 0, duration: .9, stagger: .12, ease: "power2.out", delay: .2 });
    gsap.from(".cover__flower--tl", { x: -60, opacity: 0, duration: 1.4, ease: "power2.out" });
    gsap.from(".cover__flower--br", { x: 60, opacity: 0, duration: 1.4, ease: "power2.out" });
  }

  /* ==========================================================================
     Boot
     ========================================================================== */
  render();
  initCover();
  initPlayer();
  initCountdown();
  initRsvp();
  initLightbox();
  initPetals();
  initFit();
  initAnimations();
})();
