<script setup lang="ts">
// Small, non-linking PASTI wordmark for cards, captions and section marks —
// the "logo-as-signature" device (00-brand-guide.md §08: a few repeatable
// devices should make PASTI recognizable). Same measured-dot technique as
// Logo.vue: on dark surfaces the source PNG is inverted to white and the
// yellow dot is redrawn at its measured pixel box, so the brand dot stays the
// only Yellow (scarce signature signal, 00-brand-guide.md §05).
withDefaults(
  defineProps<{
    /** Surface the mark sits on. `dark` renders white + yellow dot. */
    surface?: 'dark' | 'light'
    /** Rendered height in px (width follows the 1205x527 source ratio).
     * Omit to size by width via a class instead (ghost wordmarks). */
    height?: number
    /** Draw the yellow dot (dark surface). Off for ghost wordmarks. */
    dot?: boolean
  }>(),
  { surface: 'dark', height: undefined, dot: true }
)

// Ghost use (dot off): the inverted PNG would turn the yellow dot into a white
// blob, so the dot's measured box (see Logo.vue) is masked out of the image.
const dotCut = {
  WebkitMaskImage: 'radial-gradient(ellipse 5.6% 12.6% at 92.5% 20%, transparent 99%, #000 100%)',
  maskImage: 'radial-gradient(ellipse 5.6% 12.6% at 92.5% 20%, transparent 99%, #000 100%)'
}
</script>

<template>
  <span
    aria-hidden="true"
    class="relative inline-block shrink-0 select-none"
    :style="{ height: height ? `${height}px` : undefined, aspectRatio: '1205 / 527' }"
  >
    <img
      src="/images/pasti-logo.png"
      alt=""
      draggable="false"
      class="h-full w-auto max-w-none"
      :class="surface === 'dark' ? 'brightness-0 invert' : ''"
      :style="surface === 'dark' && !dot ? dotCut : undefined"
      width="1205"
      height="527"
    />
    <span
      v-if="surface === 'dark' && dot"
      class="absolute rounded-full bg-yellow-500"
      style="left: 87.8%; top: 9.3%; width: 9.38%; height: 21.44%"
    />
  </span>
</template>
