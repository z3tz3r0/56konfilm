import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type {
  ArrayOfObjectsInputProps,
  FormPatch,
  Reference,
  StringInputProps,
} from 'sanity';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PackageServicePackagesInput } from '@/sanity/components/inputs/PackageServicePackagesInput';
import { PackageGroupServiceOrderInput } from '@/sanity/components/inputs/PackageGroupServiceOrderInput';
import { PackageSourceTypeInput } from '@/sanity/components/inputs/PackageSourceTypeInput';
import {
  orderedCatalogServices,
  reorderCatalogReferences,
  toggleCatalogReference,
} from '@/sanity/lib/packageCatalog';

const mocks = vi.hoisted(() => {
  const fetch = vi.fn();
  const unsubscribe = vi.fn();
  const subscribe = vi.fn((_observer: unknown) => ({ unsubscribe }));
  const client = {
    fetch,
    withConfig: vi.fn().mockReturnThis(),
    listen: vi.fn((_query: string, _params: unknown, _options: unknown) => ({
      subscribe,
    })),
  };
  return {
    client,
    fetch,
    unsubscribe,
    subscribe,
    form: { siteMode: 'wedding', packages: [] as Reference[] },
  };
});
vi.mock('sanity', async (importOriginal) => ({
  ...(await importOriginal<typeof import('sanity')>()),
  useClient: () => mocks.client,
  useFormValue: (path: string[]) =>
    mocks.form[path[0] as keyof typeof mocks.form],
}));
// Test form interactions with native semantics, independently of Studio theming.
vi.mock('@sanity/ui', async () => {
  const { createElement } = await import('react');
  /** Renders a lightweight Sanity UI substitute that preserves relevant DOM and event props. */
  function container(props: any, fallback = 'div') {
    const attributes = Object.fromEntries(
      Object.entries(props).filter(
        ([key]) =>
          key.startsWith('aria-') ||
          key.startsWith('on') ||
          [
            'id',
            'style',
            'htmlFor',
            'role',
            'ref',
            'disabled',
            'draggable',
          ].includes(key)
      )
    );
    return createElement(props.as ?? fallback, attributes, props.children);
  }
  return {
    Card: (props: any) => container(props),
    Stack: (props: any) => container(props),
    Flex: (props: any) => container(props),
    Text: (props: any) => container(props, 'span'),
    Spinner: (props: any) =>
      createElement('span', {
        role: 'status',
        'aria-label': props['aria-label'],
      }),
    Checkbox: (props: any) =>
      createElement('input', { ...props, type: 'checkbox' }),
    Button: (props: any) =>
      container({ ...props, children: props.text }, 'button'),
  };
});
/** Creates a keyed Sanity reference for catalog input fixtures. */
const reference = (_ref: string, _key = `key-${_ref}`): Reference => ({
  _type: 'reference',
  _ref,
  _key,
});
/** Creates a catalog entry with a predictable title and creation timestamp. */
const entry = (_id: string, day = 1) => ({
  _id,
  _createdAt: `2026-01-0${day}T00:00:00Z`,
  title: [{ value: _id }],
});
/** Creates catalog input props with a change spy and optional value or read-only state. */
function inputProps(value?: Reference[], readOnly = false) {
  const onChange = vi.fn();
  return {
    onChange,
    props: { value, readOnly, onChange } as unknown as ArrayOfObjectsInputProps,
  };
}
/** Extracts the reference IDs from the first insert patch, if present. */
const insertedIds = (patches: FormPatch[]) =>
  (
    patches.find((patch) => patch.type === 'insert') as
      | { items: Reference[] }
      | undefined
  )?.items.map((item) => item._ref);
