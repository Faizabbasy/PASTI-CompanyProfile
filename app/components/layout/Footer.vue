<script setup lang="ts">
// Copy sourced from .docs/PASTI_Cuberto_Template_Content_Mapping.docx, section 15 —
// FOOTER / PLATFORM LINKS.
const { navLinks, platformLinks } = useFooter()
const { email } = useFinalCta()

const year = new Date().getFullYear()

const footerRef = ref<HTMLElement | null>(null)
useScrollReveal(footerRef, { y: 16 })
</script>

<template>
  <footer ref="footerRef" class="bg-navy-950 py-16 md:py-20">
    <BaseContainer>
      <div class="flex flex-col gap-16 md:flex-row md:justify-between">
        <div class="flex flex-col gap-8">
          <NuxtLink to="/" class="font-display text-2xl font-extrabold tracking-tight text-paper">
            PASTI<span class="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-yellow-500 align-super" aria-hidden="true" />
          </NuxtLink>

          <NuxtLink v-if="email" :to="`mailto:${email}`" class="btn-outline w-fit border-navy-700 text-paper hover:border-paper">
            {{ email }}
          </NuxtLink>
        </div>

        <div class="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-3">
          <nav class="flex flex-col gap-4">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="group inline-flex w-fit items-center font-display text-body-md font-medium text-navy-200 transition-all duration-400 ease-editorial hover:translate-x-1 hover:text-yellow-400"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <nav class="flex flex-col gap-4">
            <p class="eyebrow text-navy-500">Platforms</p>
            <NuxtLink
              v-for="link in platformLinks"
              :key="link.to"
              :to="link.to"
              class="group inline-flex w-fit items-center font-display text-body-md font-medium text-paper transition-all duration-400 ease-editorial hover:translate-x-1 hover:text-yellow-400"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>

      <div class="mt-16 flex flex-col-reverse gap-4 border-t border-navy-800 pt-8 text-body-sm text-navy-400 sm:flex-row sm:items-center sm:justify-between md:mt-20">
        <p>&copy; {{ year }}, PASTI</p>
      </div>
    </BaseContainer>
  </footer>
</template>
