<template>
  <section class="insights-page">
    <!-- Scroll progress bar -->
    <div class="scrollbar"><div class="progress" :style="{ width: scrollProgress + '%' }"></div></div>

    <!-- Hero -->
    <header class="hero">
      <div class="hero-text">
        <h1>Data Insights</h1>
        <p class="subtitle">
          Accessible, beautiful insights for Melbourne commuters—how car ownership and CBD population shape congestion and kerbside pressure.
        </p>
      </div>
      <div class="hero-badges">
        <span class="badge">Must‑Have</span>
        <span class="badge alt">Community Impact</span>
      </div>
    </header>
    <nav class="toolbar" v-if="ready">
  <div class="btn-group">
    <button class="btn" :class="{active:view==='all'}" @click="setView('all')">Overview</button>
    <button class="btn" @click="scrollTo('chartA')">Vehicles</button>
    <button class="btn" @click="scrollTo('chartB')">CBD</button>
    <button class="btn" @click="scrollTo('chartC')">Density</button>
  </div>
  <div class="btn-right">
    <button class="btn ghost" @click="toggleBand">
      {{ showBand ? 'Hide' : 'Show' }} COVID band
    </button>
    <button class="btn" @click="downloadData">Download data</button>
  </div>
</nav>

    <!-- KPI chips -->
    <section class="kpis" v-if="ready">
      <article class="kpi-card">
        <div class="kpi-label">Vehicle Ownership (VIC)</div>
        <div class="kpi-value">{{ formatNumber(vehicleDelta.absolute) }}</div>
        <div class="kpi-sub">+{{ vehicleDelta.percent.toFixed(1) }}% since {{ firstVehicleYear }} → {{ lastVehicleYear }}</div>
        <div class="spark" ref="sparkVehicles"></div>
      </article>
      <article class="kpi-card">
        <div class="kpi-label">CBD Population</div>
        <div class="kpi-value">{{ formatNumber(cbdPeak.value) }}</div>
        <div class="kpi-sub">Peak {{ cbdPeak.year }}, then {{ cbdDip.sign }}{{ Math.abs(cbdDip.changePct).toFixed(1) }}% to {{ cbdDip.year }}</div>
        <div class="spark" ref="sparkCBD"></div>
      </article>
      <article class="kpi-card">
        <div class="kpi-label">Vehicles per 1,000 Metro Residents</div>
        <div class="kpi-value">{{ vehiclesPer1k.latest.toFixed(1) }}</div>
        <div class="kpi-sub">Pre‑COVID avg {{ vehiclesPer1k.preAvg.toFixed(1) }} → Post‑COVID avg {{ vehiclesPer1k.postAvg.toFixed(1) }}</div>
        <div class="spark" ref="sparkPer1k"></div>
      </article>
    </section>
    <!-- In your page SFC -->

    <!-- Row 1 -->
    <section class="row" v-if="ready">
      <article class="chart-card">
        <header class="chart-head">
          <h2>Vehicle Growth & Ownership Density (2016–2021)</h2>
          <p>Vehicles (left) and vehicles per 1,000 metro residents (right).</p>
        </header>
        <div class="chart" ref="chartA"></div>
        <footer class="chart-foot"><span class="source">Source: ABS Motor Vehicle Census · Metro population from ABS</span></footer>
      </article>

      <aside class="prose-block">
        <h2 class="display">Ownership keeps climbing</h2>
        <p class="lede">
          Since {{ firstVehicleYear }}, Victoria added <b>{{ formatNumber(vehicleDelta.absolute) }}</b>
          vehicles and density rose <b>{{ densityRisePct.toFixed(1) }}%</b>. More cars per 1,000 people
          means tighter kerbside and slower circulation.
        </p>

        <div class="fact-row">
          <div class="fact"><span class="dot"></span>Latest density <b>{{ vehiclesPer1k.latest.toFixed(1) }}</b>/1,000</div>
          <div class="fact"><span class="dot"></span>Pre → Post <b>{{ vehiclesPer1k.preAvg.toFixed(1) }}</b> → <b>{{ vehiclesPer1k.postAvg.toFixed(1) }}</b></div>
          <div class="fact"><span class="dot"></span>Total vehicles <b>{{ formatNumber(vehicles[vehicles.length-1]?.Vehicles || 0) }}</b></div>
        </div>

        <p class="note" v-if="hoverA">
          <span class="pill">{{ hoverA.Year }}</span>
          Vehicles: <b>{{ formatNumber(hoverA.Vehicles) }}</b> · Density: <b>{{ hoverA.VehiclesPer1000MetroResidents.toFixed(1) }}</b>/1,000.
        </p>
      </aside>
    </section>

    <!-- Row 2 -->
    <section class="row" v-if="ready">
      <aside class="prose-block">
        <h2 class="display">CBD residents surge, then soften</h2>
        <p class="lede">
          From <b>{{ formatNumber(cbdStart.value) }}</b> in {{ cbdStart.year }} to
          <b>{{ formatNumber(cbdPeak.value) }}</b> at the {{ cbdPeak.year }} peak
          (up <b>{{ cbdLongPct.toFixed(1) }}%</b>), before a {{ cbdDip.sign }}<b>{{ Math.abs(cbdDip.changePct).toFixed(1) }}%</b>
          dip by {{ cbdDip.year }}.
        </p>

        <div class="fact-row">
          <div class="fact"><span class="dot"></span>Peak year <b>{{ cbdPeak.year }}</b></div>
          <div class="fact"><span class="dot"></span>2001 → 2021 change
            <b>{{ ((cbdPop.find(d=>d.Year===2021)?.Population - cbdStart.value) / cbdStart.value * 100).toFixed(1) }}%</b>
          </div>
          <div class="fact"><span class="dot"></span>Post‑peak change <b>{{ cbdDip.sign }}{{ Math.abs(cbdDip.changePct).toFixed(1) }}%</b></div>
        </div>

        <p class="note" v-if="hoverB">
          <span class="pill">{{ hoverB.Year }}</span> Population: <b>{{ formatNumber(hoverB.Population) }}</b>
        </p>
      </aside>

      <article class="chart-card">
        <header class="chart-head">
          <h2>Melbourne CBD Population (2001–2021)</h2>
          <p>Long‑run growth with pandemic impact highlighted.</p>
        </header>
        <div class="chart" ref="chartB"></div>
        <footer class="chart-foot"><span class="source">Source: ABS Regional Population Dataset</span></footer>
      </article>
    </section>
    <ParkingInsights />
    <!-- Row 3 -->
    <article class="chart-card full" v-if="ready">
      <header class="chart-head">
        <h2>Ownership Density: Pre‑ vs Post‑COVID</h2>
        <p>Average vehicles per 1,000 metro residents: 2016–2019 vs 2020–2021.</p>
      </header>
      <div class="chart narrow" ref="chartC"></div>
      <footer class="chart-foot"><span class="source">Source: ABS Motor Vehicle Census · Calculations by MelMove</span></footer>
    </article>

    <div v-if="!ready" class="loading">Loading insights…</div>
    <div ref="tooltip" class="tooltip" style="opacity:0"></div>
  </section>
