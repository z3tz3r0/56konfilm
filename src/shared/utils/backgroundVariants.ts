type bgVariantsKeys = 'default' | 'muted' | 'contrast';

const backgroundVariants: Record<bgVariantsKeys, string> = {
  default: '',
  muted: 'bg-secondary',
  contrast: 'bg-primary text-primary-foreground',
};

const getBGVariants = (key?: string) =>
  backgroundVariants[key as bgVariantsKeys] ?? backgroundVariants.default;

export { getBGVariants };
