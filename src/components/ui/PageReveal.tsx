/** @deprecated Page transitions are handled by app/template.tsx */
export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
