import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useContentStore } from "../../admin/store/adminContentStore";
import { cn } from "../../../lib/utils";

export function ScooterScroll() {
  const { content } = useContentStore();
  const containerRef = useRef(null);

  // Scroll progress for the entire container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={containerRef} className="h-[400vh] relative bg-[#050505]">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <video
          src="/assets/Video/electricitoys_nowatermark.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover block"
        />

        {/* --- DESKTOP VIEW SCROLL TEXT (Sticky Context) --- */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-20">
          {content.experiencePage.desktopScrolls.map((item) => (
            <ScrollText
              key={item.id}
              start={item.start}
              end={item.end}
              align={item.align}
              scrollYProgress={scrollYProgress}>
              <div
                className={cn(
                  "max-w-xl drop-shadow-xl",
                  item.align === "start" && "md:ml-32",
                  item.align === "end" && "md:mr-32 ml-auto",
                  item.align === "center" && "mx-auto",
                )}>
                <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-4">
                  {item.heading}
                </h2>
                {item.description && (
                  <p className="text-xl text-white/80 font-medium">
                    {item.description}
                  </p>
                )}
                {item.ctaText && (
                  <div className="mt-8">
                    <a
                      href={item.ctaLink}
                      className="pointer-events-auto inline-block bg-white text-black px-8 py-4 rounded-full text-lg font-bold tracking-wide hover:scale-105 transition-transform shadow-lg">
                      {item.ctaText}
                    </a>
                  </div>
                )}
              </div>
            </ScrollText>
          ))}
        </div>

        {/* Mobile Top Overlay */}
        <div className="md:hidden absolute top-0 left-0 w-full pt-20 px-6 flex flex-col items-center justify-start pointer-events-none z-10">
          <h2 className="text-white font-black italic tracking-tighter text-5xl uppercase drop-shadow-2xl text-center leading-[0.9]">
            {content.experiencePage.mobileOverlay.top.line1}
            <br />
            <span className="text-primary">
              {content.experiencePage.mobileOverlay.top.line2}
            </span>
          </h2>
          <div className="w-12 h-1 bg-white/20 mt-6 mb-4 rounded-full"></div>
          <p className="text-white/60 text-xs uppercase tracking-[0.3em] font-bold">
            {content.experiencePage.mobileOverlay.top.subtitle}
          </p>
        </div>

        {/* Mobile Bottom Overlay */}
        <div className="md:hidden absolute bottom-0 left-0 w-full pb-16 px-6 flex flex-col items-center justify-end pointer-events-none z-10">
          <div className="grid grid-cols-3 gap-4 w-full mb-8 border-t border-white/10 pt-6">
            {content.experiencePage.mobileOverlay.bottom.stats.map(
              (stat, i) => (
                <div
                  key={i}
                  className={cn(
                    "text-center",
                    i > 0 && "border-l border-white/10",
                  )}>
                  <p className="text-white font-black text-xl italic">
                    {stat.value}
                    <span className="text-xs ml-1 not-italic text-white/50">
                      {stat.unit}
                    </span>
                  </p>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold mt-1">
                    {stat.label}
                  </p>
                </div>
              ),
            )}
          </div>

          <h3 className="text-white text-2xl uppercase tracking-tighter font-black mb-2 italic">
            {content.experiencePage.mobileOverlay.bottom.heading}
          </h3>
          <p className="text-white/50 text-sm font-medium text-center max-w-[280px] leading-relaxed">
            {content.experiencePage.mobileOverlay.bottom.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to fade text in/out based on scroll range (Adapted for ScooterScroll local progress 0-1)
function ScrollText({
  children,
  start,
  end,
  align = "center",
  scrollYProgress,
}) {
  // Fade in at 'start', fade out at 'end'
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0],
  );

  const y = useTransform(scrollYProgress, [start, end], [50, -50]);

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute w-full px-8 top-1/2 -translate-y-1/2 ${
        align === "center"
          ? "text-center"
          : align === "start"
            ? "text-left"
            : "text-right"
      }`}>
      {children}
    </motion.div>
  );
}
