import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Install } from '@/components/install';
import { Convergence } from '@/components/convergence';
import { Footer } from '@/components/footer';
import { PhoneScrolly } from '@/components/phone-scrolly';

export default function Home() {
  return (
    <>
      <main id="top">
        <Hero />
        {/* Scroll distance the hero-to-features phone takeover plays out
            over — see PhoneScrolly. Empty on purpose. */}
        <div id="phone-transition-zone" aria-hidden="true" />
        <Features />
        <Install />
        <Convergence />
      </main>
      <Footer />
      <PhoneScrolly />
    </>
  );
}
