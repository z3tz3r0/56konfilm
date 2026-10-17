import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import tailwind from '@tailwindcss/postcss';

/** Compile real project styles, scanning only the components rendered by this fixture. */
export async function compileFixtureCss(root: string): Promise<string> {
  const sources = [
    'src/features/package-section/components/PackagesSection.tsx',
    'src/shared/components/common/CtaButton.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/ui/button.tsx',
    'src/shared/components/ui/input.tsx',
    'src/shared/utils/styling/styleVariants.ts',
  ];
  const stylesheet = resolve(root, 'src/app/globals.css');
  const source = await readFile(stylesheet, 'utf8');
  const scopedSource = source.replace(
    /@import ['"]tailwindcss['"];/,
    '@import "tailwindcss" source(none);\n' +
      sources
        .map(
          (file) =>
            '@source "' + resolve(root, file).replaceAll('\\', '/') + '";'
        )
        .join('\n')
  );
  if (scopedSource === source) {
    throw new Error(
      'Cannot scope Tailwind sources; refusing an unrestricted fixture scan.'
    );
  }

  // Use the PostCSS dependency owned by the installed Tailwind PostCSS plugin.
  const require = createRequire(import.meta.url);
  const requireFromTailwind = createRequire(
    require.resolve('@tailwindcss/postcss')
  );
  const postcss = requireFromTailwind('postcss');
  const result = await postcss([tailwind({ base: root })]).process(
    scopedSource,
    {
      from: stylesheet,
    }
  );
  return result.css;
}
