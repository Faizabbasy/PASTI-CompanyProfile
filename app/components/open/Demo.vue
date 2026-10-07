<script setup lang="ts">
// CTA / BUILD YOUR PROCUREMENT ECOSYSTEM (slide 26) — deep navy; the section
// tag's ring closes here (12 / 12, check drawn): the page's loop is done.
// Lead form with the brief's fields. There is no form backend (destination
// pending owner confirmation), so submit hands the request to the site's
// WhatsApp contact and says so — nothing pretends to be "sent".
// Errors: inline, linked with aria-describedby; focus moves to the first
// invalid field.
const { cta } = useOpen()
const { interest } = useOpenDemo()
const { phone, link } = useWhatsapp()

const form = reactive({ name: '', company: '', email: '', phone: '', role: '', challenge: '', message: '' })
const errors = reactive<Record<string, string>>({})
const handedOff = ref(false)
const formRef = ref<HTMLFormElement | null>(null)

const toggle = (id: string) => {
  interest.value = interest.value.includes(id) ? interest.value.filter((x) => x !== id) : [...interest.value, id]
}

const validate = () => {
  errors.name = form.name.trim() ? '' : 'Isi nama Anda.'
  errors.company = form.company.trim() ? '' : 'Isi nama perusahaan.'
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Isi email kerja yang valid, misalnya nama@perusahaan.com.'
  const first = (['name', 'company', 'email'] as const).find((k) => errors[k])
  if (first) formRef.value?.querySelector<HTMLElement>(`#op-${first}`)?.focus()
  return !first
}

const submit = () => {
  if (!validate()) return
  const picked = cta.interests.filter((o) => interest.value.includes(o.id)).map((o) => o.label)
  const text = [
    'Halo PASTI, saya ingin request demo OPEN.',
    `Nama: ${form.name}`,
    `Perusahaan: ${form.company}`,
    `Email: ${form.email}`,
    form.phone && `Telepon / WhatsApp: ${form.phone}`,
    form.role && `Jabatan: ${form.role}`,
    form.challenge && `Tantangan procurement: ${form.challenge}`,
    picked.length && `Minat: ${picked.join(', ')}`,
    form.message && `Pesan: ${form.message}`
  ]
    .filter(Boolean)
    .join('\n')
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  handedOff.value = true
}

const fields = [
  { key: 'name', label: 'Nama', type: 'text', autocomplete: 'name', required: true },
  { key: 'company', label: 'Perusahaan', type: 'text', autocomplete: 'organization', required: true },
  { key: 'email', label: 'Email kerja', type: 'email', autocomplete: 'email', required: true },
  { key: 'phone', label: 'Telepon / WhatsApp', type: 'tel', autocomplete: 'tel', required: false },
  { key: 'role', label: 'Jabatan', type: 'text', autocomplete: 'organization-title', required: false }
] as const

const input = 'mt-2 block h-12 w-full rounded-[12px] border bg-pureWhite px-4 text-[16px] font-semibold text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]'
</script>

