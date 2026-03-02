import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import bannerImage from "@/assets/fabricio-welcome.png";

interface HeroSectionProps {
  studentName: string;
  objective: string;
}

const HeroSection = ({ studentName, objective }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex flex-col overflow-hidden">
      {/* Full-bleed banner image */}
      <div className="absolute inset-0 z-0 bg-black">
        <img
          src={bannerImage}
          alt="Fabricio Moura - Bem Vindo"
          className="w-full h-full object-contain object-bottom sm:object-center"
        />
      </div>
    </section>
  );
};

export default HeroSection;
