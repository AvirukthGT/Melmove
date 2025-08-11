<template>
  <section class="mt-10">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <h2 class="text-2xl font-semibold">Parking Insights</h2>
    </div>

    <!-- Two-column layout -->
    <div class="two-col">
      <!-- Map (heatmap) -->
      <div>
        <div ref="mapEl" class="map-shell rounded-2xl shadow-inner border border-emerald-100"></div>
      </div>

      <!-- Live insights panel -->
      <div>
        <div class="info-shell rounded-2xl shadow-inner border border-emerald-100 p-6 flex flex-col">
          <header>
            <h3 class="text-xl font-semibold">Hotspots at a glance</h3>
            <p class="text-[15px] text-gray-600 leading-relaxed mt-1.5">
              Heat shows <b>parking pressure</b>: warmer = bays more often <b>occupied</b>.
              Use this to guide drivers toward <b>lower-pressure streets</b>.
            </p>
          </header>

          <!-- KPI band -->
          <div class="mt-4 grid grid-cols-3 gap-3">
            <div class="kpi">
              <div class="kpi-label">Parking Bays</div>
              <div class="kpi-value">{{ formatNumber(metrics.points) }}</div>
            </div>
          </div>

          <!-- Lists -->
          <div class="mt-4 grid grid-cols-2 gap-4 flex-grow">
            <section class="list-card">
              <h4 class="list-title">Top hotspots</h4>
              <ol class="list">
                <li v-for="(name, i) in hotNames" :key="'hot-'+i">
                  <span class="rank">{{ i+1 }}</span>
                  <span class="badge hot">hot</span>
                  <span class="where">{{ name }}</span>
                  <span class="val">55%</span>
                </li>
              </ol>
            </section>

            <section class="list-card">
              <h4 class="list-title">Best chances</h4>
              <ol class="list">
                <li v-for="(name, i) in coolNames" :key="'cool-'+i">
                  <span class="rank">{{ i+1 }}</span>
                  <span class="badge cool">low</span>
                  <span class="where">{{ name }}</span>
                  <span class="val">55%</span>
                </li>
              </ol>
            </section>
          </div>

          <!-- Legend + note -->
          <div class="mt-4 grid grid-cols-3 gap-3 text-[13px] text-gray-700">
            <div class="flex items-center gap-2"><span class="dot dot-green"></span> Lower pressure</div>
            <div class="flex items-center gap-2"><span class="dot dot-amber"></span> Moderate</div>
            <div class="flex items-center gap-2"><span class="dot dot-red"></span> High pressure</div>
          </div>
          <div class="mt-2 text-gray-500 text-[12px]">
            Source: Melbourne kerbside sensors · Last load reflects most recent snapshot.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import 'leaflet.heat'

const DATA_URL = 'https://melmoveinsight.z8.web.core.windows.net/data/part-merged.json'

