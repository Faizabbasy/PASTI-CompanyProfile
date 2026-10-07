<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

// OWNER-DIRECTED ADDITION (2026-10-01) — "Why Choose Us" / Delivery Console.
// Approved exception to docs/rework-v2 (flagged, not silently resolved): the
// locked homepage sequence (04-homepage-spec.md) removed WhyPasti; the owner
// asked for this section back, placed after Who We Are and before Trusted.
//
// Concept: the timeline IS the argument for "fast work". A sprint board whose
// lanes are PASTI's own method (useAbout().method) runs as you scroll: the
// Signal — a PASTI Yellow playhead — sweeps the weeks, bars fill and count,
// finished steps flip to Slate Navy, and the four COMPRO standards on the left
// light up in step. The playhead is also draggable (and the grid tappable) so
// the visitor can scrub it by hand. The sprint is illustrative, not a client
// project or a delivery-time claim; no invented people (role dots T / C stand
// in for the reference's avatars).
//
// Desktop (motion on): short pin (+150%), scroll scrubs the playhead; dragging
// converts to a scroll position so drag and scroll never fight. Below desktop:
// no pin — the board autoplays once on entry, then stays draggable. Reduced
// motion: final state, static (drag still works, without tweening).
// Yellow: accents / Signal only — never yellow text on white.
const { eyebrow, heading, body, reasons, lanes, weeks, board } = useWhyChooseUs()
const { setState } = useCustomCursor()

const afterWords = heading.after.split(' ')
const pad = (n: number) => String(n).padStart(2, '0')
const weekLabels = Array.from({ length: weeks }, (_, i) => `W${pad(i + 1)}`)

/** Pill anchoring: late steps align to their end so they never leave the board. */
function pillStyle(lane: (typeof lanes)[number]) {
  const end = lane.start + lane.length
  return end > weeks * 0.66
    ? { right: `${((weeks - end) / weeks) * 100}%` }
    : { left: `${(lane.start / weeks) * 100}%` }
}
function trackStyle(lane: (typeof lanes)[number]) {
  return { left: `${(lane.start / weeks) * 100}%`, width: `${(lane.length / weeks) * 100}%` }
}
function span(lane: (typeof lanes)[number]) {
  return `W${pad(Math.floor(lane.start) + 1)} – W${pad(Math.ceil(lane.start + lane.length))}`
}

const sectionRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const copyRef = ref<HTMLElement | null>(null)
const boardRef = ref<HTMLElement | null>(null)
const lanesRef = ref<HTMLElement | null>(null)
const playheadRef = ref<HTMLElement | null>(null)
const knobRef = ref<HTMLElement | null>(null)
const readoutRef = ref<HTMLElement | null>(null)
const doneCountRef = ref<HTMLElement | null>(null)
const progCountRef = ref<HTMLElement | null>(null)
const stampRef = ref<HTMLElement | null>(null)
const laneRefs = ref<HTMLElement[]>([])
const reasonRefs = ref<HTMLElement[]>([])
const hovered = ref<number | null>(null)

const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v))

