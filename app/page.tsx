import Navbar from "@/components_lovable/Navbar";
import Hero from "@/components_lovable/Hero";
import VideoDemo from "@/components_lovable/VideoDemo";
import Solutions from "@/components_lovable/Solutions";
import Platforms from "@/components_lovable/Platforms";
import TrainDeploy from "@/components_lovable/TrainDeploy";
import Pricing from "@/components_lovable/Pricing";
import CTA from "@/components_lovable/CTA";
import Footer from "@/components_lovable/Footer";
import { FAQ } from "@/components/ui/faq-section";
import { Testimonials } from "@/components/ui/testimonials";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <VideoDemo />
      <Solutions />
      <Platforms />
      <TrainDeploy />
      <Pricing />    
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
