import type { LegacyPageContent } from "@/components/LegacyPage";

export type LegacyPageKey =
  | "account"
  | "profile"
  | "resetPassword"
  | "memberDirectory"
  | "affiliateDisclosure"
  | "cookiePolicy"
  | "legal"
  | "privacy"
  | "terms"
  | "cookies"
  | "construction"
  | "masterProgram"
  | "samplePage"
  | "teamContact"
  | "resultMasterEn"
  | "resultMasterEs"
  | "resultMasterPt"
  | "resultScoreBadEs"
  | "resultScoreOkEs"
  | "resultScoreOkEn"
  | "resultScoreBadEn";

export const legacyPages: Record<LegacyPageKey, LegacyPageContent> = {
  account: {
    title: "Account",
    description:
      "Your Periospot account area is being rebuilt with the new platform. Sign in to view downloads, saved resources, and assessment history.",
    badge: "Account",
    sections: [
      {
        title: "Profile and preferences",
        body: "Update personal details, communication preferences, and language settings.",
      },
      {
        title: "Resources and downloads",
        body: "Access your ebooks, certificates, and saved materials in one place.",
      },
      {
        title: "Assessments",
        body: "Review past scores and continue in-progress assessments.",
      },
      {
        title: "Billing",
        body: "Manage subscriptions, receipts, and program enrollment details.",
      },
    ],
    primaryCta: { label: "Sign in", to: "/auth/signin" },
    secondaryCta: { label: "Create an account", to: "/auth/signup" },
  },
  profile: {
    title: "My Profile",
    description:
      "Profile management is moving into the new Periospot experience. This page will include professional credentials and learning preferences.",
    badge: "Profile",
    sections: [
      {
        title: "Professional details",
        body: "Keep your specialty, clinic, and licensing details up to date.",
      },
      {
        title: "Learning goals",
        body: "Select the topics you want to focus on for personalized recommendations.",
      },
    ],
    primaryCta: { label: "Back to account", to: "/account" },
  },
  resetPassword: {
    title: "Reset Password",
    description:
      "Password reset will be available in the new authentication flow. For now, use the sign-in page to request a reset link.",
    badge: "Security",
    sections: [
      {
        title: "Secure access",
        body: "We will enforce stronger password policies and optional MFA in the new platform.",
      },
      {
        title: "Need help?",
        body: "Contact support if you cannot access your account after migration.",
      },
    ],
    primaryCta: { label: "Go to sign in", to: "/auth/signin" },
  },
  memberDirectory: {
    title: "Member Directory",
    description:
      "The member directory is being rebuilt with updated profiles and filters. It will return once migration is complete.",
    badge: "Community",
    sections: [
      {
        title: "Find peers",
        body: "Search by specialty, location, and clinical interests.",
      },
      {
        title: "Connect",
        body: "Reach out to colleagues for clinical cases and learning opportunities.",
      },
    ],
    primaryCta: { label: "Explore resources", to: "/resources" },
  },
  affiliateDisclosure: {
    title: "Affiliate Disclosure",
    description:
      "This page will outline any affiliate relationships and how they support Periospot. Full disclosure text will be migrated shortly.",
    badge: "Transparency",
    sections: [
      {
        title: "What this means",
        body: "Some links may be affiliate links. We only recommend products that align with our educational standards.",
      },
      {
        title: "Questions",
        body: "Contact us if you have concerns about partnerships or recommendations.",
      },
    ],
    primaryCta: { label: "Contact us", to: "/contact" },
  },
  cookiePolicy: {
    title: "Cookie Policy (EU)",
    description:
      "Cookie policy content is being migrated. This page will explain how we use cookies and analytics in compliance with EU regulations.",
    badge: "Compliance",
    sections: [
      {
        title: "Cookie usage",
        body: "We use cookies to deliver content, remember preferences, and improve performance.",
      },
      {
        title: "Controls",
        body: "You will be able to manage cookie preferences in the new consent manager.",
      },
    ],
    primaryCta: { label: "Back to home", to: "/" },
  },
  legal: {
    title: "Legal",
    description:
      "Legal documentation is being consolidated for the new site. Terms, privacy, and policies will live here.",
    badge: "Legal",
    sections: [
      {
        title: "Terms of use",
        body: "Rules and conditions for accessing Periospot content and services.",
      },
      {
        title: "Privacy",
        body: "How we collect and process personal data across the platform.",
      },
    ],
    primaryCta: { label: "Privacy policy", to: "/privacy" },
    secondaryCta: { label: "Terms of use", to: "/terms" },
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "Our updated privacy policy will be published here as part of the migration.",
    badge: "Privacy",
    sections: [
      {
        title: "Data collection",
        body: "We collect only the data needed to deliver educational resources and assessments.",
      },
      {
        title: "Your rights",
        body: "You will have clear options to access, update, or delete your data.",
      },
    ],
    primaryCta: { label: "Back to legal", to: "/legal" },
  },
  terms: {
    title: "Terms of Use",
    description:
      "Updated terms of use are being drafted for the new platform. Please check back soon.",
    badge: "Terms",
    sections: [
      {
        title: "Content usage",
        body: "Guidelines for using Periospot resources and learning materials.",
      },
      {
        title: "Subscriptions",
        body: "Details about paid programs and access tiers will be listed here.",
      },
    ],
    primaryCta: { label: "Back to legal", to: "/legal" },
  },
  cookies: {
    title: "Cookies",
    description:
      "Cookie settings and disclosures will appear here after migration.",
    badge: "Cookies",
    sections: [
      {
        title: "Essential cookies",
        body: "Used to provide core site functionality and secure access.",
      },
      {
        title: "Analytics",
        body: "Helps us understand how resources are used so we can improve them.",
      },
    ],
    primaryCta: { label: "Cookie policy", to: "/cookie-policy-eu" },
  },
  construction: {
    title: "Under Construction",
    description:
      "This section is being redesigned. It will return once the migration phase is complete.",
    badge: "Work in progress",
    sections: [
      {
        title: "Why this is happening",
        body: "We are consolidating legacy content into the new Periospot experience.",
      },
      {
        title: "What to do next",
        body: "Browse the library or explore recent articles while we finish this page.",
      },
    ],
    primaryCta: { label: "Visit library", to: "/library" },
    secondaryCta: { label: "Explore articles", to: "/articles" },
  },
  masterProgram: {
    title: "Master en Periodoncia e Implantes",
    description:
      "Program details and enrollment information will be restored here. This page is part of the Spanish content track.",
    badge: "Program",
    sections: [
      {
        title: "Curriculum",
        body: "Modules, clinical cases, and assessment structure will be listed here.",
      },
      {
        title: "Enrollment",
        body: "New enrollment options will be published after the migration.",
      },
    ],
    primaryCta: { label: "Contact us", to: "/contact" },
  },
  samplePage: {
    title: "Sample Page",
    description:
      "This is a legacy placeholder from WordPress. It will be replaced with final content or removed.",
    badge: "Legacy",
    sections: [
      {
        title: "Next steps",
        body: "We will decide whether to keep or remove this page once the content audit is complete.",
      },
    ],
    primaryCta: { label: "Back to home", to: "/" },
  },
  teamContact: {
    title: "Team & Contact",
    description:
      "This legacy route will link to the team and contact experience on the new site.",
    badge: "Team",
    sections: [
      {
        title: "Meet the team",
        body: "Learn about the educators and contributors behind Periospot.",
      },
      {
        title: "Get in touch",
        body: "Reach us for partnerships, support, or feedback.",
      },
    ],
    primaryCta: { label: "Team page", to: "/team" },
    secondaryCta: { label: "Contact", to: "/contact" },
  },
  resultMasterEn: {
    title: "Congrats! You are a Periospot Master",
    description:
      "Your assessment indicates strong mastery. This result page will be personalized with your score and next steps.",
    badge: "Assessment Result",
    sections: [
      {
        title: "Next step",
        body: "Download your certificate and continue with advanced learning modules.",
      },
      {
        title: "Share",
        body: "Share your result with colleagues or your team.",
      },
    ],
    primaryCta: { label: "Back to assessments", to: "/assessments" },
  },
  resultMasterEs: {
    title: "Enhorabuena! Eres un Periospot Master",
    description:
      "Este resultado sera personalizado con tu puntuacion y recomendaciones.",
    badge: "Resultado",
    sections: [
      {
        title: "Siguiente paso",
        body: "Descarga tu certificado y continua con los modulos avanzados.",
      },
      {
        title: "Comparte",
        body: "Comparte tu resultado con colegas o tu equipo.",
      },
    ],
    primaryCta: { label: "Volver a evaluaciones", to: "/assessments" },
  },
  resultMasterPt: {
    title: "Parabens! Es um dos Mestres do Periospot",
    description:
      "Este resultado sera personalizado com a sua pontuacao e proximos passos.",
    badge: "Resultado",
    sections: [
      {
        title: "Proximo passo",
        body: "Descarregue o seu certificado e continue com os modulos avancados.",
      },
      {
        title: "Partilhar",
        body: "Partilhe o seu resultado com colegas ou com a equipa.",
      },
    ],
    primaryCta: { label: "Voltar as avaliacoes", to: "/assessments" },
  },
  resultScoreBadEs: {
    title: "Tu clasificacion no ha sido muy buena",
    description:
      "Esta pagina mostrara recomendaciones personalizadas para mejorar tu resultado.",
    badge: "Resultado",
    sections: [
      {
        title: "Recomendaciones",
        body: "Te sugeriremos recursos introductorios y practicas clinicas basicas.",
      },
      {
        title: "Siguiente intento",
        body: "Vuelve a realizar la evaluacion cuando estes listo.",
      },
    ],
    primaryCta: { label: "Volver a evaluaciones", to: "/assessments" },
  },
  resultScoreOkEs: {
    title: "Tu resultado ha sido bueno, pero no excelente",
    description:
      "Esta pagina mostrara como cerrar las brechas para alcanzar el nivel experto.",
    badge: "Resultado",
    sections: [
      {
        title: "Sugerencias",
        body: "Revisa los articulos recomendados y practica con casos clinicos.",
      },
      {
        title: "Continuar",
        body: "Completa la ruta avanzada para mejorar tu puntuacion.",
      },
    ],
    primaryCta: { label: "Volver a evaluaciones", to: "/assessments" },
  },
  resultScoreOkEn: {
    title: "Your score was good, but not excellent",
    description:
      "This page will include personalized feedback and next steps for improvement.",
    badge: "Assessment Result",
    sections: [
      {
        title: "Focus areas",
        body: "Review the modules that address your gaps and retake the assessment.",
      },
      {
        title: "Keep learning",
        body: "Explore recommended articles and resources to level up.",
      },
    ],
    primaryCta: { label: "Back to assessments", to: "/assessments" },
  },
  resultScoreBadEn: {
    title: "Your score was... lets just say it was",
    description:
      "This page will guide you toward foundational resources and a new attempt.",
    badge: "Assessment Result",
    sections: [
      {
        title: "Start here",
        body: "Begin with the core learning path to build confidence.",
      },
      {
        title: "Try again",
        body: "Return to the assessment after reviewing the basics.",
      },
    ],
    primaryCta: { label: "Back to assessments", to: "/assessments" },
  },
};

