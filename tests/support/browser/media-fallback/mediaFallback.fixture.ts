import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import {
  chromium,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest';
import type { FixtureOptions } from './types';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const directory = resolve(root, 'tests/support/browser/media-fallback');
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#237048"/></svg>';
const posterSvg = svg.replace('#237048', '#7248c8');
let browser: Browser, context: BrowserContext, page: Page;
let css: string, script: string;
let video: Buffer;
let pending: Array<() => Promise<void>>;
let pendingPosters: Array<() => Promise<void>>;
let unexpectedRequests: string[], errors: string[];

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const { build } = await import(
    createRequire(require.resolve('vitest/package.json')).resolve('vite')
  );
  const postcss = createRequire(require.resolve('@tailwindcss/postcss'))(
    'postcss'
  );
  const stylesheet = resolve(root, 'src/app/globals.css');
  const sources = [
    'src/shared/components/common/MediaWithFallback/index.tsx',
    'src/shared/components/common/MediaWithFallback/ImageMedia.tsx',
    'src/shared/components/common/MediaWithFallback/VideoMedia.tsx',
    'src/shared/components/common/MediaWithFallback/MediaPlaceholder.tsx',
    'src/shared/components/common/ImageWithFrame.tsx',
    'tests/support/browser/media-fallback/entry.tsx',
    'tests/support/browser/media-fallback/MediaCardFixture.tsx',
    'src/shared/components/common/portfolio-grid/ProjectCard.tsx',
    'src/features/team-section/components/TeamCard.tsx',
    'tests/support/browser/media-fallback/ContentMediaFixture.tsx',
    'src/features/media-gallery-section/components/grid/Grid.tsx',
    'src/features/media-gallery-section/components/grid/GalleryCard.tsx',
    'src/features/media-gallery-section/components/grid/GalleryVideo.tsx',
    'src/features/media-gallery-section/components/grid/VideoItem.tsx',
    'src/features/media-gallery-section/components/collage/Collage.tsx',
    'src/features/two-column-section/components/Production.tsx',
    'src/features/two-column-section/components/Wedding.tsx',
    'src/shared/components/layout/project-detail/ProjectHero.tsx',
    'src/shared/components/common/PortableTextImage.tsx',
    'src/shared/components/common/PortableTextRenderer.tsx',
    'src/features/video-showreel-section/components/VideoShowreelSection.tsx',
    'src/features/blog-preview-section/components/BlogPreviewSection.tsx',
    'src/shared/components/common/SectionShell.tsx',
    'src/shared/components/common/section-header/index.tsx',
  ];
  const original = await readFile(stylesheet, 'utf8');
  const scoped = original.replace(
    /@import ['"]tailwindcss['"];/,
    '@import "tailwindcss" source(none);\n' +
      sources
        .map(
          (file) => `@source "${resolve(root, file).replaceAll('\\', '/')}";`
        )
        .join('\n')
  );
  if (scoped === original)
    throw new Error('Refusing an unrestricted Tailwind scan.');
  css = (
    await postcss([tailwind({ base: root })]).process(scoped, {
      from: stylesheet,
    })
  ).css;
  const result = await build({
    root,
    configFile: false,
    envFile: false,
    logLevel: 'error',
    plugins: [react()],
    oxc: { jsx: { development: false } },
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    resolve: {
      alias: [
        {
          find: /^@\/sanity\/lib\/client$/,
          replacement: resolve(directory, 'fixtureClient.ts'),
        },
        {
          find: /^@shared\/components$/,
          replacement: resolve(directory, 'fixtureComponents.ts'),
        },
        {
          find: /^@shared\/config$/,
          replacement: resolve(directory, 'fixtureConfig.ts'),
        },
        {
          find: /^@shared\/hooks$/,
          replacement: resolve(directory, 'fixtureTier.ts'),
        },
        {
          find: 'next/link',
          replacement: resolve(root, 'tests/support/media/FixtureLink.tsx'),
        },
        {
          find: 'next/image',
          replacement: resolve(root, 'tests/support/media/FixtureImage.tsx'),
        },
        { find: '@shared', replacement: resolve(root, 'src/shared') },
        { find: '@features', replacement: resolve(root, 'src/features') },
        { find: '@', replacement: resolve(root, 'src') },
      ],
    },
    build: {
      write: false,
      lib: {
        entry: resolve(directory, 'entry.tsx'),
        name: 'MediaFixture',
        formats: ['iife'],
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  if (!('output' in output))
    throw new Error('Expected an in-memory fixture bundle.');
  script = output.output
    .filter((chunk: { type: string }) => chunk.type === 'chunk')
    .map((chunk: { code: string }) => chunk.code)
    .join('\n');
  browser = await chromium.launch({
    headless: true,
    channel: process.env.MEDIA_FALLBACK_BROWSER_CHANNEL || undefined,
  });
  // Generate a tiny real video locally; no download, CMS, filesystem asset, or fake canplay event.
  const recorder = await browser.newPage();
  await recorder.setContent('<!doctype html><html><body></body></html>');
  await recorder.bringToFront();
  video = Buffer.from(
    await recorder.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      document.body.append(canvas);
      const context = canvas.getContext('2d')!;
      const stream = canvas.captureStream(10);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      const finished = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });
      recorder.start(100);
      // Windows encoders can initialize after the first few paints. Capture a
      // sustained stream, then verify decoding before using it as a fixture.
      for (let frame = 0; frame < 20; frame++) {
        context.fillStyle = frame % 2 ? '#237048' : '#125037';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve())
        );
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      recorder.stop();
      await finished;
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: 'video/webm' });
      const probe = document.createElement('video');
      const objectUrl = URL.createObjectURL(blob);
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Fixture video did not decode.')),
          5000
        );
        probe.oncanplay = () => {
          clearTimeout(timeout);
          resolve();
        };
        probe.onerror = () => {
          clearTimeout(timeout);
          reject(
            new Error(
              `Fixture video: ${probe.error?.message}; ${blob.size} bytes`
            )
          );
        };
        probe.src = objectUrl;
        probe.load();
      });
      URL.revokeObjectURL(objectUrl);
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    })
  );
  await recorder.close();
});