</template>

<script>
import * as d3 from 'd3'
import ParkingInsights from '../components/ParkingInsights.vue'
const BRAND = '#2d5a27' // brand green



export default {
  name: 'EpicInsights',
  // name: 'UrbanTrends',
  components: { ParkingInsights },
  data(){
    return {
      ready:false,
      timeseries:[],
      vehicles:[],
      cbdPop:[],
      vehicleDelta:{ absolute:0, percent:0 },
      firstVehicleYear:null,
      lastVehicleYear:null,
      vehiclesPer1k:{ first:0, latest:0, preAvg:0, postAvg:0 },
      cbdStart:{ year:2001, value:0 },
      cbdPeak:{ year:0, value:0 },
      cbdDip:{ year:0, changePct:0, sign:'' },
      cbdLongPct:0,
      hoverA:null,
      hoverB:null,
      _resizeObs:null,
      scrollProgress:0,
      view:'all',
      showBand:true,

    }
  },
  computed:{
    densityRisePct(){
      const a = this.vehiclesPer1k.first || 1
      return ((this.vehiclesPer1k.latest - a)/a)*100
    }
  },
  async mounted(){
    try{
      const [ts, co, cbd] = await Promise.all([
        fetch('https://melmoveinsight.z8.web.core.windows.net/data/timeseries.json').then(r=>r.text()),
        fetch('https://melmoveinsight.z8.web.core.windows.net/data/car_ownership_vic.json').then(r=>r.text()),
        fetch('https://melmoveinsight.z8.web.core.windows.net/data/cbd_population.json').then(r=>r.text())
      ])
      const parseLD = t => t.trim().split(/\r?\n+/).map(l => JSON.parse(l))
      this.timeseries = parseLD(ts).sort((a,b)=>a.Year-b.Year)
      this.vehicles   = parseLD(co).sort((a,b)=>a.Year-b.Year)
      this.cbdPop     = parseLD(cbd).sort((a,b)=>a.Year-b.Year)

      this.computeStats()
      this.ready = true

      this.$nextTick(()=>{
        this.drawSpark(this.$refs.sparkVehicles, this.vehicles.map(d=>({x:d.Year, y:d.Vehicles})))
        this.drawSpark(this.$refs.sparkCBD,      this.cbdPop.map(d=>({x:d.Year, y:d.Population})))
        this.drawSpark(this.$refs.sparkPer1k,    this.timeseries.map(d=>({x:d.Year, y:d.VehiclesPer1000MetroResidents})))

        this.drawChartA(); this.drawChartB(); this.drawChartC()
        this.setupResize()
        this.setupObserver()
        this.onScroll()
      })
    }catch(e){ console.error(e) }
  },
  beforeUnmount(){
    if(this._resizeObs) this._resizeObs.disconnect()
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
  formatNumber(n){ return d3.format(',')(n) },

  onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
    const docH = document.documentElement.scrollHeight - window.innerHeight
    this.scrollProgress = docH > 0 ? Math.min(100, Math.max(0, (scrollTop / docH) * 100)) : 0
  },

  setView(v){ this.view = v },

  scrollTo(refName){
  const el = this.$refs[refName]
  if(!el) return
  const pad = parseInt(getComputedStyle(document.documentElement)
                .getPropertyValue('--anchor-pad')) || 96
  const y = el.getBoundingClientRect().top + window.scrollY - pad
  window.scrollTo({ top: y, behavior: 'smooth' })
},

  toggleBand(){
    this.showBand = !this.showBand
    this.drawChartB()
  },

  async downloadData(){
    const payload = { timeseries: this.timeseries, vehicles: this.vehicles, cbdPop: this.cbdPop }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'melmove_insights_data.json'; a.click()
    URL.revokeObjectURL(url)
  }
,


    setupObserver(){
      const rows = this.$el.querySelectorAll('.row, .chart-card.full')
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e => {
          if(e.isIntersecting){ e.target.classList.add('inview') }
          else { e.target.classList.remove('inview') }
        })
      }, { threshold: 0.25 })
      rows.forEach(r => io.observe(r))
    },

    setupResize(){
      const redraw = () => { this.drawChartA(); this.drawChartB(); this.drawChartC() }
      this._resizeObs = new ResizeObserver(() => redraw())
      ;[this.$refs.chartA, this.$refs.chartB, this.$refs.chartC].forEach(el=> el && this._resizeObs.observe(el))
      window.addEventListener('orientationchange', redraw)
      window.addEventListener('scroll', this.onScroll)
    },

    computeStats(){
      const vFirst = this.vehicles[0], vLast = this.vehicles[this.vehicles.length-1]
      this.firstVehicleYear = vFirst.Year; this.lastVehicleYear = vLast.Year
      const abs = vLast.Vehicles - vFirst.Vehicles
      this.vehicleDelta = { absolute: abs, percent: abs / vFirst.Vehicles * 100 }

      const ts = this.timeseries
      this.vehiclesPer1k.first  = ts[0].VehiclesPer1000MetroResidents
      this.vehiclesPer1k.latest = ts[ts.length-1].VehiclesPer1000MetroResidents
      const pre  = ts.filter(d=>d.Period==='Pre-COVID')
      const post = ts.filter(d=>d.Period==='Post-COVID')
      this.vehiclesPer1k.preAvg  = d3.mean(pre,  d=>d.VehiclesPer1000MetroResidents)
      this.vehiclesPer1k.postAvg = d3.mean(post, d=>d.VehiclesPer1000MetroResidents)

      const start = this.cbdPop[0]
      const peak = this.cbdPop.reduce((a,b)=> a.Population>b.Population?a:b)
      const y2021 = this.cbdPop.find(d=>d.Year===2021)
      this.cbdStart = { year:start.Year, value:start.Population }
      this.cbdPeak  = { year:peak.Year, value:peak.Population }
      this.cbdLongPct = (peak.Population - start.Population)/start.Population*100
      const dipPct = (y2021.Population - peak.Population)/peak.Population*100
      this.cbdDip = { year:2021, changePct: dipPct, sign: dipPct>=0?'+':'−' }
    },

    /* ---------- KPI sparkline ---------- */
    drawSpark(container, series){
      if(!container) return
      const w = container.clientWidth || 280, h = 92, m = {t:12,r:12,b:12,l:12}
      const svg = d3.select(container).html('').append('svg').attr('width',w).attr('height',h)
      const x = d3.scaleLinear().domain(d3.extent(series,d=>d.x)).range([m.l,w-m.r])
      const y = d3.scaleLinear().domain(d3.extent(series,d=>d.y)).nice().range([h-m.b,m.t])

      const defs = svg.append('defs')
      const g = defs.append('linearGradient').attr('id','spark-grad').attr('x1','0%').attr('x2','0%').attr('y1','0%').attr('y2','100%')
      g.append('stop').attr('offset','0%').attr('stop-color', BRAND).attr('stop-opacity', 0.34)
      g.append('stop').attr('offset','100%').attr('stop-color', BRAND).attr('stop-opacity', 0.10)

      const area = d3.area().x(d=>x(d.x)).y0(h-m.b).y1(d=>y(d.y)).curve(d3.curveMonotoneX)
      const line = d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX)

      svg.append('path').datum(series).attr('d',area).attr('fill','url(#spark-grad)')
      const path = svg.append('path').datum(series).attr('d',line).attr('fill','none').attr('stroke', BRAND).attr('stroke-width', 2.6)
      const L = path.node().getTotalLength()
      path.attr('stroke-dasharray', `${L} ${L}`).attr('stroke-dashoffset', L)
          .transition().duration(700).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)

      const last = series[series.length-1]
      svg.append('circle').attr('cx', x(last.x)).attr('cy', y(last.y)).attr('r', 3.8).attr('fill', BRAND)
    },

    /* ---------- Chart A ---------- */
    drawChartA(){
      const el=this.$refs.chartA, data=this.timeseries
      if(!el) return
      const w=el.clientWidth||920, h=400, m={top:28,right:76,bottom:52,left:68}
      const svg=d3.select(el).html('').append('svg').attr('width',w).attr('height',h)
      const plot=svg.append('g').attr('transform',`translate(${m.left},${m.top})`)
      const iw=w-m.left-m.right, ih=h-m.top-m.bottom
      const x=d3.scaleLinear().domain(d3.extent(data,d=>d.Year)).range([0,iw])
      const yL=d3.scaleLinear().domain([d3.min(data,d=>d.Vehicles)*.995,d3.max(data,d=>d.Vehicles)*1.005]).range([ih,0])
      const yR=d3.scaleLinear().domain([d3.min(data,d=>d.VehiclesPer1000MetroResidents)*.995,d3.max(data,d=>d.VehiclesPer1000MetroResidents)*1.005]).range([ih,0])

      const defs=svg.append('defs')
      const grad=defs.append('linearGradient').attr('id','veh-grad').attr('x1','0%').attr('x2','0%').attr('y1','0%').attr('y2','100%')
      grad.append('stop').attr('offset','0%').attr('stop-color', BRAND).attr('stop-opacity',0.18)
      grad.append('stop').attr('offset','100%').attr('stop-color', BRAND).attr('stop-opacity',0.04)
      const glow=defs.append('filter').attr('id','glow')
      glow.append('feGaussianBlur').attr('stdDeviation','3').attr('result','blur')
      const feMerge=glow.append('feMerge'); feMerge.append('feMergeNode').attr('in','blur'); feMerge.append('feMergeNode').attr('in','SourceGraphic')

      plot.append('g').call(d3.axisLeft(yL).ticks(5).tickSize(-iw).tickFormat(''))
           .selectAll('line').attr('stroke','var(--grid)')

      const area=d3.area().x(d=>x(d.Year)).y0(ih).y1(d=>yL(d.Vehicles)).curve(d3.curveCatmullRom.alpha(0.5))
      const line=d3.line().x(d=>x(d.Year)).y(d=>yR(d.VehiclesPer1000MetroResidents)).curve(d3.curveCatmullRom.alpha(0.5))

      const areaPath=plot.append('path').datum(data)
        .attr('fill','url(#veh-grad)')
        .attr('d',d3.area().x(d=>x(d.Year)).y0(ih).y1(()=>ih).curve(d3.curveCatmullRom.alpha(0.5)))
      areaPath.transition().duration(900).ease(d3.easeCubicOut).attr('d',area)

      const linePath=plot.append('path').datum(data).attr('fill','none').attr('stroke', BRAND).attr('stroke-width',3).attr('filter','url(#glow)').attr('d',line)
      const L=linePath.node().getTotalLength()
      linePath.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L)
        .transition().duration(900).delay(120).ease(d3.easeCubicOut).attr('stroke-dashoffset',0)

      plot.selectAll('.dot').data(data).enter().append('circle')
        .attr('class','dot').attr('cx',d=>x(d.Year)).attr('cy',d=>yR(d.VehiclesPer1000MetroResidents))
        .attr('r',4).attr('fill', BRAND)
        .style('opacity',0).transition().delay((_,i)=>200+i*70).duration(400).style('opacity',1)

      plot.append('g').attr('transform',`translate(0,${ih})`).call(d3.axisBottom(x).ticks(data.length).tickFormat(d3.format('d')))
      plot.append('g').call(d3.axisLeft(yL).ticks(5).tickFormat(d3.format(',')))
      plot.append('g').attr('transform',`translate(${iw},0)`).call(d3.axisRight(yR).ticks(5))

      const tooltip=d3.select(this.$refs.tooltip)
      plot.selectAll('.hitA').data(data).enter().append('circle')
        .attr('class','hitA').attr('cx',d=>x(d.Year)).attr('cy',d=>yR(d.VehiclesPer1000MetroResidents))
        .attr('r',16).style('fill','transparent').style('pointer-events','all')
        .on('mouseenter',(e,d)=>{ this.hoverA=d; tooltip.style('opacity',1).style('left',`${e.clientX+16}px`).style('top',`${e.clientY-12}px`).html(`<div class='tt-year'>${d.Year}</div><div><b>Vehicles</b> ${d3.format(',')(d.Vehicles)}</div><div><b>Per 1k</b> ${d.VehiclesPer1000MetroResidents.toFixed(1)}</div>`) })
        .on('mousemove',e=> tooltip.style('left',`${e.clientX+16}px`).style('top',`${e.clientY-12}px`))
        .on('mouseleave',()=>{ this.hoverA=null; tooltip.style('opacity',0) })
      d3.select(el).on('mouseleave',()=> tooltip.style('opacity',0))
    },

    /* ---------- Chart B ---------- */
    /* ---------- Chart B (rework) ---------- */
