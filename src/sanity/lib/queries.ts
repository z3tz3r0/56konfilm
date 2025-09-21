import { createClient, groq } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

export const settingsQuery = groq`*[_type == "settings"][0] {
    "siteTitle": siteTitle[_key == $lang][0].value,
    "productionNav": productionNav[]{
      "label": label[_key == $lang][0].value,
      url
    },
    "weddingNav": weddingNav[]{
      "label": label[_key == $lang][0].value,
      url
  }
  }
`;

// GROQ for Filtered Projects (by mode)
export const projectsByModelQuery = groq`*[_type == "project" && $mode in siteMode] | order(publishedAt desc) {
    _id,
    "title": title[_key == $lang][0].value,
    "overview": overview[_key == $lang][0].value,
    "slug": slug.current,
    siteMode,
    coverImage
  }
`;

// GROQ for a single Page with all its blocks
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug && siteMode == $mode][0] {
    "title": page,
    "slug": slug.current,
    seoTitle,
    siteMode,
    contentBlocks[]{
      _type,

      _type == "heroSection" => {
        "title": coalesce(title[_key==$lang][0].value, title[_key=="en"][0].value, title[0].value),
        "tagline": coalesce(tagline[_key==$lang][0].value, tagline[_key=="en"][0].value, tagline[0].value),
        backgroundImage
      },

      _type == "twoColumnSection" => {
        layout, background,
        content{
          "eyebrow": coalesce(eyebrow[_key==$lang][0].value, eyebrow[_key=="en"][0].value),
          "heading": coalesce(heading[_key==$lang][0].value, heading[_key=="en"][0].value),
          "body": coalesce(body[_key==$lang][0].value, body[_key=="en"][0].value),
          align
        },
        media{ image, "alt": coalesce(alt[_key==$lang][0].value, alt[_key=="en"][0].value) },
        ctas[]{
          "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value),
          style, linkType, pageRef->{"slug": slug.current}, externalUrl
        }
      },

      _type == "cardCollectionSection" => {
        "title": coalesce(title[_key==$lang][0].value, title[_key=="en"][0].value),
        "intro": coalesce(intro[_key==$lang][0].value, intro[_key=="en"][0].value),
        columns, background,
        cards[]{
          "title": coalesce(title[_key==$lang][0].value, title[_key=="en"][0].value),
          "body": coalesce(body[_key==$lang][0].value, body[_key=="en"][0].value),
          icon, variant,
          cta{
            "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value),
            style, linkType, pageRef->{"slug": slug.current}, externalUrl
          }
        }
      },

      _type == "timelineSection" => {
        background,
        heading{
          "eyebrow": coalesce(eyebrow[_key==$lang][0].value, eyebrow[_key=="en"][0].value),
          "heading": coalesce(heading[_key==$lang][0].value, heading[_key=="en"][0].value),
          "body": coalesce(body[_key==$lang][0].value, body[_key=="en"][0].value),
          align
        },
        steps[]{
          order,
          "title": coalesce(title[_key==$lang][0].value, title[_key=="en"][0].value),
          "description": coalesce(description[_key==$lang][0].value, description[_key=="en"][0].value)
        } | order(order asc),
        cta{
          "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value),
          style, linkType, pageRef->{"slug": slug.current}, externalUrl
        }
      },

      _type == "mediaGallerySection" => {
        background,
        heading{
          "eyebrow": coalesce(eyebrow[_key==$lang][0].value, eyebrow[_key=="en"][0].value),
          "heading": coalesce(heading[_key==$lang][0].value, heading[_key=="en"][0].value),
          "body": coalesce(body[_key==$lang][0].value, body[_key=="en"][0].value),
          align
        },
        items[]{
          media{
            image,
            "alt": coalesce(alt[_key==$lang][0].value, alt[_key=="en"][0].value)
          },
          "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value)
        },
        cta{
          "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value),
          style, linkType, pageRef->{"slug": slug.current}, externalUrl
        }
      },

      _type == "logoGridSection" => {
        background,
        "title": coalesce(title[_key==$lang][0].value, title[_key=="en"][0].value),
        logos[]{
          image,
          "alt": coalesce(alt[_key==$lang][0].value, alt[_key=="en"][0].value)
        }
      },

      _type == "ctaBannerSection" => {
        background,
        layout,
        content:{
          "eyebrow": coalesce(eyebrow[_key==$lang][0].value, eyebrow[_key=="en"][0].value),
          "heading": coalesce(heading[_key==$lang][0].value, heading[_key=="en"][0].value),
          "body": coalesce(body[_key==$lang][0].value, body[_key=="en"][0].value),
          align
        },
        media{
          image,
          "alt": coalesce(alt[_key==$lang][0].value, alt[_key=="en"][0].value)
        },
        ctas[]{
          "label": coalesce(label[_key==$lang][0].value, label[_key=="en"][0].value),
          style, linkType, pageRef->{"slug": slug.current}, externalUrl
        }
      }
    }
  }
`;
