import { describe, expect, it } from 'vitest'
import { diffAsJsonPointers } from './schemaDiff'

describe('schemaDiff', () => {
  it('added/removed/changed を JSON Pointer で返すこと', () => {
    const current = {
      version: '2026.1.0',
      rules: {
        residentTaxRate: 0.1,
        deductions: {
          spouse: 380000
        }
      }
    }

    const next = {
      version: '2026.2.0',
      rules: {
        residentTaxRate: 0.11,
        deductions: {
          dependent: 380000
        }
      },
      uiMeta: {
        labels: {
          version: '法令バージョン'
        }
      }
    }

    const diff = diffAsJsonPointers(current, next)

    expect(diff.added).toContain('/uiMeta')
    expect(diff.added).toContain('/rules/deductions/dependent')
    expect(diff.removed).toContain('/rules/deductions/spouse')
    expect(diff.changed).toContain('/version')
    expect(diff.changed).toContain('/rules/residentTaxRate')
    expect(diff.totalChanges).toBe(diff.added.length + diff.removed.length + diff.changed.length)
  })
})
