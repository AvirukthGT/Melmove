<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Smarter Parking<br>
          For Smoother<br>
          Commutes.
        </h1>
        <p class="hero-description">
          MelMove is a smart city dashboard that helps commuters plan better by visualizing real-time and historical parking data.
        </p>
        <div class="cta-buttons">
          <router-link to="/live" class="cta-button primary">
            <span class="arrow">→</span>
            EXPLORE LIVE PARKING
          </router-link>
          <router-link to="/urban-trends" class="cta-button secondary">
            START WITH URBAN TRENDS
            <span class="arrow">←</span>
          </router-link>
        </div>
      </div>

      <div class="hero-illustration">
        <div class="car-container">
          <!-- 新的车形组件 -->
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
            </div>
          </div>

          <!-- 你的数据条保留 -->
          <!-- Compact ticker under the car -->
          <div class="ticker" aria-label="Parking tips">
            <div class="ticker__mask">
              <div class="ticker__track">
                <span class="ticker__item">🚗 Park faster</span>
                <span class="ticker__dot">•</span>
                <span class="ticker__item">⏱ Save time</span>
                <span class="ticker__dot">•</span>
                <span class="ticker__item">🧭 Find spots instantly</span>
                <span class="ticker__dot">•</span>
                <span class="ticker__item">🧠 Smart parking made easy</span>
                <span class="ticker__dot">•</span>
                <span class="ticker__item">😊 Skip the stress</span>

                <!-- duplicate once for seamless loop -->
                <span class="ticker__item" aria-hidden="true">🚗 Park faster</span>
                <span class="ticker__dot" aria-hidden="true">•</span>
                <span class="ticker__item" aria-hidden="true">⏱ Save time</span>
                <span class="ticker__dot" aria-hidden="true">•</span>
                <span class="ticker__item" aria-hidden="true">🧭 Find spots instantly</span>
                <span class="ticker__dot" aria-hidden="true">•</span>
                <span class="ticker__item" aria-hidden="true">🧠 Smart parking made easy</span>
                <span class="ticker__dot" aria-hidden="true">•</span>
                <span class="ticker__item" aria-hidden="true">😊 Skip the stress</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>

