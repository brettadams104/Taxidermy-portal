import { describe, it, expect } from 'vitest'
import { renderTemplate, buildTemplateVars } from '@/lib/notifications/templates'

describe('renderTemplate', () => {
  it('replaces all known variables', () => {
    const result = renderTemplate(
      'Hi {name}, your {points}-point skull (Tag: {dnr_tag}) is done! - {business_name}',
      { name: 'John', points: '8', dnr_tag: 'MI-123', business_name: 'Skull Studio' }
    )
    expect(result).toBe('Hi John, your 8-point skull (Tag: MI-123) is done! - Skull Studio')
  })

  it('leaves unknown variables unchanged', () => {
    const result = renderTemplate('Hello {unknown}', { name: 'John', points: undefined, dnr_tag: undefined, business_name: 'SS' })
    expect(result).toBe('Hello {unknown}')
  })

  it('replaces missing optional variables with empty string', () => {
    const result = renderTemplate('DNR: {dnr_tag}', { name: 'John', points: undefined, dnr_tag: undefined, business_name: 'SS' })
    expect(result).toBe('DNR: ')
  })

  it('handles multiline templates', () => {
    const result = renderTemplate('Hi {name},\n\nYour skull is ready.\n\n- {business_name}', {
      name: 'John', points: undefined, dnr_tag: undefined, business_name: 'Skull Studio'
    })
    expect(result).toBe('Hi John,\n\nYour skull is ready.\n\n- Skull Studio')
  })
})

describe('buildTemplateVars', () => {
  it('converts null points to undefined', () => {
    const vars = buildTemplateVars('John', null, 'MI-123', 'SS')
    expect(vars.points).toBeUndefined()
  })

  it('converts non-null points to string', () => {
    const vars = buildTemplateVars('John', 8, 'MI-123', 'SS')
    expect(vars.points).toBe('8')
  })
})
