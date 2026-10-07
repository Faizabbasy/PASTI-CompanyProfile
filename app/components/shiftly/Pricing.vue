<script setup lang="ts">
// PRICING — "Flexible plans for growing teams and enterprises." No prices:
// the deck's figures live in useShiftly().commercial with publicationStatus
// 'needs_approval' and are intentionally NOT rendered until the owner
// approves them. Both plans lead to a pricing request instead.
const { pricing } = useShiftly()
const scrollTo = useShiftlyScroll()
const { link: whatsappLink } = useWhatsapp()
</script>

<template>
  <section id="pricing" class="surface-light relative overflow-hidden py-24 tablet:py-32" style="--lift-x: 20%; --lift-y: 30%">
    <BaseGridLines tone="light" />
    <BaseContainer class="relative z-10">
      <BaseSectionMark surface="light" label="Pricing" meta="On request" />
      <div class="mt-14 desktop:mt-20">
        <ShiftlyHeading :eyebrow="pricing.eyebrow" :title="pricing.headline" />
      </div>
      <div class="mt-12 grid gap-4 desktop:grid-cols-2">
        <article
          v-for="(p, i) in pricing.plans"
          :key="p.name"
          class="flex flex-col rounded-[24px] p-7 tablet:p-10"
          :class="i === 0 ? 'bg-pureWhite text-slateNavy ring-1 ring-[color:rgba(3,60,89,0.12)]' : 'bg-slateNavy text-pureWhite'"
        >
          <p class="font-mono text-[10px] uppercase tracking-[0.18em]" :class="i === 0 ? 'text-[color:rgba(3,60,89,0.55)]' : 'text-pastiYellow-500'">{{ i === 0 ? 'Subscription' : 'Add-on services' }}</p>
          <h3 class="mt-3 font-display text-[clamp(26px,2.4vw,34px)] font-extrabold tracking-[-0.02em]" :class="i === 0 ? 'text-slateNavy' : 'text-pureWhite'">{{ p.name }}</h3>
          <p class="mt-3 text-[15px] leading-relaxed" :class="i === 0 ? 'text-[color:rgba(3,60,89,0.72)]' : 'text-[color:rgba(255,255,255,0.75)]'">{{ p.body }}</p>
          <ul class="mt-6 flex-1 space-y-2.5 border-t pt-6" :class="i === 0 ? 'border-[color:rgba(3,60,89,0.12)]' : 'border-[color:rgba(255,255,255,0.14)]'">
            <li v-for="pt in p.points" :key="pt" class="flex items-center gap-3 text-[15px] font-semibold">
              <span class="grid h-5 w-5 place-items-center rounded-full bg-pastiYellow-500 text-slateNavy"><ShiftlyIcon :name="i === 0 ? 'check' : 'plus'" class="h-3 w-3" /></span>{{ pt }}
            </li>
          </ul>
          <button
            type="button"
            class="mt-8 inline-flex h-12 items-center justify-center gap-2 self-start rounded-full px-6 font-display text-[15px] font-bold transition-transform duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            :class="i === 0 ? 'bg-slateNavy text-pureWhite focus-visible:outline-slateNavy' : 'bg-pastiYellow-500 text-slateNavy focus-visible:outline-pastiYellow-500'"
            @click="scrollTo('demo')"
          >
            Request Pricing <span aria-hidden="true">→</span>
          </button>
        </article>
      </div>
      <p class="m-center mt-8 text-[15px] text-[color:rgba(3,60,89,0.72)]">
        Prefer to talk it through?
        <a :href="whatsappLink" target="_blank" rel="noopener noreferrer" class="font-bold text-slateNavy underline decoration-pastiYellow-500 decoration-2 underline-offset-4">Talk to our team</a>
      </p>
    </BaseContainer>
  </section>
</template>