export default {
  name: 'ParkingInsights',
  data() {
    return {
      raw: [],
      map: null,
      heat: null,
      metrics: { points: 0, occShare: 0 },
      hotNames: [
        'Spring St (Lonsdale–Little Lonsdale)',
        'Russell St (Little Bourke–Lonsdale)',
        'Capel St (William–Victoria)',
      ],
      coolNames: [
        'Little Bourke St (Russell–Swanston)',
        'Collins St (Swanston–Elizabeth)',
        'Lonsdale St (Elizabeth–Queen)',
      ],
    }
  },
  mounted() {
    this.initMap()
    this.loadData()
    window.addEventListener('resize', this.redraw)
    this.$nextTick(() => this.map?.invalidateSize())
    setTimeout(() => this.map?.invalidateSize(), 0)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.redraw)
  },
  methods: {
    formatNumber(n){ return (n ?? 0).toLocaleString() },

    async loadData() {
      const res = await fetch(DATA_URL)
      const text = await res.text()

      let rowsRaw
      try { rowsRaw = JSON.parse(text) }
      catch {
        rowsRaw = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(line => JSON.parse(line))
      }

      const rows = rowsRaw
        .map(d => ({
          lat: Number(d.lat ?? d.location?.lat),
          lon: Number(d.lon ?? d.location?.lng ?? d.location?.lon),
          status: String(d.status_description ?? d.bay_status ?? '').trim(),
        }))
        .filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lon) && d.status)

      this.raw = rows
      this.metrics.points = rows.length
      this.metrics.occShare = rows.filter(r => /present|occupied/i.test(r.status)).length / (rows.length || 1)

      this.plotHeat()
    },

    initMap() {
      this.map = L.map(this.$refs.mapEl, {
        center: [-37.8136, 144.9631],
        zoom: 14,
        scrollWheelZoom: true,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(this.map)
      this.map.whenReady(() => this.map.invalidateSize())
    },

    plotHeat() {
      if (!this.raw.length) return

      const isOcc = s => /present|occupied/i.test(s)
      const pts = this.raw.map(d => [d.lat, d.lon, isOcc(d.status) ? 0.55 : 0.15])

      const latLngs = this.raw.map(d => [d.lat, d.lon])
      this.map.fitBounds(latLngs, { padding: [20, 20] })

      if (this.heat) this.map.removeLayer(this.heat)
      this.heat = L.heatLayer(pts, {
        radius: 18,
        blur: 28,
        maxZoom: 17,
        minOpacity: 0.06,
        gradient: {
          0.00: 'rgba(131, 227, 119, 0.70)',
          0.35: 'rgba(131, 227, 119, 0.85)',
          0.55: 'rgba(244, 211,  94, 0.88)',
          0.80: 'rgba(243, 156,  82, 0.90)',
          1.00: 'rgba(230,  57,  70, 0.92)',
        },
      }).addTo(this.map)

      setTimeout(() => this.map?.invalidateSize(), 0)
    },

    redraw() { this.$nextTick(() => this.map?.invalidateSize()) },
  },
}
</script>

<style>
/* Map & right panel fixed height on desktop; stack on mobile */
.map-shell,
.info-shell {
  height: 520px;
}
@media (max-width: 1023.98px) {
  .map-shell,
  .info-shell {
    height: auto;
  }
}

/* Two-column layout */
.two-col { display: block; }
@media (min-width: 1024px) {
  .two-col {
    display: grid;
    grid-template-columns: 58% 1fr;
    gap: 24px;
    align-items: start;
  }
}

:global(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 16px;
}

/* KPI chips */
.kpi { background: #fff; border: 1px solid rgba(45,90,39,.14); border-radius: 12px; padding: 10px 12px }
.kpi-label { color:#6b7a71; font-size:12px; letter-spacing:.2px }
.kpi-value { color:#26312a; font-weight:800; font-size:18px }

/* List cards */
.list-card { background:#fff; border:1px solid rgba(45,90,39,.14); border-radius:12px; padding:12px }
.list-title { font-weight:700; font-size:14px; margin-bottom:6px; color:#26312a }
.list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px }
.list li { display:grid; grid-template-columns: 22px 38px 1fr auto; align-items:center; gap:8px }
.rank { width:22px; height:22px; border-radius:999px; background:#eef5ee; color:#2d5a27; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700 }
.badge { font-size:11px; padding:2px 8px; border-radius:999px; border:1px solid transparent }
.badge.hot  { background:rgba(230,57,70,.08);  color:#b53b43; border-color:rgba(230,57,70,.28) }
.badge.cool { background:rgba(131,227,119,.10); color:#2f7d32; border-color:rgba(131,227,119,.30) }
.where { color:#26312a; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.val   { color:#6b7a71; font-size:12px }

/* Legend dots */
.dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; box-shadow: 0 0 0 3px rgba(0,0,0,.04) }
.dot-red   { background: #e63946; }
.dot-amber { background: #f4d35e; }
.dot-green { background: #83e377; }

.info-shell {
  background: linear-gradient(180deg, rgba(45,90,39,.06), rgba(45,90,39,.02));
}
</style>
