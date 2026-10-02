import NumberedPagination from './NumberedPagination';
import PortfolioFilter from './PortfolioFilter';
import PageBuilder, { FullPageDocument } from '@features/PageBuilder';
import { PortfolioGrid, SectionShell } from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { Project, ProjectTag } from '@shared/types';

interface PortfolioPageProps {
  page: FullPageDocument;
  projects: Project[];
  tags: ProjectTag[];
  lang: Locale;
  mode: SiteMode;
  isMockMode?: boolean;
  currentPage: number;
  currentLimit: number;
  totalPages: number;
  portfolioSlug: string;
}

/**
 * Renders the portfolio introduction, filters, project grid, and pagination
 * within a single page-level scroll target for Next.js navigation.
 */
export default function PortfolioPage({
  page,
  projects,
  tags,
  lang,
  mode,
  isMockMode,
  currentPage,
  currentLimit,
  totalPages,
  portfolioSlug,
}: PortfolioPageProps) {
  const commonProps = { lang, mode };
  // Give Next.js a page-level scroll target. PageBuilder uses display: contents,
  // so a fragment would let the router skip the introduction and target the list.
  return (
    <div data-testid='portfolio-page'>
      <PageBuilder page={page} {...commonProps} enableSignature={isMockMode} />
      <SectionShell contentWrapperClass='space-y-8'>
        <PortfolioFilter tags={tags} {...commonProps} />
        <PortfolioGrid
          projects={projects}
          portfolioSlug={portfolioSlug}
          {...commonProps}
        />
        <NumberedPagination
          lang={lang}
          currentPage={currentPage}
          currentLimit={currentLimit}
          totalPages={totalPages}
        />
      </SectionShell>
    </div>
  );
}
