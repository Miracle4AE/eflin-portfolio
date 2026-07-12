import type { Locale } from "@/i18n/config";

export type LocalizedString = Record<Locale, string>;

export type CategoryFilterKey =
  | "all"
  | "branding"
  | "editorial"
  | "identity"
  | "digital"
  | "art-direction";

export type ProjectTypeKey =
  | "branding"
  | "editorial"
  | "identity"
  | "digital"
  | "art-direction"
  | "other";

export interface Dictionary {
  meta: {
    siteTitle: string;
    siteDescription: string;
    portfolioTitle: string;
    workTitle: string;
    workDescription: string;
    contactTitle: string;
    contactDescription: string;
    notFound: string;
  };
  nav: {
    work: string;
    about: string;
    services: string;
    contact: string;
    home: string;
    openMenu: string;
    closeMenu: string;
  };
  hero: {
    role: string;
    headline: string;
    subtitle: string;
    description: string;
    viewWork: string;
    contact: string;
    scroll: string;
  };
  work: {
    indexLabel: string;
    indexTitle: string;
    indexDescription: string;
    featuredLabel: string;
    featuredTitle: string;
    featuredDescription: string;
    viewAll: string;
    viewCaseStudy: string;
    viewCaseStudyAria: string;
    inFocus: string;
    portfolio: string;
    emptyCategory: string;
    collectionsTitle: string;
    collectionsDescription: string;
    projectsLabel: string;
    backToCollections: string;
    openBook: string;
    closeBook: string;
    bookPrevious: string;
    bookNext: string;
    soundOn: string;
    soundOff: string;
    bookProgress: string;
    bookPageStatus: string;
    bookClosed: string;
    bookEndOfCollection: string;
    bookPreviousPage: string;
    bookNextPage: string;
    soundUnavailable: string;
    viewProjectDetail: string;
    backToBook: string;
    openStandalonePage: string;
    viewFullSize: string;
    bookProjectLabel: string;
    bookDetailPageLabel: string;
    lightboxClose: string;
  };
  caseStudy: {
    projectOverview: string;
    processNotes: string;
    processBrief: string;
    processContext: string;
    processResponse: string;
    designSystem: string;
    designSystemTitle: string;
    typography: string;
    visualDirection: string;
    colorPalette: string;
    gallery: string;
    galleryTitle: string;
    nextProject: string;
    allWorks: string;
    client: string;
    year: string;
    role: string;
    category: string;
    viewGalleryImage: string;
    closeGallery: string;
    previousImage: string;
    nextImage: string;
  };
  about: {
    label: string;
    title: string;
    bio: string;
    philosophy: string;
    location: string;
    portraitAlt: string;
  };
  services: {
    label: string;
    title: string;
    description: string;
    items: Record<
      string,
      { title: string; description: string; index: string }
    >;
  };
  contact: {
    label: string;
    title: string;
    description: string;
    formSubmit: string;
    formSubmitting: string;
    successLabel: string;
    successTitle: string;
    successBody: string;
    sendAnother: string;
    formName: string;
    formEmail: string;
    formCompany: string;
    formProjectType: string;
    formMessage: string;
    formSelectType: string;
    languageLabel: string;
  };
  projectTypes: Record<ProjectTypeKey, string>;
  categories: Record<CategoryFilterKey, string>;
  validation: {
    nameRequired: string;
    nameTooLong: string;
    emailInvalid: string;
    emailTooLong: string;
    companyTooLong: string;
    projectTypeRequired: string;
    projectTypeInvalid: string;
    messageTooShort: string;
    messageTooLong: string;
    submitFailed: string;
    networkError: string;
    honeypot: string;
    rateLimited: string;
    unavailable: string;
  };
  footer: {
    headline: string;
    intro: string;
    contactLabel: string;
    navigationLabel: string;
    socialLabel: string;
    emailAria: string;
    visitSocial: string;
    backToTop: string;
    tagline: string;
    copyright: string;
  };
  cursor: {
    view: string;
    open: string;
    contact: string;
  };
  language: {
    switchTo: string;
    current: string;
  };
}