useGsapContext(() => {
  const section = sectionRef.value
  const stage = stageRef.value
  const boardEl = boardRef.value
  const lanesEl = lanesRef.value
  const playhead = playheadRef.value
  const knob = knobRef.value
  if (!section || !stage || !boardEl || !lanesEl || !playhead || !knob) return

  const laneEls = laneRefs.value
  const parts = laneEls.map((el) => ({
    el,
    fill: el.querySelector<HTMLElement>('[data-pill-fill]')!,
    track: el.querySelector<HTMLElement>('[data-track-fill]')!,
    pct: el.querySelector<HTMLElement>('[data-pct]')!
  }))

  // --- One render for every input (scroll, drag, autoplay, static) ---
  const state = { t: 0 }
  let finished = false
  const render = () => {
    const t = state.t
    const w = t * weeks
    playhead.style.left = `${t * 100}%`

    // Keep the readout chip inside the board at both ends.
    const laneW = lanesEl.clientWidth
    const kw = knob.offsetWidth
    const x = t * laneW
    const shift = clamp(-x, laneW - x - kw, -kw / 2)
    knob.style.transform = `translateX(${shift}px)`
    const week = clamp(1, weeks, Math.ceil(w) || 1)
    if (readoutRef.value) readoutRef.value.textContent = `Week ${pad(week)} / ${weeks}`
    knob.setAttribute('aria-valuenow', String(week))

    let done = 0
    let active = 0
    parts.forEach((p, i) => {
      const lane = lanes[i]!
      const prog = clamp(0, 1, (w - lane.start) / lane.length)
      p.fill.style.transform = `scaleX(${prog})`
      p.track.style.transform = `scaleX(${prog})`
      const s = prog <= 0 ? 'idle' : prog < 1 ? 'active' : lane.ongoing ? 'live' : 'done'
      if (p.el.dataset.state !== s) p.el.dataset.state = s
      p.pct.textContent = s === 'live' ? 'Ongoing' : `${Math.round(prog * 100)}%`
      if (s === 'done') done++
      else if (s !== 'idle') active++
    })
    if (doneCountRef.value) doneCountRef.value.textContent = String(done)
    if (progCountRef.value) progCountRef.value.textContent = String(active)

    reasonRefs.value.forEach((el, i) => {
      const on = String(t >= [0.12, 0.38, 0.64, 0.9][i]!)
      if (el.dataset.on !== on) el.dataset.on = on
    })

    const end = t >= 0.985
    if (end !== finished) {
      finished = end
      boardEl.dataset.finished = String(end)
      if (stampRef.value) {
        gsap.to(stampRef.value, end
          ? { autoAlpha: 1, scale: 1, rotation: -8, duration: motionTier.standardMax, ease: approvedEase.gsapCinematic, overwrite: true }
          : { autoAlpha: 0, scale: 1.3, rotation: -14, duration: motionTier.standardMin, ease: approvedEase.gsapStandard, overwrite: true })
      }
    }
  }

  const tFromPointer = (clientX: number) => {
    const r = lanesEl.getBoundingClientRect()
    return clamp(0, 1, (clientX - r.left) / r.width)
  }

  // Default driver: tween state.t (mobile / tablet / reduced motion).
  let seek = (t: number) => {
    gsap.to(state, { t, duration: motionTier.standardMax, ease: approvedEase.gsapStandard, overwrite: true, onUpdate: render })
  }

  const mm = gsap.matchMedia()

  // Reduced motion: final state, static; drag / tap set it directly.
  mm.add(reducedMotionQuery.reduce, () => {
    state.t = 1
    render()
    seek = (t: number) => {
      state.t = t
      render()
    }
  })

  mm.add(reducedMotionQuery.noPreference, () => {
    // Entrance: heading words mask up, marker wipes, copy fades, board lanes
    // slide in from the left (all widths).
    const words = headingRef.value?.querySelectorAll<HTMLElement>('[data-word]') ?? []
    const marker = headingRef.value?.querySelector<HTMLElement>('[data-marker]')
    const items = copyRef.value?.querySelectorAll<HTMLElement>('[data-copy-item]') ?? []
    const rules = boardEl.querySelectorAll<HTMLElement>('[data-rule]')
    const pills = boardEl.querySelectorAll<HTMLElement>('[data-pill]')
    gsap.set(words, { yPercent: 110 })
    if (marker) gsap.set(marker, { scaleX: 0 })
    gsap.set(items, { autoAlpha: 0, y: 16 })
    gsap.set(rules, { scaleY: 0 })
    gsap.set(pills, { autoAlpha: 0, x: -28 })
    render()
    const intro = gsap.timeline({
      defaults: { ease: approvedEase.gsapStandard },
      scrollTrigger: { trigger: section, start: 'top 72%', once: true }
    })
    intro.to(words, { yPercent: 0, duration: motionTier.cinematicMin, stagger: 0.06 }, 0)
    if (marker) intro.to(marker, { scaleX: 1, duration: motionTier.standardMax, ease: approvedEase.gsapCinematic }, 0.25)
    intro.to(items, { autoAlpha: 1, y: 0, duration: motionTier.standardMax, stagger: 0.07 }, 0.2)
    intro.to(rules, { scaleY: 1, duration: motionTier.cinematicMin, stagger: 0.03, ease: approvedEase.gsapCinematic }, 0.15)
    intro.to(pills, { autoAlpha: 1, x: 0, duration: motionTier.standardMax, stagger: 0.08, ease: approvedEase.gsapCinematic }, 0.35)
    return () => intro.kill()
  })

  // Desktop: short pin, scroll scrubs the playhead.
  mm.add(`${reducedMotionQuery.noPreference} and ${breakpointQuery.desktopUp}`, () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=150%',
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      onUpdate: render,
      defaults: { ease: 'none' }
    })
    // Hold a beat at both ends so "Week 01" and "Delivered" each register.
    tl.to(state, { t: 1, duration: 84 }, 8).to({}, { duration: 8 })
    const st = tl.scrollTrigger!
    const prevSeek = seek
    seek = (t: number) => {
      const p = (8 + t * 84) / 100
      scrollToImmediate(`y:${Math.round(st.start + (st.end - st.start) * p)}`)
    }
    return () => {
      seek = prevSeek
      st.kill()
      tl.kill()
    }
  })

  // Below desktop: autoplay once when the board comes into view.
  mm.add(`${reducedMotionQuery.noPreference} and (max-width: 1023.98px)`, () => {
    const play = gsap.to(state, {
      t: 1,
      duration: 4.2,
      ease: approvedEase.gsapStandard,
      onUpdate: render,
      scrollTrigger: { trigger: boardEl, start: 'top 70%', once: true }
    })
    return () => {
      play.scrollTrigger?.kill()
      play.kill()
    }
  })

  // --- Drag the playhead / tap the grid ---
  let dragging = false
  const onDown = (e: PointerEvent) => {
    dragging = true
    knob.setPointerCapture(e.pointerId)
    boardEl.classList.add('wcu-dragging')
    e.preventDefault()
  }
  const onMove = (e: PointerEvent) => {
    if (dragging) seek(tFromPointer(e.clientX))
  }
  const onUp = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    if (knob.hasPointerCapture(e.pointerId)) knob.releasePointerCapture(e.pointerId)
    boardEl.classList.remove('wcu-dragging')
  }
  const onTap = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-knob]')) return
    seek(tFromPointer(e.clientX))
  }
  const onKey = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    seek(clamp(0, 1, (Math.round(state.t * weeks) + step) / weeks))
  }
  knob.addEventListener('pointerdown', onDown)
  knob.addEventListener('pointermove', onMove)
  knob.addEventListener('pointerup', onUp)
  knob.addEventListener('pointercancel', onUp)
  knob.addEventListener('keydown', onKey)
  lanesEl.addEventListener('click', onTap)

  const onResize = () => render()
  window.addEventListener('resize', onResize)

  return () => {
    mm.revert()
    knob.removeEventListener('pointerdown', onDown)
    knob.removeEventListener('pointermove', onMove)
    knob.removeEventListener('pointerup', onUp)
    knob.removeEventListener('pointercancel', onUp)
    knob.removeEventListener('keydown', onKey)
    lanesEl.removeEventListener('click', onTap)
    window.removeEventListener('resize', onResize)
  }
})
</script>

