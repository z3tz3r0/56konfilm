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

const getAlignmentClass = (align?: string) =>
  ALIGNMENT_CLASS_MAP[align as AlignmentKey] ?? ALIGNMENT_CLASS_MAP.start;
const getJustifyClass = (align?: string) =>
  JUSTIFY_CLASS_MAP[align as AlignmentKey] ?? JUSTIFY_CLASS_MAP.start;
const getBGVariants = (key?: string) =>
  backgroundVariants[key as bgVariantsKeys] ?? backgroundVariants.default;

export { getAlignmentClass, getJustifyClass, getBGVariants };
