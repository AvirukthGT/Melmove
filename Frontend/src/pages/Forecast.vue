<template>
  <div class="forecast-page">
    <!-- loading progress -->
    <div class="progress-wrap" v-show="loading || loadingProgress < 100">
      <div class="progress-bar" :style="{ width: loadingProgress + '%' }"></div>
    </div>

    <div class="page-header">
      <h1>FORECAST</h1>
    </div>

    <!-- Area + action -->
    <div class="search-section">
      <div class="search-inputs">
        <div class="input-group">
          <span class="info-icon">📍</span>
          <span class="area-info">For all zones on Melbourne CBD</span>
        </div>

        <button class="continue-btn" @click="onContinue" :disabled="loading">
          <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
          {{ loading ? 'Loading…' : 'Forecast' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-banner" role="alert">{{ error }}</div>

    <!-- PREVIEW CONTENT (shows before first run) -->
<section
  v-if="!loading && !result"
  class="pre-content"
  aria-describedby="preview-desc"
>
  <div class="pre-hero">
    <h2>What you’ll get</h2>
    <p id="preview-desc" class="muted">
      A 24‑hour forecast for Melbourne CBD bays with confidence bands, peak & low times,
      and a quick trend for the next two hours. Press <strong>Forecast</strong> to generate.
    </p>
  </div>

  <div class="pre-grid">
    <!-- value cards -->
    <article class="pre-card">
      <div class="pre-badge">Insights</div>
      <h3>Peak & Low Times</h3>
      <p>Plan around congestion windows with clear peak/low markers.</p>
    </article>

    <article class="pre-card">
      <div class="pre-badge alt">Reliability</div>
      <h3>Confidence Bands</h3>
      <p>Shaded bands show uncertainty so you can judge risk vs. time.</p>
    </article>

    <article class="pre-card">
      <div class="pre-badge">Action</div>
      <h3>Next‑2h Trend</h3>
      <p>See if availability is rising or falling before you leave.</p>
    </article>

    <!-- faux preview chart (SVG) -->
    <article class="preview-chart">
      <header class="preview-head">
        <div class="title">Parking Availability — Preview</div>
        <div class="chips">
          <span class="chip micro">24h</span>
          <span class="chip micro">All Zones</span>
        </div>
      </header>

      <div class="preview-frame">
        <!-- simple SVG sparkline with a mock CI band -->
        <svg viewBox="0 0 600 200" class="preview-svg" aria-hidden="true">
          <!-- CI band -->
          <path
            d="M0,120 C120,80 240,150 360,90 C480,60 540,110 600,90 L600,140 C540,160 480,110 360,140 C240,180 120,120 0,160 Z"
            class="band"
          />
          <!-- baseline -->
          <line x1="0" y1="150" x2="600" y2="150" class="axis" />
          <!-- sparkline -->
          <path
            d="M0,140 C120,70 240,160 360,100 C480,70 540,130 600,100"
            class="line"
          />
          <!-- dots -->
          <circle cx="360" cy="100" r="3" class="dot"/>
          <circle cx="480" cy="70" r="3" class="dot"/>
          <circle cx="540" cy="130" r="3" class="dot"/>
        </svg>
        <div class="preview-note">
          Preview only — press <strong>Forecast</strong> for live data.
        </div>
      </div>
    </article>
  </div>

  <!-- tiny FAQ -->
  <details class="faq">
    <summary>How is the forecast generated?</summary>
    <p class="muted">
      The API blends recent sensor history with a trained model and returns a
      Matplotlib chart plus structured predictions including a 90% confidence range.
    </p>
  </details>
</section>


    <!-- Skeleton while waiting -->
    <div v-if="loading && !result" class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-chart shimmer"></div>
      <div class="skeleton-footer"></div>
    </div>

    <!-- Result -->
    <div class="forecast-visualizations" v-if="result">
      <!-- Insights header -->
      <div class="insights">
        <div class="chip big">
          <span class="chip-label">Now</span>
          <span class="chip-value">{{ predictedNow?.y?.toFixed(0) ?? '—' }}</span>
          <span class="chip-suffix">spots</span>
        </div>
        <div class="chip" :class="confidenceClass">
          <span class="chip-label">Confidence</span>
          <span class="chip-value">{{ confidencePct.toFixed(0) }}%</span>
        </div>
        <div class="chip">
          <span class="chip-label">Peak</span>
          <span class="chip-value">{{ peak?.y?.toFixed(1) ?? '—' }}</span>
          <span class="chip-suffix" v-if="peak?.time">at {{ formatTimeHM(peak.time) }}</span>
        </div>
        <div class="chip">
          <span class="chip-label">Low</span>
          <span class="chip-value">{{ low?.y?.toFixed(1) ?? '—' }}</span>
          <span class="chip-suffix" v-if="low?.time">at {{ formatTimeHM(low.time) }}</span>
        </div>
        <div class="chip trend" :data-trend="trend.direction">
          <span class="chip-label">Next 2h</span>
          <span class="chip-value">
            <span v-if="trend.direction === 'up'">▲</span>
            <span v-else-if="trend.direction === 'down'">▼</span>
            <span v-else>→</span>
            {{ Math.abs(trend.delta).toFixed(0) }}
          </span>
          <span class="chip-suffix">spots</span>
        </div>
      </div>

      <div class="chart-grid one-col">
        <div class="chart-card">
          <div class="chart-header">
            <div class="chart-title">{{ chartTitle }}</div>
            <div class="chart-meta" v-if="predictedNow">
              <span class="time">{{ formatTime(predictedNow.time) }}</span>
              <span class="prediction">Predicted: {{ predictedNow.y.toFixed(0) }} spots</span>
              <span class="confidence">Confidence: {{ confidencePct.toFixed(0) }}%</span>
            </div>
            <div class="chart-tools">
              <span class="meta-chip" v-if="latency.predictMs">API: {{ latency.predictMs }}ms</span>
              <span class="meta-chip" v-if="latency.plotMs">Chart: {{ latency.plotMs }}ms</span>
              <span class="meta-chip" v-if="updatedAt">Updated: {{ formatTime(updatedAt) }}</span>
              <button class="ghost-btn" @click="downloadPlot" :disabled="!plotSrc">Download PNG</button>
            </div>
          </div>

          <div class="chart-frame">
            <img
              v-if="plotSrc"
              :src="plotSrc"
              alt="Parking availability forecast (24h)"
              class="plot-img"
            />
            <div v-else class="plot-placeholder">Chart will appear here</div>
          </div>

          <div class="chart-caption">
            Matplotlib figure from <code>/predict_plot</code> with 90% CI and peak/low markers.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forecast',
  data() {
    return {
      loading: false,
      loadingProgress: 0,
      progressTimer: null,
      error: '',
      result: null,
      plotSrc: '',
      plotBlob: null,
      updatedAt: null,
      latency: { predictMs: 0, plotMs: 0 }
    }
  },
  computed: {
    apiBase() {
      const fromEnv = import.meta.env.VITE_API_BASE_URL;
      return fromEnv || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://melmove.onrender.com');
    },
    chartTitle() {
      return 'All Zones On Melbourne CBD - 24 Hours Prediction';
    },
    predictedNow() {
      return this.result?.predictions?.[0] || null;
    },
    confidencePct() {
      if (!this.predictedNow?.y || this.predictedNow?.hi == null || this.predictedNow?.lo == null) return 0;
      const { y, lo, hi } = this.predictedNow;
      if (y <= 0) return 0;
      const range = hi - lo;
      return Math.max(0, Math.min(100, (1 - range / Math.max(y, 1)) * 100));
    },
    confidenceClass() {
      const c = this.confidencePct;
      if (c >= 75) return 'good';
      if (c >= 50) return 'ok';
      return 'low';
    },
    peak() {
      const preds = this.result?.predictions || [];
      if (!preds.length) return null;
      return preds.reduce((a, b) => (a.y >= b.y ? a : b));
    },
    low() {
      const preds = this.result?.predictions || [];
      if (!preds.length) return null;
      return preds.reduce((a, b) => (a.y <= b.y ? a : b));
    },
    trend() {
      const preds = this.result?.predictions || [];
      if (preds.length < 3) return { direction: 'flat', delta: 0 };
      const now = preds[0].y;
      const twoHours = preds[Math.min(2, preds.length - 1)].y;
      const delta = twoHours - now;
      return {
        direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat',
        delta
      };
    }
  },
  methods: {
    formatTime(t) { return new Date(t).toLocaleString(); },
    formatTimeHM(t) {
      const d = new Date(t);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    buildQuery(params) {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) q.append(k, v); });
      return q.toString();
    },

    // progress handling
    startProgress() {
      this.loadingProgress = 0;
      if (this.progressTimer) clearInterval(this.progressTimer);
      // determinate-like: smoothly ramp to ~80% then wait for completion
      this.progressTimer = setInterval(() => {
        if (this.loadingProgress < 80) {
          this.loadingProgress += 2; // ~1s to 80%
        }
      }, 25);
    },
    stopProgress() {
      if (this.progressTimer) clearInterval(this.progressTimer);
      this.loadingProgress = 100;
      setTimeout(() => { this.loadingProgress = 100; }, 150);
    },

    async onContinue() {
      this.error = '';
      this.result = null;
      this.plotSrc = '';
      this.plotBlob = null;
      this.updatedAt = null;
      this.latency = { predictMs: 0, plotMs: 0 };

      this.loading = true;
      this.startProgress();

      try {
        const t0 = performance.now();
        const [predictData, plotData] = await Promise.all([
          this.fetchPredict(),
          this.fetchPlot()
        ]);
        const t1 = performance.now();

        this.latency.predictMs = Math.round(predictData.ms);
        this.latency.plotMs = Math.round(plotData.ms);
        this.updatedAt = new Date();

        // Complete progress
        this.stopProgress();
      } catch (e) {
        this.error = e?.message || 'Request failed';
        this.stopProgress();
      } finally {
        this.loading = false;
      }
    },

    async fetchPredict() {
      const started = performance.now();
      const qs = this.buildQuery({ hours: 24 });
      const url = `${this.apiBase}/predict${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data?.error?.message || 'API returned error');
      this.result = data;
      return { ms: performance.now() - started };
    },

    async fetchPlot() {
      const started = performance.now();
      const qs = this.buildQuery({ hours: 24 });
      const url = `${this.apiBase}/predict_plot${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Plot HTTP ${res.status}`);
      const blob = await res.blob();
      this.plotBlob = blob;
      this.plotSrc = URL.createObjectURL(blob);
      return { ms: performance.now() - started };
    },

    downloadPlot() {
      if (!this.plotSrc) return;
      const a = document.createElement('a');
      a.href = this.plotSrc;
      a.download = 'melmove_forecast.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
}
</script>

<style scoped>
/* progress */
.progress-wrap {
  position: sticky;
  top: 60px; /* under your navbar */
  height: 3px;
  background: transparent;
  z-index: 30;
}
.progress-bar {
  height: 3px;
  background: linear-gradient(90deg, #2d5a27, #6bbf8a);
  border-radius: 999px;
  transition: width .15s ease;
}

/* page */
.forecast-page {
  padding: 100px 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}
.page-header { margin-bottom: 8px; }
.page-header h1 {
  color: var(--primary-color);
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
}

/* controls */
.search-section { margin-bottom: 10px; }
.search-inputs {
  display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
}
.input-group { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
.area-info { color: #22334d; font-weight: 500; }
.continue-btn {
  padding: 12px 22px; background: var(--primary-color); color: white; border: none;
  border-radius: 10px; font-weight: 700; cursor: pointer; transition: transform .15s ease, background .15s ease;
  box-shadow: 0 6px 16px rgba(45,90,39,.18);
}
.continue-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
.continue-btn:disabled { opacity: .8; cursor: default; }
.btn-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.6); border-top-color: #fff;
  border-radius: 50%; display: inline-block; margin-right: 8px; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg) } }

/* error */
.error-banner {
  margin: 14px 0; padding: 12px 14px; border-radius: 10px;
  background: #ffecec; color: #8b0000; border: 1px solid #ffd1d1;
}

/* skeleton */
.skeleton-card {
  background: white; border-radius: var(--border-radius); border: 1px solid var(--border-color);
  box-shadow: var(--shadow-light); padding: 20px; margin-top: 10px;
}
.skeleton-header { height: 22px; width: 60%; background: #eef2f0; border-radius: 8px; margin-bottom: 14px; }
.skeleton-chart { height: 360px; border-radius: 12px; background: #eef2f0; }
.skeleton-footer { margin-top: 12px; height: 14px; width: 40%; background: #eef2f0; border-radius: 8px; }
.shimmer {
  position: relative; overflow: hidden;
}
.shimmer::after {
  content: ""; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.6), rgba(255,255,255,0));
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* insights */
.insights {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  margin: 18px 0 10px;
}
.chip {
  display: inline-flex; align-items: baseline; gap: 6px;
  background: #f6fbf8; border: 1px solid #e0efe5; color: #21412f;
  padding: 8px 10px; border-radius: 12px; font-weight: 600; font-size: .95rem;
}
.chip.big { font-size: 1.05rem; padding: 10px 12px; }
.chip .chip-label { font-weight: 700; color: #386a4d; }
.chip .chip-value { font-weight: 800; }
.chip .chip-suffix { font-weight: 600; opacity: .7; }
.chip.good { background: #e9f8ef; border-color: #cfeedd; }
.chip.ok { background: #fff7e6; border-color: #ffedc2; }
.chip.low { background: #fff2f2; border-color: #ffd9d9; }
.chip.trend[data-trend="up"] { background: #e9f8ef; border-color: #cfeedd; }
.chip.trend[data-trend="down"] { background: #fff2f2; border-color: #ffd9d9; }
.chip.trend[data-trend="flat"] { background: #eef3f7; border-color: #dbe6ef; }

/* card + chart */
.chart-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
.chart-card {
  background: white; border-radius: var(--border-radius); padding: 20px;
  box-shadow: var(--shadow-light); border: 1px solid var(--border-color);
}
.chart-header { margin-bottom: 12px; display: grid; gap: 8px; }
.chart-title { font-size: 1.25rem; font-weight: 800; color: var(--primary-color); }
.chart-meta { display: flex; gap: 12px; flex-wrap: wrap; color: var(--text-secondary); }
.chart-meta .prediction { color: var(--primary-color); font-weight: 700; }
.chart-meta .confidence { color: #1b9150; font-weight: 700; }
.chart-tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.meta-chip {
  background: #f3f6f4; border: 1px solid #e4ece7; color: #21412f;
  padding: 6px 8px; border-radius: 999px; font-weight: 600; font-size: .85rem;
}
.ghost-btn {
  background: #fff; border: 1px solid #dfe8e2; color: #2d5a27; padding: 6px 10px;
  border-radius: 10px; font-weight: 700; cursor: pointer;
}
.ghost-btn:hover { background: #f7faf8; }

.chart-frame {
  width: 100%; overflow-x: auto; display: flex; justify-content: center; padding: 8px;
  border-radius: 14px; background: linear-gradient(180deg, #fafcfa, #f1f6f3);
  border: 1px solid #e6efe9;
}
.plot-img {
  max-width: 100%; max-height: 460px; object-fit: contain; border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
}
.plot-placeholder {
  min-height: 260px; display: grid; place-items: center; color: var(--text-secondary);
}
.chart-caption {
  font-size: .85rem; color: var(--text-secondary); margin-top: 10px; font-style: italic;
}

@media (max-width: 768px) {
  .forecast-page { padding: 100px 16px 40px; }
  .page-header h1 { font-size: 2rem; }
  .continue-btn { align-self: flex-start; }
  .plot-img { max-height: 320px; }
}
/* ---- PREVIEW ---- */
.pre-content { margin-top: 8px; }
.pre-hero h2 { margin: 0 0 6px; font-size: 1.4rem; font-weight: 800; color: var(--primary-color); }
.pre-hero .muted { color: var(--text-secondary); }

.pre-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 14px;
}
@media (max-width: 980px) { .pre-grid { grid-template-columns: 1fr; } }

.pre-card {
  background: linear-gradient(180deg, #ffffff, #f8fbf9);
  border: 1px solid #e5efe9;
  border-radius: 14px;
  padding: 16px;
  box-shadow: var(--shadow-light);
}
.pre-card h3 { margin: 6px 0 6px; font-size: 1.05rem; }
.pre-card p { margin: 0; color: #4b5563; }
.pre-badge {
  display: inline-block; font-size: .75rem; font-weight: 800;
  color: #1b4b30; background: #e7f6ed; border: 1px solid #cfe8da;
  padding: 4px 8px; border-radius: 999px;
}
.pre-badge.alt { background: #e8f1fe; color: #1c3e80; border-color: #cfe0fb; }

.preview-chart {
  grid-column: 1 / -1;
  background: #fff;
  border: 1px solid #e6efe9;
  border-radius: 16px;
  box-shadow: var(--shadow-light);
  overflow: hidden;
}
.preview-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px; border-bottom: 1px solid #eef3f0; background: #fafdfb;
}
.preview-head .title { font-weight: 800; color: var(--primary-color); }
.preview-head .chips { display: flex; gap: 8px; }
.chip.micro {
  background: #f3f6f4; border: 1px solid #e4ece7; color: #21412f;
  padding: 4px 8px; border-radius: 999px; font-weight: 700; font-size: .78rem;
}

.preview-frame { padding: 10px 12px 14px; }
.preview-svg { width: 100%; height: 220px; display: block; }
.preview-svg .band { fill: rgba(107,191,138,0.22); }
.preview-svg .axis { stroke: #dfe8e2; stroke-width: 2; }
.preview-svg .line { fill: none; stroke: #2d5a27; stroke-width: 3; }
.preview-svg .dot { fill: #2d5a27; }
.preview-note { margin-top: 8px; color: var(--text-secondary); font-size: .9rem; }

.faq {
  margin-top: 12px;
  background: #f7faf8; border: 1px solid #e3efe7; border-radius: 10px; padding: 10px 12px;
}
.faq summary { cursor: pointer; font-weight: 700; color: #21412f; }
.faq .muted { margin-top: 6px; }

</style>
