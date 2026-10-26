<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'Sign in · PASTI CMS',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const route = useRoute()
const { login } = useCmsSession()

const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const fieldErrors = reactive<{ email?: string; password?: string }>({})
const lockedFor = ref(0)
let lockTimer: ReturnType<typeof setInterval> | null = null

const locked = computed(() => lockedFor.value > 0)

function validate(): boolean {
  fieldErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? undefined : 'Enter a valid email address.'
  fieldErrors.password = password.value ? undefined : 'Enter your password.'
  return !fieldErrors.email && !fieldErrors.password
}

function startLockCountdown(seconds: number) {
  lockedFor.value = seconds
  if (lockTimer) clearInterval(lockTimer)
  lockTimer = setInterval(() => {
    lockedFor.value = Math.max(0, lockedFor.value - 1)
    if (lockedFor.value === 0 && lockTimer) {
      clearInterval(lockTimer)
      lockTimer = null
      errorMsg.value = ''
    }
  }, 1000)
}

onBeforeUnmount(() => lockTimer && clearInterval(lockTimer))

async function onSubmit() {
  errorMsg.value = ''
  if (locked.value || !validate()) return
  submitting.value = true
  try {
    await login(email.value.trim(), password.value)
    password.value = ''
    await navigateTo(safeAdminNext(route.query.next), { replace: true })
  } catch (err) {
    password.value = ''
    const e = err as { statusCode?: number; data?: { data?: { retryAfter?: number } } }
    if (e.statusCode === 429) {
      const retryAfter = e.data?.data?.retryAfter ?? 900
      startLockCountdown(retryAfter)
      errorMsg.value = 'Too many attempts. Sign-in is paused for this account on this network.'
    } else if (e.statusCode === 401 || e.statusCode === 400) {
      errorMsg.value = 'Invalid email or password.'
    } else {
      errorMsg.value = 'Could not sign in right now. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

const countdown = computed(() => {
  const m = Math.floor(lockedFor.value / 60)
  const s = String(lockedFor.value % 60).padStart(2, '0')
  return `${m}:${s}`
})
</script>

<template>
  <main class="admin-login flex min-h-screen items-center justify-center bg-surfaceNeutral px-4 py-10 text-slateNavy">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex items-center gap-2">
        <img src="/images/pasti-logo.webp" alt="PASTI" width="1205" height="527" class="h-6 w-auto">
        <span class="rounded bg-navy-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">CMS</span>
      </div>

      <!-- method="post": a submit before hydration must never put the password in the URL -->
      <form class="rounded-lg border border-navy-100 bg-white p-6 shadow-sm" method="post" novalidate @submit.prevent="onSubmit">
        <h1 class="text-xl font-bold">Sign in</h1>
        <p class="mt-1 text-sm text-navy-500">Internal access only.</p>

        <div
          v-if="errorMsg"
          role="alert"
          class="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {{ errorMsg }}
          <span v-if="locked" class="mt-1 block font-semibold tabular-nums">Try again in {{ countdown }}</span>
        </div>

        <label for="login-email" class="mt-5 block text-sm font-medium">Email</label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          name="email"
          autocomplete="username"
          inputmode="email"
          maxlength="254"
          required
          :aria-invalid="!!fieldErrors.email"
          :aria-describedby="fieldErrors.email ? 'login-email-error' : undefined"
          class="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          :class="fieldErrors.email ? 'border-red-400' : 'border-navy-200'"
        >
        <p v-if="fieldErrors.email" id="login-email-error" class="mt-1 text-xs text-red-700">{{ fieldErrors.email }}</p>

        <label for="login-password" class="mt-4 block text-sm font-medium">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          maxlength="256"
          required
          :aria-invalid="!!fieldErrors.password"
          :aria-describedby="fieldErrors.password ? 'login-password-error' : undefined"
          class="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
          :class="fieldErrors.password ? 'border-red-400' : 'border-navy-200'"
        >
        <p v-if="fieldErrors.password" id="login-password-error" class="mt-1 text-xs text-red-700">{{ fieldErrors.password }}</p>

        <button
          type="submit"
          class="mt-6 w-full rounded-md bg-slateNavy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting || locked"
          :aria-busy="submitting"
        >
          {{ submitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style>
.admin-login :where(a, button, input):focus-visible {
  outline: 2px solid #033c59;
  outline-offset: 2px;
}
</style>
