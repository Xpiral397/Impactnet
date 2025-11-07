import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import WhatWeDo from "@/components/sections/WhatWeDo";
import ProcessPipeline from "@/components/sections/ProcessPipeline";
import DonationLeaderboard from "@/components/sections/DonationLeaderboard";
import TrustIndicators from "@/components/sections/TrustIndicators";
import ImpactDashboard from "@/components/sections/ImpactDashboard";
import VideoTestimonials from "@/components/sections/VideoTestimonials";
import GlobalReach from "@/components/sections/GlobalReach";
import TestimonyCarousel from "@/components/sections/TestimonyCarousel";
import TransparencySection from "@/components/sections/TransparencySection";
import HowItWorks from "@/components/sections/HowItWorks";
import JoinToday from "@/components/sections/JoinToday";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black">
        <HeroSection />
        <WhatWeDo />
        <ProcessPipeline />
        <DonationLeaderboard />
        <TrustIndicators />
        <ImpactDashboard />
        <VideoTestimonials />
        <GlobalReach />
        <TestimonyCarousel />
        <TransparencySection />
        <HowItWorks />
        <JoinToday />
        <Footer />
      </main>
    </>
  );
}
