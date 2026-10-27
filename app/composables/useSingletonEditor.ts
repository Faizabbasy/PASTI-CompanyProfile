import type { Ref } from 'vue'
import type { PageStatus } from '#shared/cms/fields'

// Shared editor logic for the singleton page editors (/admin/pages/about,
// /admin/pages/technology): loading, dirty tracking, unsaved-changes guard,
// tabs, client-side validation, Save Draft, Publish / Unpublish / Archive,
// error mapping and notices. Each page supplies its own form mapping and
// renders its own fields; the server stays authoritative for everything.

// Repeater items carry a local `_key` (stable v-for key) that is stripped
// before saving; new items have no id — the server assigns one.
export type Keyed<T> = Omit<T, 'id'> & { id?: string; _key: string }

let keySeq = 0
export const newKey = () => `k${Date.now().toString(36)}${(keySeq++).toString(36)}`
export const keyed = <T extends { id: string }>(list: T[]) => list.map((i) => ({ ...i, _key: i.id }))
export const unkeyed = <T extends { _key: string }>(list: T[]) => list.map(({ _key: _k, ...rest }) => rest)
export const fieldId = (path: string) => `f-${path.replace(/\./g, '-')}`

// Same schema the server enforces; returns { 'hero.headline': 'Required.' }.
export function zodFieldErrors(result: { success: true } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } }): Record<string, string> {
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) errors[issue.path.join('.')] ??= issue.message
  return errors
}

export interface EditorTab {
  key: string
  label: string
  sections: readonly string[]
}

export interface SingletonStateLike {
  status: PageStatus
  hasUnpublishedChanges: boolean
  draft: { version: number; content: unknown }
  published: { version: number } | null
}

export interface SingletonResponse<S extends SingletonStateLike> {
  state: S
  revision: number
  changedSections?: string[]
  // Images copied into the other language's draft by this save.
  mediaSynced?: number
}

export type EditorNotice = { kind: 'success' | 'error' | 'warning'; text: string }
export type EditorBusy = null | 'save' | 'publish' | 'unpublish' | 'archive'

export function tabForPathIn(tabs: readonly EditorTab[], path: string): string | null {
  const head = path.split('.')[0]
  return tabs.find((t) => t.sections.includes(head!))?.key ?? null
}