<template>
  <section ref="sectionRef" class="surface-light relative overflow-hidden" style="--lift-x: 85%; --lift-y: 20%">
    <BaseGridLines tone="light" />
    <div ref="stageRef" class="relative py-24 tablet:py-28 desktop:flex desktop:h-[100svh] desktop:min-h-[680px] desktop:items-center desktop:pb-[4svh] desktop:pt-[12svh]">
      <BaseContainer class="relative z-10 w-full">
        <BaseSectionMark surface="light" label="Why Choose Us" meta="05 / 11" />

        <div class="mt-12 grid gap-12 desktop:mt-[5svh] desktop:grid-cols-12 desktop:items-center desktop:gap-10">
          <!-- Copy -->
          <div ref="copyRef" class="m-center desktop:col-span-5">
            <p data-copy-item class="m-center-row flex items-center gap-3 font-display text-token-metadata font-semibold uppercase tracking-[0.16em] text-[color:rgba(3,60,89,0.6)]">
              <span class="h-px w-8 bg-cobalt" />{{ eyebrow }}
            </p>

            <h2 ref="headingRef" class="relative isolate mt-6 font-display text-[length:clamp(44px,5.4vw,88px)] font-extrabold leading-[0.95] tracking-[-0.045em] text-slateNavy">
              <span class="relative inline-block">
                <span data-marker aria-hidden="true" class="absolute -inset-x-[0.06em] bottom-[0.08em] -z-10 h-[0.4em] origin-left rounded-[4px] bg-pastiYellow-500" />
                <span class="wcu-mask"><span data-word class="inline-block">{{ heading.highlight }}</span></span>
              </span>{{ ' ' }}
              <template v-for="(w, i) in afterWords" :key="`a-${i}`"><span class="wcu-mask"><span data-word class="inline-block">{{ w.replace(/\.$/, '') }}<span v-if="w.endsWith('.')" class="text-pastiYellow-500">.</span></span></span>{{ ' ' }}</template>
            </h2>

            <p data-copy-item class="mt-7 max-w-[44ch] text-token-body-large text-[color:rgba(3,60,89,0.72)]">{{ body }}</p>

            <!-- Reasons: light up as the playhead passes their quarter. -->
            <ol class="mt-10 grid grid-cols-1 border-t border-[color:rgba(3,60,89,0.14)] tablet:grid-cols-2">
              <li
                v-for="(r, i) in reasons"
                :key="r"
                :ref="(el) => { if (el) reasonRefs[i] = el as HTMLElement }"
                data-copy-item
                data-on="false"
                class="wcu-reason m-center-row flex items-center gap-3 border-b border-[color:rgba(3,60,89,0.14)] py-4 tablet:[&:nth-child(odd)]:pr-6"
              >
                <span class="wcu-reason-dot h-2.5 w-2.5 shrink-0 rounded-full" />
                <span class="font-mono text-[10px] tracking-[0.14em] text-[color:rgba(3,60,89,0.45)]">{{ pad(i + 1) }}</span>
                <span class="wcu-reason-label font-display text-[15px] font-semibold">{{ r }}</span>
              </li>
            </ol>
          </div>

          <!-- Delivery console -->
          <div class="desktop:col-span-7">
            <div
              ref="boardRef"
              data-finished="false"
              class="wcu-board relative rounded-[24px] border border-[color:rgba(3,60,89,0.1)] bg-[color:rgba(255,255,255,0.82)] p-4 shadow-[0_50px_100px_-50px_rgba(3,60,89,0.45)] backdrop-blur-sm tablet:rounded-[28px] tablet:p-7"
            >
              <!-- Header: title + legend -->
              <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <div class="flex items-center gap-3">
                  <LayoutBrandMark surface="light" :height="12" />
                  <span aria-hidden="true" class="h-3.5 w-px bg-[color:rgba(3,60,89,0.2)]" />
                  <p class="font-display text-[17px] font-bold tracking-[-0.01em] text-slateNavy tablet:text-[20px]">{{ board.title }}</p>
                </div>
                <div class="flex items-center gap-4 font-display text-[12px] font-medium text-[color:rgba(3,60,89,0.75)]">
                  <span class="inline-flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-slateNavy" />{{ board.done }} <b ref="doneCountRef" class="tabular-nums text-slateNavy">0</b></span>
                  <span class="inline-flex items-center gap-2"><span class="h-3 w-3 rounded-full border-2 border-pastiYellow-500" />{{ board.progress }} <b ref="progCountRef" class="tabular-nums text-slateNavy">0</b></span>
                </div>
              </div>

              <!-- Week ruler -->
              <div class="mt-6 grid font-mono text-[10px] tracking-[0.08em] text-[color:rgba(3,60,89,0.4)]" :style="{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }">
                <span v-for="(wl, i) in weekLabels" :key="wl" class="text-center" :class="i % 2 ? 'invisible tablet:visible' : ''">{{ wl }}</span>
              </div>

              <!-- Lanes + playhead -->
              <div ref="lanesRef" class="wcu-lanes relative mt-12 cursor-pointer touch-pan-y select-none" @mouseleave="hovered = null">
                <!-- Week rules -->
                <div aria-hidden="true" class="pointer-events-none absolute -top-12 bottom-0 inset-x-0 flex justify-between">
                  <span v-for="n in weeks + 1" :key="n" data-rule class="w-px origin-top bg-[repeating-linear-gradient(180deg,rgba(3,60,89,0.13)_0_4px,transparent_4px_9px)]" />
                </div>

                <div
                  v-for="(lane, i) in lanes"
                  :key="lane.label"
                  :ref="(el) => { if (el) laneRefs[i] = el as HTMLElement }"
                  data-state="idle"
                  class="wcu-lane relative h-[62px] transition-opacity duration-300 tablet:h-[70px]"
                  :class="hovered !== null && hovered !== i ? 'opacity-40' : ''"
                  @mouseenter="hovered = i"
                >
                  <!-- Exact week span under the pill -->
                  <span aria-hidden="true" class="absolute bottom-2 h-[3px] overflow-hidden rounded-full bg-[color:rgba(3,60,89,0.1)]" :style="trackStyle(lane)">
                    <span data-track-fill class="absolute inset-0 origin-left scale-x-0 rounded-full bg-pastiYellow-500" />
                  </span>
                  <span
                    aria-hidden="true"
                    class="pointer-events-none absolute -bottom-2.5 font-mono text-[9px] tracking-[0.12em] text-[color:rgba(3,60,89,0.55)] transition-opacity duration-300"
                    :class="hovered === i ? 'opacity-100' : 'opacity-0'"
                    :style="trackStyle(lane)"
                  >{{ span(lane) }}</span>

                  <!-- Step pill -->
                  <div
                    data-pill
                    class="wcu-pill absolute top-1 flex h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full py-1 pl-1 pr-3 transition-[transform,box-shadow,background-color,color,border-color] duration-500 ease-editorial tablet:h-11 tablet:gap-2.5 tablet:pr-1.5"
                    :class="hovered === i ? '-translate-y-1' : ''"
                    :style="pillStyle(lane)"
                  >
                    <span data-pill-fill aria-hidden="true" class="wcu-pill-fill absolute inset-0 origin-left scale-x-0" />
                    <span data-pct class="wcu-pct relative min-w-[46px] rounded-full px-2 py-1 text-center font-mono text-[11px] font-semibold tabular-nums">0%</span>
                    <span class="relative font-display text-[13px] font-semibold tablet:text-[14px]">{{ lane.label }}</span>
                    <span class="wcu-check relative hidden h-5 w-5 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy">
                      <svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                    </span>
                    <span class="relative hidden items-center tablet:flex">
                      <span
                        v-for="(role, ri) in lane.roles"
                        :key="role"
                        class="wcu-role grid h-8 w-8 place-items-center rounded-full border-2 font-display text-[11px] font-bold"
                        :class="[role === 'T' ? 'wcu-role--t' : 'wcu-role--c', ri ? '-ml-2.5' : '']"
                        :title="role === 'T' ? 'Technology' : 'Creative'"
                      >{{ role }}</span>
                    </span>
                  </div>
                </div>

                <!-- Playhead (the Signal) -->
                <div ref="playheadRef" class="pointer-events-none absolute -top-12 bottom-0 left-0 z-20">
                  <span aria-hidden="true" class="absolute bottom-0 left-0 top-6 w-[2px] -translate-x-1/2 bg-pastiYellow-500 shadow-[0_0_14px_rgba(251,186,0,0.7)]" />
                  <span aria-hidden="true" class="absolute -bottom-1.5 left-0 h-3 w-3 -translate-x-1/2 rounded-full bg-pastiYellow-500 ring-4 ring-[color:rgba(251,186,0,0.22)]" />
                  <button
                    ref="knobRef"
                    data-knob
                    type="button"
                    role="slider"
                    :aria-valuemin="1"
                    :aria-valuemax="weeks"
                    aria-label="Timeline week — drag or use arrow keys"
                    class="wcu-knob pointer-events-auto absolute left-0 top-0 inline-flex h-11 cursor-grab touch-none items-center gap-2 whitespace-nowrap rounded-full bg-slateNavy pl-2 pr-3.5 font-display text-[12px] font-bold text-pureWhite shadow-[0_14px_30px_-12px_rgba(3,60,89,0.8)] active:cursor-grabbing"
                    @mouseenter="setState('view', 'Drag')"
                    @mouseleave="setState('default')"
                  >
                    <span class="grid h-7 w-7 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy">
                      <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4L1.5 8 5 12M11 4l3.5 4L11 12" /></svg>
                    </span>
                    <span ref="readoutRef" class="tabular-nums">Week 01 / {{ weeks }}</span>
                  </button>
                </div>
              </div>

              <!-- Finish stamp -->
              <span
                ref="stampRef"
                aria-hidden="true"
                class="pointer-events-none invisible absolute -bottom-5 left-4 z-30 inline-flex scale-[1.3] items-center gap-2 rounded-full border-2 border-slateNavy bg-pastiYellow-500 px-4 py-1.5 font-display text-[15px] font-extrabold uppercase tracking-[0.06em] text-slateNavy opacity-0 shadow-[0_18px_40px_-18px_rgba(3,60,89,0.6)] tablet:bottom-7 tablet:left-7"
              >
                <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                {{ board.finish }}.
              </span>
            </div>
            <p class="mt-9 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[color:rgba(3,60,89,0.45)] tablet:mt-4 desktop:text-right">
              <span class="desktop:hidden">Drag the playhead · tap a week</span>
              <span class="hidden desktop:inline">Scroll or drag the playhead</span>
            </p>
          </div>
        </div>
      </BaseContainer>
    </div>
  </section>
