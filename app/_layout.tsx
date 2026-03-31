import { SettingsSheet } from "@/components/SettingsSheet"
import { SettingsProvider } from "@/contexts/SettingsContext"
import { ShiftProvider } from "@/contexts/ShiftContext"
import AntDesign from "@expo/vector-icons/AntDesign"
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import "@tamagui/native/setup-gesture-handler"
import { Stack } from "expo-router"
import { useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Button, PortalProvider, TamaguiProvider } from "tamagui"
import { usePreferredColorScheme } from "../hooks/usePreferredColorScheme"
import { tamaguiConfig } from "../tamagui.config"

export default function RootLayout() {
  const { theme, toggleTheme } = usePreferredColorScheme()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme!} key={theme}>
        <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
          <PortalProvider>
            <SettingsProvider>
              <ShiftProvider>
                <Stack>
                  <Stack.Screen
                    name="index"
                    options={{
                      title: "My Shifto",
                      headerRight: () => (
                        <Button
                          chromeless
                          onPress={() => {
                            setSettingsOpen(true)
                          }}>
                          <AntDesign name="menu" size={16} color="$color" />
                        </Button>
                      ),
                    }}></Stack.Screen>
                </Stack>
                <SettingsSheet
                  open={settingsOpen}
                  onOpenChange={setSettingsOpen}
                />
              </ShiftProvider>
            </SettingsProvider>
          </PortalProvider>
        </ThemeProvider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
