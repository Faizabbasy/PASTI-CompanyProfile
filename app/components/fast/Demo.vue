<script setup lang="ts">
// 12 WHY FAST + REQUEST A DEMO. The value summary as chips (no superiority
// claims), then the demo form. No form backend: like e-CORPORATE's demo,
// submit hands the request to the site's WhatsApp contact. "Success" means
// "prepared in WhatsApp", never "received by PASTI"; if the window is
// blocked, the error state offers a direct link.
const { why, demo } = useFastPage()
const t = useT()
const { phone } = useWhatsapp()
const sectionRef = ref<HTMLElement | null>(null)
useFastReveal(sectionRef)

type Field = 'name' | 'company' | 'email' | 'phone' | 'role' | 'industry' | 'erp' | 'challenge' | 'message'
const form = reactive<Record<Field, string>>({ name: '', company: '', email: '', phone: '', role: '', industry: '', erp: '', challenge: '', message: '' })
const errors = reactive<Partial<Record<Field, string>>>({})
const status = ref<'idle' | 'success' | 'error'>('idle')
const fallbackUrl = ref('')
const formRef = ref<HTMLFormElement | null>(null)

const fields: { key: Exclude<Field, 'challenge' | 'message'>; label: string; type: string; autocomplete: string; required: boolean }[] = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'name', required: true },
  { key: 'company', label: 'Company', type: 'text', autocomplete: 'organization', required: true },
  { key: 'email', label: 'Work email', type: 'email', autocomplete: 'email', required: true },
  { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel', required: false },
  { key: 'role', label: 'Role', type: 'text', autocomplete: 'organization-title', required: false },
  { key: 'industry', label: 'Manufacturing industry', type: 'text', autocomplete: 'off', required: false },
  { key: 'erp', label: 'Current ERP / source system', type: 'text', autocomplete: 'off', required: false }
]

const validate = () => {
  errors.name = form.name.trim() ? '' : t('Please enter your name.')
  errors.company = form.company.trim() ? '' : t('Please enter your company.')
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : t('Please enter a valid work email.')
  errors.phone = !form.phone.trim() || /^[+\d][\d\s-]{6,}$/.test(form.phone.trim()) ? '' : t('Please enter a valid phone or WhatsApp number.')
  const first = (['name', 'company', 'email', 'phone'] as Field[]).find((f) => errors[f])
  if (first) nextTick(() => formRef.value?.querySelector<HTMLElement>(`#fd-${first}`)?.focus())
  return !first
}

const buildMessage = () =>
  [
    'Halo PASTI, saya ingin request demo FAST.',
    `Nama: ${form.name.trim()}`,
    `Perusahaan: ${form.company.trim()}`,
    `Email: ${form.email.trim()}`,
    form.phone.trim() && `Telepon/WhatsApp: ${form.phone.trim()}`,
    form.role.trim() && `Role: ${form.role.trim()}`,
    form.industry.trim() && `Industri: ${form.industry.trim()}`,
    form.erp.trim() && `ERP / source system: ${form.erp.trim()}`,
    form.challenge && `Planning challenge: ${form.challenge}`,
    form.message.trim() && `Pesan: ${form.message.trim()}`
  ].filter(Boolean).join('\n')

