import PageBuilder, { FullPageDocument } from '@features/PageBuilder';
import { PortfolioGrid, SectionShell } from '@shared/components';
import { Locale, SiteMode } from '@shared/config';
import { Project } from '@shared/types';

interface PortfolioPageProps {
  page: FullPageDocument;
  projects: Project[];
  lang: Locale;
  mode: SiteMode;
  isMockMode?: boolean;
}

export default function PortfolioPage({
  page,
  projects,
  lang,
  mode,
  isMockMode,
}: PortfolioPageProps) {
  const commonProps = { lang, mode };
  return (
    <>
      <PageBuilder page={page} {...commonProps} enableSignature={isMockMode} />
      <SectionShell>
        {/* TODO: พื้นที่สำหรับ Tags Filter จะมาแทรกตรงนี้ */}
        <PortfolioGrid projects={projects} {...commonProps} />
        {/* TODO: พื้นที่สำหรับ Numbered Pagination จะมาแทรกตรงนี้ */}
      </SectionShell>
    </>
  );
}
