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
  if (props.status !== 'published') out.push('not published')
  if (!props.active) out.push('inactive')
  if (props.approval.value !== 'confirmed') out.push(`approval is “${meta.value.label}”`)
  else if (!props.approval.coversPublished && props.status === 'published') out.push('the published wording is not the approved wording')
  return out
})

async function set(to: TestimonialApproval) {
  const prompts: Record<TestimonialApproval, string> = {
    confirmed: 'Confirm this testimonial for public use? This approves the saved draft wording (quote, person, role, company, client, photo).',
    needs_approval: 'Mark as needing approval? It stops being eligible for public display immediately.',
    hidden: 'Hide this testimonial? It stops being eligible for public display immediately.'
  }
  if (!window.confirm(prompts[to])) return
  busy.value = to
  message.value = null
  try {
    await cmsFetch(`/api/admin/shared/testimonials/${props.id}/approval`, { method: 'POST', body: { revision: props.revision, approval: to }, keepOn401: true })
    message.value = { kind: 'success', text: `Approval set to ${CLAIM_LABELS[to].label}.` }
    emit('changed')
  } catch (e) {
    const er = e as { statusCode?: number; data?: { statusMessage?: string }; statusMessage?: string }
    message.value = { kind: 'error', text: er.statusCode === 403 ? 'Only an admin can confirm a testimonial.' : er.statusCode === 409 ? 'This testimonial changed elsewhere. Reload, review, then try again.' : 'Could not change approval. Please try again.' }
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <section aria-labelledby="approval-title" class="mt-4 rounded-lg border border-navy-100 bg-white p-4">
    <div class="flex flex-wrap items-center gap-2">
      <h2 id="approval-title" class="text-sm font-semibold">Publication approval</h2>
      <span class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold" :class="meta.cls">
        <span aria-hidden="true">{{ meta.mark }}</span>{{ meta.label }}
      </span>
      <span class="text-[11px] font-semibold" :class="publicEligible ? 'text-emerald-800' : 'text-navy-500'">
        {{ publicEligible ? '✓ Public-eligible' : `Not public — ${reasons.join(', ')}` }}
      </span>
    </div>
    <p class="mt-1 text-xs text-navy-500">
      Separate from publishing: a testimonial is public only when it is published, active and confirmed for the published wording.
      <template v-if="approval.changedBy">Last changed {{ fmtCmsTime(approval.changedAt) }} by {{ approval.changedBy.name }}.</template>
    </p>
    <p v-if="approval.value === 'confirmed' && !approval.coversDraft" class="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      The draft changes approved wording. Publishing it resets approval to Needs approval until an admin confirms the new wording.
    </p>
    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button
        v-if="canApprove"
        type="button"
        class="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="dirty || !!busy || (approval.value === 'confirmed' && approval.coversDraft)"
        @click="set('confirmed')"
      >{{ busy === 'confirmed' ? 'Confirming…' : 'Confirm for public use' }}</button>
      <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-50" :disabled="dirty || !!busy || approval.value === 'needs_approval'" @click="set('needs_approval')">
        {{ busy === 'needs_approval' ? 'Saving…' : 'Needs approval' }}
      </button>
      <button type="button" class="rounded-md border border-navy-200 px-3 py-1.5 text-sm hover:bg-navy-50 disabled:opacity-50" :disabled="dirty || !!busy || approval.value === 'hidden'" @click="set('hidden')">
        {{ busy === 'hidden' ? 'Saving…' : 'Hide' }}
      </button>
      <span v-if="dirty" class="text-xs text-navy-500">Save the draft first.</span>
      <span v-else-if="!canApprove" class="text-xs text-navy-500">Only an admin can confirm public use.</span>
    </div>
    <p v-if="message" class="mt-2 text-xs font-medium" :class="message.kind === 'error' ? 'text-red-700' : 'text-emerald-800'" :role="message.kind === 'error' ? 'alert' : 'status'">{{ message.text }}</p>
  </section>
</template>
