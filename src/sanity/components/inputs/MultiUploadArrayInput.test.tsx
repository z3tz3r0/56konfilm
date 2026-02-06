
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ArrayOfObjectsInputProps } from 'sanity';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MultiUploadArrayInput } from './MultiUploadArrayInput';

// Mock Sanity hooks and components
const mockUpload = vi.fn();
const mockClient = {
  assets: {
    upload: mockUpload,
  },
};

vi.mock('sanity', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useClient: () => mockClient,
    MemberField: () => <div data-testid="member-field" />,
  };
});

// Mock UI components
const mockToast = { push: vi.fn() };
vi.mock('@sanity/ui', () => ({
  useToast: () => mockToast,
  Stack: ({ children }: any) => <div>{children}</div>,
  Flex: ({ children }: any) => <div>{children}</div>,
  Card: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  Spinner: () => <div data-testid="spinner" />,
  Text: ({ children }: any) => <div>{children}</div>,
}));

describe('MultiUploadArrayInput', () => {
  const mockOnChange = vi.fn();
  
  // Minimal mock of props required for the component
  const defaultProps: Partial<ArrayOfObjectsInputProps> = {
    onChange: mockOnChange,
    schemaType: {
      jsonType: 'array',
      name: 'items',
      of: [
        { name: 'galleryItem', type: { name: 'galleryItem' } } as any
      ],
    } as any,
    members: [],
    renderDefault: vi.fn(), // If we wrap default
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AC1: Should handle file drop and upload images', async () => {
    // GIVEN: Upload returns a valid asset
    mockUpload.mockResolvedValue({ _id: 'image-123' });

    render(<MultiUploadArrayInput {...(defaultProps as any)} />);

    // WHEN: Dropping an image file
    const file = new File(['dummy content'], 'test-image.png', { type: 'image/png' });
    const dropZone = screen.getByTestId('multi-upload-dropzone');
    
    // Simulate Drag & Drop assertions (red phase - functionality not implemented)
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    // THEN: Asset upload should be initiated
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith('image', file, expect.anything());
    });

    // AND: Patch should be emitted to add the item
    expect(mockOnChange).toHaveBeenCalled();
    const calls = mockOnChange.mock.calls;
    // Inspect patch content if needed, but presence is enough for now
    const patchCall = calls.find(call => JSON.stringify(call).includes('setIfMissing'));
    expect(patchCall).toBeDefined();
  });

  it('AC3: Should handle video uploads specifically', async () => {
    // GIVEN: Video file
    mockUpload.mockResolvedValue({ _id: 'video-456' });

    render(<MultiUploadArrayInput {...(defaultProps as any)} />);

    // WHEN: Dropping a video file
    const file = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
    const dropZone = screen.getByTestId('multi-upload-dropzone');
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    // THEN: Asset upload should be initiated for 'file' type usually, or 'image' if Sanity handles it, 
    // but AC says "mediaType = video", "videoFile = ..."
    await waitFor(() => {
        // Sanity client.assets.upload('file', ...) for videos usually
        expect(mockUpload).toHaveBeenCalledWith('file', file, expect.anything());
    });
  });

  it('AC4: Should show toast on success', async () => {
    mockUpload.mockResolvedValue({ _id: 'asset-789' });
    render(<MultiUploadArrayInput {...(defaultProps as any)} />);

    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const dropZone = screen.getByTestId('multi-upload-dropzone');
    
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(mockToast.push).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success' })
      );
    });
  });

  it('should warn on invalid file types', async () => {
    render(<MultiUploadArrayInput {...(defaultProps as any)} />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const dropZone = screen.getByTestId('multi-upload-dropzone');

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(mockToast.push).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'warning' })
      );
    });
  });
});
