import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import HeroSection from "@/components/student-page/HeroSection";
import VideoSection from "@/components/student-page/VideoSection";
import PlanSummary from "@/components/student-page/PlanSummary";
import NextSteps from "@/components/student-page/NextSteps";
import LinksBlock from "@/components/student-page/LinksBlock";
import GuidelinesBlock from "@/components/student-page/GuidelinesBlock";
import OptionalBlocks from "@/components/student-page/OptionalBlocks";
import SupportSection from "@/components/student-page/SupportSection";
import FooterSection from "@/components/student-page/FooterSection";
import StandardBlocksGrid from "@/components/student-page/StandardBlocksGrid";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/components/SortableSections";
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

interface PreviewProps {
    formData: any;
    isTemplate?: boolean;
}

export default function LivePreviewModal({ formData, isTemplate = false }: PreviewProps) {
    const {
        name,
        objective,
        plan,
        membersLink,
        supportLink,
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
        hideGuidelinesTitle = false,
        hideHighlightsTitle = false,
        optionalBlocks = [],
        links = [],
        sectionOrder: rawSectionOrder,
        standardBlocks: rawStandardBlocks,
        standardBlocksOrder: rawStandardBlocksOrder,
        extrasImageUrl = "",
        video = {},
        hasTreino,
        hasPsicologa,
        hasBioimpedancia,
        hasAreaMembros,
        hasApps,
        webdietLogin,
        webdietPassword,
        mfitLogin,
        mfitPassword,
    } = formData;

    const firstName = isTemplate ? "Aluno(a)" : (name ? name.split(" ")[0] : "Aluno(a)");

    const standardBlocksOrder = normalizeStandardBlocksOrder(rawStandardBlocksOrder);
    const sectionOrder: string[] = normalizeSectionOrder(rawSectionOrder || DEFAULT_SECTION_ORDER);
    const standardBlocks = mergeStandardBlocks(rawStandardBlocks, {
        has_bioimpedancia: hasBioimpedancia,
        has_psicologa: hasPsicologa,
        has_apps: hasApps,
        has_treino: hasTreino,
        has_area_membros: hasAreaMembros,
        webdiet_login: webdietLogin,
        webdiet_password: webdietPassword,
        mfit_login: mfitLogin,
        mfit_password: mfitPassword,
        members_link: membersLink,
    });

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

    const renderSection = (section: string) => {
        switch (section) {
            case "video":
                return video.url ? (
                    <VideoSection
                        key="video"
                        url={video.url}
                        buttonLabel={video.buttonLabel}
                        buttonUrl={video.buttonUrl || membersLink || undefined}
                    />
                ) : null;
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
                return null;
            case "guidelines":
                return (guidelinesContent || (guidelinesHighlights && guidelinesHighlights.length > 0)) ? (
                    <GuidelinesBlock
                        key="guidelines"
                        title={guidelinesTitle}
                        hideTitle={hideGuidelinesTitle}
                        hideHighlightsTitle={hideHighlightsTitle}
                        content={guidelinesContent || ""}
                        highlights={guidelinesHighlights || []}
                    />
                ) : null;
            case "optionalBlocks":
                return optionalBlocks.length > 0 ? <OptionalBlocks key="optionalBlocks" blocks={optionalBlocks} /> : null;
            case "standardButtons":
                return <StandardBlocksGrid key="standardButtons" data={standardBlocks} order={standardBlocksOrder} />;
            case "support": {
                const wa = whatsappUrl || supportLink;
                if (!wa) return null;
                return (
                    <SupportSection
                        key="support"
                        whatsappUrl={wa || undefined}
                        supportHours={supportHours || undefined}
                    />
                );
            }
            case "extras":
                return extrasImageUrl ? (
                    <section key="extras" className="bg-background">
                        <img src={extrasImageUrl} alt="" className="w-full max-w-lg mx-auto block" />
                    </section>
                ) : null;
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
                    {!sectionOrder.includes("standardButtons") && <StandardBlocksGrid data={standardBlocks} order={standardBlocksOrder} />}
                    {!sectionOrder.includes("extras") && extrasImageUrl && (
                        <section className="bg-background">
                            <img src={extrasImageUrl} alt="" className="w-full max-w-lg mx-auto block" />
                        </section>
                    )}
                    <FooterSection />
                </div>
            </DialogContent>
        </Dialog>
    );
}
