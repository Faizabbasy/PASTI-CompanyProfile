<script setup lang="ts">
const rootRef = ref<HTMLElement | null>(null)
useHeroDoodle(rootRef)
</script>

<template>
  <div ref="rootRef" class="w-full origin-bottom" style="will-change: transform">
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-auto w-full">
      <ellipse cx="110" cy="205" rx="60" ry="9" fill="#0B3954" fill-opacity="0.08" />

      <!-- mascot blob body -->
      <path
        d="M110 40c34 0 58 26 58 62 0 40-26 74-58 74s-58-34-58-74c0-36 24-62 58-62z"
        fill="#0B3954"
      />

      <!-- belly patch -->
      <path
        d="M110 92c20 0 34 16 34 40 0 22-16 40-34 40s-34-18-34-40c0-24 14-40 34-40z"
        fill="#FBBA00"
      />

      <!-- eyes -->
      <circle cx="92" cy="98" r="7" fill="#FFFFFF" />
      <circle cx="128" cy="98" r="7" fill="#FFFFFF" />
      <circle cx="94" cy="99" r="3.4" fill="#0B3954" />
      <circle cx="130" cy="99" r="3.4" fill="#0B3954" />

      <!-- smile -->
      <path d="M96 114q14 12 28 0" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" fill="none" />

      <!-- cheeks -->
      <circle cx="82" cy="108" r="5" fill="#FBBA00" fill-opacity="0.6" />
      <circle cx="138" cy="108" r="5" fill="#FBBA00" fill-opacity="0.6" />

      <!-- waving arm -->
      <path d="M158 130q22-4 26-26" stroke="#0B3954" stroke-width="9" stroke-linecap="round" fill="none" />
      <circle cx="186" cy="102" r="9" fill="#0B3954" />

      <!-- other arm -->
      <path d="M62 132q-16 6-18 24" stroke="#0B3954" stroke-width="9" stroke-linecap="round" fill="none" />
      <circle cx="42" cy="158" r="8" fill="#0B3954" />

      <!-- little feet -->
      <ellipse cx="92" cy="172" rx="12" ry="7" fill="#0B3954" />
      <ellipse cx="128" cy="172" rx="12" ry="7" fill="#0B3954" />

      <!-- sparkle -->
      <path d="M172 56l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#FBBA00" />
    </svg>
  </div>
</template>
