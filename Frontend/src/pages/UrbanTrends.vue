<template>
  <div class="urban-trends">
    <div class="container">
      <h1 class="page-title">MELBOURNE CITY VEHICLE AND POPULATION TREND ANALYSIS (2010-2021)</h1>
      
      <div class="charts-container">
        <div class="chart-card">
          <h2 class="chart-title">Vehicle Ownership Trends in Melbourne (2010-2021)</h2>
          <div class="chart-container">
            <canvas ref="vehicleChart" width="600" height="300"></canvas>
          </div>
          <p class="chart-description">
            Vehicle ownership in Melbourne has grown steadily over the past decade, placing continued pressure on roads and urban infrastructure.
          </p>
          <p class="data-source">Data Source: ABS Motor Vehicle Census dataset</p>
        </div>

        <div class="chart-card">
          <h2 class="chart-title">Melbourne CBD Population Trends (2001-2021)</h2>
          <div class="chart-container">
            <canvas ref="populationChart" width="600" height="300"></canvas>
          </div>
          <p class="chart-description">
            The population of Melbourne's CBD has doubled over the past 20 years, exacerbating peak-hour traffic congestion.
          </p>
          <p class="data-source">Data Source: ABS Regional Population Dataset</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UrbanTrends',
  mounted() {
    this.initCharts()
  },
  methods: {
    initCharts() {
      this.createVehicleChart()
      this.createPopulationChart()
    },
    createVehicleChart() {
      const canvas = this.$refs.vehicleChart
      const ctx = canvas.getContext('2d')
      
      // 车辆注册数据
      const data = {
        labels: ['2010', '2012', '2014', '2016', '2018', '2020'],
        datasets: [{
          label: 'Vehicle Registrations',
          data: [1800000, 2008800, 2200000, 2408800, 2480000, 2550000],
          borderColor: '#ff8c00',
          backgroundColor: 'rgba(255, 140, 0, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }]
      }

      // 绘制图表
      this.drawLineChart(ctx, data, 'Number of Vehicle Registrations')
    },
    createPopulationChart() {
      const canvas = this.$refs.populationChart
      const ctx = canvas.getContext('2d')
      
      // 人口数据
      const data = {
        labels: ['2001', '2005', '2010', '2015', '2020'],
        datasets: [{
          label: 'Population',
          data: [60000, 80000, 110000, 140000, 170000],
          borderColor: '#ff8c00',
          backgroundColor: 'rgba(255, 140, 0, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }]
      }

      // 绘制图表
      this.drawLineChart(ctx, data, 'Population (people)')
    },
    drawLineChart(ctx, data, yAxisLabel) {
      const canvas = ctx.canvas
      const width = canvas.width
      const height = canvas.height
      
      // 清除画布
      ctx.clearRect(0, 0, width, height)
      
      // 设置样式
      ctx.font = '12px Arial'
      ctx.fillStyle = '#333'
      
      // 绘制坐标轴
      ctx.strokeStyle = '#ccc'
      ctx.lineWidth = 1
      
      // Y轴
      ctx.beginPath()
      ctx.moveTo(60, 30)
      ctx.lineTo(60, height - 60)
      ctx.stroke()
      
      // X轴
      ctx.beginPath()
      ctx.moveTo(60, height - 60)
      ctx.lineTo(width - 30, height - 60)
      ctx.stroke()
      
      // 绘制数据线
      const maxValue = Math.max(...data.datasets[0].data)
      const minValue = Math.min(...data.datasets[0].data)
      const range = maxValue - minValue
      
      ctx.strokeStyle = data.datasets[0].borderColor
      ctx.lineWidth = 3
      ctx.beginPath()
      
      data.labels.forEach((label, index) => {
        const x = 60 + (index * (width - 90) / (data.labels.length - 1))
        const y = height - 60 - ((data.datasets[0].data[index] - minValue) / range) * (height - 90)
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        // 绘制数据点
        ctx.fillStyle = data.datasets[0].borderColor
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      })
      
      ctx.stroke()
      
      // 绘制标签
      ctx.fillStyle = '#333'
      ctx.textAlign = 'center'
      
      data.labels.forEach((label, index) => {
        const x = 60 + (index * (width - 90) / (data.labels.length - 1))
        ctx.fillText(label, x, height - 40)
      })
      
      // Y轴标签
      ctx.textAlign = 'right'
      const ySteps = 5
      for (let i = 0; i <= ySteps; i++) {
        const y = height - 60 - (i * (height - 90) / ySteps)
        const value = minValue + (i * range / ySteps)
        ctx.fillText(Math.round(value).toLocaleString(), 55, y + 4)
      }
      
      // 绘制Y轴标题
      ctx.save()
      ctx.translate(30, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText(yAxisLabel, 0, 0)
      ctx.restore()
    }
  }
}
</script>

<style scoped>
.urban-trends {
  min-height: calc(100vh - 80px);
  background-color: #ffffff;
  padding: 40px 0; /* 增加顶部间距 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.3;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.chart-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d5a27;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.chart-description {
  font-size: 1rem;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 15px;
}

.data-source {
  font-size: 0.9rem;
  color: #666666;
  font-style: italic;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .chart-card {
    padding: 20px;
  }
  
  .chart-title {
    font-size: 1.2rem;
  }
  
  .chart-container {
    padding: 10px;
  }
}
</style>
