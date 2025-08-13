<template>
  <div class="home">
    <!-- ===== HERO ===== -->
    <section class="hero">
      <!-- animated background grid + glow -->
      <div class="hero-bg">
        <div class="grid-lines"></div>
        <div class="radial-glow"></div>
      </div>

      <div class="hero-inner">
        <div class="hero-copy">
          <h1 class="hero-title">
            Smarter Parking<br>
            For Smoother<br>
            Commutes.
          </h1>
          <p class="hero-description">
            MelMove is a smart city dashboard that helps commuters plan better by visualizing real‑time and historical parking data.
          </p>

          <div class="cta-buttons">
            <router-link to="/live" class="cta-button primary">
              <span class="pulse-dot"></span>
              EXPLORE LIVE PARKING
              <span class="arrow">→</span>
            </router-link>
            <router-link to="/urban-trends" class="cta-button secondary">
              START WITH URBAN TRENDS
              <span class="arrow">←</span>
            </router-link>
          </div>

          <!-- trust badges -->
          <div class="trust">
            <span class="trust-badge">Real‑time API</span>
            <span class="dot">•</span>
            <span class="trust-badge">City open data</span>
            <span class="dot">•</span>
            <span class="trust-badge">Privacy‑first</span>
          </div>
        </div>

        <!-- illustration block -->
        <div class="hero-visual">
          <div class="car-stage">
            <div class="lane-shine"></div>
            <div class="car car--sleek">
              <div class="car-body">
                <div class="roof"></div>
                <div class="window window--rear"></div>
                <div class="window window--front"></div>
                <div class="headlight"></div>
                <div class="taillight"></div>
                <div class="grille"></div>
              </div>
              <div class="wheel wheel--rear"><div class="rim"></div></div>
              <div class="wheel wheel--front"><div class="rim"></div></div>
              <div class="car-shadow"></div>
              <div class="motion-lines">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line short"></div>
              </div>
            </div>

            <!-- compact ticker -->
            <div class="ticker" aria-label="Parking tips">
              <div class="ticker__mask">
                <div class="ticker__track">
                  <span class="ticker__item">🚗 Park faster</span><span class="ticker__dot">•</span>
                  <span class="ticker__item">⏱ Save time</span><span class="ticker__dot">•</span>
                  <span class="ticker__item">🧭 Find spots instantly</span><span class="ticker__dot">•</span>
                  <span class="ticker__item">🧠 Smart parking made easy</span><span class="ticker__dot">•</span>
                  <span class="ticker__item">😊 Skip the stress</span>
                  <!-- seamless loop -->
                  <span class="ticker__item" aria-hidden="true">🚗 Park faster</span><span class="ticker__dot" aria-hidden="true">•</span>
                  <span class="ticker__item" aria-hidden="true">⏱ Save time</span><span class="ticker__dot" aria-hidden="true">•</span>
                  <span class="ticker__item" aria-hidden="true">🧭 Find spots instantly</span><span class="ticker__dot" aria-hidden="true">•</span>
                  <span class="ticker__item" aria-hidden="true">🧠 Smart parking made easy</span><span class="ticker__dot" aria-hidden="true">•</span>
                  <span class="ticker__item" aria-hidden="true">😊 Skip the stress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STAT RIBBON -->
      <div class="stat-ribbon" role="note" aria-live="polite">
        <div class="stat">
          <div class="stat-num">
            <span class="count" data-target="17">0</span>
            <span class="unit">hrs</span>
          </div>
          <div class="stat-desc">
            Melbourne drivers waste on average each year <strong>searching for parking</strong>.
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PAIN POINTS ===== -->
    <section class="pain">
      <h2 class="section-title">The Commuter Problem</h2>
      <ul class="pain-list">
        <li class="pain-item">
          <div class="pill">⏳</div>
          <div>
            <h3>Time lost circling</h3>
            <p>Minutes stack into hours every month just hunting for a bay.</p>
          </div>
        </li>
        <li class="pain-item">
          <div class="pill">😤</div>
          <div>
            <h3>Stress & uncertainty</h3>
            <p>No visibility on restrictions, zones, or real‑time availability.</p>
          </div>
        </li>
        <li class="pain-item">
          <div class="pill">💸</div>
          <div>
            <h3>Fuel & fines</h3>
            <p>Idling, last‑minute choices, and staying over time cost real money.</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ===== VALUE / HOW IT HELPS ===== -->
    <section class="value">
      <h2 class="section-title">How MelMove Helps</h2>
      <div class="value-grid">
        <article class="value-card">
          <div class="badge">Live</div>
          <h3>Real‑time bays & heatmaps</h3>
          <p>See hotspots at a glance. Navigate to the best chance streets.</p>
          <div class="mini-sparkle" aria-hidden="true"></div>
        </article>
        <article class="value-card">
          <div class="badge alt">Plan</div>
          <h3>Smart trends</h3>
          <p>Understand weekly rhythms, events, and zone restrictions before you leave.</p>
          <div class="mini-sparkle" aria-hidden="true"></div>
        </article>
        <article class="value-card">
          <div class="badge">Save</div>
          <h3>Cut search time</h3>
          <p>Reduce circling with guidance that balances distance, price, and likelihood.</p>
          <div class="mini-sparkle" aria-hidden="true"></div>
        </article>
      </div>
    </section>

    <!-- ===== FINAL CTA ===== -->
    <section class="final-cta">
      <div class="cta-wrap">
        <h2>Ready to park smarter?</h2>
        <p>Jump into live parking or explore urban trends first.</p>
        <div class="cta-buttons row">
          <router-link to="/live" class="cta-button primary">
            EXPLORE LIVE PARKING <span class="arrow">→</span>
          </router-link>
          <router-link to="/urban-trends" class="cta-button secondary">
            START WITH URBAN TRENDS <span class="arrow">←</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  mounted() {
    // gentle count‑up for the "17 hours" stat
    const el = this.$el.querySelector('.count');
    if (!el) return;

    const animate = (entry) => {
      const target = Number(el.dataset.target || 17);
      const duration = 1600;
      const start = performance.now();

      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        animate();
        io.disconnect();
      }
    }, { threshold: 0.6 });

    io.observe(el);
  }
}
</script>

