// ============================================
// Textos da página padronizada /bem-vindo
// Edite AQUI — é o único lugar. A página não busca nada no banco.
// Personalização por link: /bem-vindo?nome=Rafael&obj=hipertrofia
// ============================================

export type Objetivo = "hipertrofia" | "emagrecimento" | "recomposicao";

export const ONBOARDING = {
  links: {
    android: "https://play.google.com/store/apps/details?id=com.fmteam.meuacompanhamento",
    ios: "https://apps.apple.com/app/my-shape-fmteam/id6785075637",
    areaMembros: "https://area-de-membros-fabriciomourateam.vercel.app",
    // Link do WhatsApp do SUPORTE (ex.: https://wa.me/55DDDNUMERO). Vazio = botão some.
    whatsappSuporte: "",
  },

  hero: {
    tituloComNome: "Bem-vindo ao time, {nome}!",
    tituloSemNome: "Bem-vindo ao time!",
    subtitulo: "Seu planejamento está pronto. Tudo o que você precisa pra começar hoje está aqui.",
    botaoApp: "Baixar o app",
  },

  passos: {
    titulo: "Comece em 3 passos",
    itens: [
      { titulo: "Baixe o app My Shape", texto: "Pelo botão acima — ele já abre a loja certa do seu celular." },
      { titulo: "Entre com seu acesso", texto: "Use o login que enviamos no WhatsApp." },
      { titulo: "Abra sua dieta e seu treino", texto: "Está tudo lá: refeições, substituições, treino do dia e orientações." },
    ],
  },

  estrategia: {
    titulo: "Sua estratégia",
    porObjetivo: {
      hipertrofia:
        "Foco em ganhar massa muscular com qualidade: comer o suficiente (sem exagero), proteína bem distribuída no dia e treino com progressão de carga. O peso na balança pode subir devagar — isso é esperado.",
      emagrecimento:
        "Foco em perder gordura preservando músculo: déficit calórico controlado, proteína alta, treino de força mantido e passos/cardio no dia a dia. Constância vale mais do que perfeição.",
      recomposicao:
        "Foco em perder gordura e ganhar músculo ao mesmo tempo: calorias perto da manutenção, proteína alta e treino de força bem feito. A balança mexe pouco — acompanhe pelas fotos e medidas.",
    } as Record<Objetivo, string>,
    // Quando o link não tem ?obj
    generico:
      "Sua dieta e seu treino foram montados para o seu objetivo, a partir da sua anamnese. Siga o plano com constância e vamos ajustando juntos a cada check-in.",
  },

  regras: {
    titulo: "5 regras de ouro",
    itens: [
      "Siga o plano o mais fiel possível nas primeiras 2 semanas — é assim que dá pra ajustar com precisão.",
      "Use as substituições do app em vez de improvisar.",
      "Beba água ao longo do dia e durma bem: isso muda o resultado.",
      "Errou numa refeição? Volte ao plano na próxima. Sem compensar, sem desistir.",
      "Dúvida é pra perguntar: chama o suporte antes de mudar qualquer coisa por conta.",
    ],
  },

  linhaDoTempo: {
    titulo: "Como vai ser daqui pra frente",
    itens: [
      { quando: "Hoje", texto: "Baixe o app, abra a dieta e o treino e organize suas compras." },
      { quando: "Semana 1", texto: "Adaptação: siga o plano e anote dúvidas e dificuldades." },
      { quando: "Dia 30", texto: "Check-in: fotos, medidas e feedback pelo app." },
      { quando: "Depois do check-in", texto: "Ajustamos dieta e treino com base nos seus resultados." },
    ],
  },

  incluso: {
    titulo: "O que está incluso",
    itens: [
      "Plano alimentar individualizado",
      "Treino personalizado no app",
      "Check-ins com ajustes de dieta e treino",
      "Suporte pelo WhatsApp",
      "Acompanhamento da sua evolução (fotos e medidas)",
      "Área de membros com conteúdos e orientações",
    ],
  },

  suporte: {
    titulo: "Precisa de ajuda?",
    texto: "Fale com o suporte FMTEAM pelo WhatsApp.",
    horario: "Seg a sex, 8h às 18h",
    botao: "Falar no WhatsApp",
  },

  alemDisso: {
    titulo: "Quer ir além?",
    texto: "Na área de membros você encontra módulos e orientações completas.",
    botao: "Acessar área de membros",
  },

  // Mensagem que o gerador de link copia (painel /admin). {nome} e {link} são trocados.
  mensagemWhatsapp:
    "Bora, {nome}! 💪 Seu planejamento está pronto. Aqui está tudo o que você precisa pra começar hoje: 👉 {link}\n\nPrimeiro passo: baixe o app e abra sua dieta. Qualquer dúvida, é só me chamar aqui.",
};

export const OBJETIVOS: { value: Objetivo; label: string }[] = [
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "recomposicao", label: "Recomposição corporal" },
];

export function buildBemVindoUrl(origin: string, nome: string, obj?: Objetivo | "") {
  const params = new URLSearchParams();
  const n = nome.trim().split(/\s+/)[0];
  if (n) params.set("nome", n);
  if (obj) params.set("obj", obj);
  const qs = params.toString();
  return `${origin}/bem-vindo${qs ? `?${qs}` : ""}`;
}
