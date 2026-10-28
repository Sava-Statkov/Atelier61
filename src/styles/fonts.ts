import { Sofia_Sans, Sofia_Sans_Extra_Condensed, Sofia_Sans_Semi_Condensed } from "next/font/google";

/*
 * Provisional type system: one superfamily, three widths. Sofia Sans is drawn by Lettersoup
 * (Botio Nikoltchev, Ani Petrova) and ships Bulgarian Cyrillic letterforms, which the browser
 * selects because <html lang="bg">. Swap families here; components only use the CSS variables.
 */
export const fontText = Sofia_Sans({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sofia",
  display: "swap",
});

export const fontDisplay = Sofia_Sans_Extra_Condensed({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sofia-xc",
  display: "swap",
});

export const fontLabel = Sofia_Sans_Semi_Condensed({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sofia-sc",
  display: "swap",
});

export const fontVariables = `${fontText.variable} ${fontDisplay.variable} ${fontLabel.variable}`;