beforeEach(async () => {
  pending = [];
  pendingPosters = [];
  unexpectedRequests = [];
  errors = [];
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    serviceWorkers: 'block',
    reducedMotion: 'no-preference',
  });
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (
      url.origin !== 'https://media.fixture.test' &&
      !(
        url.origin === 'https://cdn.sanity.io' &&
        url.pathname.startsWith('/images/fixture/development/')
      )
    ) {
      unexpectedRequests.push(url.href);
      await route.abort();
      return;
    }
    const respond = () =>
      url.pathname.includes('error')
        ? route.fulfill({ status: 404, body: 'Fixture asset unavailable' })
        : route.fulfill({
            status: 200,
            contentType: url.pathname.endsWith('.webm')
              ? 'video/webm'
              : 'image/svg+xml',
            body: url.pathname.endsWith('.webm')
              ? video
              : url.pathname.includes('poster')
                ? posterSvg
                : svg,
          });
    if (url.pathname.includes('loading')) {
      await new Promise<void>((resolve) => {
        const queue = url.pathname.includes('poster')
          ? pendingPosters
          : pending;
        queue.push(async () => {
          await respond();
          resolve();
        });
      });
    } else await respond();
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body><div id="root"></div></body></html>`
  );
  await page.addScriptTag({ content: script });
});

afterEach(async () => {
  await Promise.all(
    [...pending.splice(0), ...pendingPosters.splice(0)].map((respond) =>
      respond().catch(() => {})
    )
  );
  expect(await page.evaluate(() => window.mediaHydrationErrors)).toEqual([]);
  await context?.close();
  expect(unexpectedRequests).toEqual([]);
  expect(errors).toEqual([]);
});
afterAll(async () => {
  await browser?.close();
});

async function show(options: FixtureOptions) {
  await page.evaluate((options) => window.showMediaFixture(options), options);
  if (
    options.consumer === 'gallery-video' &&
    options.videoAutoplay === false &&
    options.state !== 'source-missing'
  ) {
    await expect(page.getByTestId('video-item-fallback')).toBeVisible();
    return;
  }
  await expect(
    page.locator('[data-slot="media-with-fallback"]').first()
  ).toBeVisible();
}

function media() {
  return page.locator('[data-slot="media-with-fallback"]').first();
}

async function surface() {
  return page
    .locator('[data-slot="media-loading-surface"]')
    .first()
    .evaluate((node) => {
      const styles = getComputedStyle(node);
      return {
        animation: styles.animationName,
        color: styles.backgroundColor,
        animations: node.getAnimations().length,
      };
    });
}

async function assertGeometry(
  before: { width: number; height: number } | null
) {
  if (!before) throw new Error('Missing initial frame geometry.');
  const after = await media().boundingBox();
  expect(after?.width).toBeCloseTo(before.width, 1);
  expect(after?.height).toBeCloseTo(before.height, 1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
}

/** Sample actual composited pixels, not just the poster's DOM/style visibility. */
async function framePixel() {
  const screenshot = await media().screenshot({ animations: 'disabled' });
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    // Stay clear of centered loading text and native controls.
    return Array.from(
      context.getImageData(
        Math.floor(image.width / 4),
        Math.floor(image.height / 4),
        1,
        1
      ).data
    );
  }, screenshot.toString('base64'));
}

for (const mode of ['production', 'wedding'] as const) {
  for (const lang of ['en', 'th'] as const) {
    describe(`Media fallback ${mode}/${lang}`, () => {
      it.each(['error', 'success'] as const)(
        'hydrates an already-settled %s video without replaying media events',
        async (state) => {
          await show({
            mode,
            lang,
            mediaType: 'video',
            state,
            serverRendered: true,
          });
          const nativeVideo = page.getByTestId('native-video');
          const original = await nativeVideo.elementHandle();
          const bounds = await media().boundingBox();
          if (state === 'error') {
            await expect
              .poll(() =>
                nativeVideo.evaluate((node) => {
                  const video = node as HTMLVideoElement;
                  return {
                    network: video.networkState,
                    ready: video.readyState,
                    error: video.error,
                  };
                })
              )
              .toEqual({ network: 3, ready: 0, error: null });
            await expect
              .poll(() => page.evaluate(() => window.mediaSourceErrors))
              .toBe(1);
          } else {
            await expect
              .poll(() =>
                nativeVideo.evaluate(
                  (node) => (node as HTMLVideoElement).readyState
                )
              )
              .toBeGreaterThanOrEqual(3);
          }
          // Server HTML cannot respond to the load/error event that already occurred.
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          await page.evaluate(() => window.hydrateMediaFixture());
          await expect(media()).toHaveAttribute('data-media-status', state);
          expect(
            await nativeVideo.evaluate(
              (node, original) => node === original,
              original
            )
          ).toBe(true);
          if (state === 'error') {
            expect(await page.evaluate(() => window.mediaSourceErrors)).toBe(1);
            await expect(page.getByRole('status')).toHaveText(
              lang === 'th' ? 'ไม่สามารถโหลดวิดีโอได้' : 'Unable to load video'
            );
          } else await expect(page.getByRole('status')).toHaveCount(0);
          await assertGeometry(bounds);
        }
      );

      it('keeps slow videos loading across hydration and keyed source changes', async () => {
        await show({
          mode,
          lang,
          mediaType: 'video',
          state: 'loading',
          serverRendered: true,
          sourceVersion: 1,
        });
        await expect.poll(() => pending.length).toBeGreaterThan(0);
        const first = await page.getByTestId('native-video').elementHandle();
        await page.evaluate(() => window.hydrateMediaFixture());
        // Wait a task and paint after hydration so the deferred check has executed.
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            )
        );
        await expect(media()).toHaveAttribute('data-media-status', 'loading');
        await show({
          mode,
          lang,
          mediaType: 'video',
          state: 'loading',
          sourceVersion: 2,
        });
        await expect.poll(() => pending.length).toBeGreaterThanOrEqual(2);
        expect(
          await page
            .getByTestId('native-video')
            .evaluate((node, first) => node === first, first)
        ).toBe(false);
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            )
        );
        await expect(media()).toHaveAttribute('data-media-status', 'loading');
        await Promise.all(pending.splice(0).map((respond) => respond()));
        await expect(media()).toHaveAttribute('data-media-status', 'success');
      });

      it.each([375, 1280])(
        'shows decoded posters above loading feedback at %ipx and falls back when they fail',
        async (width) => {
          await page.setViewportSize({ width, height: 800 });
          await show({
            mode,
            lang,
            mediaType: 'video',
            state: 'loading',
            poster: 'loading',
            preload: 'metadata',
          });
          await expect.poll(() => pending.length).toBeGreaterThan(0);
          await expect.poll(() => pendingPosters.length).toBeGreaterThan(0);
          const bounds = await media().boundingBox();
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          const poster = page.getByAltText('Fixture poster');
          expect(
            await poster.evaluate((node) => (node as HTMLImageElement).complete)
          ).toBe(false);
          expect(await surface()).toMatchObject({ animation: 'pulse' });
          await Promise.all(
            pendingPosters.splice(0).map((respond) => respond())
          );
          await expect
            .poll(() =>
              poster.evaluate((node) => (node as HTMLImageElement).naturalWidth)
            )
            .toBe(160);
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          expect(await framePixel()).toEqual([114, 72, 200, 255]);
          // Negative control: restoring the old stacking order must hide the poster.
          await poster.evaluate((node) => {
            node.parentElement!.parentElement!.style.zIndex = '0';
          });
          expect(await framePixel()).not.toEqual([114, 72, 200, 255]);
          await poster.evaluate((node) => {
            node.parentElement!.parentElement!.style.removeProperty('z-index');
          });
          expect(await framePixel()).toEqual([114, 72, 200, 255]);
          expect(
            await poster.evaluate(
              (node) =>
                getComputedStyle(node.parentElement!.parentElement!)
                  .pointerEvents
            )
          ).toBe('none');
          await page.emulateMedia({ reducedMotion: 'reduce' });
          expect(await framePixel()).toEqual([114, 72, 200, 255]);
          // A failed decorative poster must reveal video feedback, not an empty frame.
          await show({
            mode,
            lang,
            mediaType: 'video',
            state: 'loading',
            poster: 'error',
            preload: 'metadata',
          });
          await expect(poster).toHaveCount(0);
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          await expect(page.getByRole('status')).toHaveText(
            lang === 'th' ? 'กำลังโหลดวิดีโอ…' : 'Loading video…'
          );
          expect(await surface()).toMatchObject({
            animation: 'none',
            animations: 0,
          });
          expect(await framePixel()).toEqual([249, 249, 249, 255]);
          await assertGeometry(bounds);
          await show({
            mode,
            lang,
            mediaType: 'video',
            state: 'loading',
            poster: 'success',
            preload: 'metadata',
          });
          await expect
            .poll(() =>
              poster.evaluate((node) => (node as HTMLImageElement).naturalWidth)
            )
            .toBe(160);
          expect(await framePixel()).toEqual([114, 72, 200, 255]);
          await Promise.all(pending.splice(0).map((respond) => respond()));
          await expect(media()).toHaveAttribute('data-media-status', 'success');
          await expect(poster).toHaveCount(0);
          await expect(page.getByRole('status')).toHaveCount(0);
          await assertGeometry(bounds);
          await show({
            mode,
            lang,
            mediaType: 'video',
            state: 'error',
            poster: 'success',
            preload: 'metadata',
          });
          await expect(media()).toHaveAttribute('data-media-status', 'error');
          await expect(poster).toHaveCount(0);
          await expect(page.getByRole('status')).toHaveText(
            lang === 'th' ? 'ไม่สามารถโหลดวิดีโอได้' : 'Unable to load video'
          );
          await assertGeometry(bounds);
        }
      );

      it.each([375, 1280])(
        'renders real loading/success/error geometry at %ipx',
        async (width) => {
          await page.setViewportSize({ width, height: 800 });
          await show({ mode, lang, state: 'loading' });
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          await expect.poll(() => pending.length).toBeGreaterThan(0);
          expect(await surface()).toMatchObject({
            animation: 'pulse',
            color: 'rgb(249, 249, 249)',
            animations: 1,
          });
          const text = page.getByRole('status').locator('span');
          expect((await text.boundingBox())?.width).toBe(1);
          const bounds = await media().boundingBox();
          await Promise.all(pending.splice(0).map((respond) => respond()));
          await expect(media()).toHaveAttribute('data-media-status', 'success');
          await expect(page.getByRole('status')).toHaveCount(0);
          expect(
            await page
              .getByAltText('Fixture cover')
              .evaluate((node) => (node as HTMLImageElement).naturalWidth)
          ).toBe(160);
          await assertGeometry(bounds);
          await show({ mode, lang, state: 'error' });
          await expect(media()).toHaveAttribute('data-media-status', 'error');
          await expect(page.getByRole('status')).toHaveText(
            lang === 'th' ? 'ไม่สามารถโหลดรูปภาพได้' : 'Unable to load image'
          );
          expect(await surface()).toMatchObject({
            animation: 'none',
            animations: 0,
          });
          await assertGeometry(bounds);
          await show({ mode, lang, state: 'source-missing' });
          await expect(media()).toHaveAttribute(
            'data-media-status',
            'source-missing'
          );
          await expect(page.getByRole('status')).toHaveText(
            lang === 'th' ? 'ไม่มีรูปภาพ' : 'No Image'
          );
          expect(
            await page
              .getByRole('status')
              .locator('span')
              .evaluate((node) => getComputedStyle(node).color)
          ).toBe('rgb(0, 4, 13)');
          await assertGeometry(bounds);
        }
      );

      it('reacts to reduced motion without reloading the image or losing its frame', async () => {
        await page.setViewportSize({ width: 375, height: 800 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await show({ mode, lang, state: 'loading', frame: true });
        expect(await surface()).toMatchObject({
          animation: 'none',
          animations: 0,
        });
        const label = page.getByRole('status').locator('span');
        await expect(label).toHaveText(
          lang === 'th' ? 'กำลังโหลดรูปภาพ…' : 'Loading image…'
        );
        expect((await label.boundingBox())!.width).toBeGreaterThan(50);
        const bounds = await media().boundingBox();
        expect(bounds!.width / bounds!.height).toBeCloseTo(191 / 275, 3);
        const original = await page
          .getByAltText('Framed cover')
          .elementHandle();
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        expect(await surface()).toMatchObject({
          animation: 'pulse',
          animations: 1,
        });
        expect((await label.boundingBox())!.width).toBe(1);
        expect(
          await page
            .getByAltText('Framed cover')
            .evaluate((node, original) => node === original, original)
        ).toBe(true);
        await Promise.all(pending.splice(0).map((respond) => respond()));
        await expect(media()).toHaveAttribute('data-media-status', 'success');
        await assertGeometry(bounds);
      });

      it('decodes native video and handles real source failures', async () => {
        await show({ mode, lang, mediaType: 'video', state: 'loading' });
        await expect(media()).toHaveAttribute('data-media-status', 'loading');
        await expect.poll(() => pending.length).toBeGreaterThan(0);
        expect(await surface()).toMatchObject({
          animation: 'pulse',
          animations: 1,
        });
        const bounds = await media().boundingBox();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await expect(page.getByRole('status')).toHaveText(
          lang === 'th' ? 'กำลังโหลดวิดีโอ…' : 'Loading video…'
        );
        expect(await surface()).toMatchObject({
          animation: 'none',
          animations: 0,
        });
        await Promise.all(pending.splice(0).map((respond) => respond()));
        await expect
          .poll(async () => ({
            status: await media().getAttribute('data-media-status'),
            details: await page.getByTestId('native-video').evaluate((node) => {
              const element = node as HTMLVideoElement;
              return {
                currentSrc: element.currentSrc,
                error: element.error?.message,
                readyState: element.readyState,
                networkState: element.networkState,
              };
            }),
          }))
          .toMatchObject({ status: 'success' });
        expect(
          await page
            .getByTestId('native-video')
            .evaluate((node) => (node as HTMLVideoElement).videoWidth)
        ).toBe(160);
        await assertGeometry(bounds);
        await show({ mode, lang, mediaType: 'video', state: 'error' });
        await expect(media()).toHaveAttribute('data-media-status', 'error');
        await expect(page.getByRole('status')).toHaveText(
          lang === 'th' ? 'ไม่สามารถโหลดวิดีโอได้' : 'Unable to load video'
        );
        await show({ mode, lang, mediaType: 'video', state: 'source-missing' });
        await expect(page.getByRole('status')).toHaveText(
          lang === 'th' ? 'ไม่มีวิดีโอ' : 'No Video'
        );
      });

      it.each(['project', 'team'] as const)(
        'preserves %s card content, links and geometry without or after a failed cover',
        async (consumer) => {
          await page.setViewportSize({ width: 375, height: 800 });
          await show({ mode, lang, consumer });
          const bounds = await media().boundingBox();
          expect(bounds!.width / bounds!.height).toBeCloseTo(
            consumer === 'project' ? 367 / 224 : 4 / 3,
            3
          );
          await expect(page.getByRole('heading')).toHaveText(
            consumer === 'project' ? 'Fixture project' : 'Fixture member'
          );
          if (consumer === 'project')
            await expect(page.getByRole('link')).toHaveAttribute(
              'href',
              `/${lang}/${mode}/work/fixture-project`
            );
          else await expect(page.getByText('Fixture biography')).toBeVisible();
          await show({ mode, lang, consumer, state: 'success' });
          await expect(media()).toHaveAttribute('data-media-status', 'success');
          await assertGeometry(bounds);
          await show({ mode, lang, consumer, state: 'error' });
          await expect(media()).toHaveAttribute('data-media-status', 'error');
          await assertGeometry(bounds);
          await expect(page.getByRole('heading')).toBeVisible();
          await show({ mode, lang, consumer, state: 'invalid' });
          await expect(media()).toHaveAttribute('data-media-status', 'error');
          await assertGeometry(bounds);
        }
      );

      it.each(
        (
          [
            'grid',
            'two-column',
            'hero',
            'portable-text',
            'showreel',
            'blog',
          ] as const
        ).flatMap((consumer) =>
          [320, 1280].map((width) => ({ consumer, width }))
        )
      )(
        'preserves actual $consumer content frames across all image states at $width px',
        async ({ consumer, width }) => {
          await page.setViewportSize({ width, height: 900 });
          await show({ mode, lang, consumer, state: 'loading' });
          await expect
            .poll(() => pending.length, {
              message: `${consumer} at ${width}px: expected a new controlled loading request`,
            })
            .toBeGreaterThan(0);
          await expect(media()).toHaveAttribute('data-media-status', 'loading');
          const bounds = await media().boundingBox();
          expect(bounds!.width).toBeGreaterThan(0);
          expect(bounds!.height).toBeGreaterThan(0);
          expect(await surface()).toMatchObject({
            animation: 'pulse',
            animations: 1,
          });
          await Promise.all(pending.splice(0).map((respond) => respond()));
          await expect(media()).toHaveAttribute('data-media-status', 'success');
          await assertGeometry(bounds);
          if (consumer === 'showreel') {
            const button = await page
              .getByTestId('showreel-play')
              .boundingBox();
            const icon = await page
              .locator('[data-slot="showreel-overlay"] > div')
              .boundingBox();
            expect(icon!.x + icon!.width / 2).toBeCloseTo(
              button!.x + button!.width / 2,
              1
            );
            expect(icon!.y + icon!.height / 2).toBeCloseTo(
              button!.y + button!.height / 2,
              1
            );
          }
          for (const state of ['error', 'source-missing', 'invalid'] as const) {
            await show({ mode, lang, consumer, state });
            await expect(media()).toHaveAttribute(
              'data-media-status',
              state === 'source-missing' ? 'source-missing' : 'error'
            );
            await assertGeometry(bounds);
            if (consumer === 'showreel') {
              const icon = await page
                .locator('[data-slot="showreel-overlay"] > div')
                .boundingBox();
              const text = await page
                .getByRole('status')
                .locator('span')
                .boundingBox();
              const overlaps =
                icon!.x < text!.x + text!.width &&
                icon!.x + icon!.width > text!.x &&
                icon!.y < text!.y + text!.height &&
                icon!.y + icon!.height > text!.y;
              expect(overlaps).toBe(false);
            }
          }
        }
      );

      if (mode === 'wedding') {
        it('keeps all three Collage design slots and their ratios with missing or failed assets', async () => {
          await page.setViewportSize({ width: 1280, height: 1000 });
          await show({ mode, lang, consumer: 'collage', state: 'success' });
          const frames = page.locator('[data-slot="media-with-fallback"]');
          await expect(frames).toHaveCount(3);
          await expect
            .poll(async () =>
              frames.evaluateAll((nodes) =>
                nodes.every(
                  (node) => node.getAttribute('data-media-status') === 'success'
                )
              )
            )
            .toBe(true);
          const bounds = await Promise.all(
            [0, 1, 2].map((index) => frames.nth(index).boundingBox())
          );
          for (const state of ['source-missing', 'invalid'] as const) {
            await show({ mode, lang, consumer: 'collage', state });
            await expect(frames).toHaveCount(3);
            for (let index = 0; index < 3; index++) {
              const current = await frames.nth(index).boundingBox();
              expect(current!.width).toBeCloseTo(bounds[index]!.width, 1);
              expect(current!.height).toBeCloseTo(bounds[index]!.height, 1);
            }
          }
        });
      }

      it('uses the Gallery video adapter for real decoding, source changes, and policy-disabled static content', async () => {
        await show({ mode, lang, consumer: 'gallery-video', state: 'loading' });
        await expect.poll(() => pending.length).toBeGreaterThan(0);
        await Promise.all(pending.splice(0).map((respond) => respond()));
        await expect(media()).toHaveAttribute('data-media-status', 'success');
        await expect(page.getByTestId('video-item')).toHaveAttribute(
          'preload',
          'metadata'
        );
        await show({ mode, lang, consumer: 'gallery-video', state: 'error' });
        await expect(media()).toHaveAttribute('data-media-status', 'error');
        await show({
          mode,
          lang,
          consumer: 'gallery-video',
          state: 'success',
          videoAutoplay: false,
        });
        await expect(page.getByTestId('video-item-fallback')).toBeVisible();
        await expect(page.locator('video')).toHaveCount(0);
        await expect(page.getByRole('status')).toHaveCount(0);
        await show({
          mode,
          lang,
          consumer: 'gallery-video',
          state: 'source-missing',
          videoAutoplay: false,
        });
        await expect(page.getByRole('status')).toHaveText(
          lang === 'th' ? 'ไม่มีวิดีโอ' : 'No Video'
        );
      });
    });
  }
}
