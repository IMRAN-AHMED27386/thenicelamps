"use client";

import { useEffect, useRef } from "react";

export default function HeroFx() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container || container.childElementCount > 0) return;
    for (let i = 0; i < 35; i++) {
      const p = document.createElement("div");
      p.classList.add("ptcl");
      const size = Math.random() * 3.5 + 1;
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${Math.random() * 0.55};
        animation-duration: ${Math.random() * 18 + 10}s;
        animation-delay: ${Math.random() * 12}s;
      `;
      container.appendChild(p);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const heroImg = document.getElementById("heroImg");
      if (heroImg) {
        heroImg.style.transform = `scale(1.05) translateY(${window.scrollY * 0.22}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div id="particles" ref={ref} />;
}
