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
}

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
}: PortfolioPageProps) {
  const commonProps = { lang, mode };
  return (
    <>
      <PageBuilder page={page} {...commonProps} enableSignature={isMockMode} />
      <SectionShell contentWrapperClass='space-y-8'>
        <PortfolioFilter tags={tags} {...commonProps} />
        <PortfolioGrid projects={projects} {...commonProps} />
        <NumberedPagination
          currentPage={currentPage}
          currentLimit={currentLimit}
          totalPages={totalPages}
        />
      </SectionShell>
    </>
  );
}
