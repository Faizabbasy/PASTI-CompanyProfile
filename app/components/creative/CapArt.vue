<script setup lang="ts">
import type { CreativeArt } from '~/composables/useCreative'

// INTERIM capability illustration (owner 2026-10-07: "ilustrasi sementara").
// Drawn in PASTI's line language (navy ground, white hairlines, one yellow
// accent) so it reads as a placeholder diagram of the discipline — never as
// client work. Replace per capability once real creative visuals exist.
defineProps<{ art: CreativeArt; label: string }>()
</script>

<template>
  <div class="cap-art relative h-full w-full overflow-hidden bg-slateNavy" role="img" :aria-label="`Illustration: ${label}`">
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" class="absolute inset-0 h-full w-full" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <!-- shared dot grid -->
      <g fill="rgba(255,255,255,0.12)" stroke="none">
        <template v-for="x in 13" :key="`x${x}`">
          <circle v-for="y in 10" :key="`d${x}-${y}`" :cx="x * 30 - 10" :cy="y * 30 - 10" r="1" />
        </template>
      </g>

      <!-- Creative Communication: message → audience -->
      <g v-if="art === 'communication'" stroke="#fff" stroke-width="1.5">
        <rect x="70" y="80" width="150" height="62" rx="18" />
        <path d="M98 142 l-10 22 26-22" />
        <path d="M94 104h100M94 120h70" stroke-opacity="0.55" />
        <rect x="180" y="160" width="150" height="62" rx="18" fill="#FBBA00" stroke="#FBBA00" />
        <path d="M302 222 l10 22 -26-22" stroke="#FBBA00" fill="#FBBA00" />
        <path d="M204 184h100M204 200h60" stroke="#033C59" stroke-width="2" />
        <text x="70" y="64" fill="#fff" fill-opacity="0.5" font-size="9" font-family="monospace" letter-spacing="2" stroke="none">STRATEGY → EXECUTION → TRUST</text>
      </g>

      <!-- Integrated Campaign: one message, 360° across channels -->
      <g v-else-if="art === 'campaign'" stroke="#fff" stroke-width="1.5">
        <circle cx="200" cy="150" r="96" stroke-opacity="0.35" stroke-dasharray="2 6" />
        <circle cx="200" cy="150" r="62" stroke-opacity="0.6" />
        <circle cx="200" cy="150" r="30" fill="#FBBA00" stroke="#FBBA00" />
        <text x="200" y="155" text-anchor="middle" fill="#033C59" font-size="13" font-weight="800" stroke="none">360°</text>
        <g v-for="(a, i) in [0, 60, 120, 180, 240, 300]" :key="a">
          <circle :cx="200 + 96 * Math.cos((a - 90) * Math.PI / 180)" :cy="150 + 96 * Math.sin((a - 90) * Math.PI / 180)" r="7" :fill="i % 2 ? '#033C59' : '#fff'" />
          <path :d="`M${200 + 32 * Math.cos((a - 90) * Math.PI / 180)} ${150 + 32 * Math.sin((a - 90) * Math.PI / 180)} L${200 + 88 * Math.cos((a - 90) * Math.PI / 180)} ${150 + 88 * Math.sin((a - 90) * Math.PI / 180)}`" stroke-opacity="0.35" />
        </g>
        <text x="40" y="40" fill="#fff" fill-opacity="0.55" font-size="9" font-family="monospace" letter-spacing="2" stroke="none">ONLINE</text>
        <text x="312" y="276" fill="#fff" fill-opacity="0.55" font-size="9" font-family="monospace" letter-spacing="2" stroke="none">OFFLINE</text>
      </g>

      <!-- Social Media: content grid + engagement trend -->
      <g v-else-if="art === 'social'" stroke="#fff" stroke-width="1.5">
        <template v-for="r in 3" :key="`r${r}`">
          <rect v-for="c in 3" :key="`c${r}-${c}`" :x="60 + (c - 1) * 54" :y="60 + (r - 1) * 54" width="46" height="46" rx="8" :fill="r === 2 && c === 2 ? '#FBBA00' : 'none'" :stroke="r === 2 && c === 2 ? '#FBBA00' : '#fff'" :stroke-opacity="r === 2 && c === 2 ? 1 : 0.5" />
        </template>
        <path d="M245 210 L275 180 L300 192 L340 120" stroke="#FBBA00" stroke-width="2.5" />
        <circle cx="340" cy="120" r="5" fill="#FBBA00" stroke="none" />
        <path d="M245 230 H345" stroke-opacity="0.4" />
        <text x="245" y="250" fill="#fff" fill-opacity="0.55" font-size="9" font-family="monospace" letter-spacing="2" stroke="none">ENGAGEMENT</text>
      </g>

      <!-- Vertical Video: 9:16 frames, play, timeline -->
      <g v-else-if="art === 'video'" stroke="#fff" stroke-width="1.5">
        <rect x="88" y="78" width="70" height="124" rx="12" stroke-opacity="0.45" />
        <rect x="242" y="78" width="70" height="124" rx="12" stroke-opacity="0.45" />
        <rect x="160" y="50" width="80" height="180" rx="14" />
        <path d="M190 124 L190 156 L216 140 Z" fill="#FBBA00" stroke="#FBBA00" />
        <path d="M172 212 H228" stroke-opacity="0.35" stroke-width="3" />
        <path d="M172 212 H204" stroke="#FBBA00" stroke-width="3" />
        <text x="200" y="262" text-anchor="middle" fill="#fff" fill-opacity="0.55" font-size="9" font-family="monospace" letter-spacing="2" stroke="none">9:16 · HOOK · CUT · TREND</text>
      </g>

      <!-- Production: viewfinder, REC, aperture -->
      <g v-else-if="art === 'production'" stroke="#fff" stroke-width="1.5">
        <path d="M70 90 V66 H100 M300 66 H330 V90 M330 210 V234 H300 M100 234 H70 V210" />
        <circle cx="200" cy="150" r="46" stroke-opacity="0.6" />
        <g stroke-opacity="0.6">
          <path v-for="a in [0, 60, 120, 180, 240, 300]" :key="a" :d="`M${200 + 46 * Math.cos(a * Math.PI / 180)} ${150 + 46 * Math.sin(a * Math.PI / 180)} L${200 + 20 * Math.cos((a + 70) * Math.PI / 180)} ${150 + 20 * Math.sin((a + 70) * Math.PI / 180)}`" />
        </g>
        <circle cx="94" cy="84" r="5" fill="#FBBA00" stroke="none" />
        <text x="106" y="88" fill="#FBBA00" font-size="10" font-family="monospace" letter-spacing="2" stroke="none">REC</text>
        <text x="330" y="88" text-anchor="end" fill="#fff" fill-opacity="0.55" font-size="9" font-family="monospace" letter-spacing="1" stroke="none">00:00:12</text>
        <path d="M188 150 H212 M200 138 V162" stroke-opacity="0.8" />
      </g>

      <!-- Brand Identity & UI/UX: construction grid, swatches, UI frame -->
      <g v-else stroke="#fff" stroke-width="1.5">
        <rect x="56" y="62" width="130" height="130" stroke-opacity="0.35" />
        <path d="M56 127 H186 M121 62 V192" stroke-opacity="0.25" />
        <circle cx="121" cy="127" r="44" stroke-opacity="0.8" />
        <circle cx="140" cy="108" r="12" fill="#FBBA00" stroke="#FBBA00" />
        <rect x="56" y="210" width="34" height="26" rx="4" fill="#fff" stroke="none" />
        <rect x="96" y="210" width="34" height="26" rx="4" fill="#FBBA00" stroke="none" />
        <rect x="136" y="210" width="34" height="26" rx="4" stroke-opacity="0.6" />
        <rect x="224" y="62" width="120" height="174" rx="14" />
        <path d="M240 84 H300 M240 104 H328" stroke-opacity="0.5" />
        <rect x="240" y="122" width="88" height="54" rx="6" stroke-opacity="0.5" />
        <rect x="240" y="190" width="88" height="24" rx="12" fill="#FBBA00" stroke="none" />
      </g>
    </svg>
  </div>
</template>
