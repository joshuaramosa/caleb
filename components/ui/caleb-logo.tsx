import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CalebLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  glow?: boolean;
  priority?: boolean;
  className?: string;
  asLink?: boolean;
  href?: string;
  logoUrl?: string;
}

const SIZES = {
  xs: "w-20 h-auto",
  sm: "w-28 sm:w-32 h-auto",
  md: "w-40 sm:w-48 h-auto",
  lg: "w-56 sm:w-64 h-auto",
  xl: "w-72 sm:w-80 h-auto",
  hero: "w-full max-w-[320px] sm:max-w-[420px] h-auto",
};

export function CalebLogo({
  size = "md",
  glow = false,
  priority = true,
  className,
  asLink = false,
  href = "/",
  logoUrl,
}: CalebLogoProps) {
  const content = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 select-none",
        glow &&
          "drop-shadow-[0_4px_24px_rgba(240,192,0,0.35)] hover:drop-shadow-[0_8px_32px_rgba(192,80,0,0.45)]",
        className
      )}
    >
      <Image
        src={logoUrl || "/logo.png"}
        alt="Pollería Don Caleb"
        width={1024}
        height={1024}
        priority={priority}
        className={cn("object-contain transition-transform duration-300 aspect-square", SIZES[size])}
        draggable={false}
      />
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caleb-500 rounded-lg"
        aria-label="Ir al inicio de Pollería Don Caleb"
      >
        {content}
      </Link>
    );
  }

  return content;
}