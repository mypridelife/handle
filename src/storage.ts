import { preferZhuyin } from './i18n'
import { dayNo, isLegalIdiomOnUrl, urlIdiom } from './state'
import type { TriesMeta } from './logic'

export const legacyTries = useStorage<Record<number, string[]>>('handle-tries', {})

export const initialized = useStorage('handle-initialized', false)
export const history = useStorage<Record<number | string, TriesMeta>>('handle-tries-meta', {})
export const useZhuyin = useStorage('handle-zhuyin', preferZhuyin)
export const useNumberTone = useStorage('handle-number-tone', false)
export const colorblind = useStorage('handle-colorblind', false)

export const meta = computed<TriesMeta>({
  get() {
    if (isLegalIdiomOnUrl.value) {
      if (!(urlIdiom.value in history.value))
        history.value[urlIdiom.value] = {}
      return history.value[urlIdiom.value]
    }
    if (!(dayNo.value in history.value))
      history.value[dayNo.value] = {}
    return history.value[dayNo.value]
  },
  set(v) {
    if (isLegalIdiomOnUrl.value) {
      history.value[urlIdiom.value] = v
    }
    history.value[dayNo.value] = v
  },
})

export const tries = computed<string[]>({
  get() {
    if (!meta.value.tries)
      meta.value.tries = []
    return legacyTries.value[dayNo.value] || meta.value.tries
  },
  set(v) {
    meta.value.tries = v
  },
})

export function markStart() {
  if (meta.value.end)
    return
  if (!meta.value.start)
    meta.value.start = Date.now()
}

export function markEnd() {
  if (meta.value.end)
    return

  if (!meta.value.duration)
    meta.value.duration = 0

  meta.value.end = Date.now()
  if (meta.value.start)
    meta.value.duration += meta.value.end - meta.value.start
}

export function onPause() {
  if (meta.value.end)
    return

  if (!meta.value.duration)
    meta.value.duration = 0

  if (meta.value.start) {
    meta.value.duration += Date.now() - meta.value.start
    meta.value.start = undefined
  }
}

export const gamesCount = computed(() => Object.values(history.value).filter(m => m.passed || m.answer || m.failed).length)
export const passedCount = computed(() => Object.values(history.value).filter(m => m.passed).length)
export const noHintPassedCount = computed(() => Object.values(history.value).filter(m => m.passed && !m.hint).length)
export const historyTriesCount = computed(() => Object.values(history.value).filter(m => m.passed || m.answer || m.failed).map(m => m.tries?.length || 0).reduce((a, b) => a + b, 0))

export const triesCount = computed(() => tries.value.length)
export const averageDurations = computed(() => {
  const items = Object.values(history.value).filter(m => m.passed && m.duration)
  if (!items.length)
    return 0
  const durations = items.map(m => m.duration!).reduce((a, b) => a + b, 0)
  const ts = durations / items.length / 1000
  const m = Math.floor(ts / 60)
  const s = Math.round(ts % 60)
  if (m)
    return `${m}m${s}s`
  return `${s}s`
})
