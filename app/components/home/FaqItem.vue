<script setup lang="ts">
import gsap from 'gsap'
import type { FaqItem } from '~/composables/useFaq'

// One FAQ row. Native <details>/<summary> semantics are kept (keyboard,
// screen readers, find-in-page); the parent owns which row is open so only
// one answer is expanded at a time.
//
// Row anatomy:   01   Question text ..........................  [ + ]
//                     └ answer, revealed word by word ┘
// Hover / focus: a Cobalt fill sweeps in from the left edge (line travel,
// 00-brand-guide.md §10), the index turns Cobalt and the question steps
// right. Open: the plus resolves to minus inside a filled frame, the answer
// rises word by word, and a Yellow Signal point marks the active row — one
// state change inside the 200-300ms window (04-homepage-spec.md §8).
const props = defineProps<{ item: FaqItem; open: boolean }>()
const emit = defineEmits<{ toggle: []; hover: [] }>()

const bodyRef = ref<HTMLElement | null>(null)
const words = computed(() => props.item.answer.split(/\s+/))
const { setState } = useCustomCursor()

// Keep <details> open until the collapse has finished, otherwise the
// browser hides the content instantly and the height transition snaps.
const closing = ref(false)
watch(
  () => props.open,
  async (isOpen, was) => {
    if (!isOpen && was) {
      closing.value = true
      window.setTimeout(() => (closing.value = false), 320)
      return
    }
    if (!isOpen) return
    await nextTick()
    if (window.matchMedia(reducedMotionQuery.reduce).matches) return
    const w = bodyRef.value?.querySelectorAll('[data-w]')
    if (w?.length) {
      gsap.fromTo(w, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.012, ease: approvedEase.gsapStandard, overwrite: 'auto' })
    }
  }
)

function onSummary(event: MouseEvent) {
  event.preventDefault()
  emit('toggle')
}
</script>

<template>
  <div
    class="faq-row group/row relative border-t border-[color:rgba(3,60,89,0.12)]"
    :data-open="open"
    @mouseenter="emit('hover'); setState('link')"
    @mouseleave="setState('default')"
    @focusin="emit('hover')"
  >
    <!-- Hover sweep: a light Cobalt wash drawn in from the left edge. -->
    <span aria-hidden="true" class="faq-row__sweep pointer-events-none absolute inset-0 origin-left bg-[linear-gradient(90deg,rgba(3, 60, 89,0.07),rgba(3, 60, 89,0))]" />
    <!-- Active Signal: left bar (the section's Signal, spec §8) + Yellow point. -->
    <span aria-hidden="true" class="faq-row__bar absolute -left-px top-0 h-full w-[3px] origin-top bg-cobalt" />

    <details class="relative" :open="open || closing">
      <summary
        class="flex cursor-pointer list-none items-center gap-5 py-7 marker:content-none focus-visible:outline-none md:gap-8 md:py-8"
        @click="onSummary"
      >
        <span class="faq-row__index w-8 shrink-0 pl-4 font-display text-token-metadata font-semibold tabular-nums tracking-[0.08em] md:w-14 md:pl-6">{{ item.index }}</span>
        <span class="faq-row__q flex-1 font-display text-[length:clamp(19px,1.9vw,30px)] font-semibold leading-[1.2] tracking-[-0.015em] text-slateNavy">
          {{ item.question }}
        </span>
        <span aria-hidden="true" class="faq-row__icon relative mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border md:mr-4">
          <span class="absolute h-[1.5px] w-4 bg-current" />
          <span class="faq-row__icon-v absolute h-4 w-[1.5px] bg-current" />
        </span>
      </summary>

      <div class="grid transition-[grid-template-rows] duration-300 ease-editorial" :style="{ gridTemplateRows: open ? '1fr' : '0fr' }">
        <div class="overflow-hidden">
          <div ref="bodyRef" class="flex items-start gap-5 pb-9 md:gap-8">
            <span aria-hidden="true" class="w-8 shrink-0 md:w-14" />
            <p class="max-w-2xl text-[length:clamp(16px,1.25vw,19px)] leading-[1.65] text-[color:rgba(3,60,89,0.78)]">
              <template v-for="(w, i) in words" :key="i"
                ><span class="inline-block overflow-hidden align-top"><span data-w class="inline-block">{{ w }}</span></span
                >{{ ' ' }}</template
              >
            </p>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.faq-row__sweep {
  transform: scaleX(0);
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row:hover .faq-row__sweep,
.faq-row:focus-within .faq-row__sweep,
.faq-row[data-open='true'] .faq-row__sweep {
  transform: scaleX(1);
}
.faq-row__bar {
  transform: scaleY(0);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row[data-open='true'] .faq-row__bar {
  transform: scaleY(1);
}
.faq-row__index {
  color: rgba(3, 60, 89, 0.45);
  transition: color 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row:hover .faq-row__index,
.faq-row:focus-within .faq-row__index,
.faq-row[data-open='true'] .faq-row__index {
  color: #033C59;
}
.faq-row__q {
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row:hover .faq-row__q,
.faq-row:focus-within .faq-row__q {
  transform: translateX(6px);
}
.faq-row__icon {
  color: #033c59;
  border-color: rgba(3, 60, 89, 0.2);
  transition: background-color 0.2s, border-color 0.2s, color 0.2s, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row:hover .faq-row__icon {
  border-color: #033C59;
  color: #033C59;
}
.faq-row[data-open='true'] .faq-row__icon {
  background: #033c59;
  border-color: #033c59;
  color: #fff;
  transform: rotate(180deg);
}
.faq-row__icon-v {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.faq-row[data-open='true'] .faq-row__icon-v {
  transform: scaleY(0);
}
summary::-webkit-details-marker {
  display: none;
}
summary:focus-visible .faq-row__q {
  text-decoration: underline;
  text-decoration-color: #033C59;
  text-underline-offset: 6px;
}
@media (prefers-reduced-motion: reduce) {
  .faq-row__sweep,
  .faq-row__bar,
  .faq-row__q,
  .faq-row__icon,
  .faq-row__icon-v {
    transition: none;
  }
}
</style>
