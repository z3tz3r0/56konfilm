import { describe, expect, it } from 'vitest';
import { getAlignmentClass, getJustifyClass } from '@shared/utils';

describe('getAlignmentClass', () => {
  it('returns start alignment by default', () => {
    expect(getAlignmentClass()).toBe('items-start text-left');
  });

  it('returns center alignment', () => {
    expect(getAlignmentClass('center')).toBe('items-center text-center');
  });

  it('returns end alignment', () => {
    expect(getAlignmentClass('end')).toBe('items-end text-right');
  });

  it('falls back to start for unknown values', () => {
    expect(getAlignmentClass('invalid')).toBe('items-start text-left');
  });
});

describe('getJustifyClass', () => {
  it('returns start justify by default', () => {
    expect(getJustifyClass()).toBe('justify-start');
  });

  it('returns center justify', () => {
    expect(getJustifyClass('center')).toBe('justify-center');
  });

  it('returns end justify', () => {
    expect(getJustifyClass('end')).toBe('justify-end');
  });

  it('falls back to start for unknown values', () => {
    expect(getJustifyClass('invalid')).toBe('justify-start');
  });
});
