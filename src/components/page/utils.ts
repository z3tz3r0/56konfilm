const ALIGNMENT_CLASS_MAP: Record<string, string> = {
  start: 'items-start text-left',
  center: 'items-center text-center',
  end: 'items-end text-right',
};

const JUSTIFY_CLASS_MAP: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

export function getAlignmentClass(align?: string): string {
  if (!align) {
    return ALIGNMENT_CLASS_MAP.start;
  }

  return ALIGNMENT_CLASS_MAP[align] ?? ALIGNMENT_CLASS_MAP.start;
}

export function getJustifyClass(align?: string): string {
  if (!align) {
    return JUSTIFY_CLASS_MAP.start;
  }

  return JUSTIFY_CLASS_MAP[align] ?? JUSTIFY_CLASS_MAP.start;
}
