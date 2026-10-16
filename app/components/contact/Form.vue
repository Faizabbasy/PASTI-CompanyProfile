<script setup lang="ts">
// Contact form — hands the brief to WhatsApp (owner decision 2026-10-16; no
// form backend). Same submit pattern as ecorp/Demo.vue: validate, build the
// message, open wa.me inside the submit gesture, then show "success" (=
// prepared in WhatsApp, not "received by PASTI") or, when a pop-up blocker
// stops the window, an error state with a direct link.
// "What do you need?" is a set of toggle chips (thumb-sized, multi-select)
// built from the real service and platform names (useContact).
const { needs, phone } = useContact()

type Field = 'name' | 'company' | 'email' | 'phone' | 'message'
const form = reactive<Record<Field, string>>({ name: '', company: '', email: '', phone: '', message: '' })
const picked = ref<string[]>([])
const errors = reactive<Partial<Record<Field, string>>>({})
const status = ref<'idle' | 'success' | 'error'>('idle')
const fallbackUrl = ref('')
const formRef = ref<HTMLFormElement | null>(null)

const fields: { key: Exclude<Field, 'message'>; label: string; type: string; autocomplete: string; required: boolean }[] = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'name', required: true },
  { key: 'company', label: 'Company', type: 'text', autocomplete: 'organization', required: true },
  { key: 'email', label: 'Work email', type: 'email', autocomplete: 'email', required: true },
  { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel', required: false }
]

const toggle = (n: string) => {
  picked.value = picked.value.includes(n) ? picked.value.filter((x) => x !== n) : [...picked.value, n]
}

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Please enter your name.'
  errors.company = form.company.trim() ? '' : 'Please enter your company.'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Please enter a valid work email.'
  errors.phone = !form.phone.trim() || /^[+\d][\d\s-]{6,}$/.test(form.phone.trim()) ? '' : 'Please enter a valid phone or WhatsApp number.'
  const first = (['name', 'company', 'email', 'phone'] as Field[]).find((f) => errors[f])
  if (first) nextTick(() => formRef.value?.querySelector<HTMLElement>(`#ct-${first}`)?.focus())
  return !first
}

const buildMessage = () =>
  [
    'Halo PASTI, saya ingin berdiskusi tentang kebutuhan kami.',
    `Nama: ${form.name.trim()}`,
    `Perusahaan: ${form.company.trim()}`,
    `Email: ${form.email.trim()}`,
    form.phone.trim() && `Telepon/WhatsApp: ${form.phone.trim()}`,
    picked.value.length && `Kebutuhan: ${picked.value.join(', ')}`,
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
  picked.value = []
}

const input =
  'mt-2 block h-12 w-full rounded-[12px] border bg-pureWhite px-4 font-display text-[16px] font-semibold text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]'
</script>

<template>
  <div class="relative rounded-[28px] border border-[color:rgba(3,60,89,0.1)] bg-pureWhite p-6 text-slateNavy shadow-[0_40px_80px_-50px_rgba(3,60,89,0.55)] tablet:p-9">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p id="ct-form-title" class="font-display text-[24px] font-extrabold tracking-[-0.02em]">Tell us about it<span class="text-pastiYellow-500">.</span></p>
        <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.65)]">Fields marked * are required. Your brief opens in WhatsApp, ready to send.</p>
      </div>
      <LayoutBrandMark surface="light" :height="12" class="mt-2 shrink-0 opacity-80" />
    </div>

    <!-- Success / error: the brief was prepared in WhatsApp, not received. -->
    <div v-if="status !== 'idle'" class="mt-8" role="status" aria-live="polite">
      <div class="flex items-center gap-3">
        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full" :class="status === 'success' ? 'bg-pastiYellow-500' : 'bg-[color:rgba(194,65,45,0.12)]'">
          <svg v-if="status === 'success'" viewBox="0 0 16 16" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
          <span v-else aria-hidden="true" class="font-display text-[18px] font-bold text-[#C2412D]">!</span>
        </span>
        <p class="font-display text-[20px] font-bold tracking-[-0.01em]">
          {{ status === 'success' ? 'Your brief is ready in WhatsApp.' : 'WhatsApp didn’t open.' }}
        </p>
      </div>
      <p class="mt-3 text-[15px] leading-relaxed text-[color:rgba(3,60,89,0.75)]">
        {{ status === 'success' ? 'Press send in WhatsApp to reach the PASTI team.' : 'Your browser may have blocked the new window. Use the button below to open it.' }}
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a :href="fallbackUrl" target="_blank" rel="noopener noreferrer" class="inline-flex h-12 items-center gap-2 rounded-full bg-slateNavy px-6 font-display text-[15px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.98]">
          Open WhatsApp
          <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
        </a>
        <button type="button" class="h-12 font-display text-[15px] font-semibold underline decoration-pastiYellow-500 decoration-2 underline-offset-4" @click="reset">Start a new brief</button>
      </div>
    </div>

    <form v-else ref="formRef" novalidate class="mt-7" aria-labelledby="ct-form-title" @submit.prevent="submit">
      <div class="grid gap-x-5 gap-y-5 tablet:grid-cols-2">
        <div v-for="f in fields" :key="f.key">
          <label :for="`ct-${f.key}`" class="text-[13.5px] font-bold">{{ f.label }}<span v-if="f.required" aria-hidden="true" class="text-[#B25E00]"> *</span></label>
          <input
            :id="`ct-${f.key}`"
            v-model="form[f.key]"
            :type="f.type"
            :autocomplete="f.autocomplete"
            :required="f.required"
            :aria-invalid="!!errors[f.key]"
            :aria-describedby="errors[f.key] ? `ct-${f.key}-err` : undefined"
            :class="[input, errors[f.key] ? 'border-[#C2412D]' : 'border-[color:rgba(3,60,89,0.18)]']"
            @input="errors[f.key] = ''"
          >
          <p v-if="errors[f.key]" :id="`ct-${f.key}-err`" class="mt-1.5 text-[13px] font-medium text-[#C2412D]">{{ errors[f.key] }}</p>
        </div>
      </div>

      <fieldset class="mt-6">
        <legend class="text-[13.5px] font-bold">What do you need? <span class="font-medium text-[color:rgba(3,60,89,0.6)]">Pick any</span></legend>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="n in needs"
            :key="n"
            type="button"
            :aria-pressed="picked.includes(n)"
            class="min-h-[44px] rounded-full border px-4 py-2 text-left text-[14px] font-semibold transition-[background-color,border-color,color] duration-200 ease-editorial focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
            :class="picked.includes(n) ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.18)] bg-pureWhite text-slateNavy hover:border-slateNavy'"
            @click="toggle(n)"
          >
            <span aria-hidden="true" class="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle transition-colors duration-200" :class="picked.includes(n) ? 'bg-pastiYellow-500' : 'bg-[color:rgba(3,60,89,0.25)]'" />{{ n }}
          </button>
        </div>
      </fieldset>

      <div class="mt-6">
        <label for="ct-message" class="text-[13.5px] font-bold">Message</label>
        <textarea
          id="ct-message"
          v-model="form.message"
          rows="4"
          class="mt-2 block w-full resize-none rounded-[12px] border border-[color:rgba(3,60,89,0.18)] px-4 py-3 text-[16px] font-medium text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]"
        />
      </div>

      <div class="mt-8 flex flex-col tablet:flex-row">
        <button type="submit" class="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-slateNavy pl-7 pr-2 font-display text-[16px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500">
          Send via WhatsApp
          <span class="grid h-10 w-10 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover:-rotate-45">
            <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
