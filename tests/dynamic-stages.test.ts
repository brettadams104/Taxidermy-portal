import { isValidStatus, getFinalStage, isSkullCompleted, getInProgressStages } from '@/lib/queries/stages';

describe('Dynamic Stages', () => {
  const testStages = ['Received', 'Processing', 'Complete'];

  it('should validate status against business stages', () => {
    expect(isValidStatus('Received', testStages)).toBe(true);
    expect(isValidStatus('Invalid', testStages)).toBe(false);
  });

  it('should correctly identify final stage', () => {
    expect(getFinalStage(testStages)).toBe('Complete');
  });

  it('should check skull completion status', () => {
    expect(isSkullCompleted('Complete', testStages)).toBe(true);
    expect(isSkullCompleted('Received', testStages)).toBe(false);
  });

  it('should get in-progress stages', () => {
    expect(getInProgressStages(testStages)).toEqual(['Received', 'Processing']);
  });

  it('should handle different stage counts', () => {
    const customStages = ['S1', 'S2', 'S3', 'S4', 'S5'];
    expect(getFinalStage(customStages)).toBe('S5');
    expect(getInProgressStages(customStages)).toHaveLength(4);
  });
});
