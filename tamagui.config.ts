import { createAnimations } from "@tamagui/animations-react-native"
import { defaultConfig } from "@tamagui/config/v5"
import { createTamagui } from "tamagui"
import { themes } from "./themes"

export const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes,
  animations: createAnimations({
    quick: {
      type: "spring",
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    bouncy: {
      type: "spring",
      damping: 10,
      mass: 0.9,
      stiffness: 150,
    },
    lazy: {
      type: "spring",
      damping: 20,
      stiffness: 60,
    },
    medium: {
      type: "spring",
      damping: 15,
      stiffness: 120,
    },
    slow: {
      type: "spring",
      damping: 15,
      stiffness: 40,
    },
  }),
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}