<style scoped>
:root {
  --green: #4a7c59;
  --green-strong: #3d6b4a;
  --ink: #2c3e50;
  --bg: #ffffff;
  --muted: #718096;
}

/* ===== base ===== */
.home { background: var(--bg); color: var(--ink); }
.section-title { font-size: 1.8rem; margin: 0 0 18px; color: var(--ink); }

/* ===== HERO ===== */
.hero {
  position: relative;
  padding: 80px 24px 24px;
  overflow: hidden;
  isolation: isolate;
}
.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 56px;
  align-items: center;
}
@media (max-width: 980px) {
  .hero-inner { grid-template-columns: 1fr; gap: 36px; }
}

/* bg decoration */
.hero-bg .grid-lines {
  position: absolute; inset: 0;
  background:
    linear-gradient(transparent 23px, rgba(74,124,89,.08) 24px) 0 0 / 100% 24px,
    linear-gradient(90deg, transparent 23px, rgba(74,124,89,.08) 24px) 0 0 / 24px 100%;
  mask: radial-gradient(closest-side, #000 60%, transparent 100%) 80% 30% / 60% 60% no-repeat;
  pointer-events: none;
}
.hero-bg .radial-glow {
  position: absolute; width: 800px; height: 800px; right: -240px; top: -160px;
  background: radial-gradient( closest-side, rgba(74,124,89,.22), rgba(74,124,89,0) 70% );
  filter: blur(4px);
  animation: slow-drift 14s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: -1;
}
@keyframes slow-drift { from { transform: translateY(0) } to { transform: translateY(26px) } }

/* copy */
.hero-copy { max-width: 580px; }
.hero-title {
  font-size: clamp(2.4rem, 4.6vw, 4rem);
  line-height: 1.08;
  font-weight: 800;
  color: #2d5a27;
  margin: 0 0 18px;
}
.hero-description {
  color: #22228A;
  font-size: 1.12rem;
  line-height: 1.65;
  margin: 0 0 28px;
}

/* CTAs */
.cta-buttons { display: grid; gap: 12px; }
.cta-buttons.row { grid-auto-flow: column; justify-content: center; }
@media (max-width: 520px) { .cta-buttons.row { grid-auto-flow: row; } }

.cta-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px 22px; border-radius: 14px; text-decoration: none; font-weight: 700;
  font-size: .9rem; letter-spacing: .6px; text-transform: uppercase;
  border: 2px solid transparent; transition: transform .18s ease, background .18s ease, border-color .18s ease;
}
.cta-button .arrow { font-weight: 900; }
.cta-button .pulse-dot {
  width: 8px; height: 8px; border-radius: 999px; background: #fff; box-shadow: 0 0 0 0 rgba(255,255,255,.6);
  animation: pulse 1.8s ease-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,.6) }
  70% { box-shadow: 0 0 0 10px rgba(255,255,255,0) }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0) }
}