const submit = () => {
  if (!validate()) return
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage())}`
  fallbackUrl.value = url
  // window.open must run inside the submit gesture.
  const w = window.open(url, '_blank')
  if (w) w.opener = null
  status.value = w ? 'success' : 'error'
}
const reset = () => {
  status.value = 'idle'
  ;(Object.keys(form) as Field[]).forEach((k) => (form[k] = ''))
}

const input = 'mt-2 block h-12 w-full rounded-[12px] border bg-pureWhite px-4 font-display text-[16px] font-semibold text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]'
</script>

<template>
  <section id="demo" ref="sectionRef" class="relative overflow-hidden bg-surfaceNeutral py-24 tablet:py-32">
    <BaseGridLines tone="light" edge="top" />
    <BaseContainer class="relative z-10">
        <BaseSectionMark surface="light" label="FAST" meta="12 / 12" class="mb-12 desktop:mb-16" />
      <!-- Why FAST -->
      <div data-fr class="m-center">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.6)]">{{ t('Why FAST') }}</p>
        <ul class="m-center-row mt-4 flex flex-wrap gap-2">
          <li v-for="(w, i) in why" :key="i" class="inline-flex items-center gap-2 rounded-full bg-pureWhite px-3.5 py-2 font-display text-[13px] font-semibold text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.1)]">
            <span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-pastiYellow-500" />{{ w }}
          </li>
        </ul>
      </div>

      <div class="mt-16 grid gap-12 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <FastHeading size="md" :eyebrow="demo.eyebrow" :title="demo.headline" :lede="demo.body" />
          <p class="m-center mt-8 font-display text-[22px] font-extrabold tracking-[-0.02em] text-slateNavy">{{ t('Your Production.') }} <span class="text-pastiYellow-600">{{ t('Your Rules.') }}</span></p>
        </div>

        <div data-fr class="rounded-[28px] bg-pureWhite p-6 text-slateNavy shadow-[0_40px_80px_-50px_rgba(3,60,89,0.55)] ring-1 ring-[color:rgba(3,60,89,0.08)] tablet:p-9 desktop:col-span-7">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p id="fd-title" class="font-display text-[24px] font-extrabold tracking-[-0.02em]">{{ t('Request a demo') }}<span class="text-pastiYellow-500">.</span></p>
              <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.65)]">{{ t('Fields marked * are required. Your request opens in WhatsApp, ready to send.') }}</p>
            </div>
            <FastMark :size="13" class="mt-2 shrink-0" />
          </div>

          <div v-if="status !== 'idle'" class="mt-8" role="status" aria-live="polite">
            <p class="font-display text-[20px] font-bold">{{ status === 'success' ? t('Your request is ready in WhatsApp.') : t('WhatsApp didn’t open.') }}</p>
            <p class="mt-2 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">{{ status === 'success' ? t('Press send in WhatsApp to reach the PASTI team.') : t('Your browser may have blocked the new window. Use the button below to open it.') }}</p>
            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a :href="fallbackUrl" target="_blank" rel="noopener noreferrer" class="inline-flex h-12 items-center gap-2 rounded-full bg-slateNavy px-6 font-display text-[15px] font-bold text-pureWhite">{{ t('Open WhatsApp') }}</a>
              <button type="button" class="h-12 font-display text-[15px] font-semibold underline decoration-pastiYellow-500 decoration-2 underline-offset-4" @click="reset">{{ t('Start a new request') }}</button>
            </div>
          </div>

          <form v-else ref="formRef" novalidate class="mt-7" aria-labelledby="fd-title" @submit.prevent="submit">
            <div class="grid gap-x-5 gap-y-5 tablet:grid-cols-2">
              <div v-for="f in fields" :key="f.key">
                <label :for="`fd-${f.key}`" class="text-[13.5px] font-bold">{{ t(f.label) }}<span v-if="f.required" aria-hidden="true" class="text-[#B25E00]"> *</span></label>
                <input
                  :id="`fd-${f.key}`"
                  v-model="form[f.key]"
                  :type="f.type"
                  :autocomplete="f.autocomplete"
                  :required="f.required"
                  :aria-invalid="!!errors[f.key]"
                  :aria-describedby="errors[f.key] ? `fd-${f.key}-err` : undefined"
                  :class="[input, errors[f.key] ? 'border-[#C2412D]' : 'border-[color:rgba(3,60,89,0.18)]']"
                  @input="errors[f.key] = ''"
                >
                <p v-if="errors[f.key]" :id="`fd-${f.key}-err`" class="mt-1.5 text-[13px] font-medium text-[#C2412D]">{{ errors[f.key] }}</p>
              </div>
              <div>
                <label for="fd-challenge" class="text-[13.5px] font-bold">{{ t('Planning challenge') }}</label>
                <select id="fd-challenge" v-model="form.challenge" :class="[input, 'border-[color:rgba(3,60,89,0.18)]']">
                  <option value="">{{ t('Select…') }}</option>
                  <option v-for="(c, i) in demo.challenges" :key="i" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="mt-5">
              <label for="fd-message" class="text-[13.5px] font-bold">{{ t('Message') }}</label>
              <textarea id="fd-message" v-model="form.message" rows="3" class="mt-2 block w-full resize-none rounded-[12px] border border-[color:rgba(3,60,89,0.18)] px-4 py-3 text-[16px] font-medium text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]" />
            </div>
            <button type="submit" class="group mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-slateNavy pl-7 pr-2 font-display text-[16px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500 max-tablet:w-full">
              {{ t('Request a Demo') }}
              <span class="grid h-10 w-10 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover:-rotate-45">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </button>
          </form>
        </div>
      </div>
    </BaseContainer>
  </section>
</template>
