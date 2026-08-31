<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 15 —
// FOOTER / PLATFORM LINKS.
const { navLinks, platformLinks } = useFooter()
const { email } = useFinalCta()

const year = new Date().getFullYear()

const footerRef = ref<HTMLElement | null>(null)
useScrollReveal(footerRef, { y: 16, children: '.footer-reveal', stagger: 0.08 })

const { setState } = useCustomCursor()
</script>

<template>
  <footer ref="footerRef" class="relative overflow-hidden border-t border-navy-900 bg-navy-950 py-16 md:py-20">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -left-1/4 -top-1/2 h-[32rem] w-[32rem] rounded-full bg-yellow-500/[0.06] blur-3xl"
    />

    <BaseContainer class="relative">
      <div class="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div class="footer-reveal flex flex-col gap-8 md:col-span-4">
          <div class="w-fit origin-left scale-[1.6] md:scale-[1.9]">
            <LayoutLogo inverted />
          </div>

          <NuxtLink
            v-if="email"
            :to="`mailto:${email}`"
            class="btn-outline w-fit border-navy-700 text-paper hover:border-paper"
            @mouseenter="setState('contact')"
            @mouseleave="setState('default')"
          >
            {{ email }}
          </NuxtLink>
        </div>

        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-4 md:col-start-6 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Navigate</p>
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="group inline-flex w-fit items-center gap-2 font-display text-body-lg font-medium text-navy-200 transition-all duration-400 ease-editorial hover:translate-x-1 hover:text-yellow-400"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            {{ link.label }}
            <span
              aria-hidden="true"
              class="inline-block -translate-x-1 opacity-0 transition-all duration-400 ease-editorial group-hover:translate-x-0 group-hover:opacity-100"
            >→</span>
          </NuxtLink>
        </nav>

        <nav class="footer-reveal flex flex-col gap-4 border-navy-800 md:col-span-3 md:col-start-10 md:border-l md:pl-8">
          <p class="eyebrow text-navy-500">Platforms</p>
          <NuxtLink
            v-for="link in platformLinks"
            :key="link.to"
            :to="link.to"
            class="group inline-flex w-fit items-center gap-1.5 font-display text-body-lg font-medium text-paper transition-all duration-400 ease-editorial hover:translate-x-1 hover:text-yellow-400"
            @mouseenter="setState('link')"
            @mouseleave="setState('default')"
          >
            <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500 transition-transform duration-400 ease-editorial group-hover:scale-125" aria-hidden="true" />
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>

      <div class="footer-reveal mt-16 flex flex-col-reverse gap-4 border-t border-navy-800 pt-8 text-body-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between md:mt-20">
        <p>&copy; {{ year }} PT Hidup Pasti Bahagia</p>
        <p class="text-navy-500">Technology + Creative under one roof by PASTI</p>
      </div>
    </BaseContainer>
  </footer>
</template>
