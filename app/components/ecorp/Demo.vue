<script setup lang="ts">
// REQUEST DEMO — CONFIRMED headline + copy. Form with validation, loading,
// success and error states.
//
// TEMPORARY SUBMIT HANDLER: there is no form backend yet (destination is
// pending owner confirmation). `temporarySubmit` hands the request to the
// site's existing WhatsApp contact. "Success" therefore means "prepared in
// WhatsApp — send it there", never "received by PASTI"; if the WhatsApp
// window cannot be opened (e.g. a pop-up blocker), the error state offers a
// direct link instead. Replace `temporarySubmit` with the real endpoint.
const { demo, problems } = useEcorporate()
const { link: whatsappLink, phone } = useWhatsapp()

type Field = 'name' | 'company' | 'email' | 'phone' | 'role' | 'challenge' | 'message'
const form = reactive<Record<Field, string>>({ name: '', company: '', email: '', phone: '', role: '', challenge: '', message: '' })
const errors = reactive<Partial<Record<Field, string>>>({})
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const fallbackUrl = ref('')
const formRef = ref<HTMLFormElement | null>(null)

const challenges = [...problems.map((p) => p.problem), 'Other']

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Please enter your name.'
  errors.company = form.company.trim() ? '' : 'Please enter your company.'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Please enter a valid work email.'
  errors.phone = !form.phone.trim() || /^[+\d][\d\s-]{6,}$/.test(form.phone.trim()) ? '' : 'Please enter a valid phone or WhatsApp number.'
  const first = (['name', 'company', 'email', 'phone'] as Field[]).find((f) => errors[f])
  if (first) nextTick(() => formRef.value?.querySelector<HTMLElement>(`#ed-${first}`)?.focus())
  return !first
}

const buildMessage = () =>
  [
    'Halo PASTI, saya ingin request demo e-CORPORATE.',
    `Nama: ${form.name}`,
    `Perusahaan: ${form.company}`,
    `Email: ${form.email}`,
    form.phone && `Telepon/WhatsApp: ${form.phone}`,
    form.role && `Role: ${form.role}`,
    form.challenge && `Business challenge: ${form.challenge}`,
    form.message && `Pesan: ${form.message}`
  ].filter(Boolean).join('\n')

// TEMPORARY — see header. Returns whether the hand-off window opened.
const temporarySubmit = (text: string): boolean => {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  fallbackUrl.value = url
  const w = window.open(url, '_blank')
  if (!w) return false
  w.opener = null
  return true
}

const submit = () => {
  if (status.value === 'loading') return
  if (!validate()) return
  status.value = 'loading'
  // window.open must run inside the click/submit gesture — call it first.
  const ok = temporarySubmit(buildMessage())
  requestAnimationFrame(() => (status.value = ok ? 'success' : 'error'))
}

const reset = () => {
  status.value = 'idle'
  ;(Object.keys(form) as Field[]).forEach((k) => (form[k] = ''))
}

const input = 'mt-2 block h-12 w-full border-b bg-transparent font-display text-[17px] font-semibold text-slateNavy outline-none transition-colors duration-300 focus:border-slateNavy focus-visible:border-b-2'
const borderOf = (f: Field) => (errors[f] ? 'border-[#b4361f]' : 'border-[color:rgba(3,60,89,0.22)]')
</script>

