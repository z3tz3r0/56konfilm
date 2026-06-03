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
    ? formatProjectDate(project.projectDate, lang)
    : null;

  return (
    <aside className='bg-neutral dark:bg-card text-card-foreground border-border/50 dark:border-steel-gray/50 static h-fit rounded-2xl border p-8 md:w-[300px] lg:sticky lg:top-[calc(80px+16px)]'>
      <h3 className='border-border/50 dark:border-steel-gray/50 mb-6 border-b pb-4 text-xl font-semibold'>
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

function formatProjectDate(value: string, lang: Locale) {
  // 1. แยก ปี-เดือน-วัน ออกจากกันเพื่อป้องกันปัญหาการ Parse วันที่เพี้ยนในบางเบราว์เซอร์ (เช่น Safari รุ่นเก่า)
  const [year, month, day] = value.split('-').map(Number);

  // 2. สร้าง Date Object ที่เป็น UTC จริงๆ
  const utcDate = new Date(Date.UTC(year, month - 1, day));

  // 3. บังคับ Format ให้อ่านค่าจาก Timezone UTC เสมอ
  return utcDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
