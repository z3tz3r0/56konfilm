import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="grid h-screen place-items-center">
      <div id="production" className="grid place-items-center gap-4">
        <Button variant="default" service="production">
          Text
        </Button>
        <Button variant="destructive" service="production">
          Text
        </Button>
        <Button variant="ghost" service="production">
          Text
        </Button>
        <Button variant="link" service="production">
          Text
        </Button>
        <Button variant="neutral" service="production">
          Text
        </Button>
        <Button variant="secondary" service="production">
          Text
        </Button>
      </div>
      <div id="wedding" className="grid place-items-center gap-4">
        <Button variant="default" service="wedding">
          Text
        </Button>
        <Button variant="destructive" service="wedding">
          Text
        </Button>
        <Button variant="ghost" service="wedding">
          Text
        </Button>
        <Button variant="link" service="wedding">
          Text
        </Button>
        <Button variant="neutral" service="wedding">
          Text
        </Button>
        <Button variant="secondary" service="wedding">
          Text
        </Button>
      </div>
    </main>
  );
}
