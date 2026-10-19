/** Replace only remote icon loading; AppIcon's real wrapper and sizing remain. */
export function Icon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  return (
    <svg viewBox='0 0 24 24' className={className} data-icon-name={icon}>
      <rect x='3' y='5' width='18' height='14' rx='2' fill='currentColor' />
      <circle cx='12' cy='12' r='4' fill='none' stroke='currentColor' />
    </svg>
  );
}