<template>
  <section id="demo" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10" style="background: radial-gradient(ellipse 60% 60% at 10% 90%, rgba(251,186,0,0.16), transparent 70%), linear-gradient(180deg, #033C59 0%, #022436 100%)" />
    <div aria-hidden="true" class="op-rules--dark pointer-events-none absolute inset-0 -z-10" />

    <BaseContainer>
      <OpenTag :n="12" label="Build your procurement ecosystem" surface="dark" />

      <div class="mt-14 grid gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <OpenHeading :lines="cta.title" surface="dark" size="md" :lede="cta.body" />
          <p class="mt-8 flex items-center gap-3 font-display text-[19px] font-extrabold">
            <span class="grid h-8 w-8 place-items-center rounded-full border-2 border-pastiYellow-500 text-pastiYellow-500">
              <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
            </span>
            {{ cta.line }}
          </p>
          <ul class="mt-10 grid grid-cols-2 border-t border-[color:rgba(255,255,255,0.14)]">
            <li v-for="p in cta.pillars" :key="p" class="flex items-center gap-2.5 border-b border-[color:rgba(255,255,255,0.14)] py-4 font-display text-[15px] font-bold">
              <OpenMark :size="16" />{{ p }}
            </li>
          </ul>
          <a :href="link" target="_blank" rel="noopener noreferrer" class="group mt-8 inline-flex min-h-11 items-center gap-2 font-display text-[16px] font-bold text-pureWhite underline decoration-pastiYellow-500 decoration-2 underline-offset-[6px]">
            Talk to PASTI
            <svg viewBox="0 0 16 16" class="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
          </a>
        </div>

        <form ref="formRef" novalidate class="rounded-[28px] bg-pureWhite p-6 text-slateNavy tablet:p-9 desktop:col-span-7" aria-labelledby="op-form-title" @submit.prevent="submit">
          <p id="op-form-title" class="font-display text-[24px] font-extrabold tracking-[-0.02em]">Request a Demo</p>
          <p class="mt-1 text-[14px] text-[color:rgba(3,60,89,0.65)]">Kolom bertanda * wajib diisi.</p>

          <div class="mt-7 grid gap-x-5 gap-y-5 tablet:grid-cols-2">
            <div v-for="f in fields" :key="f.key">
              <label :for="`op-${f.key}`" class="text-[13.5px] font-bold">{{ f.label }}<span v-if="f.required" aria-hidden="true" class="text-[#B25E00]"> *</span></label>
              <input
                :id="`op-${f.key}`"
                v-model="form[f.key]"
                :type="f.type"
                :autocomplete="f.autocomplete"
                :required="f.required"
                :aria-invalid="!!errors[f.key]"
                :aria-describedby="errors[f.key] ? `op-${f.key}-err` : undefined"
                :class="[input, errors[f.key] ? 'border-[#C2412D]' : 'border-[color:rgba(3,60,89,0.18)]']"
              >
              <p v-if="errors[f.key]" :id="`op-${f.key}-err`" class="mt-1.5 text-[13px] font-medium text-[#C2412D]">{{ errors[f.key] }}</p>
            </div>
            <div>
              <label for="op-challenge" class="text-[13.5px] font-bold">Tantangan procurement</label>
              <select id="op-challenge" v-model="form.challenge" :class="[input, 'border-[color:rgba(3,60,89,0.18)]']">
                <option value="">Pilih salah satu</option>
                <option v-for="c in cta.challenges" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>

          <fieldset class="mt-7">
            <legend class="text-[13.5px] font-bold">Minat</legend>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="o in cta.interests"
                :key="o.id"
                type="button"
                :aria-pressed="interest.includes(o.id)"
                class="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[14px] font-bold transition-[background-color,border-color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500"
                :class="interest.includes(o.id) ? 'border-slateNavy bg-slateNavy text-pureWhite' : 'border-[color:rgba(3,60,89,0.2)] hover:border-slateNavy'"
                @click="toggle(o.id)"
              >
                <svg v-if="interest.includes(o.id)" viewBox="0 0 16 16" class="h-3.5 w-3.5 text-pastiYellow-500" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 8.5l3 3 7-7" /></svg>
                {{ o.label }}
              </button>
            </div>
          </fieldset>

          <div class="mt-7">
            <label for="op-message" class="text-[13.5px] font-bold">Pesan</label>
            <textarea id="op-message" v-model="form.message" rows="3" class="mt-2 block w-full resize-none rounded-[12px] border border-[color:rgba(3,60,89,0.18)] px-4 py-3 text-[16px] font-medium text-slateNavy outline-none transition-[border-color,box-shadow] duration-200 focus:border-slateNavy focus:shadow-[0_0_0_4px_rgba(251,186,0,0.35)]" />
          </div>

          <div class="mt-8 flex flex-col gap-4 tablet:flex-row tablet:items-center">
            <button type="submit" class="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-slateNavy pl-7 pr-2 font-display text-[16px] font-bold text-pureWhite transition-transform duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pastiYellow-500">
              Request a Demo
              <span class="grid h-10 w-10 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy transition-transform duration-500 ease-editorial group-hover:-rotate-45">
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
              </span>
            </button>
            <p class="text-[13px] text-[color:rgba(3,60,89,0.6)]">Permintaan dikirim lewat WhatsApp tim PASTI.</p>
          </div>
          <p v-if="handedOff" role="status" class="mt-4 rounded-[12px] bg-[color:rgba(251,186,0,0.18)] px-4 py-3 text-[14px] font-medium">
            Pesan permintaan demo sudah disiapkan di WhatsApp. Kirim pesannya dari sana untuk menyelesaikan.
          </p>
        </form>
      </div>
    </BaseContainer>
  </section>
</template>
