import { SKULL_STATUSES } from '@/lib/constants'
import type { SkullStatus } from '@/lib/types'

export function getNextStatus(current: SkullStatus): SkullStatus | null {
  const index = SKULL_STATUSES.indexOf(current)
  return index < SKULL_STATUSES.length - 1 ? SKULL_STATUSES[index + 1] : null
}

export function isFinished(status: SkullStatus): boolean {
  return status === 'Finished'
}
