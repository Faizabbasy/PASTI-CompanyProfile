<script setup lang="ts">
// Line illustrations for What We Build's capability cards — one distinct
// drawing per capability, so the cards differ by content rather than by
// size alone. Precision Framing, not HUD decoration (00-brand-guide.md §08):
// each drawing states what the capability IS (a route of stacked blocks, a
// structured network, a device layout, a crop frame).
//
// Every stroke carries `data-stroke`; the single Cobalt accent stroke per
// drawing carries `data-accent`. The parent draws them on (stroke-dashoffset,
// after setting pathLength=1) — with no JS the drawings simply render
// complete, which is also the reduced-motion / mobile static state.
defineProps<{
  kind: 'technology' | 'enterprise' | 'mobile' | 'creative'
}>()
</script>

<template>
  <svg
    viewBox="0 0 240 140"
    fill="none"
    stroke="currentColor"
    stroke-width="1.25"
    stroke-linecap="square"
    stroke-linejoin="miter"
    aria-hidden="true"
    focusable="false"
    class="block h-full w-full"
    data-art
  >
    <!-- Technology: blocks ascending along an execution route -->
    <template v-if="kind === 'technology'">
      <path data-stroke d="M12 118H228" opacity="0.45" />
      <path data-stroke d="M20 118V106H60V118" />
      <path data-stroke d="M68 118V90H108V118" />
      <path data-stroke d="M116 118V74H156V118" />
      <path data-stroke d="M164 118V58H204V118" />
      <path data-accent d="M20 98L88 82L136 66L184 50L226 22" stroke="#033C59" stroke-width="1.75" />
      <path data-accent d="M212 22H226V36" stroke="#033C59" stroke-width="1.75" />
    </template>

    <!-- Enterprise: structured network, orthogonal links, shared bus -->
    <template v-else-if="kind === 'enterprise'">
      <rect data-stroke x="104" y="14" width="32" height="20" />
      <path data-stroke d="M120 34V54M52 54H188M52 54V72M120 54V72M188 54V72" />
      <rect data-stroke x="32" y="72" width="40" height="24" />
      <rect data-accent x="100" y="72" width="40" height="24" stroke="#033C59" stroke-width="1.75" />
      <rect data-stroke x="168" y="72" width="40" height="24" />
      <path data-stroke d="M52 96V116M120 96V116M188 96V116" />
      <path data-stroke d="M20 116H220" opacity="0.6" />
    </template>

    <!-- Mobile: device outline with a layout inside, side crop guides -->
    <template v-else-if="kind === 'mobile'">
      <rect data-stroke x="88" y="8" width="64" height="124" rx="8" />
      <path data-stroke d="M112 16H128" opacity="0.6" />
      <rect data-stroke x="96" y="26" width="48" height="10" />
      <rect data-accent x="96" y="42" width="48" height="40" stroke="#033C59" stroke-width="1.75" />
      <path data-stroke d="M96 92H144M96 100H128M96 108H136" />
      <path data-stroke d="M112 124H128" opacity="0.6" />
      <path data-stroke d="M28 70H76M164 70H212" opacity="0.45" />
      <path data-stroke d="M28 62V78M212 62V78" opacity="0.45" />
    </template>

    <!-- Creative: crop marks around a frame, form + type inside -->
    <template v-else>
      <path data-stroke d="M22 36V22H36M204 22H218V36M218 104V118H204M36 118H22V104" opacity="0.7" />
      <rect data-stroke x="42" y="38" width="156" height="64" />
      <circle data-accent cx="94" cy="70" r="20" stroke="#033C59" stroke-width="1.75" />
      <path data-stroke d="M132 92L172 48" />
      <path data-stroke d="M132 60H160M132 70H150" opacity="0.6" />
    </template>
  </svg>
</template>
