import { PageTransition } from "@/components/motion/PageTransition";

export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