</template>

<style scoped>
.wcu-mask {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  margin: -0.2em;
  padding: 0.2em;
}

/* Reasons */
.wcu-reason-dot {
  background: transparent;
  box-shadow: inset 0 0 0 1.5px rgba(3, 60, 89, 0.3);
  transition: background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.wcu-reason-label {
  color: rgba(3, 60, 89, 0.4);
  transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.wcu-reason[data-on='true'] .wcu-reason-dot {
  background: #fbba00;
  box-shadow: 0 0 0 5px rgba(251, 186, 0, 0.18);
}
.wcu-reason[data-on='true'] .wcu-reason-label {
  color: #033c59;
}

/* Pills by state: idle → active (yellow-tinted fill) → done (Slate Navy) / live */
.wcu-pill {
  color: #033c59;
  background: #fff;
  border: 1px solid rgba(3, 60, 89, 0.12);
  box-shadow: 0 16px 34px -20px rgba(3, 60, 89, 0.45);
}
.wcu-pill-fill {
  background: linear-gradient(90deg, rgba(251, 186, 0, 0.1), rgba(251, 186, 0, 0.28));
}
.wcu-pct {
  background: rgba(3, 60, 89, 0.07);
  color: #033c59;
}
.wcu-lane[data-state='idle'] .wcu-pill {
  opacity: 0.55;
  box-shadow: none;
}
.wcu-lane[data-state='done'] .wcu-pill {
  color: #fff;
  background: #033c59;
  border-color: #033c59;
  box-shadow: 0 20px 40px -18px rgba(3, 60, 89, 0.75);
}
.wcu-lane[data-state='done'] .wcu-pill-fill {
  opacity: 0;
}
.wcu-lane[data-state='done'] .wcu-pct {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}
.wcu-lane[data-state='done'] .wcu-check {
  display: grid;
}
.wcu-lane[data-state='live'] .wcu-pill {
  border-color: #fbba00;
}
.wcu-lane[data-state='live'] .wcu-pct {
  background: #fbba00;
}

.wcu-role {
  border-color: #fff;
}
.wcu-role--t {
  background: #033c59;
  color: #fff;
}
.wcu-role--c {
  background: #fbba00;
  color: #033c59;
}
.wcu-lane[data-state='done'] .wcu-role {
  border-color: #033c59;
}
.wcu-lane[data-state='done'] .wcu-role--t {
  background: #fff;
  color: #033c59;
}

.wcu-board[data-finished='true'] .wcu-knob {
  background: #fbba00;
  color: #033c59;
}
.wcu-board[data-finished='true'] .wcu-knob > span:first-child {
  background: #033c59;
  color: #fbba00;
}
.wcu-dragging {
  cursor: grabbing;
}
</style>
