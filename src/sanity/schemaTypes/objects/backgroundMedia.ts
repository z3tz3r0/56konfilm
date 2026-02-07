import { defineField, defineType } from 'sanity';

type BackgroundMediaItem = {
  _type?: string;
};

/** Type for image field value with asset reference */
export type ImageAssetValue = {
  asset?: {
    _ref?: string;
  };
};

/** Type for Sanity validation context with client access */
export type SanityValidationContext = {
  getClient?: (options: { apiVersion: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: (query: string, params: Record<string, string>) => Promise<any>;
  };
};

export const MAX_IMAGE_SIZE_BYTES = 1_000_000;
export const IMAGE_SIZE_WARNING_MESSAGE =
  'Warning: Image too large, please optimize < 1MB';

/**
 * Reusable async validation function for image asset size.
 * Returns a warning message if image exceeds 1MB.
 * Fails-open with console warning on network errors.
 */
export const validateImageAssetSizeWarning = async (
  value: ImageAssetValue | undefined,
  context: SanityValidationContext | undefined
): Promise<true | string> => {
  const assetRef = value?.asset?._ref;
  if (!assetRef || !context?.getClient) {
    return true;
  }

  try {
    const client = context.getClient({ apiVersion: '2023-11-20' });
    const asset = (await client.fetch(
      '*[_id == $ref][0]{size}',
      { ref: assetRef }
    )) as { size?: number };

    if (typeof asset?.size === 'number' && asset.size > MAX_IMAGE_SIZE_BYTES) {
      return IMAGE_SIZE_WARNING_MESSAGE;
    }
  } catch (error) {
    // Fail-open but log warning for debugging
    console.warn('[Sanity Validation] Image size check failed, skipping:', error);
    return true;
  }

  return true;
};

export const backgroundMediaType = defineType({
  name: 'backgroundMedia',
  title: 'Background Media',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaAsset',
      title: 'Media Asset',
      description: 'เลือกรูปภาพหรือวิดีโอสำหรับใช้เป็นพื้นหลัง (สำหรับวิดีโอ: เพิ่มรูปภาพ poster เพื่อ blur-up effect)',
      type: 'array',
      of: [
        defineField({
          name: 'backgroundImage',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          validation: (Rule) =>
            Rule.custom((value, context) =>
              validateImageAssetSizeWarning(
                value as ImageAssetValue | undefined,
                context as SanityValidationContext
              )
            ).warning(),
        }),
        defineField({
          name: 'backgroundVideo',
          title: 'Video',
          type: 'file',
          options: {
            accept: 'video/*',
          },
        }),
      ],
      validation: (Rule) => Rule.max(2).custom((items) => {
        if (!items || items.length === 0) return true;

        const typedItems = items as BackgroundMediaItem[];
        const images = typedItems.filter((item) => item?._type === 'image');
        const videos = typedItems.filter((item) => item?._type === 'backgroundVideo');

        if (videos.length > 1) return 'Only 1 video allowed';
        if (images.length > 1) return 'Only 1 poster image allowed';
        
        if (videos.length > 0 && images.length === 0) {
          return 'Video MUST be paired with a poster image for blur-up effect';
        }

        return true;
      }),
    }),
  ],
});
