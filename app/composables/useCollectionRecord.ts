import type { PageStatus } from '#shared/cms/fields'
import type { EditorNotice } from './useSingletonEditor'

// Collection-record helpers for the Work CMS (projects, case studies). A
// record's own editor reuses useSingletonEditor — record endpoints answer
// the same { state, revision } shape — so only create and hard delete live
// here.

export interface CollectionAdminStateLike {
  id: string
  status: PageStatus
  dummy: boolean
  published: { version: number } | null
  revisions: unknown[]
}

type FetchError = { statusCode?: number; statusMessage?: string; data?: { data?: { fields?: { path: string; message: string }[] }; statusMessage?: string } }

export function useCollectionCreate() {
  const errors = ref<Record<string, string>>({})
  const notice = ref<EditorNotice | null>(null)
  const busy = ref(false)
  const err = (path: string) => errors.value[path]

  async function submit<R>(opts: { validate: () => Record<string, string>; request: () => Promise<R>; then: (res: R) => unknown }) {
    notice.value = null
    errors.value = opts.validate()
    if (Object.keys(errors.value).length) {
      nextTick(() => document.getElementById(fieldId(Object.keys(errors.value)[0]!))?.focus())
      return
    }
    busy.value = true
    try {
      const res = await opts.request()
      await opts.then(res)
    } catch (e) {
      const er = e as FetchError
      if (er.statusCode === 400 || er.statusCode === 403) {
        const fields = er.data?.data?.fields ?? []
        for (const f of fields) errors.value[f.path.replace(/^content\./, '')] ??= f.message
      }
      notice.value = {
        kind: 'error',
        text: er.statusCode === 403 ? er.data?.statusMessage || "You don't have permission to do this." : er.statusCode === 400 ? 'Some fields need attention.' : 'Could not create the record. Please try again.'
      }
    } finally {
      busy.value = false
    }
  }

  return { errors, err, notice, busy, submit }
}

// Hard delete is only for records that were never published (ADMIN). Anything
// with public history is archived instead — the server enforces both.
export function useRecordDelete(endpoint: string, backTo: string, label: () => string) {
  const { cmsFetch, can } = useCmsSession()
  const deleting = ref(false)
  const deleteError = ref('')
  const canDelete = (s: CollectionAdminStateLike | null) => !!s && can('content.delete') && s.status === 'draft' && !s.published && !s.revisions.length

  async function remove() {
    if (!window.confirm(`Delete “${label()}” permanently? It was never published. This cannot be undone.`)) return
    deleting.value = true
    deleteError.value = ''
    try {
      await cmsFetch(endpoint, { method: 'DELETE' })
      await navigateTo(backTo)
    } catch (e) {
      const er = e as FetchError
      deleteError.value = er.data?.statusMessage || er.statusMessage || 'Could not delete.'
    } finally {
      deleting.value = false
    }
  }

  return { canDelete, remove, deleting, deleteError }
}
