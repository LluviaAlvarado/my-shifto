import { Shift, ShiftStats } from "@/types/types"
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

interface ShiftContextType {
  shifts: Shift[]
  loading: boolean
  addShift: (shift: Shift) => Promise<void>
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
  getShifts: (filters?: { date?: Date; week?: Date; month?: Date }) => Shift[]
  getStats: (date?: Date) => ShiftStats
  setDefaultHourlyRate: (rate: number) => Promise<void>
  defaultHourlyRate: number
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export const ShiftProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [defaultHourlyRate, setDefaultHourlyRateState] = useState(1122)

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

  const getShifts = (filters?: {
    date?: Date
    week?: Date
    month?: Date
  }): Shift[] => {
    if (!filters) return shifts

    return shifts.filter(async (shift) => {
      const shiftDate = parseISO(shift.date)

      if (filters.date) {
        const start = startOfDay(filters.date)
        const end = endOfDay(filters.date)
        return isWithinInterval(shiftDate, { start, end })
      }

      if (filters.week) {
        // adapt to saved start of week
        const savedWeekStart = await AsyncStorage.getItem("weekStartDay")
        const weekStart = savedWeekStart
          ? (parseInt(savedWeekStart) as 0 | 1 | 2 | 3 | 4 | 5 | 6)
          : 1

        const start = startOfWeek(filters.week, { weekStartsOn: weekStart })
        const end = endOfWeek(filters.week, { weekStartsOn: weekStart })
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

  const calculateHours = (startTime: string, endTime: string): number => {
    const [startH, startM] = startTime.split(":").map(Number)
    const [endH, endM] = endTime.split(":").map(Number)
    const startDate = new Date(2000, 0, 1, startH, startM)
    const endDate = new Date(2000, 0, 1, endH, endM)
    let hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    // Handle overnight shifts
    if (hours < 0) hours += 24
    return hours
  }

  const getStats = (date: Date = new Date()): ShiftStats => {
    const dailyShifts = getShifts({ date })
    const weeklyShifts = getShifts({ week: date })
    const monthlyShifts = getShifts({ month: date })

    const calculateTotals = (shiftList: Shift[]) => {
      return shiftList.reduce(
        (acc, shift) => {
          const hours = calculateHours(shift.startTime, shift.endTime)
          const rate = shift.hourlyRate || defaultHourlyRate
          return {
            hours: acc.hours + hours,
            earnings: acc.earnings + hours * rate,
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

  const setDefaultHourlyRate = async (rate: number) => {
    try {
      await AsyncStorage.setItem("defaultHourlyRate", JSON.stringify(rate))
      setDefaultHourlyRateState(rate)
    } catch (error) {
      console.error("Error saving hourly rate:", error)
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
        getStats,
        setDefaultHourlyRate,
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
