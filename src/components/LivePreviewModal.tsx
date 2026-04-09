import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import HeroSection from "@/components/student-page/HeroSection";
import PlanSummary from "@/components/student-page/PlanSummary";
import NextSteps from "@/components/student-page/NextSteps";
import LinksBlock from "@/components/student-page/LinksBlock";
import CredentialsBlock from "@/components/student-page/CredentialsBlock";
import GuidelinesBlock from "@/components/student-page/GuidelinesBlock";
import OptionalBlocks from "@/components/student-page/OptionalBlocks";
import SupportSection from "@/components/student-page/SupportSection";
import FooterSection from "@/components/student-page/FooterSection";
import { DEFAULT_SECTION_ORDER } from "@/components/SortableSections";

import webdietTutorial from "@/assets/webdiet-tutorial.png";
import mfitTutorial from "@/assets/mfit-tutorial.png";

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

interface PreviewProps {
    formData: any;
    isTemplate?: boolean;
}

export default function LivePreviewModal({ formData, isTemplate = false }: PreviewProps) {
    const {
        name,
        objective,
        plan,
        hasApps,
        membersLink,
        supportLink,
        webdietLogin,
        webdietPassword,
        mfitLogin,
        mfitPassword,
        strategy,
        duration,
        whatsappUrl,
        supportHours,
        steps = [],
        stepsTitle = "📋 PRÓXIMOS PASSOS",
        hideStepsTitle = false,
        guidelinesContent,
        guidelinesHighlights = [],
        guidelinesTitle = "📌 Orientações Importantes",
        hideHighlightsTitle = false,
        faqs = [],
        optionalBlocks = [],
        links = [],
        sectionOrder = DEFAULT_SECTION_ORDER,
    } = formData;

    const firstName = isTemplate ? "Aluno(a)" : (name ? name.split(" ")[0] : "Aluno(a)");

    // Build links array
    const allLinks = [
        ...(membersLink
            ? [{ label: "Área de Membros", url: membersLink, icon: "members", description: "Módulos e orientações completas" }]
            : []),
        ...(supportLink
            ? [{ label: "Suporte WhatsApp", url: supportLink, icon: "support", description: supportHours || "" }]
            : []),
        ...links,
    ];

    // Build credentials
    const credentials = [];
    if (hasApps) {
        if (webdietLogin || webdietPassword) {
            credentials.push({
                appName: "WebDiet",
                login: webdietLogin || "",
                password: webdietPassword || "",
                instructions: "Abra o app e clique em 'Já me consultei'",
                tutorialImage: webdietTutorial,
            });
        }
        if (mfitLogin || mfitPassword) {
            credentials.push({
                appName: "MFit Personal",
                login: mfitLogin || "",
                password: mfitPassword || "",
                instructions: "Clique em 'Sou aluno' e entre com os dados",
                tutorialImage: mfitTutorial,
            });
        }
    }

    const renderSection = (section: string) => {
        switch (section) {
            case "summary":
                return (
                    <PlanSummary
                        key="summary"
                        objective={objectiveLabels[objective] || objective}
                        plan={planLabels[plan || "shape"] || plan || "Shape"}
                        duration={duration || undefined}
                        strategy={strategy || undefined}
                    />
                );
            case "steps":
                return steps.length > 0 ? <NextSteps key="steps" steps={steps} hideTitle={hideStepsTitle} title={stepsTitle} /> : null;
            case "links":
                return allLinks.length > 0 ? <LinksBlock key="links" links={allLinks} /> : null;
            case "credentials":
                return credentials.length > 0 ? (
                    <section key="credentials" className="px-4 py-8 bg-background">
                        <div className="max-w-lg mx-auto space-y-4">
                            <h3 className="font-display text-2xl text-foreground">🔐 CREDENCIAIS DE ACESSO</h3>
                            {credentials.map((cred, i) => (
                                <CredentialsBlock key={i} {...cred} />
                            ))}
                        </div>
                    </section>
                ) : null;
            case "guidelines":
                return (guidelinesContent || (guidelinesHighlights && guidelinesHighlights.length > 0)) ? (
                    <GuidelinesBlock
                        key="guidelines"
                        title={guidelinesTitle}
                        hideHighlightsTitle={hideHighlightsTitle}
                        content={guidelinesContent || ""}
                        highlights={guidelinesHighlights || []}
                    />
                ) : null;
            case "optionalBlocks":
                return optionalBlocks.length > 0 ? <OptionalBlocks key="optionalBlocks" blocks={optionalBlocks} /> : null;
            case "support":
                return (
                    <SupportSection
                        key="support"
                        whatsappUrl={whatsappUrl || supportLink || undefined}
                        faqs={faqs.length > 0 ? faqs : undefined}
                        supportHours={supportHours || undefined}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                    <Eye className="w-4 h-4 inline mr-1" />
                    Preview
                </button>
            </DialogTrigger>
            {/* Usando max-w-[480px] para simular a visualização de celular */}
            <DialogContent className="max-w-[480px] w-full h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border sm:rounded-xl">
                <DialogTitle className="sr-only">Live Preview do Plano do Aluno</DialogTitle>
                <div className="min-h-full bg-background pb-10">
                    <HeroSection
                        studentName={firstName}
                        objective={objectiveLabels[objective] || objective}
                    />
                    {sectionOrder.map(renderSection)}
                    <FooterSection />
                </div>
            </DialogContent>
        </Dialog>
    );
}
