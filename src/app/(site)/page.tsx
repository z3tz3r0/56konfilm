import { Button } from '@/components/ui/button';

export default async function Home() {
  return (
    <div className="grid h-screen place-items-center gap-16">
      <div className="grid place-items-center gap-4">
        <Button variant="default">Text</Button>
        <Button variant="secondary">Text</Button>
        <Button variant="neutral">Text</Button>
      </div>
    </div>
  );
}
