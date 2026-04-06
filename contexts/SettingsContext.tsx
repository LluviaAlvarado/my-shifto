import { Settings } from "@/types/types"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

interface SettingsContextType {
  settings: Settings
  loading: boolean
  getSettings: () => Settings
  saveSettings: (newSettings: Settings) => Promise<void>
  setTheme: (theme: "light" | "dark") => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    currency: "¥",
    defaultHourlyRate: 1122,
    theme: "dark",
    weekStartDay: 1,
    lateNightStart: "22:00",
    lateNightRateIncrease: 25,
  })
  const [loading, setLoading] = useState(true)

  // Load shifts and settings from AsyncStorage on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const settings = await AsyncStorage.getItem("settings")
      if (settings) {
        setSettings(JSON.parse(settings))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem("settings", JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  const getSettings = (): Settings => {
    return settings
  }

  const setTheme = (theme: "light" | "dark") => {
    setSettings((prev) => ({ ...prev, theme }))
    AsyncStorage.setItem("settings", JSON.stringify({ ...settings, theme }))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getSettings,
        saveSettings,
        setTheme,
      }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
