/** Offline placeholder only; layout tests assert the requested bi:quote name,
 * not the downloaded glyph artwork. AppIcon and its sizing remain real. */
export function Icon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  return (
    <svg viewBox='0 0 24 24' className={className} data-icon-name={icon}>
      <path
        fill='currentColor'
        d='M3 6h7v8H6c0 2 1 3 3 4v2c-4-1-6-4-6-8V6zm11 0h7v8h-4c0 2 1 3 3 4v2c-4-1-6-4-6-8V6z'
      />
    </svg>
  );
}
