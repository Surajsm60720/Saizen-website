import { Hero } from '@/components/hero';
import { Pipeline } from '@/components/pipeline';
import { Features } from '@/components/features';
import { Security } from '@/components/security';
import { Install } from '@/components/install';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <>
      <main id="top">
        <Hero />
        <Pipeline />
        <Features />
        <Security />
        <Install />
      </main>
      <Footer />
    </>
  );
}
