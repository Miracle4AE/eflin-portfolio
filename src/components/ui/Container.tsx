import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
  id?: string;
}

export function Container({
  children,
  className,
  as: Tag = "div",
  id,
}: ContainerProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-16",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
