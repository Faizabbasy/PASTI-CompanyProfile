<script setup lang="ts">
import type { TestimonialApproval, TestimonialExtra } from '#shared/utils/testimonialSchema'

// Publication approval for one testimonial — separate from the publish
// workflow. Text + mark, never colour alone. Confirm is ADMIN-only (the
// server answers 403 otherwise); anyone who can edit may lower approval,
// which takes effect immediately. Disabled while the form has unsaved
// changes: a confirm always covers the SAVED draft wording.
const props = defineProps<{ id: string; revision: number; approval: TestimonialExtra['approval']; publicEligible: boolean; status: string; active: boolean; dirty: boolean }>()
const emit = defineEmits<{ changed: [] }>()
const { cmsFetch, can } = useCmsSession()
const canApprove = computed(() => can('claims.approve'))
const busy = ref<TestimonialApproval | null>(null)
const message = ref<{ kind: 'success' | 'error'; text: string } | null>(null)
const meta = computed(() => CLAIM_LABELS[props.approval.value])

const reasons = computed(() => {
  const out: string[] = []
  if (props.status !== 'published') out.push('belum di-publish')
  if (!props.active) out.push('tidak dicentang “Tampilkan”')
  if (props.approval.value !== 'confirmed') out.push(`persetujuan: “${meta.value.label}”`)
  else if (!props.approval.coversPublished && props.status === 'published') out.push('teks yang tayang bukan teks yang disetujui')
  return out
})

async function set(to: TestimonialApproval) {
  const prompts: Record<TestimonialApproval, string> = {
    confirmed: 'Setujui testimoni ini untuk tampil di website? Yang disetujui adalah teks draft yang sudah disimpan (kutipan, nama, jabatan, perusahaan, klien, foto).',
    needs_approval: 'Tandai perlu persetujuan? Testimoni langsung tidak boleh tampil di website.',
    hidden: 'Sembunyikan testimoni ini? Testimoni langsung tidak boleh tampil di website.'
  }
  if (!window.confirm(prompts[to])) return
  busy.value = to
  message.value = null
  try {
    await cmsFetch(`/api/admin/shared/testimonials/${props.id}/approval`, { method: 'POST', body: { revision: props.revision, approval: to }, keepOn401: true })
    message.value = { kind: 'success', text: `Persetujuan diubah menjadi ${CLAIM_LABELS[to].label}.` }
    emit('changed')
  } catch (e) {
    const er = e as { statusCode?: number; data?: { statusMessage?: string }; statusMessage?: string }
    message.value = { kind: 'error', text: er.statusCode === 403 ? 'Hanya admin yang bisa menyetujui testimoni.' : er.statusCode === 409 ? 'Testimoni ini diubah di tempat lain. Muat ulang, cek lagi, lalu coba lagi.' : 'Persetujuan gagal diubah. Coba lagi.' }
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <section aria-labelledby="approval-title" class="mt-4 rounded-lg border border-navy-100 bg-white p-4">
    <div class="flex flex-wrap items-center gap-2">
      <h2 id="approval-title" class="text-sm font-semibold">Persetujuan tampil</h2>
      <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="meta.cls">
        <span aria-hidden="true">{{ meta.mark }}</span>{{ meta.label }}
      </span>
      <span class="text-[11px] font-semibold" :class="publicEligible ? 'text-emerald-800' : 'text-navy-500'">
        {{ publicEligible ? '✓ Boleh tampil di website' : `Belum tampil — ${reasons.join(', ')}` }}
      </span>
    </div>
    <p class="mt-1 text-xs text-navy-500">
      Terpisah dari Publish: testimoni baru tampil di website kalau sudah di-publish, dicentang “Tampilkan”, DAN disetujui (Disetujui) untuk teks yang tayang.
      <template v-if="approval.changedBy">Terakhir diubah {{ fmtCmsTime(approval.changedAt) }} oleh {{ approval.changedBy.name }}.</template>
    </p>
    <p v-if="approval.value === 'confirmed' && !approval.coversDraft" class="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      Draft ini mengubah teks yang sudah disetujui. Kalau di-publish, persetujuan kembali ke “Perlu persetujuan” sampai admin menyetujui teks barunya.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        v-if="canApprove"
        type="button"
        class="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="dirty || !!busy || (approval.value === 'confirmed' && approval.coversDraft)"
        @click="set('confirmed')"
      >{{ busy === 'confirmed' ? 'Menyetujui…' : 'Setujui untuk tampil' }}</button>
      <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-50" :disabled="dirty || !!busy || approval.value === 'needs_approval'" @click="set('needs_approval')">
        {{ busy === 'needs_approval' ? 'Menyimpan…' : 'Perlu persetujuan' }}
      </button>
      <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-50" :disabled="dirty || !!busy || approval.value === 'hidden'" @click="set('hidden')">
        {{ busy === 'hidden' ? 'Menyimpan…' : 'Sembunyikan' }}
      </button>
      <span v-if="dirty" class="text-xs text-navy-500">Klik Save draft dulu.</span>
      <span v-else-if="!canApprove" class="text-xs text-navy-500">Hanya admin yang bisa menyetujui untuk tampil.</span>
    </div>
    <p v-if="message" class="mt-2 text-xs font-medium" :class="message.kind === 'error' ? 'text-red-700' : 'text-emerald-800'" :role="message.kind === 'error' ? 'alert' : 'status'">{{ message.text }}</p>
  </section>
</template>
