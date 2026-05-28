import { describe, it, expect } from 'vitest'
import { getNextStatus, isFinished } from '@/lib/actions/skull-helpers'
import type { SkullStatus } from '@/lib/types'

describe('getNextStatus', () => {
  it('returns the next status in sequence', () => {
    expect(getNextStatus('Deer Head Received')).toBe('Skull Skinned')
    expect(getNextStatus('Skull Skinned')).toBe('Maceration Period')
    expect(getNextStatus('Whitening')).toBe('Finished')
  })

  it('returns null when already at Finished', () => {
    expect(getNextStatus('Finished')).toBeNull()
  })
})

describe('isFinished', () => {
  it('returns true when status is Finished', () => {
    expect(isFinished('Finished')).toBe(true)
  })

  it('returns false for all other statuses', () => {
    const others: SkullStatus[] = [
      'Deer Head Received', 'Skull Skinned', 'Maceration Period',
      'Skull Cleaning', 'Degreasing', 'Whitening',
    ]
    others.forEach(s => expect(isFinished(s)).toBe(false))
  })
})