<template>
  <section id="demo" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 15%; --lift-y: 85%">
    <BaseGridLines tone="light" edge="top" />
    <EcorpMarks label="12 / 12 · Request a demo" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Request demo" meta="12 / 12" />

      <div class="mt-12 grid gap-12 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-5">
          <EcorpHeading eyebrow="Request a demo" :before="demo.headline.before" :mark="demo.headline.mark" :after="demo.headline.after" :dot="false" :lede="demo.body" />
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="group mt-8 inline-flex min-h-11 items-center gap-2 border-b-2 border-pastiYellow-500 font-display text-[15px] font-bold text-slateNavy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500"
          >
            Talk to PASTI
            <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </a>
        </div>

        <div class="desktop:col-span-7">
          <!-- Success -->
          <div v-if="status === 'success'" role="status" class="border border-[color:rgba(3,60,89,0.14)] border-t-2 border-t-pastiYellow-500 bg-pureWhite p-8 tablet:p-10">
            <span class="grid h-10 w-10 place-items-center bg-pastiYellow-500 text-slateNavy" aria-hidden="true"><svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 8.5l3 3 7-7" /></svg></span>
            <h3 class="mt-6 font-display text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-slateNavy">Your request is ready in WhatsApp.</h3>
            <p class="mt-3 max-w-[30rem] text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">Send the prepared message in WhatsApp to reach the PASTI team. If the window didn’t appear, <a :href="fallbackUrl" target="_blank" rel="noopener noreferrer" class="font-bold text-slateNavy underline decoration-pastiYellow-500 decoration-2 underline-offset-4">open it here</a>.</p>
            <button type="button" class="mt-8 inline-flex min-h-11 items-center font-display text-[14px] font-bold text-slateNavy underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500" @click="reset">Start a new request</button>
          </div>

          <!-- Form -->
          <form v-else ref="formRef" class="border border-[color:rgba(3,60,89,0.14)] bg-pureWhite p-6 tablet:p-10" novalidate :aria-busy="status === 'loading'" @submit.prevent="submit">
            <div class="grid gap-x-8 gap-y-7 tablet:grid-cols-2">
              <div v-for="f in ([
                { k: 'name', label: 'Name', type: 'text', auto: 'name', req: true },
                { k: 'company', label: 'Company', type: 'text', auto: 'organization', req: true },
                { k: 'email', label: 'Work email', type: 'email', auto: 'email', req: true },
                { k: 'phone', label: 'Phone / WhatsApp', type: 'tel', auto: 'tel', req: false },
                { k: 'role', label: 'Role', type: 'text', auto: 'organization-title', req: false }
              ] as const)" :key="f.k">
                <label :for="`ed-${f.k}`" class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.65)]">{{ f.label }}<span v-if="f.req" aria-hidden="true" class="text-[#b4361f]"> *</span><span v-if="!f.req" class="normal-case tracking-normal text-[color:rgba(3,60,89,0.45)]"> (optional)</span></label>
                <input
                  :id="`ed-${f.k}`"
                  v-model="form[f.k]"
                  :type="f.type"
                  :autocomplete="f.auto"
                  :required="f.req"
                  :aria-invalid="!!errors[f.k]"
                  :aria-describedby="errors[f.k] ? `ed-${f.k}-err` : undefined"
                  :class="[input, borderOf(f.k)]"
                >
                <p v-if="errors[f.k]" :id="`ed-${f.k}-err`" class="mt-1.5 text-[13px] font-medium text-[#b4361f]">{{ errors[f.k] }}</p>
              </div>
              <div>
                <label for="ed-challenge" class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.65)]">Business challenge<span class="normal-case tracking-normal text-[color:rgba(3,60,89,0.45)]"> (optional)</span></label>
                <select id="ed-challenge" v-model="form.challenge" :class="[input, borderOf('challenge'), 'cursor-pointer appearance-none bg-[length:12px] bg-[right_4px_center] bg-no-repeat pr-6']" style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23033C59' stroke-width='1.6'/%3E%3C/svg%3E&quot;)">
                  <option value="">Select one</option>
                  <option v-for="c in challenges" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <div class="mt-7">
              <label for="ed-message" class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.65)]">Message<span class="normal-case tracking-normal text-[color:rgba(3,60,89,0.45)]"> (optional)</span></label>
              <textarea id="ed-message" v-model="form.message" rows="3" class="mt-2 block w-full resize-none border-b border-[color:rgba(3,60,89,0.22)] bg-transparent py-2 font-display text-[16px] font-semibold text-slateNavy outline-none transition-colors duration-300 focus:border-slateNavy" />
            </div>

            <!-- Error (hand-off could not open) -->
            <div v-if="status === 'error'" role="alert" class="mt-7 border-l-2 border-[#b4361f] bg-[#fbeeeb] px-4 py-3 text-[14px] text-[#7a2414]">
              WhatsApp couldn’t be opened automatically (it may have been blocked).
              <a :href="fallbackUrl" target="_blank" rel="noopener noreferrer" class="font-bold underline underline-offset-4">Open the prepared request</a> to send it.
            </div>

            <div class="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="submit"
                :disabled="status === 'loading'"
                class="group inline-flex h-14 items-center gap-3 bg-slateNavy pl-7 pr-2 font-display text-[16px] font-bold text-pureWhite transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pastiYellow-500"
              >
                {{ status === 'loading' ? 'Preparing…' : 'Request a Demo' }}
                <span class="grid h-10 w-10 place-items-center bg-pastiYellow-500 text-slateNavy">
                  <svg v-if="status !== 'loading'" viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
                  <span v-else class="ed-spin h-4 w-4 rounded-full border-2 border-slateNavy border-t-transparent" aria-hidden="true" />
                </span>
              </button>
              <p class="max-w-[18rem] text-[12px] leading-snug text-[color:rgba(3,60,89,0.6)]">Your request opens as a prepared WhatsApp message to the PASTI team.</p>
            </div>
          </form>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .ed-spin {
    animation: ed-spin 0.8s linear infinite;
  }
}
@keyframes ed-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
