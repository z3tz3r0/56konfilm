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
}

export default function PortfolioPage({
  page,
  projects,
  tags,
  lang,
  mode,
  isMockMode,
}: PortfolioPageProps) {
  const commonProps = { lang, mode };
  return (
    <>
      <PageBuilder page={page} {...commonProps} enableSignature={isMockMode} />
      <SectionShell contentWrapperClass='space-y-8'>
        <PortfolioFilter tags={tags} {...commonProps} />
        <PortfolioGrid projects={projects} {...commonProps} />
        {/* TODO: พื้นที่สำหรับ Numbered Pagination จะมาแทรกตรงนี้ */}
      </SectionShell>
    </>
  );
}
