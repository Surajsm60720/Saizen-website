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
        {/* Tall, deliberately empty: the phone parks in the middle of the
            viewport for this whole stretch while its screen steps through
            the intro captures, one per slice of scroll. Features can't
            arrive until it's been scrolled through. See PhoneScrolly. */}
        <div id="phone-intro-zone" aria-hidden="true" />
        <Features />
        {/* Same idea, closing beat: the phone re-centres and holds the
            tagline for this stretch before fading out. Empty on purpose. */}
        <div id="phone-tagline-zone" aria-hidden="true" />
        <Install />
        <Convergence />
      </main>
      <Footer />
      <PhoneScrolly />
    </>
  );
}
