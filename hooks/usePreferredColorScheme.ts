import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { useColorScheme } from "react-native"

export function usePreferredColorScheme() {
  const scheme = useColorScheme()
  const [theme, setTheme] = useState<"light" | "dark">(
    scheme === "dark" ? "dark" : "light"
  )
  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem("settings")
    if (saved) {
      const { theme } = JSON.parse(saved)
      setTheme(theme)
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    try {
      const saved = await AsyncStorage.getItem("settings")
      const settings = saved ? JSON.parse(saved) : {}
      settings.theme = newTheme
      await AsyncStorage.setItem("settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  return { theme, toggleTheme }
}
