import { describe, it, expect } from 'vitest'
import { getNextStatus, isFinished, isPendingPickup } from '@/lib/actions/skull-helpers'
import type { SkullStatus } from '@/lib/types'

describe('getNextStatus', () => {
  it('returns the next status in sequence', () => {
    expect(getNextStatus('Deer Head Received')).toBe('Skull Skinned')
    expect(getNextStatus('Skull Skinned')).toBe('Maceration Period')
    expect(getNextStatus('Whitening')).toBe('Finished')
    expect(getNextStatus('Finished')).toBe('Pending Pickup')
  })

  it('returns null when already at Pending Pickup', () => {
    expect(getNextStatus('Pending Pickup')).toBeNull()
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

describe('Pending Pickup Status', () => {
  it('should transition from Finished to Pending Pickup', () => {
    const nextStatus = getNextStatus('Finished')
    expect(nextStatus).toBe('Pending Pickup')
  })

  it('should return null for Pending Pickup (no further status)', () => {
    const nextStatus = getNextStatus('Pending Pickup')
    expect(nextStatus).toBeNull()
  })

  it('isPendingPickup should correctly identify Pending Pickup status', () => {
    expect(isPendingPickup('Pending Pickup')).toBe(true)
    expect(isPendingPickup('Finished')).toBe(false)
    expect(isPendingPickup('Whitening')).toBe(false)
  })
})
