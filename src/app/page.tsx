import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="grid h-screen place-items-center gap-16 bg-black">
      <div id="production" className="dark grid place-items-center gap-4">
        <Button variant="default">Text</Button>
        <Button variant="secondary">Text</Button>
        <Button variant="neutral">Text</Button>
      </div>
      <div id="wedding" className="grid place-items-center gap-4">
        <Button variant="default">Text</Button>
        <Button variant="secondary">Text</Button>
        <Button variant="neutral">Text</Button>
      </div>
    </main>
  );
}
