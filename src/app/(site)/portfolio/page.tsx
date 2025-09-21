import { client, projectsByModelQuery } from '@/sanity/lib/queries';
import { Project } from '@/types/sanity';

const SITE_MODE = 'production';

interface PortfolioPageProps {
  params: Promise<{ locale: string }>;
}

const PortfoiloPage = async ({ params }: PortfolioPageProps) => {
  const { locale } = await params;

  const projects = await client.fetch<Project[]>(
    projectsByModelQuery,
    { lang: locale, mode: SITE_MODE },
    { next: { revalidate: 3600 } }
  );

  return (
    <main>
      <h1>Our Work</h1>
      <div>
        {projects.map((project) => (
          <div key={project._id}>
            <h2>{project.title}</h2>
            <h2>{project.overview}</h2>
          </div>
        ))}
      </div>
    </main>
  );
};

export default PortfoiloPage;
