import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PageSelectorProviderProps {
  children: ReactNode;
}

const PageSelectorProvider = ({ children }: PageSelectorProviderProps) => {
  return (
    <Tabs defaultValue="production" className="container mx-auto">
      <div className="flex justify-between">
        <Link href="/">Logo</Link>
        <TabsList>
          <TabsTrigger value="production">production</TabsTrigger>
          <TabsTrigger value="wedding">wedding</TabsTrigger>
        </TabsList>
        <nav className="flex justify-between gap-8">
          <Link href="/about">about</Link>
          <Link href="/portfolio">portfolio</Link>
          <Link href="/services">service</Link>
          <Link href="/contact">contact us</Link>
        </nav>
      </div>
      <TabsContent value="production">{children}</TabsContent>
    </Tabs>
  );
};

export default PageSelectorProvider;
