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
  setCurrency: (currency: string) => void
  setDefaultHourlyRate: (defaultHourlyRate: number) => void
  setTheme: (theme: string) => void
  setWeekStartDay: (weekStartDay: number) => void
  setLateNightStart: (lateNightStart: string) => void
  setLateNightRateIncrease: (lateNightRateIncrease: number) => void
  setTransportationCost: (transportationCost: number) => void
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
    transportationCost: 440,
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

  const setCurrency = (currency: string) => {
    setSettings((prev) => ({ ...prev, currency }))
    AsyncStorage.setItem("settings", JSON.stringify({ ...settings, currency }))
  }
  const setDefaultHourlyRate = (defaultHourlyRate: number) => {
    setSettings((prev) => ({ ...prev, defaultHourlyRate }))
    AsyncStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, defaultHourlyRate })
    )
  }
  const setTheme = (theme: string) => {
    setSettings((prev) => ({ ...prev, theme }))
    AsyncStorage.setItem("settings", JSON.stringify({ ...settings, theme }))
  }

  const setWeekStartDay = (weekStartDay: number) => {
    setSettings((prev) => ({ ...prev, weekStartDay }))
    AsyncStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, weekStartDay })
    )
  }
  const setLateNightStart = (lateNightStart: string) => {
    setSettings((prev) => ({ ...prev, lateNightStart }))
    AsyncStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, lateNightStart })
    )
  }
  const setLateNightRateIncrease = (lateNightRateIncrease: number) => {
    setSettings((prev) => ({ ...prev, lateNightRateIncrease }))
    AsyncStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, lateNightRateIncrease })
    )
  }
  const setTransportationCost = (transportationCost: number) => {
    setSettings((prev) => ({ ...prev, transportationCost }))
    AsyncStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, transportationCost })
    )
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        getSettings,
        saveSettings,
        setCurrency,
        setDefaultHourlyRate,
        setTheme,
        setWeekStartDay,
        setLateNightStart,
        setLateNightRateIncrease,
        setTransportationCost,
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
