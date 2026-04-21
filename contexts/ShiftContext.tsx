import { Shift, ShiftStats } from "@/types/types"
import { calculateHours, getLocalDateString } from "@/utils/shiftUtils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
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
  getNextPayAmount: () => number
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
      const shiftDate = getLocalDateString(shift.date)

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
          const { hours, totalEarnings } = calculateHours(
            shift.startTime,
            shift.endTime,
            settings.lateNightStart,
            settings.lateNightRateIncrease,
            rate,
            settings.weekendRateIncrease,
            shift.date
          )

          return {
            hours: acc.hours + hours,
            earnings:
              acc.earnings + totalEarnings + settings.transportationCost,
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

  const getNextPayAmount = (): number => {
    const settings = getSettings()
    const today = new Date()
    let periodStart: Date
    let periodEnd: Date
    const weekStartDay =
      typeof settings.weekStartDay === "number" ? settings.weekStartDay : 1
    const weekStartsOn = weekStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6

    if (settings.payFrequency === "weekly") {
      // Previous natural week (e.g., Mon-Sun or user weekStartDay)
      periodStart = startOfWeek(addDays(today, -7), { weekStartsOn })
      periodEnd = endOfWeek(addDays(today, -7), { weekStartsOn })
      // For weekly, check if today is past the pay day (day of week)
      if (settings.payDay !== undefined && today.getDay() > settings.payDay) {
        periodStart = startOfWeek(today, { weekStartsOn })
        periodEnd = endOfWeek(today, { weekStartsOn })
      }
    } else if (settings.payFrequency === "biweekly") {
      // Previous natural biweek: two weeks ago (start of week) to last week (end of week)
      periodStart = startOfWeek(addDays(today, -14), {
        weekStartsOn,
      })
      periodEnd = endOfWeek(addDays(today, -7), {
        weekStartsOn,
      })
      // For biweekly, check if today is past the pay day (week parity + day of week)
      if (settings.payDay !== undefined) {
        // Calculate which week of the biweek we're in
        const weeksSinceEpoch = Math.floor(
          today.getTime() / (7 * 24 * 60 * 60 * 1000)
        )
        const isPayWeek = weeksSinceEpoch % 2 === 0
        const todayDayOfWeek = today.getDay()

        // If it's a pay week and we're past the pay day, or if it's after the pay week
        if ((isPayWeek && todayDayOfWeek > settings.payDay) || !isPayWeek) {
          periodStart = startOfWeek(today, { weekStartsOn })
          periodEnd = endOfWeek(addDays(today, 7), { weekStartsOn })
        }
      }
    } else {
      // Monthly (default): previous natural month
      const thisMonth = today.getMonth()
      const thisYear = today.getFullYear()
      const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
      const prevMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
      periodStart = new Date(prevMonthYear, prevMonth, 1)
      periodEnd = endOfMonth(new Date(prevMonthYear, prevMonth, 1))
      // For monthly, check if today is past the day of month
      const currentPayDayThisMonth = new Date(
        thisYear,
        thisMonth,
        settings.payDay,
        23,
        59,
        59,
        999
      )
      if (
        new Date(thisYear, thisMonth, today.getDate()) > currentPayDayThisMonth
      ) {
        periodStart = new Date(thisYear, thisMonth, 1)
        periodEnd = endOfMonth(new Date(thisYear, thisMonth, 1))
      }
    }
    // Sum all shifts in [periodStart, periodEnd]
    const periodShifts = shifts.filter((shift) => {
      const [y, m, d] = shift.date.split("-")
      const shiftDate = new Date(Number(y), Number(m) - 1, Number(d))
      return shiftDate >= periodStart && shiftDate <= periodEnd
    })

    // Calculate total earnings for the period
    return periodShifts.reduce((sum, shift) => {
      const rate = shift.hourlyRate || defaultHourlyRate
      const { totalEarnings } = calculateHours(
        shift.startTime,
        shift.endTime,
        settings.lateNightStart,
        settings.lateNightRateIncrease,
        rate,
        settings.weekendRateIncrease,
        shift.date
      )
      return sum + totalEarnings + settings.transportationCost
    }, 0)
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
        getNextPayAmount,
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