export async function useSingletonEditor<S extends SingletonStateLike, F>(opts: {
  // Page name in messages ("About", "Technology").
  name: string
  endpoint: string
  asyncKey: string
  // Bilingual pages: which language record to edit (sent as ?lang=).
  lang?: 'id' | 'en'
  tabs: readonly EditorTab[]
  toForm: (content: S['draft']['content']) => F
  toPayload: (form: F) => unknown
  validate: (form: F) => Record<string, string>
}) {
  const { cmsFetch, can, fetchSession } = useCmsSession()

  // Everything that needs the component instance (watchers, lifecycle and
  // route hooks) is registered before the first await.
  const query = opts.lang ? { lang: opts.lang } : undefined
  const asyncData = useAsyncData(opts.lang ? `${opts.asyncKey}-${opts.lang}` : opts.asyncKey, () => cmsFetch<SingletonResponse<S>>(opts.endpoint, { query }))
  const { data, status: loadStatus, error: loadError, refresh } = asyncData

  const server = ref(null) as Ref<SingletonResponse<S> | null>
  const form = ref(null) as Ref<F | null>
  const savedSnapshot = ref('')
  const load = (d: SingletonResponse<S> | null | undefined) => {
    if (!d) return
    server.value = d
    form.value = opts.toForm(d.state.draft.content)
    savedSnapshot.value = JSON.stringify(opts.toPayload(form.value))
  }
  watch(data, load)

  const state = computed(() => server.value?.state ?? null)
  // Optimistic-lock token of the loaded draft (record-level actions such as
  // testimonial approval pin it too).
  const revision = computed(() => server.value?.revision ?? 0)
  const dirty = computed(() => !!form.value && JSON.stringify(opts.toPayload(form.value)) !== savedSnapshot.value)

  // ---- tabs -----------------------------------------------------------------
  const activeTab = ref(opts.tabs[0]!.key)
  const errors = ref<Record<string, string>>({})
  const tabForPath = (path: string) => tabForPathIn(opts.tabs, path)
  const errorCount = (tab: string) => Object.keys(errors.value).filter((p) => tabForPath(p) === tab).length
  const err = (path: string) => errors.value[path]

  // ---- feedback -------------------------------------------------------------
  const notice = ref<EditorNotice | null>(null)
  const sessionExpired = ref(false)
  const busy = ref<EditorBusy>(null)

  function jumpToFirstError() {
    const first = Object.keys(errors.value)[0]
    if (!first) return
    const tab = tabForPath(first)
    if (tab) activeTab.value = tab
    nextTick(() => document.getElementById(fieldId(first))?.focus())
  }

  // "Klik teks untuk edit" in the admin previews links here with
  // ?field=<path>: open that field's section, scroll to it and flash it.
  // A path may name a group (`points`, `body`) — the first input in it wins.
  // A collapsed repeater item (AdminFormRepeater `path`) is opened first.
  function jumpToField(path: string) {
    const tab = tabForPath(path)
    if (tab) activeTab.value = tab
    nextTick(() => setTimeout(async () => {
      const id = fieldId(path)
      const find = () => document.getElementById(id) ?? document.querySelector<HTMLElement>(`[id^="${id}-"]`)
      let el = find()
      if (!el) {
        // The repeater whose path the field sits under (`capabilities.items`
        // for `capabilities.items.2.title`); open that item (or the first).
        const lists = [...document.querySelectorAll<HTMLElement>('[data-repeater]')].filter((r) => path === r.dataset.repeater || path.startsWith(`${r.dataset.repeater}.`))
        const list = lists.sort((a, b) => b.dataset.repeater!.length - a.dataset.repeater!.length)[0]
        if (list) {
          const index = Number(path.slice(list.dataset.repeater!.length + 1).split('.')[0]) || 0
          const items = [...list.querySelectorAll<HTMLElement>('[aria-expanded]')]
          const toggle = items[index] ?? items[0]
          if (toggle?.getAttribute('aria-expanded') === 'false') toggle.click()
          await nextTick()
          el = find()
        }
      }
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus({ preventScroll: true })
      const box = el.closest<HTMLElement>('fieldset') ?? el.parentElement ?? el
      // An attribute, not a class: Vue rewrites `class` when the form block
      // re-renders (e.g. a repeater item opening) and would drop the flash.
      box.setAttribute('data-cms-jump', '')
      setTimeout(() => box.removeAttribute('data-cms-jump'), 2600)
    }, 200))
  }
  const fieldQuery = useRoute().query.field
  onMounted(() => {
    if (typeof fieldQuery === 'string' && fieldQuery) jumpToField(fieldQuery)
  })

  function describeError(e: unknown, action: string): string {
    const er = e as { statusCode?: number; statusMessage?: string; data?: { data?: { fields?: { path: string; message: string }[] }; statusMessage?: string } }
    const code = er.statusCode
    if (code === 401) {
      sessionExpired.value = true
      return 'Sesi login sudah habis. Perubahanmu masih ada di halaman ini — login lagi di tab baru, lalu coba lagi.'
    }
    if (code === 403) {
      const msg = er.data?.statusMessage || er.statusMessage || ''
      return /csrf|cross-site/i.test(msg) ? 'Pemeriksaan keamanan gagal. Muat ulang halaman lalu coba lagi.' : `Role kamu tidak punya izin untuk ${action}.`
    }
    if (code === 409) return er.data?.statusMessage || er.statusMessage || 'Konten ini baru diubah di tempat lain. Muat ulang halaman untuk melanjutkan.'
    if (code === 400 || code === 422) {
      const fields = er.data?.data?.fields ?? []
      const mapped: Record<string, string> = {}
      for (const f of fields) mapped[f.path.replace(/^content\./, '')] ??= f.message
      errors.value = mapped
      jumpToFirstError()
      return `Gagal ${action}: ${fields.length || 'beberapa'} kolom perlu diperbaiki.`
    }
    return `Gagal ${action}. Coba lagi.`
  }

  async function ensureSession() {
    if (!sessionExpired.value) return
    const user = await fetchSession(true)
    if (user) sessionExpired.value = false
  }

  // ---- actions --------------------------------------------------------------
  async function saveDraft() {
    if (!form.value || !server.value) return
    notice.value = null
    errors.value = opts.validate(form.value)
    if (Object.keys(errors.value).length) {
      notice.value = { kind: 'error', text: `Perbaiki ${Object.keys(errors.value).length} kolom yang ditandai merah dulu sebelum menyimpan.` }
      jumpToFirstError()
      return
    }
    busy.value = 'save'
    try {
      await ensureSession()
      const res = await cmsFetch<SingletonResponse<S>>(opts.endpoint, {
        query,
        method: 'PUT',
        body: { revision: server.value.revision, content: opts.toPayload(form.value) },
        keepOn401: true
      })
      server.value = res
      form.value = opts.toForm(res.state.draft.content)
      savedSnapshot.value = JSON.stringify(opts.toPayload(form.value))
      notice.value = res.changedSections?.length
        ? { kind: 'success', text: `Draft tersimpan (v${res.state.draft.version}).${res.mediaSynced ? ` ${res.mediaSynced} gambar juga diperbarui di draft versi ${opts.lang === 'id' ? 'English' : 'Indonesia'}.` : ''} Website belum berubah sampai admin klik Publish.` }
        : { kind: 'success', text: 'Tidak ada perubahan untuk disimpan.' }
    } catch (e) {
      notice.value = { kind: 'error', text: describeError(e, 'menyimpan draft') }
    } finally {
      busy.value = null
    }
  }

  async function runStatusAction(kind: 'publish' | 'unpublish' | 'archive') {
    if (!server.value) return
    const n = opts.name
    const prompts = {
      publish: `Publish draft v${server.value.state.draft.version}? Draft ini akan langsung tampil di website sebagai versi ${n} yang baru.`,
      unpublish: server.value.state.status === 'archived' ? `Kembalikan ${n} menjadi draft? Tetap tidak tampil di website.` : `Unpublish ${n}? Website akan kembali memakai konten bawaan.`,
      archive: `Arsipkan ${n}? Website akan kembali memakai konten bawaan.`
    }
    if (!window.confirm(prompts[kind])) return
    notice.value = null
    busy.value = kind
    try {
      await ensureSession()
      const res = await cmsFetch<SingletonResponse<S>>(`${opts.endpoint}/${kind}`, {
        query,
        method: 'POST',
        body: kind === 'publish' ? { revision: server.value.revision } : {},
        keepOn401: true
      })
      server.value = res
      const text = {
        publish: `Berhasil di-publish (v${res.state.published?.version}).`,
        unpublish: `${n} sekarang berstatus draft dan tidak tampil di website.`,
        archive: `${n} diarsipkan dan tidak tampil di website.`
      }[kind]
      notice.value = { kind: 'success', text }
    } catch (e) {
      notice.value = { kind: 'error', text: describeError(e, { publish: 'publish', unpublish: 'unpublish', archive: 'mengarsipkan' }[kind]) }
    } finally {
      busy.value = null
    }
  }

  const publishedIds = computed(() => (state.value as { publishedItemIds?: string[] } | null)?.publishedItemIds ?? [])

  // ---- unsaved-changes protection ------------------------------------------
  onBeforeRouteLeave(() => {
    if (dirty.value && !window.confirm('Ada perubahan yang belum disimpan. Tinggalkan halaman ini dan buang perubahannya?')) return false
  })
  function beforeUnload(e: BeforeUnloadEvent) {
    if (!dirty.value) return
    e.preventDefault()
    e.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

  // ---- permissions ----------------------------------------------------------
  const canPublish = computed(() => can('content.publish'))
  const canUnpublish = computed(() => can('content.unpublish') && (state.value?.status === 'published' || state.value?.status === 'archived'))
  const canArchive = computed(() => can('content.archive') && state.value?.status !== 'archived')
  const publishDisabledReason = computed(() => {
    if (dirty.value) return 'Save the draft first.'
    if (state.value?.status === 'published' && !state.value.hasUnpublishedChanges) return 'Nothing new to publish.'
    return ''
  })

  await asyncData
  load(data.value)

  return {
    loadStatus,
    loadError,
    refresh,
    form,
    state,
    revision,
    dirty,
    activeTab,
    errors,
    errorCount,
    err,
    notice,
    sessionExpired,
    busy,
    saveDraft,
    runStatusAction,
    publishedIds,
    canPublish,
    canUnpublish,
    canArchive,
    publishDisabledReason
  }
}

export const fmtCmsTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB' : '—'
