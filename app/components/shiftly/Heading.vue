<script setup lang="ts">
// Section heading for /shiftly: mono eyebrow with a "shift bar" (three
// stacked strokes, the page's motif), hero-scale title, optional lede.
withDefaults(defineProps<{ eyebrow: string; title: string; lede?: string; surface?: 'light' | 'dark'; as?: 'h1' | 'h2' }>(), { surface: 'light', as: 'h2' })
</script>

<template>
  <div class="m-center">
    <p class="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.62)]' : 'text-[color:rgba(3,60,89,0.6)]'">
      <span aria-hidden="true" class="flex flex-col gap-[3px]">
        <span class="block h-[2px] w-4 bg-pastiYellow-500" />
        <span class="block h-[2px] w-2.5 bg-pastiYellow-500 opacity-70" />
        <span class="block h-[2px] w-3.5 bg-pastiYellow-500 opacity-40" />
      </span>
      {{ eyebrow }}
    </p>
    <component :is="as" class="hero-title mt-4" :class="surface === 'dark' ? 'hero-title--dark' : ''">
      {{ title.replace(/\.$/, '') }}<span class="text-pastiYellow-500">.</span>
    </component>
    <p v-if="lede" class="m-center mt-5 max-w-[46ch] text-token-body-large leading-relaxed" :class="surface === 'dark' ? 'text-[color:rgba(255,255,255,0.72)]' : 'text-[color:rgba(3,60,89,0.72)]'">{{ lede }}</p>
  </div>
</template>
