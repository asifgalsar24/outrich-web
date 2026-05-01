"use client";
import React from "react";
import { motion } from "framer-motion";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  interactive?: boolean;
  glowColor?: string;
}

interface DockIcon {
  src: string;
  alt: string;
  onClick?: () => void;
}

const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  interactive = false,
  glowColor,
}) => {
  const baseStyle: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,0.16)",
    ...style,
  };

  const layers = (
    <>
      <div
        className="absolute inset-0 z-0"
        style={{ backdropFilter: "blur(16px) saturate(160%)", filter: "url(#glass-distortion)", isolation: "isolate" }}
      />
      <div className="absolute inset-0 z-10" style={{ background: "rgba(255,255,255,0.07)" }} />
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.13), inset -1px -1px 0 rgba(255,255,255,0.03)" }}
      />
      {interactive && (
        <div className="absolute inset-0 z-[25] rounded-[inherit] pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-0 bottom-0 w-1/3"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
            variants={{
              rest: { x: "200%" },
              hover: { x: "-200%", transition: { duration: 0.55, ease: "easeInOut" } },
            }}
          />
        </div>
      )}
      <div className="relative z-30">{children}</div>
    </>
  );

  const content = interactive ? (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={baseStyle}
      initial="rest"
      whileHover="hover"
      variants={
        glowColor
          ? {
              rest:  { y: 0, scale: 1,     boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
              hover: { y: -4, scale: 1.012, boxShadow: `0 0 40px 0 ${glowColor}22, 0 12px 40px rgba(0,0,0,0.5)` },
            }
          : {
              rest:  { y: 0, scale: 1,     boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
              hover: { y: -4, scale: 1.012, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" },
            }
      }
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {layers}
    </motion.div>
  ) : (
    <div
      className={`relative overflow-hidden transition-all duration-700 ${className}`}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)", ...baseStyle }}
    >
      {layers}
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : content;
};

const GlassDock: React.FC<{ icons: DockIcon[]; href?: string }> = ({ icons, href }) => (
  <GlassEffect href={href} className="rounded-3xl p-3 hover:p-4">
    <div className="flex items-center justify-center gap-2 overflow-hidden">
      {icons.map((icon, index) => (
        <img
          key={index}
          src={icon.src}
          alt={icon.alt}
          className="w-16 h-16 transition-all duration-700 hover:scale-110 cursor-pointer"
          style={{
            transformOrigin: "center center",
            transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
          }}
          onClick={icon.onClick}
        />
      ))}
    </div>
  </GlassEffect>
);

const GlassButton: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href }) => (
  <GlassEffect href={href} className="rounded-3xl px-8 py-4 hover:opacity-90">
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{ transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)" }}
    >
      {children}
    </div>
  </GlassEffect>
);

const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }}>
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.001 0.005"
        numOctaves={1}
        seed={17}
        result="turbulence"
      />
      <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
        <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
        <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
      </feComponentTransfer>
      <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
      <feSpecularLighting
        in="softMap"
        surfaceScale={5}
        specularConstant={1}
        specularExponent={100}
        lightingColor="white"
        result="specLight"
      >
        <fePointLight x={-200} y={-200} z={300} />
      </feSpecularLighting>
      <feComposite
        in="specLight"
        operator="arithmetic"
        k1={0}
        k2={1}
        k3={1}
        k4={0}
        result="litImage"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale={200}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);

export { GlassEffect, GlassDock, GlassButton, GlassFilter };
