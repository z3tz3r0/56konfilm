import type { StringInputProps } from 'sanity';

/** Display the legacy value without silently rewriting existing page content. */
export function PackageSourceTypeInput(props: StringInputProps) {
  return props.renderDefault({
    ...props,
    value:
      props.value === undefined || props.value === 'inline'
        ? 'manual'
        : props.value,
  });
}