/** Reads the displayed service labels in their current list order. */
const listIds = () =>
  within(screen.getByRole('list', { name: 'รายการเปรียบเทียบ' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

beforeEach(() => {
  mocks.fetch.mockReset();
  mocks.client.withConfig.mockClear();
  mocks.client.listen.mockClear();
  mocks.subscribe.mockClear();
  mocks.unsubscribe.mockClear();
  mocks.form.siteMode = 'wedding';
  mocks.form.packages = [reference('package')];
});

describe('Service Package checkbox input', () => {
  it('reads the published mode catalog without patching and can remove the final selection in draft', async () => {
    mocks.fetch.mockResolvedValue([entry('package')]);
    const { onChange, props } = inputProps([reference('package')]);
    render(<PackageServicePackagesInput {...props} />);
    const checkbox = await screen.findByRole('checkbox', { name: 'package' });
    expect(checkbox).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(mocks.client.withConfig).toHaveBeenCalledWith({
      perspective: 'published',
      useCdn: false,
    });
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "package"'),
      { mode: 'wedding' }
    );
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toMatchObject([
      { type: 'unset', path: [{ _key: 'key-package' }] },
    ]);
  });

  it('adds only the selected reference through granular patches', async () => {
    mocks.fetch.mockResolvedValue([entry('package')]);
    const { onChange, props } = inputProps();
    render(<PackageServicePackagesInput {...props} />);
    fireEvent.click(await screen.findByRole('checkbox', { name: 'package' }));
    const patches = onChange.mock.calls[0][0] as FormPatch[];
    expect(patches.map((patch) => patch.type)).toEqual([
      'setIfMissing',
      'insert',
    ]);
    expect(insertedIds(patches)).toEqual(['package']);
  });

  it('allows removing stale selected references without showing them as available checkboxes', async () => {
    mocks.fetch.mockResolvedValue([entry('package')]);
    const { onChange, props } = inputProps([reference('stale')]);
    render(<PackageServicePackagesInput {...props} />);
    const remove = await screen.findByRole('button', {
      name: 'ลบรายการอ้างอิง stale',
    });
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    fireEvent.click(remove);
    expect(onChange.mock.calls[0][0]).toMatchObject([
      { type: 'unset', path: [{ _key: 'key-stale' }] },
    ]);
  });

  it('preserves selections on read failure and supports retry without auto-patching', async () => {
    mocks.fetch
      .mockRejectedValueOnce(new Error('fixture outage'))
      .mockResolvedValueOnce([entry('package')]);
    const { onChange, props } = inputProps([reference('package')]);
    render(<PackageServicePackagesInput {...props} />);
    await screen.findByText(/ยังโหลดแพ็กเกจไม่ได้/);
    expect(
      screen.queryByRole('button', { name: /ลบรายการอ้างอิง/ })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    expect(
      await screen.findByRole('checkbox', { name: 'package' })
    ).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });

  it('blocks editing in read-only forms and makes no request when mode is missing', async () => {
    mocks.fetch.mockResolvedValue([entry('package')]);
    const { onChange, props } = inputProps([reference('package')], true);
    const view = render(<PackageServicePackagesInput {...props} />);
    const checkbox = await screen.findByRole('checkbox', { name: 'package' });
    expect(checkbox).toBeDisabled();
    fireEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
    view.unmount();
    mocks.fetch.mockClear();
    mocks.form.siteMode = '';
    render(<PackageServicePackagesInput {...props} />);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});

describe('Group derived sortable input', () => {
  it('autofills, removes stale rows from the view, and orders new rows by date/ID without a load patch', async () => {
    mocks.fetch.mockResolvedValue([
      entry('c', 3),
      entry('b', 1),
      entry('a', 1),
    ]);
    const { onChange, props } = inputProps([
      reference('c'),
      reference('stale'),
    ]);
    render(<PackageGroupServiceOrderInput {...props} />);
    await screen.findByRole('button', { name: 'จัดลำดับ c' });
    expect(listIds()).toEqual(['c', 'a', 'b']);
    expect(onChange).not.toHaveBeenCalled();
    expect(mocks.fetch).toHaveBeenCalledWith(
      expect.stringContaining('_type == "packageService"'),
      { mode: 'wedding', packageIds: ['package'] }
    );
  });

  it('materializes derived order only after keyboard moves and retains existing reference keys', async () => {
    mocks.fetch.mockResolvedValue([entry('a'), entry('b', 2), entry('c', 3)]);
    const { onChange, props } = inputProps([reference('a')]);
    const view = render(<PackageGroupServiceOrderInput {...props} />);
    const handle = await screen.findByRole('button', { name: 'จัดลำดับ c' });
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(insertedIds(onChange.mock.calls[0][0])).toEqual(['c', 'a', 'b']);
    const insert = (onChange.mock.calls[0][0] as FormPatch[]).find(
      (patch) => patch.type === 'insert'
    ) as unknown as { items: Reference[] };
    expect(insert.items[1]._key).toBe('key-a');
    expect(insert.items[0]).toMatchObject({ _weak: true });
    expect(
      (onChange.mock.calls[0][0] as FormPatch[]).some(
        (patch) => patch.type === 'set'
      )
    ).toBe(false);
    view.rerender(
      <PackageGroupServiceOrderInput {...props} value={insert.items as never} />
    );
    expect(listIds()).toEqual(['c', 'a', 'b']);
    expect(screen.getByRole('status')).toHaveTextContent('ย้าย c ไปที่ลำดับ 1');
  });

  it('supports drag and explicit move buttons without availability controls', async () => {
    mocks.fetch.mockResolvedValue([entry('a'), entry('b', 2), entry('c', 3)]);
    const { onChange, props } = inputProps();
    render(<PackageGroupServiceOrderInput {...props} />);
    const handle = await screen.findByRole('button', { name: 'จัดลำดับ a' });
    const dataTransfer = { effectAllowed: '', setData: vi.fn() };
    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.dragOver(
      screen.getByRole('button', { name: 'จัดลำดับ c' }).closest('li')!
    );
    fireEvent.drop(
      screen.getByRole('button', { name: 'จัดลำดับ c' }).closest('li')!
    );
    expect(insertedIds(onChange.mock.calls[0][0])).toEqual(['b', 'c', 'a']);
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'เลื่อน b ขึ้น' }));
    expect(insertedIds(onChange.mock.calls[0][0])).toEqual(['b', 'a', 'c']);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /เพิ่ม|ลบ/ })
    ).not.toBeInTheDocument();
  });

  it('retains stored order on query/listener failure and blocks moves until retry', async () => {
    mocks.fetch.mockResolvedValue([entry('a'), entry('b', 2)]);
    const { onChange, props } = inputProps([reference('b'), reference('a')]);
    render(<PackageGroupServiceOrderInput {...props} />);
    await screen.findByRole('button', { name: 'จัดลำดับ b' });
    const subscription = mocks.subscribe.mock.calls[0][0] as unknown as {
      error: (error: Error) => void;
    };
    act(() => subscription.error(new Error('fixture disconnected')));
    expect(listIds()).toEqual(['b', 'a']);
    expect(screen.getByRole('button', { name: 'จัดลำดับ b' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('button', { name: 'จัดลำดับ b' }), {
      key: 'ArrowDown',
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'จัดลำดับ b' })
      ).not.toBeDisabled()
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(mocks.client.listen.mock.calls[0][0]).toContain(
      '!(_id in path("drafts.**"))'
    );
  });

  it('keeps read-only order intact and does not patch newly eligible services on refresh', async () => {
    mocks.fetch
      .mockResolvedValueOnce([entry('a'), entry('b', 2)])
      .mockResolvedValueOnce([entry('a'), entry('b', 2), entry('c', 3)]);
    const { onChange, props } = inputProps([reference('b')], true);
    const view = render(<PackageGroupServiceOrderInput {...props} />);
    await screen.findByRole('button', { name: 'จัดลำดับ b' });
    const subscription = mocks.subscribe.mock.calls[0][0] as unknown as {
      next: () => void;
    };
    act(() => subscription.next());
    await screen.findByRole('button', { name: 'จัดลำดับ c' });
    expect(listIds()).toEqual(['b', 'a', 'c']);
    expect(screen.getByRole('button', { name: 'จัดลำดับ b' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
    view.unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledOnce();
  });
});

describe('Catalog form patches and legacy source display', () => {
  it('does not duplicate references and unsets duplicate IDs by their stable keys', () => {
    const value = [
      reference('a', 'one'),
      reference('drafts.a', 'two'),
      reference('b'),
    ];
    expect(toggleCatalogReference(value, 'a', true)).toEqual([]);
    expect(toggleCatalogReference(value, 'a', false)).toMatchObject([
      { type: 'unset', path: [{ _key: 'one' }] },
      { type: 'unset', path: [{ _key: 'two' }] },
    ]);
    const patches = reorderCatalogReferences(
      [reference('a'), reference('stale')],
      ['b', 'a']
    );
    expect(insertedIds(patches)).toEqual(['b', 'a']);
    expect(patches.some((patch) => patch.type === 'set')).toBe(false);
    expect(
      orderedCatalogServices(
        [entry('b'), entry('a')],
        [reference('stale'), reference('b'), reference('b')]
      ).map((item) => item._id)
    ).toEqual(['b', 'a']);
  });

  it.each([undefined, 'inline', 'manual', 'catalog'])(
    'displays source %s using the native input without changing the stored value',
    (value) => {
      const onChange = vi.fn();
      const renderDefault = vi.fn(() => null);
      const props = {
        value,
        onChange,
        renderDefault,
      } as unknown as StringInputProps;
      render(<PackageSourceTypeInput {...props} />);
      expect(renderDefault).toHaveBeenCalledWith({
        ...props,
        value: value === 'catalog' ? 'catalog' : 'manual',
      });
      expect(onChange).not.toHaveBeenCalled();
    }
  );
});
