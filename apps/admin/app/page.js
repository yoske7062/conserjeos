import Nav from '../components/landing/Nav';
import Hero from '../components/landing/Hero';
import Comparison from '../components/landing/Comparison';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Benefits from '../components/landing/Benefits';
import Pricing from '../components/landing/Pricing';
import FAQ from '../components/landing/FAQ';
import CTABanner from '../components/landing/CTABanner';
import Footer from '../components/landing/Footer';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Nav />
      <main>
        <Hero />
        <Comparison />
        <Features />
        <HowItWorks />
        <Benefits />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
