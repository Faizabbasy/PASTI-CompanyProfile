<script setup lang="ts">
import type { OpenItem } from '~/composables/useOpen'

// READY-TO-DEVELOP FRAMEWORK (slides 6, 7) — deep navy. What OPEN is,
// structurally: a board of nine foundation pieces that lock into place on
// entry (it already exists — "we don't start from a blank page"), then the
// path from framework to system as three layers: OPEN Framework → Your
// Business (adapted through six dimensions) → Your Procurement System.
const { framework } = useOpen()
const layers = framework.layers as [OpenItem, OpenItem, OpenItem]
const boardRef = ref<HTMLElement | null>(null)
const boardIn = useOpenInView(boardRef, 0.3)
const layersRef = ref<HTMLElement | null>(null)
const layersIn = useOpenInView(layersRef, 0.3)
</script>

<template>
  <section id="framework" data-header-theme="dark" class="relative isolate overflow-hidden bg-slateNavy py-24 text-pureWhite tablet:py-32">
    <div aria-hidden="true" class="op-rules--dark pointer-events-none absolute inset-0 -z-10" />
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10" style="background: radial-gradient(ellipse 50% 60% at 85% 30%, rgba(251,186,0,0.12), transparent 70%), linear-gradient(180deg, #033C59 0%, #022436 100%)" />

    <BaseContainer>
      <OpenTag :n="4" label="Ready-to-develop framework" surface="dark" />

      <div class="mt-14 grid items-start gap-14 desktop:grid-cols-12 desktop:gap-10">
        <div class="desktop:col-span-5">
          <OpenHeading :lines="framework.title" surface="dark" size="lg" :lede="framework.intro" />
          <p class="m-center mt-5 max-w-[30rem] text-[16px] leading-[1.65] text-[color:rgba(255,255,255,0.72)]">{{ framework.after }}</p>
          <p class="m-center mx-auto w-fit border-t-[3px] border-pastiYellow-500 pt-4 desktop:mx-0 desktop:w-auto desktop:border-l-[3px] desktop:border-t-0 desktop:pt-0 desktop:pl-5 mt-10 font-display text-[length:clamp(24px,2.4vw,34px)] font-extrabold leading-[1.1] tracking-[-0.025em]">{{ framework.notBlank }}</p>
        </div>

        <!-- Foundation board -->
        <div ref="boardRef" class="desktop:col-span-6 desktop:col-start-7" :class="{ 'is-in': boardIn }">
          <div class="rounded-[24px] border border-[color:rgba(255,255,255,0.14)] bg-[color:rgba(255,255,255,0.03)] p-3 tablet:p-4">
            <div class="flex items-center justify-between px-2 pb-3 pt-1">
              <span class="flex items-center gap-2 font-display text-[14px] font-extrabold"><OpenMark :size="18" />OPEN Framework</span>
              <span class="text-[12px] text-[color:rgba(255,255,255,0.5)]">Functional foundation</span>
            </div>
            <ul class="grid grid-cols-2 gap-2 tablet:grid-cols-3 tablet:gap-2.5">
              <li
                v-for="(f, i) in framework.foundation"
                :key="f"
                class="op-pop flex min-h-[92px] flex-col justify-between rounded-[14px] border border-[color:rgba(255,255,255,0.1)] bg-[color:rgba(255,255,255,0.06)] p-4 tablet:min-h-[112px]"
                :class="i === framework.foundation.length - 1 ? '!bg-pastiYellow-500 !border-pastiYellow-500 text-slateNavy' : ''"
                :style="{ '--d': `${i * 70}ms` }"
              >
                <span class="flex gap-1" aria-hidden="true">
                  <span class="h-1.5 w-1.5 rounded-full" :class="i === framework.foundation.length - 1 ? 'bg-slateNavy' : 'bg-pastiYellow-500'" />
                  <span class="h-1.5 w-4 rounded-full" :class="i === framework.foundation.length - 1 ? 'bg-[color:rgba(3,60,89,0.3)]' : 'bg-[color:rgba(255,255,255,0.18)]'" />
                </span>
                <span class="font-display text-[15px] font-bold leading-tight tracking-[-0.01em] tablet:text-[16px]">{{ f }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Framework → business → system -->
      <div ref="layersRef" class="mt-20 desktop:mt-28" :class="{ 'is-in': layersIn }">
        <div class="m-center flex flex-col gap-3 desktop:flex-row desktop:items-end desktop:justify-between">
          <p class="font-display text-[length:clamp(22px,2.2vw,30px)] font-extrabold tracking-[-0.02em]">From framework to your system.</p>
          <p class="font-display text-[16px] font-bold text-[color:rgba(255,255,255,0.6)]">{{ framework.tagline.join(' ') }}</p>
        </div>
        <ol class="mt-8 grid gap-3 desktop:grid-cols-[1fr_auto_1.35fr_auto_1fr] desktop:items-stretch desktop:gap-4">
          <li class="op-fade rounded-[20px] border border-[color:rgba(255,255,255,0.18)] p-6" style="--d: 0ms">
            <p class="font-display text-[20px] font-extrabold">{{ layers[0].label }}</p>
            <p class="mt-3 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.7)]">{{ layers[0].body }}</p>
          </li>
          <li aria-hidden="true" class="op-fade grid place-items-center text-pastiYellow-500" style="--d: 150ms">
            <svg viewBox="0 0 24 24" class="h-6 w-6 rotate-90 desktop:rotate-0" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M14 6l6 6-6 6" /></svg>
          </li>
          <li class="op-fade rounded-[20px] border border-dashed border-[color:rgba(255,255,255,0.3)] p-6" style="--d: 250ms">
            <p class="font-display text-[20px] font-extrabold">{{ layers[1].label }}</p>
            <p class="mt-3 text-[15px] leading-relaxed text-[color:rgba(255,255,255,0.7)]">{{ layers[1].body }}</p>
            <ul class="mt-5 flex flex-wrap gap-2" aria-label="Customization">
              <li v-for="a in framework.adaptedBy" :key="a" class="rounded-full border border-[color:rgba(255,255,255,0.2)] px-3 py-1 text-[13px] font-semibold">{{ a }}</li>
            </ul>
          </li>
          <li aria-hidden="true" class="op-fade grid place-items-center text-pastiYellow-500" style="--d: 400ms">
            <svg viewBox="0 0 24 24" class="h-6 w-6 rotate-90 desktop:rotate-0" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M14 6l6 6-6 6" /></svg>
          </li>
          <li class="op-fade rounded-[20px] bg-pastiYellow-500 p-6 text-slateNavy" style="--d: 500ms">
            <p class="font-display text-[20px] font-extrabold">{{ layers[2].label }}</p>
            <p class="mt-3 text-[15px] font-medium leading-relaxed text-[color:rgba(3,60,89,0.85)]">{{ layers[2].body }}</p>
          </li>
        </ol>
      </div>
    </BaseContainer>
  </section>
</template>
