<script setup lang="ts">
// REQUEST DEMO — the page's conversion point. Module chips are pre-selected
// by any "Request Demo" CTA on the page (useOpenDemo). There is no form
// backend yet (BUTUH KONFIRMASI: email / CRM / WhatsApp), so for now submit
// composes the request into the site's existing WhatsApp contact link.
const { modules } = useOpen()
const { interest } = useOpenDemo()
const { phone } = useWhatsapp()

const options = [...modules.map((m) => ({ id: m.id, label: m.title })), { id: 'full-ecosystem', label: 'Full ecosystem' }]

const form = reactive({ name: '', company: '', email: '', phone: '', message: '' })
const errors = reactive<Record<string, string>>({})
const sent = ref(false)

const toggle = (id: string) => {
  interest.value = interest.value.includes(id) ? interest.value.filter((x) => x !== id) : [...interest.value, id]
}

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Please enter your name.'
  errors.company = form.company.trim() ? '' : 'Please enter your company.'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Please enter a valid work email.'
  return !errors.name && !errors.company && !errors.email
}

const submit = () => {
  if (!validate()) return
  const picked = options.filter((o) => interest.value.includes(o.id)).map((o) => o.label)
  const text = [
    'Halo PASTI, saya ingin request demo OPEN.',
    `Nama: ${form.name}`,
    `Perusahaan: ${form.company}`,
    `Email: ${form.email}`,
    form.phone && `Telepon: ${form.phone}`,
    picked.length && `Minat: ${picked.join(', ')}`,
    form.message && `Pesan: ${form.message}`
  ].filter(Boolean).join('\n')
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  sent.value = true
}

const fields = [
  { key: 'name', label: 'Name', type: 'text', autocomplete: 'name', required: true },
  { key: 'company', label: 'Company', type: 'text', autocomplete: 'organization', required: true },
  { key: 'email', label: 'Work email', type: 'email', autocomplete: 'email', required: true },
  { key: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', required: false }
] as const
</script>

<template>
  <section id="demo" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 85%; --lift-y: 20%">
    <BaseGridLines tone="light" />
    <div aria-hidden="true" class="open-glow pointer-events-none absolute -left-[12%] bottom-[-10%] h-[50vw] max-h-[680px] w-[50vw] max-w-[680px] opacity-80" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Request demo" meta="11 / 11" />

      <div class="mt-12 grid gap-14 desktop:grid-cols-12 desktop:gap-8">
        <div class="m-center desktop:col-span-4">
          <OpenMark :size="52" class="mx-auto desktop:mx-0" />
          <OpenHeading class="mt-6" before="Request " mark="Demo" lede="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore." />
        </div>

        <form class="rounded-[28px] border border-[color:rgba(3,60,89,0.08)] bg-pureWhite p-6 shadow-[0_60px_120px_-60px_rgba(3,60,89,0.6)] tablet:p-10 desktop:col-span-7 desktop:col-start-6" novalidate @submit.prevent="submit">
          <div class="grid gap-x-8 gap-y-7 tablet:grid-cols-2">
            <label v-for="f in fields" :key="f.key" class="block">
              <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">{{ f.label }}<span v-if="f.required" class="text-pastiYellow-500"> *</span></span>
              <input
                v-model="form[f.key]"
                :type="f.type"
                :autocomplete="f.autocomplete"
                :inputmode="f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : undefined"
                :aria-invalid="!!errors[f.key]"
                class="mt-2 block h-12 w-full border-b bg-transparent font-display text-[18px] font-semibold text-slateNavy outline-none transition-colors duration-300 placeholder:text-[color:rgba(3,60,89,0.3)] focus:border-pastiYellow-500"
                :class="errors[f.key] ? 'border-[#c2412d]' : 'border-[color:rgba(3,60,89,0.2)]'"
              >
              <span v-if="errors[f.key]" class="mt-1.5 block text-[13px] text-[#c2412d]">{{ errors[f.key] }}</span>
            </label>
          </div>

          <fieldset class="mt-9">
            <legend class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">Interested in</legend>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="o in options"
                :key="o.id"
                type="button"
                :aria-pressed="interest.includes(o.id)"
                class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-[background-color,border-color,color] duration-300 active:scale-[0.97]"
                :class="interest.includes(o.id) ? 'border-pastiYellow-500 bg-pastiYellow-500 text-slateNavy' : 'border-[color:rgba(3,60,89,0.18)] text-slateNavy hover:border-slateNavy'"
                @click="toggle(o.id)"
              >
                <svg v-if="interest.includes(o.id)" viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                {{ o.label }}
              </button>
            </div>
          </fieldset>

          <label class="mt-9 block">
            <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">Message</span>
            <textarea v-model="form.message" rows="3" class="mt-2 block w-full resize-none border-b border-[color:rgba(3,60,89,0.2)] bg-transparent py-2 font-display text-[17px] font-semibold text-slateNavy outline-none transition-colors duration-300 focus:border-pastiYellow-500" />
          </label>

          <div class="mt-10 flex flex-wrap items-center gap-5">
            <button type="submit" class="group inline-flex h-14 items-center gap-3 rounded-full bg-slateNavy pl-7 pr-2 font-display text-[16px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.97]">
              Request Demo
              <span class="grid h-10 w-10 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover:-rotate-45">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </button>
            <p v-if="sent" role="status" class="text-[14px] text-[color:rgba(3,60,89,0.75)]">Thanks — your request has been prepared in WhatsApp.</p>
          </div>
        </form>
      </div>
    </BaseContainer>
  </section>
</template>
