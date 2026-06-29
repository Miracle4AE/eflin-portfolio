import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export type ContactFormData = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
  website?: string;
  sourcePage?: string;
  locale?: Locale;
};

export type ContactFieldErrors = Partial<
  Record<keyof Omit<ContactFormData, "website" | "sourcePage" | "locale">, string>
>;

export type ContactValidationResult =
  | { success: true; data: ContactFormData }
  | { success: false; errors: ContactFieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LIMITS = {
  nameMax: 100,
  emailMax: 254,
  companyMax: 200,
  messageMin: 20,
  messageMax: 5000,
  sourcePageMax: 500,
} as const;

export const PROJECT_TYPE_VALUES = [
  "branding",
  "editorial",
  "identity",
  "digital",
  "art-direction",
  "other",
] as const;

export type ProjectTypeValue = (typeof PROJECT_TYPE_VALUES)[number];

export function validateContactForm(
  input: Record<string, unknown>,
  locale: Locale = "en",
): ContactValidationResult {
  const v = getDictionary(locale).validation;
  const errors: ContactFieldErrors = {};

  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  const company = String(input.company ?? "").trim();
  const projectType = String(input.projectType ?? "").trim();
  const message = String(input.message ?? "").trim();
  const website = String(input.website ?? "").trim();
  const sourcePage = String(input.sourcePage ?? "").trim();
  const formLocale = String(input.locale ?? locale).trim();

  if (website) {
    return { success: false, errors: { message: v.honeypot } };
  }

  if (name.length < 2) {
    errors.name = v.nameRequired;
  } else if (name.length > LIMITS.nameMax) {
    errors.name = v.nameTooLong;
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.email = v.emailInvalid;
  } else if (email.length > LIMITS.emailMax) {
    errors.email = v.emailTooLong;
  }

  if (company.length > LIMITS.companyMax) {
    errors.company = v.companyTooLong;
  }

  if (!projectType) {
    errors.projectType = v.projectTypeRequired;
  } else if (!PROJECT_TYPE_VALUES.includes(projectType as ProjectTypeValue)) {
    errors.projectType = v.projectTypeInvalid;
  }

  if (message.length < LIMITS.messageMin) {
    errors.message = v.messageTooShort;
  } else if (message.length > LIMITS.messageMax) {
    errors.message = v.messageTooLong;
  }

  if (sourcePage.length > LIMITS.sourcePageMax) {
    return { success: false, errors: { message: v.honeypot } };
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      company,
      projectType,
      message,
      sourcePage: sourcePage || undefined,
      locale: formLocale === "tr" ? "tr" : "en",
    },
  };
}

export function validateContactFormClient(
  input: Omit<ContactFormData, "website" | "sourcePage">,
  locale: Locale = "en",
): ContactValidationResult {
  return validateContactForm({ ...input, website: "" }, locale);
}

export function getProjectTypeOptions(locale: Locale) {
  const dict = getDictionary(locale);
  return PROJECT_TYPE_VALUES.map((value) => ({
    value,
    label: dict.projectTypes[value],
  }));
}
