import { Button } from '../../ui';
import { Locale } from '@shared/config';
import { Project } from '@shared/types';
import { cn } from '@shared/utils';

interface ProjectAsideProps {
  project: Project;
  lang: Locale;
}

export default function ProjectAside({ project, lang }: ProjectAsideProps) {
  const isEngLang = lang === 'en';

  const headingStyleClass = 'text-text-secondary text-sm';
  const dataStyleClass = 'text-text-primary font-semibold';
  const fallbackClass = 'text-text-secondary text-sm italic font-normal';

  const validServices = project.services?.filter((s) => s.trim() !== '') || [];

  // ฟังก์ชันช่วย Format วันที่ให้แสดงผลสวยงามตามภาษา
  const formattedDate = project.projectDate
    ? new Date(project.projectDate).toLocaleDateString(
        isEngLang ? 'en-US' : 'th-TH',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : null;

  return (
    <aside className='bg-card text-card-foreground ring-steel-gray sticky top-10 h-fit rounded-2xl border p-8 md:min-w-[300px]'>
      <h3 className='border-steel-gray mb-6 border-b pb-4 text-xl font-semibold'>
        {isEngLang ? 'Project Details' : 'รายละเอียดผลงาน'}
      </h3>

      <dl className='space-y-5'>
        {/* ลูกค้า (Client) */}
        <div className='space-y-2'>
          <dt className={headingStyleClass}>
            {isEngLang ? 'Client' : 'ลูกค้า'}
          </dt>
          <dd className={dataStyleClass}>
            {project.client ? (
              <>{project.client}</>
            ) : (
              <span className={fallbackClass}>
                {isEngLang ? 'Not specified' : 'ไม่ระบุ'}
              </span>
            )}
          </dd>
        </div>

        {/* วันที่ (Date) */}
        <div className='space-y-2'>
          <dt className={headingStyleClass}>{isEngLang ? 'Date' : 'วันที่'}</dt>
          <dd className={dataStyleClass}>
            {formattedDate ? (
              formattedDate
            ) : (
              <span className={fallbackClass}>
                {isEngLang ? 'Not specified' : 'ไม่ระบุ'}
              </span>
            )}
          </dd>
        </div>

        {/* บริการ (Services) */}
        <div className='space-y-2'>
          <dt className={headingStyleClass}>
            {isEngLang ? 'Services' : 'บริการ'}
          </dt>
          <dd className={dataStyleClass}>
            {validServices.length > 0 ? (
              <>{validServices.join(', ')}</>
            ) : (
              <span className={fallbackClass}>
                {isEngLang ? 'No services provided' : 'ไม่มีบริการใดที่ระบุไว้'}
              </span>
            )}
          </dd>
        </div>

        {/* หมวดหมู่ (Tags) */}
        <div className='space-y-2'>
          <dt className={headingStyleClass}>
            {isEngLang ? 'Tags' : 'หมวดหมู่'}
          </dt>
          <dd className={cn('flex flex-wrap gap-2', dataStyleClass)}>
            {project.tags && project.tags.length > 0 ? (
              project.tags.map((tag, index) => (
                <Button
                  key={`${tag}-${index}`}
                  size={'sm'}
                  variant={'secondary'}
                >
                  {tag}
                </Button>
              ))
            ) : (
              <span className={fallbackClass}>
                {isEngLang ? 'No tags' : 'ไม่มีหมวดหมู่'}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