.cta-button.primary { background: var(--green); color: #fff; border-color: var(--green); }
.cta-button.primary:hover { background: var(--green-strong); transform: translateY(-1px); }
.cta-button.secondary { background: #fff; color: #2d5a27; border-color: var(--green); }
.cta-button.secondary:hover { background: #f4f7f5; transform: translateY(-1px); }

/* trust badges */
.trust { display: flex; align-items: center; gap: 10px; margin-top: 12px; color: var(--muted); font-size: .95rem; }
.trust .trust-badge { background: #f6fbf8; color: #2d5a27; border: 1px solid #e0efe5; padding: 6px 10px; border-radius: 999px; font-weight: 600; }
.trust .dot { color: #b8c5bb; }

/* illustration */
.hero-visual { display: flex; justify-content: center; }
.car-stage {
  position: relative; padding: 22px; border-radius: 16px;
  background: linear-gradient(180deg, #f9fbf9, #f2f6f3);
  border: 1px solid #e5efe9;
  box-shadow: 0 10px 30px rgba(0,0,0,.05), inset 0 1px 0 rgba(255,255,255,.6);
}
.lane-shine {
  position: absolute; left: 18px; right: 18px; top: 64px; height: 70px; border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
  filter: blur(8px); opacity: .5; pointer-events: none;
}

/* ===== Car (refined) ===== */
.car { position: relative; width: 260px; height: 128px; margin-bottom: 18px; }
.car--sleek { animation: car-bob 3s ease-in-out infinite; }
@keyframes car-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }

.car-body {
  position: absolute; left: 24px; top: 54px; width: 212px; height: 58px;
  background: linear-gradient(#2c2c2c, #202020);
  border-radius: 20px 28px 16px 16px;
  box-shadow: inset 0 2px 0 rgba(255,255,255,.06), 0 8px 14px rgba(0,0,0,.16);
}
.roof {
  position: absolute; left: 42px; top: -34px; width: 124px; height: 52px;
  background: linear-gradient(#2f2f2f, #222); border-radius: 70px 70px 8px 8px; box-shadow: 0 4px 0 rgba(0,0,0,.15);
}
.window {
  position: absolute; top: -20px; width: 58px; height: 28px;
  background: linear-gradient(180deg, rgba(170,210,255,.9), rgba(120,170,220,.9));
  border-radius: 10px 10px 6px 6px; box-shadow: inset 0 0 10px rgba(255,255,255,.25);
}
.window--rear  { left: 30px; }
.window--front { right: 30px; }

.headlight { position: absolute; right: -6px; top: 26px; width: 12px; height: 10px; background: #ffd166; border-radius: 4px; box-shadow: 0 0 12px #ffd166aa; }
.taillight { position: absolute; left: -6px; top: 26px; width: 10px; height: 10px; background: #ff4d4f; border-radius: 3px; box-shadow: 0 0 10px #ff4d4faa; }
.grille { position: absolute; right: 16px; bottom: 10px; width: 36px; height: 6px; border-radius: 3px; background: repeating-linear-gradient(to right, #1a1a1a, #1a1a1a 6px, #303030 6px, #303030 10px); opacity: .9; }

.wheel {
  position: absolute; bottom: 8px; width: 38px; height: 38px; background: #1f1f1f;
  border: 5px solid #fff; border-radius: 50%;
  box-shadow: inset 0 0 0 3px #111, 0 4px 8px rgba(0,0,0,.25);
}
.wheel--rear  { left: 44px; }
.wheel--front { right: 44px; }
.rim { position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; background: #999; border-radius: 50%; transform: translate(-50%, -50%); box-shadow: inset 0 0 0 2px #666; }

.car-shadow { position: absolute; left: 30px; right: 30px; bottom: 0; height: 10px; background: radial-gradient(ellipse at center, rgba(0,0,0,.35), rgba(0,0,0,0) 70%); filter: blur(2px); }
.motion-lines { position: absolute; top: 50%; right: -28px; display: flex; flex-direction: column; gap: 6px; }
.motion-lines .line { width: 24px; height: 3px; background: #2d2d2d; border-radius: 2px; opacity: .9; animation: speed 1.2s linear infinite; }
.motion-lines .line:nth-child(2){ animation-delay: .2s }
.motion-lines .line.short { width: 14px; animation-delay: .4s }
@keyframes speed { from{ transform: translateX(0) } to{ transform: translateX(10px); opacity: .2 } }

/* ===== Ticker ===== */
.ticker { margin-top: 10px; display: flex; justify-content: center; }
.ticker__mask {
  position: relative; max-width: 420px; padding: 12px 18px; border-radius: 999px; background: var(--green); color: #fff;
  overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.08);
}
.ticker__mask::before, .ticker__mask::after {
  content: ""; position: absolute; top: 0; width: 40px; height: 100%; background: linear-gradient(to right, var(--green), rgba(74,124,89,0));
  pointer-events: none;
}
.ticker__mask::after { right: 0; transform: scaleX(-1); }
.ticker__track { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; will-change: transform; animation: ticker-move 26s linear infinite; }
.ticker__item { font-size: 16px; font-weight: 600; opacity: .95; color: #000000}
.ticker__dot { opacity: .6; }
@keyframes ticker-move { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }

/* ===== STAT RIBBON ===== */
.stat-ribbon {
  max-width: 1100px; margin: 40px auto 0; padding: 0 24px;
}
.stat {
  display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center;
  background: #0f2017; color: #e9f5ed; border: 1px solid #1e3a29; border-radius: 16px; padding: 14px 18px;
  box-shadow: 0 10px 24px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.06);
}
.stat-num { display: flex; align-items: baseline; gap: 6px; font-weight: 800; }
.stat-num .count { font-size: 2.1rem; line-height: 1; }
.stat-num .unit { font-size: 1rem; opacity: .8; }
.stat-desc { font-size: 1rem; }
.stat strong { color: #b6f1c4; }

/* ===== PAIN POINTS ===== */
.pain { padding: 56px 24px 8px; max-width: 1100px; margin: 0 auto; }
.pain-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
@media (max-width: 900px) { .pain-list { grid-template-columns: 1fr; } }
.pain-item { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start; background: #f7faf8; border: 1px solid #e3efe7; border-radius: 14px; padding: 16px; }
.pain-item h3 { margin: 0 0 6px; font-size: 1.1rem; }
.pain-item p { margin: 0; color: #4b5563; }
.pain-item .pill { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; background: #eaf4ee; border: 1px solid #d8ebe0; font-size: 1.2rem; }

/* ===== VALUE ===== */
.value { padding: 18px 24px 56px; max-width: 1100px; margin: 0 auto; }
.value-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
@media (max-width: 900px) { .value-grid { grid-template-columns: 1fr; } }
.value-card {
  position: relative; overflow: hidden;
  background: linear-gradient(180deg, #ffffff, #f6faf7);
  border: 1px solid #e4efe7; border-radius: 16px; padding: 18px;
  box-shadow: 0 12px 28px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.6);
}
.value-card h3 { margin: 6px 0 8px; }
.value-card p { margin: 0; color: #4b5563; }
.value-card .badge { display: inline-block; font-weight: 700; font-size: .78rem; color: #1b4b30; background: #e7f6ed; border: 1px solid #cde9d7; padding: 4px 8px; border-radius: 999px; }
.value-card .badge.alt { background: #e8f1fe; color: #1c3e80; border-color: #cfe0fb; }

/* subtle animated “micro chart” shimmer */
.mini-sparkle {
  position: absolute; right: -40px; bottom: -40px; width: 160px; height: 160px; border-radius: 50%;
  background: conic-gradient(from 180deg, rgba(74,124,89,.18), rgba(74,124,89,0) 60%);
  filter: blur(12px); opacity: .6; animation: rotate 12s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg) } }

/* ===== FINAL CTA ===== */
.final-cta { padding: 40px 24px 80px; }
.cta-wrap {
  max-width: 980px; margin: 0 auto; text-align: center;
  background: linear-gradient(180deg, #f9fbf9, #f1f6f3); border: 1px solid #e4efe7; border-radius: 20px; padding: 28px;
  box-shadow: 0 16px 36px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.7);
}
.cta-wrap h2 { margin: 0 0 6px; }
.cta-wrap p { margin: 0 0 16px; color: #4b5563; }

/* ===== a11y: reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  .car--sleek, .motion-lines .line, .ticker__track, .hero-bg .radial-glow, .mini-sparkle, .cta-button .pulse-dot { animation: none !important; }
}

.cta-buttons {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.cta-button.primary {
  background: var(--green);
  color: #073101;
  border-color: var(--green);
}

.cta-button.primary:hover {
  background: var(--green-strong);
  transform: translateY(-1px);
}

.cta-button.secondary {
  background: #fff;
  color: var(--green);
  border-color: var(--green);
}

.cta-button.secondary:hover {
  background: #f4f7f5;
  transform: translateY(-1px);
}
</style>
