import ProjectCard from '@shared/components/common/portfolio-grid/ProjectCard';
import TeamCard from '@features/team-section/components/TeamCard';
import { MotionProvider } from '@shared/providers/MotionProvider';
import type { FixtureOptions } from './types';

/** Render a project or team card with synthetic image data for the requested browser fixture state. */
export default function MediaCardFixture({
  mode = 'production',
  lang = 'en',
  state = 'source-missing',
  consumer,
}: FixtureOptions) {
  const image =
    state === 'source-missing'
      ? { asset: null, crop: null, hotspot: null }
      : {
          asset: {
            _type: 'reference' as const,
            _ref:
              state === 'invalid'
                ? 'invalid-reference'
                : `image-${state}-1200x800-jpg`,
          },
        };
  return (
    <MotionProvider>
      <div className='mx-auto max-w-[480px]'>
        {consumer === 'project' ? (
          <ProjectCard
            project={{
              _id: 'fixture',
              title: 'Fixture project',
              slug: 'fixture-project',
              siteMode: [mode],
              projectDate: '2026-01-01',
              coverImage: image,
            }}
            lang={lang}
            mode={mode}
            portfolioSlug='work'
          />
        ) : (
          <TeamCard
            member={{
              _key: 'fixture',
              name: 'Fixture member',
              role: 'Director',
              bio: 'Fixture biography',
              image,
            }}
            lang={lang}
          />
        )}
      </div>
    </MotionProvider>
  );
}
