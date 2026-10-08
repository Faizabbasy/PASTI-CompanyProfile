<script setup lang="ts">
// OPEN headline — the deck's two-beat statements ("OPEN is / not another
// SaaS.") set as stacked lines that rise out of a clip on entry. Contrast,
// not a highlighted word: lines from `mutedFrom` on drop to a quieter tone
// (yellow text is never used on white — contrast). Optional lede below.
const props = withDefaults(
  defineProps<{
    lines: string[]
    mutedFrom?: number
    lede?: string
    surface?: 'light' | 'dark'
    size?: 'xl' | 'lg' | 'md'
    as?: 'h1' | 'h2' | 'h3'
  }>(),
  { mutedFrom: 1, lede: undefined, surface: 'light', size: 'lg', as: 'h2' }
)

const rootRef = ref<HTMLElement | null>(null)
const inView = useOpenInView(rootRef, 0.4)
const dark = computed(() => props.surface === 'dark')
const sizeClass = computed(
  () =>
    ({
      xl: 'text-[length:clamp(40px,6vw,92px)]',
      lg: 'text-[length:clamp(34px,4.6vw,72px)]',
      md: 'text-[length:clamp(28px,3.2vw,48px)]'
    })[props.size]
)
</script>

<template>
  <div ref="rootRef" class="m-center" :class="{ 'is-in': inView }">
    <component :is="as" class="op-display" :class="[sizeClass, dark ? 'text-pureWhite' : 'text-slateNavy']">
      <span
        v-for="(l, i) in lines"
        :key="i"
        class="op-line"
        :class="i >= mutedFrom ? (dark ? 'text-[color:rgba(255,255,255,0.5)]' : 'text-[color:rgba(3,60,89,0.42)]') : ''"
      ><span :style="{ '--d': `${i * 90}ms` }">{{ l }}</span></span>
    </component>
    <p
      v-if="lede"
      class="op-fade m-center mt-6 max-w-[34rem] text-[16px] leading-[1.65] tablet:text-[17px]"
      :class="dark ? 'text-[color:rgba(255,255,255,0.74)]' : 'text-[color:rgba(3,60,89,0.78)]'"
      :style="{ '--d': `${lines.length * 90 + 120}ms` }"
    >{{ lede }}</p>
  </div>
</template>
