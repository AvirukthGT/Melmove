<template>
  <div v-if="!unlocked" class="gate">
    <div class="card">
      <h2>Enter Password</h2>
      <input
        v-model="input"
        type="password"
        @keyup.enter="check"
        placeholder="Password"
        autofocus
      />
      <button @click="check">Unlock</button>
      <p v-if="error" class="err">Incorrect password</p>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PasswordGate',
  data() {
    return { unlocked: false, input: '', error: false }
  },
  mounted() {
    if (localStorage.getItem('mm_site_unlocked') === 'true') this.unlocked = true
  },
  methods: {
    check() {
      const PASS = import.meta.env.VITE_SITE_PASS || 'secret123'
      if (this.input === PASS) {
        this.unlocked = true
        localStorage.setItem('mm_site_unlocked', 'true')
      } else {
        this.error = true
      }
    }
  }
}
</script>

<style>
.gate{
  position: fixed; inset: 0; display: grid; place-items: center;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(2px);
  z-index: 9999;
}
.card{
  width: min(92vw, 380px); padding: 22px; border-radius: 14px;
  background: #fff; border: 1px solid #e7e7e7; box-shadow: 0 12px 36px rgba(0,0,0,.08);
  display: grid; gap: 10px; text-align: center;
}
.card input{ padding: 10px 12px; border:1px solid #d5d5d5; border-radius: 10px; font-size: 14px }
.card button{
  padding: 10px 12px; border-radius: 999px; border: 0;
  background: #2d5a27; color: #fff; cursor: pointer;
}
.err{ color: #c62828; font-size: 12px; margin-top: 4px }
</style>
