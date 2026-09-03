<script setup lang="ts">
import { buildWorkMascot } from '~/composables/doodle/buildWorkMascot'

const rootRef = ref<HTMLElement | null>(null)
useHeroDoodle(rootRef)
</script>

<template>
  <DoodleScene :build="buildWorkMascot">
    <div ref="rootRef" class="w-full origin-bottom" style="will-change: transform">
      <svg viewBox="0 0 240 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-auto w-full">
        <ellipse cx="120" cy="205" rx="70" ry="9" fill="#0B3954" fill-opacity="0.08" />

        <!-- desk -->
        <rect x="30" y="150" width="180" height="10" rx="5" fill="#0B3954" />
        <rect x="46" y="160" width="10" height="34" rx="4" fill="#0B3954" />
        <rect x="184" y="160" width="10" height="34" rx="4" fill="#0B3954" />

        <!-- monitor -->
        <rect x="78" y="96" width="84" height="58" rx="8" fill="#0B3954" />
        <rect x="86" y="104" width="68" height="42" rx="4" fill="#EAF1F4" />
        <rect x="94" y="112" width="30" height="6" rx="3" fill="#FBBA00" />
        <rect x="94" y="124" width="46" height="5" rx="2.5" fill="#9FC1CF" />
        <rect x="94" y="133" width="36" height="5" rx="2.5" fill="#9FC1CF" />
        <rect x="112" y="154" width="16" height="10" fill="#0B3954" />
        <rect x="98" y="163" width="44" height="6" rx="3" fill="#0B3954" />

        <!-- character body -->
        <g>
          <ellipse cx="120" cy="118" rx="26" ry="24" fill="#FBBA00" />
          <circle cx="111" cy="114" r="4" fill="#0B3954" />
          <circle cx="129" cy="114" r="4" fill="#0B3954" />
          <path d="M110 126q10 8 20 0" stroke="#0B3954" stroke-width="3" stroke-linecap="round" fill="none" />

          <!-- arms on keyboard -->
          <path d="M96 132q-14 6 -16 20" stroke="#523B00" stroke-width="7" stroke-linecap="round" fill="none" />
          <path d="M144 132q14 6 16 20" stroke="#523B00" stroke-width="7" stroke-linecap="round" fill="none" />
        </g>

        <!-- keyboard -->
        <rect x="76" y="150" width="88" height="10" rx="4" fill="#1C5E7C" />
      </svg>
    </div>
  </DoodleScene>
</template>
