type AlignmentKey = 'start' | 'center' | 'end';

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

const getAlignmentClass = (align?: string) =>
  ALIGNMENT_CLASS_MAP[align as AlignmentKey] ?? ALIGNMENT_CLASS_MAP.start;

const getJustifyClass = (align?: string) =>
  JUSTIFY_CLASS_MAP[align as AlignmentKey] ?? JUSTIFY_CLASS_MAP.start;

export { getAlignmentClass, getJustifyClass };
