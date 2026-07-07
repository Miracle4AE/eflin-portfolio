"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/data/site";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { Magnetic } from "@/components/motion/Magnetic";
import {
  getProjectTypeOptions,
  validateContactFormClient,
  type ContactFieldErrors,
} from "@/lib/validation";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

type FormStatus = "idle" | "submitting" | "success" | "error";

interface ContactFormProps {
  sourcePage?: string;
  className?: string;
}

const inputClass =
  "w-full border-b border-foreground/15 bg-transparent py-3 text-sm text-foreground placeholder:text-muted/50 transition-colors focus:border-accent/60 focus:outline-none";

const labelClass =
  "mb-2 block text-[10px] font-medium uppercase tracking-[0.25em] text-muted";

export function ContactForm({ sourcePage = "/", className }: ContactFormProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const projectTypeOptions = getProjectTypeOptions(locale);
  const contactCursor = useMountedCursor("contact");

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [globalError, setGlobalError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGlobalError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website = String(formData.get("website") ?? "");

    if (website) {
      setGlobalError(dict.validation.honeypot);
      setStatus("error");
      return;
    }

    const validation = validateContactFormClient(
      { name, email, company, projectType, message, locale },
      locale,
    );

    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validation.data,
          website,
          sourcePage,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setGlobalError(data.error ?? dict.validation.submitFailed);
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
      setProjectType("");
      setMessage("");
    } catch {
      setGlobalError(dict.validation.networkError);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("mx-auto max-w-xl text-center", className)}
        role="status"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent">
          {dict.contact.successLabel}
        </p>
        <p className="font-display text-2xl font-light text-foreground md:text-3xl">
          {dict.contact.successTitle}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {dict.contact.successBody}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {dict.contact.sendAnother}
        </button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn("mx-auto max-w-xl text-left", className)}
      aria-label={dict.contact.title}
    >
      <div
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field label={dict.contact.formName} error={errors.name} htmlFor="contact-name">
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label={dict.contact.formEmail} error={errors.email} htmlFor="contact-email">
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            aria-invalid={Boolean(errors.email)}
          />
        </Field>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field
          label={dict.contact.formCompany}
          error={errors.company}
          htmlFor="contact-company"
        >
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field
          label={dict.contact.formProjectType}
          error={errors.projectType}
          htmlFor="contact-project-type"
        >
          <select
            id="contact-project-type"
            name="projectType"
            required
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className={cn(inputClass, "cursor-pointer appearance-none")}
            aria-invalid={Boolean(errors.projectType)}
          >
            <option value="" disabled>
              {dict.contact.formSelectType}
            </option>
            {projectTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-8">
        <Field label={dict.contact.formMessage} error={errors.message} htmlFor="contact-message">
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(inputClass, "resize-none")}
            aria-invalid={Boolean(errors.message)}
          />
        </Field>
      </div>

      {globalError && (
        <p
          className="mt-6 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          {globalError}
        </p>
      )}

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Magnetic strength={0.15}>
          <button
            type="submit"
            disabled={status === "submitting"}
            {...contactCursor}
            className="inline-flex min-w-[200px] items-center justify-center border border-accent bg-accent px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-background transition-colors hover:bg-accent-hover hover:border-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "submitting"
              ? dict.contact.formSubmitting
              : dict.contact.formSubmit}
          </button>
        </Magnetic>
        <a
          href={`mailto:${siteConfig.email}`}
          {...contactCursor}
          className="text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {siteConfig.email}
        </a>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </motion.div>
  );
}
