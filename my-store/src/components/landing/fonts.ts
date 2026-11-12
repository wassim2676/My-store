import { Cormorant_Garamond, Inter, Manrope, Playfair_Display } from "next/font/google";

// ==================== 🔤 خطوط صفحات الهبوط (تُحمَّل فقط حيث تُستخدم) ====================
// كل خط يعرّف متغير CSS، و themeStyle() يختار منها حسب إعداد المسوّق (--lp-font-heading)
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-lp-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-lp-cormorant", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-lp-manrope", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-lp-inter", display: "swap" });

/** أضِفها إلى className الغلاف الذي يحمل themeStyle() */
export const landingFontVars = `${playfair.variable} ${cormorant.variable} ${manrope.variable} ${inter.variable}`;
