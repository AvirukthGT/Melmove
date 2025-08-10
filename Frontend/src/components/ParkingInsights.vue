<template>
  <section class="mt-10">
    <div class="flex items-center gap-3 mb-4">
      <h2 class="text-2xl font-semibold">Parking Insights</h2>

      <select
        v-model="zoneFilter"
        @change="applyFilter"
        class="px-3 py-2 rounded-lg border border-gray-200"
      >
        <option :value="null">All zones</option>
        <option v-for="z in zones" :key="z" :value="z">Zone {{ z }}</option>
      </select>

      <button @click="refresh" class="px-3 py-2 rounded-lg bg-green-600 text-white">
        Refresh
      </button>
    </div>
<!-- Layout -->
<!-- Hard‑reliable layout -->
<div class="two-col">
  <!-- Map -->
  <div>
    <div ref="mapEl" class="map-shell rounded-2xl shadow-inner border border-emerald-100"></div>
  </div>

  <!-- Trend -->
  <div>
    <div class="chart-shell rounded-2xl shadow-inner border border-emerald-100 p-4 flex flex-col">
      <h3 class="text-lg font-medium mb-2">Occupancy by hour (avg)</h3>
      <svg ref="trendEl" class="flex-grow" :width="chart.w" :height="chart.h"></svg>
      <div class="text-sm text-gray-500 mt-2">
        Occupied = <span class="font-medium">Present</span>, Available =
        <span class="font-medium">Unoccupied</span>
      </div>
    </div>
  </div>
</div>
  </section>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as d3 from 'd3'
import L from 'leaflet'

const DATA_URL = 'https://melmoveinsight.z8.web.core.windows.net/data/part-merged.json'

