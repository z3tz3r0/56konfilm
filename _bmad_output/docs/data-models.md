# Data Models

This project uses Sanity CMS for content management. Below are the primary data models (schemas).

## Documents

### Project (`project`)
Cinematic case studies and portfolio items.
- **title**: Localized string.
- **slug**: URL slug generated from title.
- **siteMode**: Array of strings (`production`, `wedding`).
- **overview**: Localized text.
- **coverImage**: Main project image.
- **publishedAt**: Publication date.

### Page (`page`)
Modular pages composed of dynamic sections.
- **page**: Internal page name.
- **siteMode**: String (`production`, `wedding`).
- **slug**: URL slug.
- **contentBlocks**: Array of sections (Hero, Two Column, etc.).
- **seoTitle**: SEO title string.

### Settings (`settings`)
Global site configurations.
- **siteName**: Localized string.
- **logo**: Site logo image.
- **socialLinks**: Array of social media objects.

### CMS Credentials (`cmsCredentials`)
Internal authentication data (Hidden from Studio UI).
- **username**: Admin username.
- **password**: Hashed admin password.

## Sections (Block Content)

- **heroSection**: Main landing section with background media and CTA.
- **twoColumnSection**: Side-by-side content (image/text).
- **cardCollectionSection**: Grid of cards for services or features.
- **timelineSection**: Process or history steps.
- **mediaGallerySection**: Grid/Slider of images/videos.
- **logoGridSection**: Partner or client logos.
- **ctaBannerSection**: Full-width call to action.

## Localized Objects

The project uses a custom localization pattern where fields are arrays of objects containing `locale` and `value`.
- **localizedString**: `{ locale: string, value: string }`
- **localizedText**: `{ locale: string, value: text }`
- **localizedBlock**: `{ locale: string, value: portableText }`
