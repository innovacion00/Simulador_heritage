import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Simulator } from "@/components/Simulator";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <Hero />
      <Simulator />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
