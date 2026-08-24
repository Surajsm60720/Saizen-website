import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Install } from '@/components/install';
import { Convergence } from '@/components/convergence';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <>
      <main id="top">
        <Hero />
        <Features />
        <Install />
        <Convergence />
      </main>
      <Footer />
    </>
  );
}
