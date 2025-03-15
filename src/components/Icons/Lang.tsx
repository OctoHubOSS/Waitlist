import React from "react";

interface LanguageIconProps {
  language: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LanguageIcon: React.FC<LanguageIconProps> = ({
  language,
  className = "",
  size = "md",
}) => {
  if (!language) return null;

  // Normalize language name
  const normalizedLang = language
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\+/g, "plus")
    .replace(/#/g, "sharp");

  // Size classes
  const sizePx = {
    sm: "16px",
    md: "20px",
    lg: "24px",
  };

  // Official language brand colors
  const languageColors: Record<string, string> = {
    javascript: "#F7DF1E",
    typescript: "#3178C6",
    python: "#3776AB",
    java: "#007396",
    csharp: "#239120",
    cpp: "#00599C",
    go: "#00ADD8",
    ruby: "#CC342D",
    php: "#777BB4",
    rust: "#DEA584",
    kotlin: "#7F52FF",
    swift: "#F05138",
    html: "#E34F26",
    markdown: "#000080",
    css: "#1572B6",
    scss: "#CC6699",
    sass: "#CC6699",
    dart: "#0175C2",
    vue: "#4FC08D",
    react: "#61DAFB",
    angular: "#DD0031",
    svelte: "#FF3E00",
    shell: "#89E051",
    bash: "#4EAA25",
    powershell: "#5391FE",
    lua: "#000080",
    perl: "#39457E",
    elixir: "#6E4A7E",
    r: "#276DC3",
    groovy: "#4298B8",
    coffeescript: "#244776",
    scala: "#DC322F",
    haxe: "#DF7900",
    actionscript: "#D291FF",
    objectivec: "#438EFF",
    reason: "#FF5847",
    ocaml: "#3E5459",
    fsharp: "#B845FC",
    clojure: "#5881D8",
    erlang: "#A90533",
    julia: "#A270BA",
    crystal: "#000100",
    nim: "#37775B",
    purescript: "#1D222D",
    cython: "#5A9E6F",
    fortran: "#734F96",
    haskell: "#5D4F85",
    lisp: "#3C5C5E",
    racket: "#3C5CFF",
    vbnet: "#9457EB",
    asm: "#6E4C13",
    matlab: "#E16737",
    pascal: "#E3F171",
    sol: "#808080", // Solidity
    apex: "#1797C0",
    tcl: "#E4CC98",
    cobol: "#F7A41D",
    ada: "#02F88C",
    smalltalk: "#596706",
    prolog: "#74283C",
    forth: "#341708",
    abap: "#E8274B",
    vhdl: "#ADB2C6",
    verilog: "#B2B7F8",
    qsharp: "#fed659",
    janet: "#088A85",
    zig: "#F7A41D",
  };

  // Map language names to react-icons components
  const iconComponentMap: Record<string, React.ElementType | null> = {};

  const IconComponent = iconComponentMap[normalizedLang] || null;
  const iconColor = languageColors[normalizedLang] || "#6e7681";

  if (IconComponent) {
    return (
      <IconComponent
        className={className}
        size={sizePx[size]}
        color={iconColor} // Apply the color
        style={{ color: iconColor }} // Ensure the color is applied in all cases
      />
    );
  }

  // Fallback to colored dot - use same color mapping for consistency
  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${className}`}
      style={{ backgroundColor: iconColor }}
    />
  );
};

export default LanguageIcon;
