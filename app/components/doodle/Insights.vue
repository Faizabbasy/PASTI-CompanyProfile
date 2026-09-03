<script setup lang="ts">
import { buildInsightsMascot } from '~/composables/doodle/buildInsightsMascot'

const rootRef = ref<HTMLElement | null>(null)
useHeroDoodle(rootRef)
</script>

<template>
  <DoodleScene :build="buildInsightsMascot">
    <div ref="rootRef" class="w-full origin-bottom" style="will-change: transform">
      <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-auto w-full">
        <ellipse cx="110" cy="205" rx="62" ry="9" fill="#0B3954" fill-opacity="0.08" />

        <!-- open book -->
        <path d="M40 168V96c26 0 52 8 66 20V188c-14-12-40-20-66-20z" fill="#0B3954" />
        <path d="M180 168V96c-26 0-52 8-66 20V188c14-12 40-20 66-20z" fill="#1C5E7C" />
        <path d="M106 116v72" stroke="#051B28" stroke-width="3" stroke-linecap="round" />

        <path d="M52 112q22 4 34 16" stroke="#EAF1F4" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M52 128q22 4 34 16" stroke="#EAF1F4" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M168 112q-22 4-34 16" stroke="#EAF1F4" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M168 128q-22 4-34 16" stroke="#EAF1F4" stroke-width="3" stroke-linecap="round" fill="none" />

        <!-- character peeking from behind -->
        <circle cx="110" cy="70" r="26" fill="#FBBA00" />
        <circle cx="101" cy="66" r="4" fill="#0B3954" />
        <circle cx="119" cy="66" r="4" fill="#0B3954" />
        <path d="M100 78q10 8 20 0" stroke="#0B3954" stroke-width="3" stroke-linecap="round" fill="none" />

        <!-- idea bulb -->
        <g>
          <circle cx="164" cy="44" r="16" fill="#FFFBEB" stroke="#FBBA00" stroke-width="3" />
          <rect x="158" y="58" width="12" height="8" rx="2" fill="#523B00" />
          <path d="M158 66h12" stroke="#523B00" stroke-width="2" stroke-linecap="round" />
          <path d="M164 20v-8M182 30l6-6M146 30l-6-6" stroke="#FBBA00" stroke-width="3" stroke-linecap="round" />
        </g>
      </svg>
    </div>
  </DoodleScene>
</template>
