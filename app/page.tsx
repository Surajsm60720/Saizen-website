import { Hero } from '@/components/hero';
import { Pipeline } from '@/components/pipeline';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <main id="top">
      <Hero />
      <Pipeline />
      <Features />
    </main>
  );
}
