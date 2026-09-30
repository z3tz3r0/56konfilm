import { describe, expect, it } from 'vitest';
import { buttonVariants } from '@shared/components/ui/button';

describe('Button disabled hover styles', () => {
  it.each([
    'default',
    'destructive',
    'secondary',
    'neutral',
    'ghost',
    'link',
  ] as const)('applies hover styles only while %s is enabled', (variant) => {
    const hoverClasses = buttonVariants({ variant })
      .split(' ')
      .filter((className) => className.includes('hover:'));

    expect(hoverClasses.length).toBeGreaterThan(0);
    expect(
      hoverClasses.every((className) =>
        className.includes('hover:not-disabled:')
      )
    ).toBe(true);
  });
});
