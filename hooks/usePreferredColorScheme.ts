import { useSettings } from "@/contexts/SettingsContext"
export function usePreferredColorScheme() {
  const { settings, setTheme } = useSettings()
  const theme = settings.theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  return { theme, toggleTheme }
}
