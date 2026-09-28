import { fireEvent, render, screen } from '@testing-library/react';
import { set, type UrlInputProps } from 'sanity';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleMapsEmbedUrlInput } from './GoogleMapsEmbedUrlInput';

const toastPush = vi.hoisted(() => vi.fn());
vi.mock('@sanity/ui', () => ({
  useToast: () => ({ push: toastPush }),
}));

const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18';

function renderInput(readOnly = false) {
  const onChange = vi.fn();
  const renderDefault = vi.fn((props: UrlInputProps) => (
    <input
      aria-label='Google Maps Embed URL'
      value={props.value ?? ''}
      readOnly={props.readOnly}
      onChange={() => undefined}
    />
  ));
  const props = {
    onChange,
    renderDefault,
    readOnly,
    value: 'https://www.google.com/maps/embed?pb=old',
  } as unknown as UrlInputProps;
  render(<GoogleMapsEmbedUrlInput {...props} />);
  return { onChange, renderDefault, props };
}

function paste(value: string) {
  fireEvent.paste(screen.getByRole('textbox'), {
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? value : ''),
    },
  });
}

describe('GoogleMapsEmbedUrlInput', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reuses the default URL input and stores only the URL from pasted iframe markup', () => {
    const { onChange, renderDefault, props } = renderInput();
    expect(renderDefault).toHaveBeenCalledWith(props);

    paste(`<iframe width="600" src="${mapUrl}" height="450"></iframe>`);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(set(mapUrl));
    expect(toastPush).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success' })
    );
  });

  it('leaves direct URL paste to the standard URL input', () => {
    const { onChange } = renderInput();
    paste(mapUrl);
    expect(onChange).not.toHaveBeenCalled();
    expect(toastPush).not.toHaveBeenCalled();
  });

  it('rejects unrelated HTML without replacing the saved URL', () => {
    const { onChange } = renderInput();
    paste('<iframe src="https://example.com/map"></iframe>');
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue(
      'https://www.google.com/maps/embed?pb=old'
    );
    expect(toastPush).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' })
    );
  });

  it('does not intercept paste when the field is read-only', () => {
    const { onChange } = renderInput(true);
    paste(`<iframe src="${mapUrl}"></iframe>`);
    expect(onChange).not.toHaveBeenCalled();
    expect(toastPush).not.toHaveBeenCalled();
  });
});
