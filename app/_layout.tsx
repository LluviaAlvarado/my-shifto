import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { PortalProvider, TamaguiProvider } from "tamagui"
import { usePreferredColorScheme } from "../hooks/usePreferredColorScheme"

import { tamaguiConfig } from "../tamagui.config"

export default function RootLayout() {
  const colorScheme = usePreferredColorScheme()

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme!}
      key={colorScheme}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PortalProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: "My Shifto" }} />
          </Stack>
        </PortalProvider>
      </ThemeProvider>
    </TamaguiProvider>
  )
}
