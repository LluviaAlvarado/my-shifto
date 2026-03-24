import {
  green,
  greenDark,
  red,
  redDark,
  yellow,
  yellowDark,
} from "@tamagui/colors"
import { createV5Theme, defaultChildrenThemes } from "@tamagui/config/v5"
import { v5ComponentThemes } from "@tamagui/themes/v5"

const darkPalette = [
  "hsla(280, 45%, 1%, 1)",
  "hsla(280, 45%, 6%, 1)",
  "hsla(280, 45%, 12%, 1)",
  "hsla(280, 45%, 17%, 1)",
  "hsla(280, 45%, 23%, 1)",
  "hsla(280, 45%, 28%, 1)",
  "hsla(280, 45%, 34%, 1)",
  "hsla(280, 45%, 39%, 1)",
  "hsla(280, 45%, 45%, 1)",
  "hsla(280, 45%, 50%, 1)",
  "hsla(0, 15%, 93%, 1)",
  "hsla(0, 15%, 99%, 1)",
]
const lightPalette = [
  "hsla(280, 45%, 94%, 1)",
  "hsla(280, 45%, 89%, 1)",
  "hsla(280, 45%, 84%, 1)",
  "hsla(280, 45%, 79%, 1)",
  "hsla(280, 45%, 74%, 1)",
  "hsla(280, 45%, 70%, 1)",
  "hsla(280, 45%, 65%, 1)",
  "hsla(280, 45%, 60%, 1)",
  "hsla(280, 45%, 55%, 1)",
  "hsla(280, 45%, 50%, 1)",
  "hsla(0, 15%, 15%, 1)",
  "hsla(0, 15%, 1%, 1)",
]

// Your custom accent color theme
const accentLight = {
  accent1: "hsla(190, 50%, 43%, 1)",
  accent2: "hsla(190, 50%, 45%, 1)",
  accent3: "hsla(190, 50%, 48%, 1)",
  accent4: "hsla(190, 50%, 50%, 1)",
  accent5: "hsla(190, 50%, 53%, 1)",
  accent6: "hsla(190, 50%, 55%, 1)",
  accent7: "hsla(190, 50%, 58%, 1)",
  accent8: "hsla(190, 50%, 60%, 1)",
  accent9: "hsla(190, 50%, 63%, 1)",
  accent10: "hsla(190, 50%, 65%, 1)",
  accent11: "hsla(250, 50%, 95%, 1)",
  accent12: "hsla(250, 50%, 95%, 1)",
}

const accentDark = {
  accent1: "hsla(190, 50%, 35%, 1)",
  accent2: "hsla(190, 50%, 38%, 1)",
  accent3: "hsla(190, 50%, 41%, 1)",
  accent4: "hsla(190, 50%, 43%, 1)",
  accent5: "hsla(190, 50%, 46%, 1)",
  accent6: "hsla(190, 50%, 49%, 1)",
  accent7: "hsla(190, 50%, 52%, 1)",
  accent8: "hsla(190, 50%, 54%, 1)",
  accent9: "hsla(190, 50%, 57%, 1)",
  accent10: "hsla(190, 50%, 60%, 1)",
  accent11: "hsla(250, 50%, 90%, 1)",
  accent12: "hsla(250, 50%, 95%, 1)",
}

const builtThemes = createV5Theme({
  darkPalette,
  lightPalette,
  componentThemes: v5ComponentThemes,
  accent: {
    light: accentLight,
    dark: accentDark,
  },
  childrenThemes: {
    // Include default color themes (blue, red, green, yellow, etc.)
    ...defaultChildrenThemes,

    // Semantic color themes for warnings, errors, and success states
    warning: {
      light: yellow,
      dark: yellowDark,
    },
    error: {
      light: red,
      dark: redDark,
    },
    success: {
      light: green,
      dark: greenDark,
    },
  },
})

export type Themes = typeof builtThemes

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === "client" &&
  process.env.NODE_ENV === "production"
    ? ({} as any)
    : (builtThemes as any)

export { accentDark, accentLight }

