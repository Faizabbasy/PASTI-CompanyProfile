<script setup lang="ts">
// Admin previews: hover any marked text (useCmsMark) to see which CMS field
// it is; click to open the editor at that field. A switch turns it off so
// the page can be used normally (open the reader, click buttons). Works on
// teleported content too (document-level listeners, capture phase). The
// switch renders where the component is placed (the preview's yellow bar),
// so it never covers the page.
const on = ref(true)
const box = ref<{ top: number; left: number; width: number; height: number; label: string } | null>(null)
let current: HTMLElement | null = null

const marked = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('[data-cms-href]') : null)

function place() {
  if (!on.value || !current || !current.isConnected) return void (box.value = null)
  const r = current.getBoundingClientRect()
  box.value = { top: r.top, left: r.left, width: r.width, height: r.height, label: current.dataset.cmsLabel ?? '' }
}
function over(e: MouseEvent) {
  current = marked(e.target)
  place()
}
function click(e: MouseEvent) {
  const el = on.value ? marked(e.target) : null
  if (!el?.dataset.cmsHref) return
  e.preventDefault()
  e.stopPropagation()
  window.location.href = el.dataset.cmsHref
}
watch(on, place)

onMounted(() => {
  document.addEventListener('mouseover', over, true)
  document.addEventListener('click', click, true)
  window.addEventListener('scroll', place, true)
  window.addEventListener('resize', place)
})
onBeforeUnmount(() => {
  document.removeEventListener('mouseover', over, true)
  document.removeEventListener('click', click, true)
  window.removeEventListener('scroll', place, true)
  window.removeEventListener('resize', place)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="box" aria-hidden="true" class="pointer-events-none fixed z-[200] rounded-md outline outline-2 outline-offset-2 outline-amber-500" :style="{ top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px` }">
      <span class="absolute left-0 whitespace-nowrap rounded bg-amber-500 px-2 py-0.5 text-[12px] font-semibold text-black shadow" :class="box.top < 34 ? 'top-full mt-1.5' : 'bottom-full mb-1.5'">✎ {{ box.label }} — klik untuk edit</span>
    </div>
  </Teleport>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-semibold"
    :class="on ? 'border-amber-500 bg-amber-400 text-black' : 'border-amber-400 bg-white text-amber-950 hover:bg-amber-100'"
    :aria-pressed="on"
    @click.stop="on = !on"
  >
    ✎ Klik teks untuk edit: {{ on ? 'ON' : 'OFF' }}
  </button>
</template>
