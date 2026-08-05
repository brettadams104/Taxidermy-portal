import { describe, it, expect } from 'vitest'
import { isValidStatus, getFinalStage } from '@/lib/queries/stages'
import { isSkullCompleted } from '@/lib/types/business'

describe('Dynamic Stages', () => {
  describe('isValidStatus', () => {
    it('should validate status against business stages', () => {
      const stages = ['Received', 'Processing', 'Complete']
      expect(isValidStatus('Received', stages)).toBe(true)
      expect(isValidStatus('Processing', stages)).toBe(true)
      expect(isValidStatus('Complete', stages)).toBe(true)
    })

    it('should reject invalid status', () => {
      const stages = ['Received', 'Processing', 'Complete']
      expect(isValidStatus('Invalid', stages)).toBe(false)
      expect(isValidStatus('Unknown', stages)).toBe(false)
      expect(isValidStatus('', stages)).toBe(false)
    })

    it('should handle empty stages array', () => {
      const stages: string[] = []
      expect(isValidStatus('Received', stages)).toBe(false)
    })

    it('should handle case-sensitive validation', () => {
      const stages = ['Received', 'Processing', 'Complete']
      expect(isValidStatus('received', stages)).toBe(false)
      expect(isValidStatus('RECEIVED', stages)).toBe(false)
    })
  })

  describe('getFinalStage', () => {
    it('should get final stage correctly', () => {
      const stages = ['A', 'B', 'C']
      expect(getFinalStage(stages)).toBe('C')
    })

    it('should work with single stage', () => {
      const stages = ['Only']
      expect(getFinalStage(stages)).toBe('Only')
    })

    it('should get final stage from longer sequences', () => {
      const stages = ['Received', 'Skinned', 'Maceration', 'Cleaning', 'Whitening', 'Finished']
      expect(getFinalStage(stages)).toBe('Finished')
    })

    it('should throw error for empty stages', () => {
      const stages: string[] = []
      expect(() => getFinalStage(stages)).toThrow('Cannot get final stage from empty array')
    })
  })

  describe('isSkullCompleted', () => {
    it('should detect completed skulls', () => {
      const stages = ['R', 'P', 'C']
      expect(isSkullCompleted('C', stages)).toBe(true)
    })

    it('should detect incomplete skulls', () => {
      const stages = ['R', 'P', 'C']
      expect(isSkullCompleted('R', stages)).toBe(false)
      expect(isSkullCompleted('P', stages)).toBe(false)
    })

    it('should handle all in-progress stages', () => {
      const stages = ['Received', 'Processing', 'Complete']
      expect(isSkullCompleted('Received', stages)).toBe(false)
      expect(isSkullCompleted('Processing', stages)).toBe(false)
      expect(isSkullCompleted('Complete', stages)).toBe(true)
    })

    it('should handle single stage', () => {
      const stages = ['Only']
      expect(isSkullCompleted('Only', stages)).toBe(true)
    })

    it('should return false for empty stages', () => {
      const stages: string[] = []
      expect(isSkullCompleted('Complete', stages)).toBe(false)
    })

    it('should be case-sensitive', () => {
      const stages = ['Received', 'Processing', 'Complete']
      expect(isSkullCompleted('complete', stages)).toBe(false)
      expect(isSkullCompleted('Complete', stages)).toBe(true)
    })
  })

  describe('Various stage counts', () => {
    it('should handle 2 stages (minimal)', () => {
      const stages = ['Start', 'End']
      expect(getFinalStage(stages)).toBe('End')
      expect(isSkullCompleted('Start', stages)).toBe(false)
      expect(isSkullCompleted('End', stages)).toBe(true)
    })

    it('should handle 3 stages', () => {
      const stages = ['1', '2', '3']
      expect(getFinalStage(stages)).toBe('3')
      expect(isSkullCompleted('1', stages)).toBe(false)
      expect(isSkullCompleted('2', stages)).toBe(false)
      expect(isSkullCompleted('3', stages)).toBe(true)
    })

    it('should handle 5 stages', () => {
      const stages = ['A', 'B', 'C', 'D', 'E']
      expect(getFinalStage(stages)).toBe('E')
      expect(isSkullCompleted('A', stages)).toBe(false)
      expect(isSkullCompleted('C', stages)).toBe(false)
      expect(isSkullCompleted('E', stages)).toBe(true)
    })

    it('should handle 9+ stages', () => {
      const stages = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9']
      expect(getFinalStage(stages)).toBe('S9')
      expect(isSkullCompleted('S1', stages)).toBe(false)
      expect(isSkullCompleted('S5', stages)).toBe(false)
      expect(isSkullCompleted('S9', stages)).toBe(true)
    })
  })

  describe('Stage validation with dynamic counts', () => {
    it('should validate all statuses in 2-stage workflow', () => {
      const stages = ['Received', 'Complete']
      expect(isValidStatus('Received', stages)).toBe(true)
      expect(isValidStatus('Complete', stages)).toBe(true)
      expect(isValidStatus('Processing', stages)).toBe(false)
    })

    it('should validate all statuses in 5-stage workflow', () => {
      const stages = ['R', 'P', 'Cl', 'Wh', 'C']
      expect(isValidStatus('R', stages)).toBe(true)
      expect(isValidStatus('Cl', stages)).toBe(true)
      expect(isValidStatus('C', stages)).toBe(true)
      expect(isValidStatus('Invalid', stages)).toBe(false)
    })
  })
})
