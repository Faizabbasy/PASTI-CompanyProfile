<script setup lang="ts">
const route = useRoute()
const { can } = useCmsSession()
const groups = computed(() => useAdminNav().filter((g) => !g.permission || can(g.permission)))

const isActive = (to: string) => route.path === to
const inGroup = (to: string) => to !== '/admin' && (route.path === to || route.path.startsWith(`${to}/`))
</script>

<template>
  <aside class="flex flex-col border-r border-navy-100 bg-white" aria-label="CMS navigation">
    <div class="flex h-16 shrink-0 items-center gap-2 border-b border-navy-100 px-5">
      <img src="/images/pasti-logo.webp" alt="PASTI" width="1205" height="527" class="h-5 w-auto">
      <span class="rounded bg-navy-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-navy-600">CMS</span>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4 text-sm">
      <ul class="space-y-1">
        <li v-for="group in groups" :key="group.to">
          <NuxtLink
            :to="group.to"
            class="flex items-center rounded-md px-3 py-2 font-medium transition-colors hover:bg-navy-50"
            :class="isActive(group.to) || (inGroup(group.to) && !group.children) ? 'bg-navy-50 text-slateNavy' : inGroup(group.to) ? 'text-slateNavy' : 'text-navy-600'"
            :aria-current="isActive(group.to) ? 'page' : undefined"
          >
            {{ group.label }}
          </NuxtLink>
          <ul v-if="group.children" class="mb-2 ml-3 mt-0.5 space-y-0.5 border-l border-navy-100 pl-2">
            <li v-for="child in group.children" :key="child.to">
              <NuxtLink
                :to="child.to"
                class="block rounded-md px-3 py-1.5 transition-colors hover:bg-navy-50"
                :class="isActive(child.to) ? 'bg-navy-50 font-semibold text-slateNavy' : 'text-navy-500'"
                :aria-current="isActive(child.to) ? 'page' : undefined"
              >
                {{ child.label }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <p class="border-t border-navy-100 px-5 py-3 text-[11px] text-navy-500">Internal · not public</p>
  </aside>
</template>