export const legacyPageRoutes: { path: string; key: LegacyPageKey }[] = [
  { path: "/account", key: "account" },
  { path: "/mi-cuenta", key: "account" },
  { path: "/my-profile", key: "profile" },
  { path: "/reset-password", key: "resetPassword" },
  { path: "/member-directory", key: "memberDirectory" },
  { path: "/affiliate-disclosure", key: "affiliateDisclosure" },
  { path: "/cookie-policy-eu", key: "cookiePolicy" },
  { path: "/legal", key: "legal" },
  { path: "/privacy", key: "privacy" },
  { path: "/terms", key: "terms" },
  { path: "/cookies", key: "cookies" },
  { path: "/en-construccion", key: "construction" },
  { path: "/master-en-periodoncia-e-implantes-de-periocentrum", key: "masterProgram" },
  { path: "/sample-page", key: "samplePage" },
  { path: "/team-contact", key: "teamContact" },
  {
    path: "/congrats-%f0%9f%8e%89-you-are-a-periospot-master-%f0%9f%91%8c",
    key: "resultMasterEn",
  },
  {
    path: "/enhorabuena-%f0%9f%8e%89-eres-un-periospot-master-%f0%9f%91%8c",
    key: "resultMasterEs",
  },
  {
    path: "/parabens-%f0%9f%8e%89-es-um-dos-mestres-do-periospot-%f0%9f%91%8c",
    key: "resultMasterPt",
  },
  {
    path: "/tu-clasificacion-no-ha-sido-muy-buena-%f0%9f%98%85",
    key: "resultScoreBadEs",
  },
  { path: "/tu-resultado-ha-sido-bueno-pero-no-excelente", key: "resultScoreOkEs" },
  { path: "/your-score-was-good-but-not-excellent", key: "resultScoreOkEn" },
  {
    path: "/your-score-was-lests-just-say-it-was-%f0%9f%98%85",
    key: "resultScoreBadEn",
  },
];

export const legacyCategoryRoutes = [
  {
    path: "/periospot-hacks",
    title: "Periospot Hacks",
    description: "Quick clinical tips and workflows sourced from the legacy blog posts.",
    category: "Periospot Hacks",
  },
  {
    path: "/periospot-bookshelf",
    title: "Periospot Bookshelf",
    description: "A curated list of books and reading recommendations from Periospot.",
    category: "Periospot Bookshelf",
  },
  {
    path: "/periospot-patron",
    title: "Periospot Patron",
    description: "Highlights and updates for patrons and supporters.",
    category: "Periospot Patron",
  },
  {
    path: "/periospot-for-dental-patients",
    title: "Periospot for Dental Patients",
    description: "Patient-focused articles and resources from the legacy site.",
    category: "Periospot for Patients",
  },
];
