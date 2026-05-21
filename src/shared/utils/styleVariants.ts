type AlignmentKey = 'start' | 'center' | 'end';
type bgVariantsKeys = 'default' | 'muted' | 'contrast';

const ALIGNMENT_CLASS_MAP = {
  start: 'items-start text-left',
  center: 'items-center text-center',
  end: 'items-end text-right',
};
const JUSTIFY_CLASS_MAP = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};
const backgroundVariants: Record<bgVariantsKeys, string> = {
  default: '',
  muted: 'bg-secondary',
  contrast: 'bg-primary text-primary-foreground',
};

const isAlignmentKey = (value: string): value is AlignmentKey =>
  value === 'start' || value === 'center' || value === 'end';
const isBgVariantKey = (value: string): value is bgVariantsKeys =>
  value === 'default' || value === 'muted' || value === 'contrast';

const getAlignmentClass = (align?: string) =>
  align && isAlignmentKey(align)
    ? ALIGNMENT_CLASS_MAP[align]
    : ALIGNMENT_CLASS_MAP.start;
const getJustifyClass = (align?: string) =>
  align && isAlignmentKey(align)
    ? JUSTIFY_CLASS_MAP[align]
    : JUSTIFY_CLASS_MAP.start;
const getBGVariants = (key?: string) =>
  key && isBgVariantKey(key)
    ? backgroundVariants[key]
    : backgroundVariants.default;

export { getAlignmentClass, getJustifyClass, getBGVariants };
