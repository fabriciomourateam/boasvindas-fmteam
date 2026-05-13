import { useParams } from "react-router-dom";
import HeroSection from "@/components/student-page/HeroSection";
import PlanSummary from "@/components/student-page/PlanSummary";
import NextSteps from "@/components/student-page/NextSteps";
import LinksBlock from "@/components/student-page/LinksBlock";
import GuidelinesBlock from "@/components/student-page/GuidelinesBlock";
import OptionalBlocks from "@/components/student-page/OptionalBlocks";
import SupportSection from "@/components/student-page/SupportSection";
import FooterSection from "@/components/student-page/FooterSection";
import ShareButton from "@/components/student-page/ShareButton";
import StandardBlocksGrid from "@/components/student-page/StandardBlocksGrid";
import { Toaster } from "sonner";
import { useStudentPage } from "@/hooks/useStudentPages";
import { Loader2 } from "lucide-react";
import { DEFAULT_SECTION_ORDER } from "@/components/SortableSections";
import { mergeStandardBlocks, normalizeStandardBlocksOrder } from "@/pages/CreatePage";

const objectiveLabels: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  recomposicao: "Recomposição Corporal",
  hipertrofia: "Hipertrofia",
};

const planLabels: Record<string, string> = {
  shape: "Shape",
  premium: "Premium",
  premium_anual: "Premium Anual",
};

const StudentPage = () => {
  const { slug } = useParams();
  const { data: page, isLoading, error } = useStudentPage(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="font-display text-6xl gradient-gold-text">404</span>
          <p className="text-white/50 text-sm mt-4">Página não encontrada ou ainda não publicada.</p>
        </div>
      </div>
    );
  }

  const cc = (page.custom_content || {}) as Record<string, any>;
  const steps = cc.steps || [];
  const guidelines = cc.guidelines || {};
  const optionalBlocks = cc.optionalBlocks || [];
  const customLinks = cc.links || [];
  const extrasImageUrl: string = cc.extrasImageUrl || "";
  const standardBlocksOrder = normalizeStandardBlocksOrder(cc.standardBlocksOrder);
  const standardBlocks = mergeStandardBlocks(cc.standardBlocks, {
    has_bioimpedancia: page.has_bioimpedancia,
    has_psicologa: page.has_psicologa,
    has_apps: page.has_apps,
    has_treino: page.has_treino,
    has_area_membros: page.has_area_membros,
    webdiet_login: page.webdiet_login,
    webdiet_password: page.webdiet_password,
    mfit_login: page.mfit_login,
    mfit_password: page.mfit_password,
    members_link: page.members_link,
  });

  // Build links array
  const allLinks = [
    ...(page.members_link
      ? [{ label: "Área de Membros", url: page.members_link, icon: "members", description: "Módulos e orientações completas" }]
      : []),
    ...(page.support_link
      ? [{ label: "Suporte WhatsApp", url: page.support_link, icon: "support", description: cc.supportHours || "" }]
      : []),
    ...customLinks,
  ];

  // Extract first name
  const firstName = page.student_name.split(" ")[0];

  const sectionOrder: string[] = cc.sectionOrder || DEFAULT_SECTION_ORDER;

  const renderSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          <PlanSummary
            key="summary"
            objective={objectiveLabels[page.objective] || page.objective}
            plan={planLabels[page.plan] || page.plan}
            duration={page.duration || undefined}
            strategy={page.strategy || undefined}
          />
        );
      case "steps":
        return steps.length > 0 ? <NextSteps key="steps" steps={steps} hideTitle={cc.hideStepsTitle} title={cc.stepsTitle} /> : null;
      case "links":
        return allLinks.length > 0 ? <LinksBlock key="links" links={allLinks} /> : null;
      case "credentials":
        return null;
      case "guidelines":
        return (guidelines.content || (guidelines.highlights && guidelines.highlights.length > 0)) ? (
          <GuidelinesBlock
            key="guidelines"
            title={guidelines.title}
            hideTitle={guidelines.hideGuidelinesTitle}
            hideHighlightsTitle={guidelines.hideHighlightsTitle}
            content={guidelines.content || ""}
            highlights={guidelines.highlights || []}
          />
        ) : null;
      case "optionalBlocks":
        return optionalBlocks.length > 0 ? <OptionalBlocks key="optionalBlocks" blocks={optionalBlocks} /> : null;
      case "standardButtons":
        return <StandardBlocksGrid key="standardButtons" data={standardBlocks} order={standardBlocksOrder} />;
      case "support":
        return (
          <SupportSection
            key="support"
            whatsappUrl={cc.whatsappUrl || page.support_link || undefined}
            supportHours={cc.supportHours || undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      <HeroSection
        studentName={firstName}
        objective={objectiveLabels[page.objective] || page.objective}
      />

      {sectionOrder.map(renderSection)}

      {/* standardButtons como fallback: se NÃO estiver no sectionOrder de templates antigos, renderiza no fim */}
      {!sectionOrder.includes("standardButtons") && <StandardBlocksGrid data={standardBlocks} order={standardBlocksOrder} />}

      {extrasImageUrl && (
        <section className="bg-background">
          <img src={extrasImageUrl} alt="" className="w-full max-w-lg mx-auto block" />
        </section>
      )}

      <FooterSection />

      <ShareButton studentName={firstName} />
    </div>
  );
};

export default StudentPage;
