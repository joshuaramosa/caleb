"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";

/** Navegación por chips con scroll horizontal, fija bajo el header, pensada para el pulgar. */
export function CategoryNav({ categories }: { categories: Category[] }) {
  const [active, setActive] = useState(categories[0]?.slug);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace("cat-", ""));
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = (slug: string) => {
    document
      .getElementById(`cat-${slug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      aria-label="Categorías"
      className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur"
    >
      <div className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => scrollTo(c.slug)}
            aria-current={active === c.slug}
            className={`font-sans whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-bold tracking-wide transition-all ${
              active === c.slug
                ? "bg-[#F0A000] text-white shadow-md shadow-[#F0A000]/30"
                : "bg-white text-stone-600 border border-black/5 hover:text-stone-900"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
