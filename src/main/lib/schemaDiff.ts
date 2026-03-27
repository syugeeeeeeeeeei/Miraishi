import type { TaxSchemaDiffSummary } from '@myTypes/miraishi'

const escapePointer = (segment: string): string => segment.replace(/~/g, '~0').replace(/\//g, '~1')

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const diffAsJsonPointers = (left: unknown, right: unknown): TaxSchemaDiffSummary => {
  const added: string[] = []
  const removed: string[] = []
  const changed: string[] = []

  const walk = (leftNode: unknown, rightNode: unknown, path: string): void => {
    if (Array.isArray(leftNode) || Array.isArray(rightNode)) {
      const leftArr = Array.isArray(leftNode) ? leftNode : []
      const rightArr = Array.isArray(rightNode) ? rightNode : []
      const maxLength = Math.max(leftArr.length, rightArr.length)
      for (let i = 0; i < maxLength; i += 1) {
        const nextPath = `${path}/${i}`
        if (i >= leftArr.length) {
          added.push(nextPath)
          continue
        }
        if (i >= rightArr.length) {
          removed.push(nextPath)
          continue
        }
        walk(leftArr[i], rightArr[i], nextPath)
      }
      return
    }

    if (isObject(leftNode) || isObject(rightNode)) {
      const leftObj = isObject(leftNode) ? leftNode : {}
      const rightObj = isObject(rightNode) ? rightNode : {}
      const keys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)])
      for (const key of keys) {
        const nextPath = `${path}/${escapePointer(key)}`
        if (!(key in leftObj)) {
          added.push(nextPath)
          continue
        }
        if (!(key in rightObj)) {
          removed.push(nextPath)
          continue
        }
        walk(leftObj[key], rightObj[key], nextPath)
      }
      return
    }

    if (leftNode !== rightNode) {
      changed.push(path || '/')
    }
  }

  walk(left, right, '')

  return {
    added,
    removed,
    changed,
    totalChanges: added.length + removed.length + changed.length
  }
}
