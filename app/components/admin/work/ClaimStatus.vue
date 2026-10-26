<script setup lang="ts">
import { CLAIM_STATUSES, type ClaimStatus } from '#shared/cms/fields'

// Claim / media approval control: text + mark, never colour alone. Only an
// ADMIN (claims.approve) can choose Confirmed; the server rejects it from
// anyone else (403) and downgrades an edited confirmed item for editors.
const props = defineProps<{ id: string; canApprove: boolean; error?: string; savedStatus?: ClaimStatus | null }>()
const model = defineModel<ClaimStatus>({ required: true })
const meta = computed(() => CLAIM_LABELS[model.value])
// An editor can keep an already-confirmed item (unchanged), not newly confirm one.
const confirmLocked = computed(() => !props.canApprove && props.savedStatus !== 'confirmed')
const EXPLAIN: Record<ClaimStatus, string> = {
  confirmed: 'Sudah dicek dan disetujui admin — boleh tampil di website.',
  needs_approval: 'Menunggu dicek admin — belum tampil di website.',
  hidden: 'Sengaja tidak ditampilkan — disimpan untuk catatan saja.'
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <label :for="id" class="text-sm font-medium">Status persetujuan</label>
      <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="meta.cls">
        <span aria-hidden="true">{{ meta.mark }}</span>{{ meta.label }}
      </span>
      <span class="text-[11px] font-medium" :class="model === 'confirmed' ? 'text-emerald-800' : 'text-navy-500'">
        {{ model === 'confirmed' ? 'Boleh tampil di website' : 'Tidak tampil di website' }}
      </span>
    </div>
    <select :id="id" v-model="model" class="mt-1 block w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm" :aria-invalid="!!error" :aria-describedby="`${id}-hint`">
      <option v-for="s in CLAIM_STATUSES" :key="s" :value="s" :disabled="s === 'confirmed' && confirmLocked">
        {{ CLAIM_LABELS[s].label }}{{ s === 'confirmed' && confirmLocked ? ' (khusus admin)' : '' }}
      </option>
    </select>
    <p :id="`${id}-hint`" class="mt-1 text-xs text-navy-500">
      {{ EXPLAIN[model] }}<template v-if="!canApprove"> Hanya admin yang bisa menyetujui; kalau item yang sudah disetujui diubah, statusnya kembali ke “Perlu persetujuan”.</template>
    </p>
    <p v-if="error" class="mt-1 text-xs font-medium text-red-700" role="alert"><span aria-hidden="true">⚠ </span>{{ error }}</p>
  </div>
</template>
