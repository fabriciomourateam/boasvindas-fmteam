import { useParams } from "react-router-dom";
import HeroSection from "@/components/student-page/HeroSection";
import PlanSummary from "@/components/student-page/PlanSummary";
import NextSteps from "@/components/student-page/NextSteps";
import LinksBlock from "@/components/student-page/LinksBlock";
import CredentialsBlock from "@/components/student-page/CredentialsBlock";
import GuidelinesBlock from "@/components/student-page/GuidelinesBlock";
import OptionalBlocks from "@/components/student-page/OptionalBlocks";
import SupportSection from "@/components/student-page/SupportSection";
import FooterSection from "@/components/student-page/FooterSection";
import { Toaster } from "sonner";

// Demo data — will come from Supabase later
const demoData = {
  studentName: "Eduardo",
  objective: "Recomposição Corporal",
  plan: "Premium Anual",
  duration: "12 meses de acompanhamento",
  strategy: "Déficit calórico moderado + estímulo de hipertrofia, com foco em conseguirmos fazer com que você perca gordura ganhando massa muscular durante esse processo, trazendo assim mais definição muscular!",
  steps: [
    { title: "Assista todos os módulos da Área de Membros", description: "É essencial ver todos os vídeos antes de iniciar." },
    { title: "Baixe os aplicativos (WebDiet e MFit)", description: "Acesse seu plano alimentar e treinos pelo celular." },
    { title: "Siga o plano alimentar à risca", description: "Este é o ponto principal do seu acompanhamento." },
    { title: "Inicie os treinos periodizados", description: "12 semanas de progressão para evolução contínua." },
    { title: "Dê feedbacks nos Check-ins", description: "A comunicação é a chave do nosso trabalho!" },
  ],
  links: [
    { label: "Área de Membros", url: "#", icon: "members", description: "Módulos e orientações completas" },
    { label: "Suporte WhatsApp", url: "#", icon: "support", description: "Segunda a sexta, 08h às 18h" },
  ],
  credentials: [
    { appName: "WebDiet", login: "11 98827-3628", password: "data_nascimento", instructions: "Abra o app e clique em 'Já me consultei'" },
    { appName: "MFit Personal", login: "luziano.jo@gmail.com", password: "10912", instructions: "Clique em 'Sou aluno' e entre com os dados" },
  ],
  guidelines: {
    content: "Faça todas as refeições do dia, NEM A MAIS, NEM A MENOS. Não incluir alimentos que não estejam na dieta. Evite ficar beliscando — as beliscadas são o que mais atrapalham os planejamentos.",
    highlights: [
      "Pode inverter a ordem das refeições quando for mais prático",
      "Pode comer a refeição em horário diferente do que está na dieta",
      "Progrida nas cargas sempre que conseguir, levando as repetições até a falha",
    ],
  },
  optionalBlocks: [
    {
      type: "treino" as const,
      title: "Treino Periodizado",
      content: "Você vai ver que coloquei um treino periodizado de 12 semanas. Foque em dar seu máximo para que cada treino seja desafiador a ponto do SEU CORPO PRECISAR ENTENDER QUE ELE TEM QUE EVOLUIR.",
    },
    {
      type: "psicologa" as const,
      title: "Mentorias com a Psicóloga",
      content: "As mentorias com a psicóloga Josie são em grupo, toda última segunda-feira do mês às 20h00. Acesse pela Área de Membros.",
      link: "#",
      linkLabel: "Acessar Mentorias",
    },
  ],
  faqs: [
    { question: "Posso trocar a ordem das refeições?", answer: "Sim! Pode inverter a ordem quando for mais prático." },
    { question: "Posso comer fora do horário?", answer: "Sim, os horários são um norte. O principal é consumir todos os alimentos no dia." },
    { question: "E se tiver dificuldades?", answer: "Me chame no WhatsApp, não precisa esperar os Check-ins!" },
  ],
  supportHours: "Segunda à Sexta: 08h00 às 18h00",
  whatsappUrl: "https://wa.me/5511999999999",
};

const StudentPage = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <HeroSection
        studentName={demoData.studentName}
        objective={demoData.objective}
      />

      <PlanSummary
        objective={demoData.objective}
        plan={demoData.plan}
        duration={demoData.duration}
        strategy={demoData.strategy}
      />

      <NextSteps steps={demoData.steps} />

      <LinksBlock links={demoData.links} />

      <section className="px-4 sm:px-8 py-8 bg-background">
        <div className="max-w-lg mx-auto space-y-4">
          <h3 className="font-display text-2xl text-foreground">🔐 CREDENCIAIS DE ACESSO</h3>
          {demoData.credentials.map((cred, i) => (
            <CredentialsBlock key={i} {...cred} />
          ))}
        </div>
      </section>

      <GuidelinesBlock
        content={demoData.guidelines.content}
        highlights={demoData.guidelines.highlights}
      />

      <OptionalBlocks blocks={demoData.optionalBlocks} />

      <SupportSection
        whatsappUrl={demoData.whatsappUrl}
        faqs={demoData.faqs}
        supportHours={demoData.supportHours}
      />

      <FooterSection />
    </div>
  );
};

export default StudentPage;