/* Compact pill ticker */
.ticker {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
.ticker__mask {
  position: relative;
  max-width: 360px;            /* 控制宽度，避免占太多版心 */
  padding: 12px 18px;
  border-radius: 999px;        /* 胶囊形 */
  background: #4a7c59;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.08);
}
.ticker__mask::before,
.ticker__mask::after {
  content: "";
  position: absolute;
  top: 0; width: 40px; height: 100%;
  pointer-events: none;
  /* 左右渐隐遮罩 */
  background: linear-gradient(to right, #4a7c59, rgba(74,124,89,0));
}
.ticker__mask::after {
  right: 0;
  transform: scaleX(-1);
}
.ticker__track {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  will-change: transform;
  animation: ticker-move 28s linear infinite; /* 慢一点更高雅 */
}
.ticker__item {
  font-size: 16px;
  font-weight: 600;
  opacity: .95;
}
.ticker__dot {
  opacity: .6;
}
@keyframes ticker-move {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 尊重系统“减少动态”设置 */
@media (prefers-reduced-motion: reduce) {
  .ticker__track { animation: none; }
}

/* 深色模式（可选） */
@media (prefers-color-scheme: dark) {
  .ticker__mask {
    background: #355d41;
  }
}


.home {
  min-height: calc(100vh - 80px);
  background-color: #ffffff;
  padding-top: 20px;
}

.hero-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 80px;
}

.hero-content { flex: 1; max-width: 500px; }
.hero-title { font-size: 3.5rem; font-weight: bold; color: #2d5a27; line-height: 1.1; margin-bottom: 30px; }
.hero-description { font-size: 1.2rem; color: #22228A; line-height: 1.6; margin-bottom: 40px; }

.cta-buttons { display: flex; flex-direction: column; gap: 20px; }
.cta-button {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;
  font-size: 14px; text-transform: uppercase; letter-spacing: .5px; transition: .3s;
  border: 2px solid transparent;
}
.cta-button.primary { background:#4a7c59; color:#fff; border-color:#4a7c59; }
.cta-button.primary:hover { background:#3d6b4a; transform: translateY(-2px); }
.cta-button.secondary { background:#fff; color:#2d5a27; border-color:#4a7c59; }
.cta-button.secondary:hover { background:#f8f9fa; transform: translateY(-2px); }
.arrow { font-size: 16px; font-weight: bold; }

.hero-illustration { flex: 1; display: flex; justify-content: center; align-items: center; }
.car-container {
  position: relative; border: 2px dashed #4a7c59; border-radius: 12px;
  padding: 20px; background: #f8f9fa;
}

/* ===== Sleek Car ===== */
.car { position: relative; width: 240px; height: 120px; margin-bottom: 20px; }
.car--sleek { animation: car-bob 3s ease-in-out infinite; }
@keyframes car-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }

/* 车身 */
.car-body {
  position: absolute; left: 20px; top: 52px; width: 200px; height: 56px;
  background: linear-gradient(#2c2c2c, #202020);
  border-radius: 18px 26px 16px 16px;
  box-shadow: inset 0 2px 0 rgba(255,255,255,.06), 0 6px 12px rgba(0,0,0,.15);
}

/* 车顶 */
.roof {
  position: absolute; left: 40px; top: -34px; width: 120px; height: 52px;
  background: linear-gradient(#2f2f2f, #222);
  border-radius: 70px 70px 8px 8px;
  box-shadow: 0 4px 0 rgba(0,0,0,.15);
}

/* 车窗 */
.window {
  position: absolute; top: -20px; width: 56px; height: 28px;
  background: linear-gradient(180deg, rgba(170,210,255,.9), rgba(120,170,220,.9));
  border-radius: 10px 10px 6px 6px;
  box-shadow: inset 0 0 10px rgba(255,255,255,.25);
}
.window--rear  { left: 28px; }
.window--front { right: 28px; }

/* 灯 & 格栅 */
.headlight {
  position: absolute; right: -6px; top: 26px; width: 12px; height: 10px;
  background: #ffd166; border-radius: 4px; box-shadow: 0 0 12px #ffd166aa;
}
.taillight {
  position: absolute; left: -6px; top: 26px; width: 10px; height: 10px;
  background: #ff4d4f; border-radius: 3px; box-shadow: 0 0 10px #ff4d4faa;
}
.grille {
  position: absolute; right: 16px; bottom: 10px; width: 36px; height: 6px; border-radius: 3px;
  background: repeating-linear-gradient(to right, #1a1a1a, #1a1a1a 6px, #303030 6px, #303030 10px);
  opacity: .9;
}

/* 车轮 */
.wheel {
  position: absolute; bottom: 8px; width: 36px; height: 36px; background: #1f1f1f;
  border: 5px solid #fff; border-radius: 50%;
  box-shadow: inset 0 0 0 3px #111, 0 4px 8px rgba(0,0,0,.25);
}
.wheel--rear  { left: 42px; }
.wheel--front { right: 42px; }
.wheel .rim {
  position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; background: #999;
  border-radius: 50%; transform: translate(-50%, -50%); box-shadow: inset 0 0 0 2px #666;
}

/* 车影 */
.car-shadow {
  position: absolute; left: 30px; right: 30px; bottom: 0; height: 10px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,.35), rgba(0,0,0,0) 70%);
  filter: blur(2px);
}

/* 速度线 */
.motion-lines { position: absolute; top: 50%; right: -28px; display: flex; flex-direction: column; gap: 6px; }
.motion-lines .line { width: 22px; height: 3px; background: #2d2d2d; border-radius: 2px; opacity: .9; }

/* 数据条保持原样 */
.data-box {
  display: flex; align-items: center; justify-content: space-between;
  background-color: #4a7c59; color: #fff; padding: 15px 20px; border-radius: 6px; font-weight: 700;
}
.data-item { font-size: 18px; }
.chart-icon { font-size: 20px; }

/* 响应式 */
@media (max-width: 768px) {
  .hero-section { flex-direction: column; text-align: center; gap: 40px; padding: 0 20px; }
  .hero-title { font-size: 2.5rem; }
  .hero-description { font-size: 1.1rem; }
  .car-container { width: 100%; max-width: 300px; }
}
</style>
