<script setup lang="ts">
// "Technologies we build with" — owner decision 2026-10-07. The 7 platform
// logos (useTrustedClients) that used to fill the Trusted marquee, moved here
// above the Trusted Partner card as a quiet strip: they are technologies, not
// clients, so the label claims no partnership. Deliberately simple — no
// motion beyond a CSS hover; logos keep their own identity (04-spec §Partner
// Logo Respect), only desaturated at rest.
const label = 'Technologies we build with'
// Same names/files as useTrustedClients, but served from public/logos/tech/:
// copies trimmed to the mark with transparent backgrounds (the originals carry
// uneven padding, and TikTok/WordPress an opaque background), so one height
// reads evenly across the row. Originals in public/logos/ are untouched.
const logos = useTrustedClients().clients.map((c) => ({ ...c, logo: c.logo.replace('/logos/', '/logos/tech/') }))
</script>

<template>
  <div class="m-stack flex flex-col gap-6 border-t border-[color:rgba(3,60,89,0.14)] pt-5 desktop:flex-row desktop:items-center desktop:gap-10">
    <p class="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:rgba(3,60,89,0.5)]">{{ label }}</p>
    <ul class="flex w-full flex-wrap items-center justify-center gap-x-7 gap-y-5 tablet:grid tablet:grid-cols-7 desktop:gap-x-10">
      <li v-for="logo in logos" :key="logo.name" class="flex h-8 items-center justify-center">
        <img
          :src="logo.logo"
          :alt="logo.name"
          loading="lazy"
          decoding="async"
          draggable="false"
          class="tech-logo max-h-6 max-w-[6rem] object-contain tablet:max-h-7 tablet:max-w-[7rem]"
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tech-logo {
  filter: grayscale(1);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}
.tech-logo:hover {
  filter: none;
  opacity: 1;
}
</style>