export default {
  name: 'ParkingInsights',
  data() {
    return {
      raw: [],
      filtered: [],
      map: null,
      markersLayer: null,
      zoneFilter: null,
      zones: [],
      chart: { w: 560, h: 300, m: { t: 20, r: 20, b: 30, l: 40 } },
    }
  },
  mounted() {
    this.initMap()
    this.loadData()
    window.addEventListener('resize', this.redraw)

    // Ensure Leaflet recalculates after the DOM settles
    this.$nextTick(() => this.map?.invalidateSize())
    setTimeout(() => this.map?.invalidateSize(), 0)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.redraw)
  },
  methods: {
    async loadData() {
      const res = await fetch(DATA_URL)
      const text = await res.text()

      let rowsRaw
      try {
        rowsRaw = JSON.parse(text)
      } catch {
        rowsRaw = text
          .split(/\r?\n/)
          .map(s => s.trim())
          .filter(Boolean)
          .map(line => JSON.parse(line))
      }

      const rows = rowsRaw
        .map(d => ({
          zone: Number(d.zone_number ?? d.zone_id ?? null),
          lat: Number(d.lat ?? d.location?.lat),
          lon: Number(d.lon ?? d.location?.lng ?? d.location?.lon),
          status: String(d.status_description ?? d.bay_status ?? '').trim(),
          ts: new Date(d.status_timestamp ?? d.lastupdated ?? d.last_updated),
        }))
        .filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lon) && d.status)

      this.raw = rows
      this.zones = Array.from(new Set(rows.map(d => d.zone).filter(Boolean))).sort((a, b) => a - b)
      this.applyFilter()
    },

    applyFilter() {
      const z = this.zoneFilter == null ? null : Number(this.zoneFilter)
      this.filtered = z != null ? this.raw.filter(r => r.zone === z) : this.raw.slice()
      this.plotMap()
      this.plotTrend()
    },

    refresh() {
      this.loadData()
    },

    // ---------- Map ----------
    initMap() {
      this.map = L.map(this.$refs.mapEl, {
        center: [-37.8136, 144.9631],
        zoom: 14,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(this.map)

      this.markersLayer = L.layerGroup().addTo(this.map)

      // Recalculate once tiles load and the container is fully laid out
      this.map.whenReady(() => this.map.invalidateSize())
    },

    plotMap() {
      this.markersLayer.clearLayers()
      if (!this.filtered.length) return

      const occupied = s => /present/i.test(s)
      const green = '#2e7d32'
      const red = '#c62828'

      this.filtered.forEach(d => {
        L.circleMarker([d.lat, d.lon], {
          radius: 5.5,
          weight: 1,
          color: occupied(d.status) ? red : green,
          fillColor: occupied(d.status) ? red : green,
          fillOpacity: 0.85,
          opacity: 0.9,
        })
          .bindPopup(
            `<strong>Status:</strong> ${d.status}<br/>
             <strong>Zone:</strong> ${d.zone ?? '—'}<br/>
             <strong>Time:</strong> ${d.ts.toLocaleString()}`
          )
          .addTo(this.markersLayer)
      })

      const latLngs = this.filtered.map(d => [d.lat, d.lon])
      this.map.fitBounds(latLngs, { padding: [20, 20] })

      // One more nudge after bounds change
      setTimeout(() => this.map?.invalidateSize(), 0)
    },

    // ---------- Trend (D3) ----------
    plotTrend() {
      const svg = d3.select(this.$refs.trendEl)
      svg.selectAll('*').remove()

      const { w, h, m } = this.chart
      const innerW = w - m.l - m.r
      const innerH = h - m.t - m.b

      const byHour = d3.rollup(
        this.filtered,
        v => v.filter(d => /present/i.test(d.status)).length / v.length,
        d => d.ts.getHours()
      )

      const data = d3.range(24).map(hr => ({
        hour: hr,
        ratio: byHour.has(hr) ? byHour.get(hr) : null,
      }))

      const x = d3.scaleLinear().domain([0, 23]).range([m.l, m.l + innerW])
      const y = d3.scaleLinear().domain([0, 1]).nice().range([m.t + innerH, m.t])

      const g = svg.append('g')

      g.append('g')
        .attr('transform', `translate(0,${m.t + innerH})`)
        .call(d3.axisBottom(x).ticks(12).tickFormat(d => `${d}:00`))

      g.append('g')
        .attr('transform', `translate(${m.l},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))

      const line = d3.line().defined(d => d.ratio != null).x(d => x(d.hour)).y(d => y(d.ratio)).curve(d3.curveMonotoneX)
      const area = d3.area().defined(d => d.ratio != null).x(d => x(d.hour)).y0(y(0)).y1(d => y(d.ratio)).curve(d3.curveMonotoneX)

      g.append('path').datum(data).attr('d', area).attr('fill', '#a7f3d0')
      g.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', '#065f46').attr('stroke-width', 3)

      g.selectAll('circle.pt')
        .data(data.filter(d => d.ratio != null))
        .enter()
        .append('circle')
        .attr('class', 'pt')
        .attr('cx', d => x(d.hour))
        .attr('cy', d => y(d.ratio))
        .attr('r', 2.5)
        .attr('fill', '#065f46')

      g.append('text')
        .attr('x', m.l)
        .attr('y', m.t - 6)
        .attr('font-size', 12)
        .attr('fill', '#374151')
        .text('Share of occupied bays by hour (across selected data)')
    },

    redraw() {
      this.plotTrend()
      this.$nextTick(() => this.map?.invalidateSize())
    },
  },
}
</script>

<!-- IMPORTANT: don't scope the Leaflet container height; use :global -->
<style>
.map-shell {
  height: 520px;         /* guaranteed height so the map is visible */
  min-height: 320px;
  position: relative;
}

/* Ensure Leaflet fills that shell */
:global(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 16px;
}
.leaflet-control-container .leaflet-control {
  border-radius: 12px;
  overflow: hidden;
}
.map-shell,
.chart-shell {
  height: 520px; /* equal height for map and chart on desktop */
}

@media (max-width: 1024px) {
  .map-shell,
  .chart-shell {
    height: auto; /* allow natural stacking height on mobile */
  }
}

:global(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 16px;
}


/* Desktop = side-by-side */
@media (min-width: 1024px) {
  .pi-wrap {
    display: flex;
    gap: 24px;
    align-items: stretch;
  }


}

/* Equal heights */
.map-shell,
.chart-shell {
  height: 520px;
}
@media (max-width: 1023.98px) {
  .map-shell,
  .chart-shell {
    height: auto;
  }
}

/* Leaflet fill */
:global(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 16px;
}
/* Two-column grid that never fails */
.two-col { display: block; }  /* mobile: stacked */
@media (min-width: 1024px) {
  .two-col {
    display: grid;
    grid-template-columns: 58% 1fr; /* ~7/12 and 5/12 */
    gap: 24px;
    align-items: start;
  }
}

/* Equal heights (you already have these; keep them) */
.map-shell, .chart-shell { height: 520px; }
@media (max-width: 1023.98px) { .map-shell, .chart-shell { height: auto; } }

/* Leaflet should fill its shell */
:global(.leaflet-container){ height:100%; width:100%; border-radius:16px; }
</style>
