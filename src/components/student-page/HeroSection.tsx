import bannerImage from "@/assets/fabricio-welcome.png";

interface HeroSectionProps {
  studentName: string;
  objective: string;
}

const HeroSection = ({ studentName, objective }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden bg-black">
      {/* Banner exibido na proporção natural (sem barras pretas) */}
      <img
        src={bannerImage}
        alt="Fabricio Moura - Bem Vindo"
        className="block w-full h-auto"
      />
    </section>
  );
};

export default HeroSection;
