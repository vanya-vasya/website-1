import Hero from "@/components/landing/hero";
import Slider from "@/components/landing/slider";
import Solutions from "@/components/landing/solutions";
import Testimonials from "@/components/landing/testimonials";
import FAQ from "@/components/landing/faq";
import Contact from "@/components/landing/contact";
import Header from "@/components/landing/header";
import Footer from "@/components/landing/footer";
import { cn } from '@/lib/utils';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export default function HomePage() {
  return (
    <main className={cn("bg-[#0f172a] text-[#A1AAC9] overflow-x-hidden h-full flex flex-col justify-between", nunito.className)}>
      <Header />
      <div className="bg-slate-900">
        <Hero />
        <Slider />
        <FAQ />
        <Solutions />
        <Testimonials />
        <Contact />
      </div>
      <Footer />
    </main>
  );
}