drawChartB(){
  const el=this.$refs.chartB, data=this.cbdPop
  if(!el) return
  const w=el.clientWidth||920, h=400, m={top:28,right:40,bottom:52,left:68}
  const svg=d3.select(el).html('').append('svg').attr('width',w).attr('height',h)
  const plot=svg.append('g').attr('transform',`translate(${m.left},${m.top})`)
  const iw=w-m.left-m.right, ih=h-m.top-m.bottom
  const x=d3.scaleLinear().domain(d3.extent(data,d=>d.Year)).range([0,iw])
  const y=d3.scaleLinear().domain([0,d3.max(data,d=>d.Population)]).nice().range([ih,0])

  // defs
  const defs=svg.append('defs')
  const grad=defs.append('linearGradient').attr('id','cbd-grad').attr('x1','0%').attr('x2','0%').attr('y1','0%').attr('y2','100%')
  grad.append('stop').attr('offset','0%').attr('stop-color', BRAND).attr('stop-opacity',0.18)
  grad.append('stop').attr('offset','100%').attr('stop-color', BRAND).attr('stop-opacity',0.03)
  defs.append('clipPath').attr('id','clipB').append('rect').attr('width',iw).attr('height',ih)

  // subtle grid
  plot.append('g')
    .attr('class','grid')
    .call(d3.axisLeft(y).ticks(4).tickSize(-iw).tickFormat(''))
    .selectAll('line').attr('stroke','var(--grid)')

  // content
  const content=plot.append('g').attr('clip-path','url(#clipB)')
  // COVID band
  if(this.showBand){
    const step=(x(2002)-x(2001))||(iw/(data.length-1))
    const bandX0=Math.max(0,(x(2020))-step/2), bandX1=Math.min(iw,(x(2021))+step/2)
    content.append('rect')
      .attr('x',bandX0).attr('width',Math.max(0,bandX1-bandX0))
      .attr('y',0).attr('height',ih)
      .attr('fill','var(--band)').style('opacity',0)
      .transition().duration(600).delay(200).style('opacity',1)
  }

  // COVID band
  const step=(x(2002)-x(2001))||(iw/(data.length-1))
  const bandX0=Math.max(0,(x(2020))-step/2), bandX1=Math.min(iw,(x(2021))+step/2)
  content.append('rect').attr('x',bandX0).attr('width',Math.max(0,bandX1-bandX0)).attr('y',0).attr('height',ih)
    .attr('fill','var(--band)').style('opacity',0).transition().duration(600).delay(200).style('opacity',1)

  // area + line
  const area=d3.area().x(d=>x(d.Year)).y0(ih).y1(d=>y(d.Population)).curve(d3.curveCatmullRom.alpha(0.5))
  const line=d3.line().x(d=>x(d.Year)).y(d=>y(d.Population)).curve(d3.curveCatmullRom.alpha(0.5))

  const areaPath=content.append('path').datum(data).attr('fill','url(#cbd-grad)')
    .attr('d',d3.area().x(d=>x(d.Year)).y0(ih).y1(()=>ih).curve(d3.curveCatmullRom.alpha(0.5)))
  areaPath.transition().duration(900).ease(d3.easeCubicOut).attr('d',area)

  const linePath=content.append('path').datum(data).attr('fill','none').attr('stroke', BRAND).attr('stroke-width',3).attr('d',line)
  const L=linePath.node().getTotalLength()
  linePath.attr('stroke-dasharray',`${L} ${L}`).attr('stroke-dashoffset',L)
    .transition().duration(900).delay(120).ease(d3.easeCubicOut).attr('stroke-dashoffset',0)

  // axes (fewer, nicer ticks)
  const years=data.map(d=>d.Year)
  const xTicks=years.filter((_,i)=> i%2===0) // every 2 years
  plot.append('g').attr('class','axis x').attr('transform',`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickValues(xTicks).tickFormat(d3.format('d')))
  plot.append('g').attr('class','axis y')
    .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('~s'))) // 50k, 100k…

  // peak callout that never collides
  const peak=data.reduce((a,b)=> a.Population>b.Population?a:b)
  const px=x(peak.Year), py=y(peak.Population)
  content.append('circle').attr('cx',px).attr('cy',py).attr('r',4).attr('fill', BRAND)

  // smart label position (to the right, clamped)
  const labelGroup=svg.append('g').attr('class','callout')
  const labelPad=6, maxW=170
  const labelText = `Peak ${peak.Year}: ${d3.format(',')(peak.Population)}`
  // initial guess
  let lx = m.left + Math.min(Math.max(px+10, 8), iw - maxW) // clamp inside chart width
  let ly = m.top  + Math.max(py - 10, 12)

  // leader line
  labelGroup.append('line')
    .attr('x1', m.left+px).attr('y1', m.top+py)
    .attr('x2', lx).attr('y2', ly-8)
    .attr('stroke','var(--ink)').attr('opacity',0.6).attr('stroke-width',1.2)

  // text with background pill
  const t = labelGroup.append('text').attr('x',lx).attr('y',ly).attr('class','anno').text(labelText)
  const bb = t.node().getBBox()
  labelGroup.insert('rect',':first-child')
    .attr('x', bb.x - labelPad).attr('y', bb.y - labelPad)
    .attr('width', bb.width + labelPad*2).attr('height', bb.height + labelPad*2)
    .attr('rx', 6).attr('ry', 6).attr('fill','#fff').attr('stroke','rgba(45,90,39,.22)')

  // tooltip
  const tooltip=d3.select(this.$refs.tooltip)
  content.selectAll('.hitB').data(data).enter().append('circle')
    .attr('class','hitB').attr('cx',d => x(d.Year)).attr('cy', d => y(d.Population)).attr('r',12)
    .style('fill','transparent').style('pointer-events','all')
    .on('mouseenter',(e,d)=>{ this.hoverB=d; tooltip.style('opacity',1).style('left',`${e.clientX+16}px`).style('top',`${e.clientY-12}px`).html(`<div class='tt-year'>${d.Year}</div><div><b>Population</b> ${d3.format(',')(d.Population)}</div>`) })
    .on('mousemove',e=> tooltip.style('left',`${e.clientX+16}px`).style('top',`${e.clientY-12}px`))
    .on('mouseleave',()=>{ this.hoverB=null; tooltip.style('opacity',0) })
}
,

    /* ---------- Chart C ---------- */
    drawChartC(){
      const el=this.$refs.chartC
      if(!el) return
      const pre=this.vehiclesPer1k.preAvg, post=this.vehiclesPer1k.postAvg
      const data=[{label:'Pre‑COVID (2016–2019)', value:pre},{label:'Post‑COVID (2020–2021)', value:post}]
      const w=el.clientWidth||680, h=240, m={top:28,right:24,bottom:48,left:24}
      const svg=d3.select(el).html('').append('svg').attr('width',w).attr('height',h)
      const plot=svg.append('g').attr('transform',`translate(${m.left},${m.top})`)
      const iw=w-m.left-m.right, ih=h-m.top-m.bottom
      const x=d3.scalePoint().domain(data.map(d=>d.label)).range([0,iw]).padding(0.6)
      const y=d3.scaleLinear().domain([d3.min(data,d=>d.value)*0.98, d3.max(data,d=>d.value)*1.02]).range([ih,0])

      plot.append('line')
        .attr('x1',x(data[0].label)).attr('y1',y(data[0].value))
        .attr('x2',x(data[1].label)).attr('y2',y(data[1].value))
        .attr('stroke', BRAND).attr('stroke-width',5).attr('opacity',0.9)

      plot.selectAll('circle').data(data).enter().append('circle')
        .attr('cx',d=>x(d.label)).attr('cy',d=>y(d.value))
        .attr('r',7).attr('fill', BRAND)

      plot.selectAll('.slabel').data(data).enter().append('text')
        .attr('class','slabel').attr('x',d=>x(d.label)).attr('y',d=>y(d.value)-12)
        .attr('text-anchor','middle').text(d=>d.value.toFixed(1))

      plot.selectAll('.xcat').data(data).enter().append('text')
        .attr('class','xcat').attr('x',d=>x(d.label)).attr('y',ih+28)
        .attr('text-anchor','middle').text(d=>d.label)

      const delta=(post-pre)
      svg.append('text').attr('x',m.left+iw/2).attr('y',m.top+16)
        .attr('text-anchor','middle').attr('class','anno')
        .text(`${delta>=0?'+':''}${delta.toFixed(1)} per 1,000 → Higher post‑COVID`)
    }
  }
}

</script>

<style scoped>
/* Light theme with MelMove green */
:global(:root){
  --bg:#ffffff; --card:#ffffff; --ink:#26312a; --muted:#6b7a71;
  --grid:rgba(45,90,39,.08); --accent:#2d5a27; --band:rgba(45,90,39,.10)
}

.insights-page{
  padding:32px clamp(16px,4vw,48px) 56px;
  background:
    radial-gradient(900px 420px at -10% -10%, rgba(45,90,39,.05), transparent),
    radial-gradient(900px 420px at 110% 0%, rgba(45,90,39,.04), transparent),
    var(--bg);
  color:var(--ink)
}

/* Scroll progress */
.scrollbar{ position:fixed; top:0; left:0; width:100%; height:3px; z-index:60; background:transparent }
.scrollbar .progress{ height:100%; background: linear-gradient(90deg, rgba(45,90,39,.6), rgba(45,90,39,1)); box-shadow: 0 0 12px rgba(45,90,39,.35) inset }

.hero{ display:grid; grid-template-columns:1fr auto; gap:16px; align-items:end; margin:8px 0 20px }
.hero h1{ font-size:clamp(20px,3.2vw,34px); margin:0 0 6px; color:var(--ink) }
.subtitle{ color:var(--muted); max-width:72ch; margin:0 }
.hero-badges{ display:flex; gap:8px; align-items:center; justify-content:flex-end }
.badge{ background:linear-gradient(180deg, rgba(45,90,39,.06), rgba(45,90,39,.02)); color:var(--ink); border:1px solid rgba(45,90,39,.22); padding:6px 10px; border-radius:999px; font-size:12px; letter-spacing:.3px }
.badge.alt{ background:rgba(45,90,39,.08); border-color:rgba(45,90,39,.25) }

.kpis{ display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:16px; margin:16px 0 28px }
.kpi-card {
  background: linear-gradient(
    180deg,
    rgba(45, 90, 39, 0.06) 0%,
    rgba(45, 90, 39, 0.02) 100%
  );
  border: 1px solid rgba(45, 90, 39, 0.12);
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  padding: 16px 16px 12px;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.kpi-card:hover {
  box-shadow:
    0 26px 50px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}
.kpi-label{ color:var(--muted); font-size:12px; letter-spacing:.3px }
.kpi-value{ font-size:clamp(22px,4.2vw,32px); font-weight:800; margin:2px 0 4px; color:var(--ink) }
.kpi-sub{ color:var(--muted); font-size:12px }
.spark{ height:92px; margin-top:10px }

.row{ display:grid; grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr); gap:28px; align-items:stretch; margin-bottom:28px }
.row.inview .chart-card, .row.inview .prose-block{ box-shadow: 0 34px 64px rgba(45,90,39,.12), 0 0 0 1px rgba(45,90,39,.10) inset; transition: box-shadow .3s ease }

.chart-card{ background:#fff; border:1px solid rgba(45,90,39,.12); border-radius:20px; box-shadow: 0 28px 60px rgba(0,0,0,.08); padding:14px 14px 10px }
.chart-head h2{ margin:2px 0 4px; font-size:20px; letter-spacing:.2px; color:var(--ink) }
.chart-head p{ margin:0; color:var(--muted); font-size:13px }
.chart{ width:100%; min-height:340px; overflow:visible; border-radius:14px }
.chart.narrow{ min-height:220px }
.chart-foot{ display:flex; justify-content:space-between; align-items:center; margin-top:4px }
.source{ color:var(--muted); font-size:12px }

/* Prose panels */
.prose-block{
  padding: 22px 22px 18px;
  background: linear-gradient(180deg, rgba(45,90,39,.06), rgba(45,90,39,.03));
  border: 1px solid rgba(45,90,39,.12);
  border-radius: 18px;
  box-shadow: 0 18px 44px rgba(0,0,0,.06);
  min-height: 340px;
  display:flex; flex-direction:column; justify-content:flex-start;
}
.display{ font-size: clamp(28px, 4.4vw, 56px); line-height: 1.05; margin: 0 0 12px; letter-spacing: .2px; color:var(--ink) }
.lede{ font-size: clamp(18px, 1.8vw, 22px); color: var(--ink); opacity: .95; margin: 0 0 16px; max-width: 70ch }
.note{ color: var(--muted); margin-top: 6px }
.pill{ display:inline-block; padding:2px 8px; border-radius:999px; border:1px solid rgba(45,90,39,.25); margin-right:8px; font-size:12px; color:var(--ink); background:rgba(45,90,39,.06) }

.fact-row{ display:flex; flex-wrap:wrap; gap:12px 18px; margin-top:8px; color:var(--ink) }
.fact{ display:flex; align-items:center; gap:8px; font-weight:600 }
.fact .dot{ width:10px; height:10px; border-radius:999px; background:var(--accent); box-shadow:0 0 0 3px rgba(45,90,39,.08) }

.full{ grid-column:1 / -1; margin-top:4px }

@media (max-width: 980px){
  .kpis{ grid-template-columns:1fr }
  .row{ grid-template-columns:1fr }
  .chart{ min-height:300px }
}

path, .grid line{ pointer-events:none }
.legend{ fill:var(--muted); font-size:12px }
.anno{ fill:var(--ink); font-size:12px; opacity:.9 }
.tooltip{ position:fixed; pointer-events:none; z-index:40; background:#ffffff; color:var(--ink); border:1px solid rgba(45,90,39,.18); padding:8px 10px; border-radius:10px; font-size:12px; box-shadow:0 18px 40px rgba(0,0,0,.12) }
.tt-year{ font-weight:700; margin-bottom:2px }

.loading{ color:var(--muted); padding:32px; text-align:center }

.axis path, .axis line{
  stroke: rgba(45,90,39,.25);
  shape-rendering: geometricPrecision;
}
.axis .tick text{
  fill: var(--muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.grid line{
  stroke-dasharray: 3 3;
}

.callout text.anno{
  fill: var(--ink);
  font-size: 12px;
}
.toolbar{
  display:flex; justify-content:space-between; align-items:center;
  gap:16px; margin:8px 0 18px;
}

.btn-group{ display:flex; gap:8px; flex-wrap:wrap }
.btn-right{ display:flex; gap:8px; flex-wrap:wrap }

.btn{
  appearance:none; border:1px solid rgba(45,90,39,.22);
  background:linear-gradient(180deg, rgba(45,90,39,.06), rgba(45,90,39,.02));
  color:var(--ink); padding:8px 12px; border-radius:999px;
  font-size:13px; letter-spacing:.2px; cursor:pointer;
  transition:.2s ease; box-shadow:0 1px 0 rgba(255,255,255,.5) inset;
}
.btn:hover{ transform:translateY(-1px); box-shadow:0 6px 14px rgba(0,0,0,.08) }
.btn.active{ background:var(--accent); color:#fff; border-color:var(--accent) }
.btn.ghost{ background:#fff; border-color:rgba(45,90,39,.18) }

:global(:root){ --anchor-pad: 96px }         /* tweak as needed */
@media (max-width: 980px){ :root{ --anchor-pad: 72px }}

/* Make sections respect the offset when using scrollIntoView */
.chart, .prose-block, .chart-card.full {
  scroll-margin-top: var(--anchor-pad);
}
:global(:root){
  --anchor-pad: 96px;                 /* tweak to taste (toolbar+breathing room) */
}

/* When the browser scrolls to the top, keep content below this padding */
:global(html){
  scroll-padding-top: var(--anchor-pad);
}

/* When using scrollIntoView OR manual hash jumps, leave space above targets */
.row,
.chart-card.full,
.prose-block .display,      /* big section headings */
.chart                      /* chart containers */
{
  scroll-margin-top: var(--anchor-pad);
}
</style>
