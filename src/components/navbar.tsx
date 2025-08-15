import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const navbar = () => {
  return (
    <>
      <div>
        <h1>Logo</h1>
        <Tabs>
          <TabsList>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="wedding">Wedding</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-4">
          <Link href="about">About</Link>
          <Link href="portfolio">Portfolio</Link>
          <Link href="services">Services</Link>
          <Link href="contact">Contact</Link>
        </div>
      </div>
    </>
  );
};

export default navbar;
