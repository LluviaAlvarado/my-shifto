import { Shift, ShiftStats } from "@/types/types"
import { calculateHours } from "@/utils/shiftUtils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { useSettings } from "./SettingsContext"

interface ShiftContextType {
  shifts: Shift[]
  loading: boolean
  addShift: (shift: Shift) => Promise<void>
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
  getShifts: (
    filters?: { date?: Date; week?: Date; month?: Date },
    weekStartDay?: number
  ) => Shift[]
  loadShifts: (newShifts: Shift[]) => Promise<void>
  getStats: () => ShiftStats
  defaultHourlyRate: number
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export const ShiftProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const { getSettings } = useSettings()
  const settings = getSettings()
  const [defaultHourlyRate, setDefaultHourlyRateState] = useState(
    settings.defaultHourlyRate || 1122
  )

  // Load shifts and settings from AsyncStorage on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [shiftsData, rateData] = await Promise.all([
        AsyncStorage.getItem("shifts"),
        AsyncStorage.getItem("@settings_defaultHourlyRate"),
      ])
      if (shiftsData) {
        setShifts(JSON.parse(shiftsData))
      }
      if (rateData) {
        setDefaultHourlyRateState(JSON.parse(rateData))
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveShifts = async (newShifts: Shift[]) => {
    try {
      await AsyncStorage.setItem("shifts", JSON.stringify(newShifts))
      setShifts(newShifts)
    } catch (error) {
      console.error("Error saving shifts:", error)
    }
  }

  const addShift = async (shift: Shift) => {
    const newShifts = [...shifts, shift]
    await saveShifts(newShifts)
  }

  const updateShift = async (id: string, updates: Partial<Shift>) => {
    const newShifts = shifts.map((shift) =>
      shift.id === id
        ? { ...shift, ...updates, updatedAt: new Date().toISOString() }
        : shift
    )
    await saveShifts(newShifts)
  }

  const deleteShift = async (id: string) => {
    const newShifts = shifts.filter((shift) => shift.id !== id)
    await saveShifts(newShifts)
  }

  const getShifts = (
    filters?: { date?: Date; week?: Date; month?: Date },
    weekStartDay: number = 1
  ): Shift[] => {
    if (!filters) return shifts

    return shifts.filter((shift) => {
      const shiftDate = parseISO(shift.date)

      if (filters.date) {
        const start = startOfDay(filters.date)
        const end = endOfDay(filters.date)
        return isWithinInterval(shiftDate, { start, end })
      }

      if (filters.week) {
        const start = startOfWeek(filters.week, {
          weekStartsOn: weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        })
        const end = endOfWeek(filters.week, {
          weekStartsOn: weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        })
        return isWithinInterval(shiftDate, { start, end })
      }

      if (filters.month) {
        const start = startOfMonth(filters.month)
        const end = endOfMonth(filters.month)
        return isWithinInterval(shiftDate, { start, end })
      }

      return true
    })
  }

  const loadShifts = async (newShifts: Shift[]) => {
    await AsyncStorage.setItem("shifts", JSON.stringify(newShifts))
    setShifts(newShifts)
  }

  const getStats = (): ShiftStats => {
    const settings = getSettings()
    const date: Date = new Date()
    const dailyShifts = getShifts({ date })
    const weeklyShifts = getShifts({ week: date }, settings.weekStartDay)
    const monthlyShifts = getShifts({ month: date })

    const calculateTotals = (shiftList: Shift[]) => {
      return shiftList.reduce(
        (acc, shift) => {
          const rate = shift.hourlyRate || defaultHourlyRate
          const { hours, normalHours, extraEarnings } = calculateHours(
            shift.startTime,
            shift.endTime,
            settings.lateNightStart,
            settings.lateNightRateIncrease,
            rate
          )

          return {
            hours: acc.hours + hours,
            earnings:
              acc.earnings +
              normalHours * rate +
              extraEarnings +
              settings.transportationCost,
          }
        },
        { hours: 0, earnings: 0 }
      )
    }

    const daily = calculateTotals(dailyShifts)
    const weekly = calculateTotals(weeklyShifts)
    const monthly = calculateTotals(monthlyShifts)
    const total = calculateTotals(shifts)

    return {
      totalHours: total.hours,
      totalEarnings: total.earnings,
      dailyHours: daily.hours,
      dailyEarnings: daily.earnings,
      weeklyHours: weekly.hours,
      weeklyEarnings: weekly.earnings,
      monthlyHours: monthly.hours,
      monthlyEarnings: monthly.earnings,
    }
  }

  return (
    <ShiftContext.Provider
      value={{
        shifts,
        loading,
        addShift,
        updateShift,
        deleteShift,
        getShifts,
        loadShifts,
        getStats,
        defaultHourlyRate,
      }}>
      {children}
    </ShiftContext.Provider>
  )
}

export const useShifts = () => {
  const context = useContext(ShiftContext)
  if (!context) {
    throw new Error("useShifts must be used within a ShiftProvider")
  }
  return context
}
