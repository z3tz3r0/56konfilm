# Sanity MCP Guidelines for AI Agents

This document defines strict rules for AI agents interacting with Sanity CMS content via the MCP server or Sanity client. Following these rules prevents orphaned fields, schema mismatches, and data corruption.

## Rule 1: Always Read the Schema Before Writing

Before creating or patching any document, you MUST:

1. Call `get_schema` with the specific document type.
2. Verify that every field you intend to write exists in the schema.
3. Never add fields that are not defined in the schema.

```
// Good: Field exists in schema
patch.set({ siteTitle: [...] })

// Bad: Field does NOT exist in schema
patch.set({ language: "en" })  // <-- This creates an orphaned field
```

## Rule 2: Understand Internationalized Array Structure

This project uses `sanity-plugin-internationalized-array`. Localized fields use a specific structure:

```json
{
  "siteTitle": [
    {
      "_key": "unique-random-key",
      "_type": "internationalizedArrayStringValue",
      "language": "en",
      "value": "56KonFilm"
    },
    {
      "_key": "another-random-key",
      "_type": "internationalizedArrayStringValue",
      "language": "th",
      "value": "..."
    }
  ]
}
```

**Critical rules:**
- The `_key` field must be a **unique random string**, never a language code like `"en"` or `"th"`.
- Each array should have at most one entry per language.
- Never append empty entries (entries without a `value` field).
- The `language` field inside each entry is managed by the plugin — do not add a top-level `language` field to the document.

## Rule 3: Use `query_documents` to Read Before Patching

Before modifying a document:

1. Query the current state of the document.
2. Identify existing array items by their `_key`.
3. Patch specific items rather than replacing entire arrays (to avoid data loss).

## Rule 4: Never Use `deploy_schema` with Local Studio

This project has a local Sanity Studio (`sanity.config.ts`). The MCP `deploy_schema` tool must NOT be used — it would desync the cloud schema from the local schema. Schema changes should be made in local files and deployed via `npx sanity deploy`.

## Rule 5: Prefer `patch_document_from_json` Over `create_documents_from_markdown`

The `create_documents_from_markdown` and `patch_document_from_markdown` tools can produce incorrect Portable Text mappings. Prefer JSON-based tools for this project.

## Rule 6: Test in Draft Before Publishing

- Always patch `drafts.<documentId>` first.
- Verify the result in the Studio UI.
- Only call `publish_documents` after manual verification.

## Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Adding top-level `language` field | "Unknown field" warning in Studio | Only write fields defined in schema |
| Using `_key: "en"` for array items | Duplicate/ghost entries | Use random UUIDs for `_key` values |
| Appending without checking existing items | Duplicate array entries | Query first, then patch |
| Using `deploy_schema` with local Studio | Cloud/local schema desync | Always modify local schema files |
