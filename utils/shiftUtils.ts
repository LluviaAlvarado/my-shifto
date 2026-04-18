import { endOfDay, format, startOfDay } from "date-fns"

export const calculateHours = (
  startTime: string,
  endTime: string,
  lateNightStart?: string,
  lateNightRateIncrease?: number,
  hourlyRate?: number,
  weekendRateIncrease?: number,
  dateString?: string // yyyy-MM-dd, required for weekend logic
) => {
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  const startDate = new Date(2000, 0, 1, startH, startM)
  const endDate = new Date(2000, 0, 1, endH, endM)
  let hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  if (hours < 0) hours += 24
  let lateNightHours = 0
  let normalHours = hours
  let extraEarnings = 0
  let weekendHours = 0
  let weekendEarnings = 0
  let lateNightEarnings = 0
  let baseEarnings = 0

  // Weekend logic
  let isWeekend = false
  if (dateString) {
    const date = getLocalDate(dateString)
    const day = date.getDay()
    isWeekend = day === 0 || day === 6 // Sunday=0, Saturday=6
  }

  // Late night logic
  if (lateNightStart && lateNightRateIncrease && hourlyRate) {
    let rateIncrease =
      (lateNightRateIncrease > 1
        ? lateNightRateIncrease / 100
        : lateNightRateIncrease) + 1
    const [lnH, lnM] = lateNightStart.split(":").map(Number)
    const lateNightStartDate = new Date(2000, 0, 1, lnH, lnM)
    if (
      endDate > lateNightStartDate ||
      (hours < 24 && startDate < lateNightStartDate && endDate < startDate)
    ) {
      let lateStart = lateNightStartDate
      if (startDate > lateNightStartDate) lateStart = startDate
      let lateEnd = endDate
      if (endDate < lateNightStartDate)
        lateEnd = new Date(2000, 0, 2, endH, endM)
      lateNightHours =
        (lateEnd.getTime() - lateStart.getTime()) / (1000 * 60 * 60)
      if (lateNightHours < 0) lateNightHours = 0
      if (lateNightHours > hours) lateNightHours = hours
      normalHours = hours - lateNightHours
      lateNightEarnings = lateNightHours * hourlyRate * (rateIncrease - 1)
    }
  }

  // Weekend rate logic
  if (isWeekend && weekendRateIncrease && hourlyRate) {
    let weekendRate =
      (weekendRateIncrease > 1
        ? weekendRateIncrease / 100
        : weekendRateIncrease) + 1
    // All hours (including late night) get the weekend increase
    weekendHours = hours
    weekendEarnings = hours * hourlyRate * (weekendRate - 1)
  }

  // Base earnings
  if (hourlyRate) {
    baseEarnings = hours * hourlyRate
  }

  // Total extraEarnings is sum of late night and weekend increases (stacked if both apply)
  extraEarnings = lateNightEarnings + weekendEarnings

  return {
    hours,
    normalHours,
    lateNightHours,
    weekendHours,
    extraEarnings,
    baseEarnings,
    totalEarnings: baseEarnings + extraEarnings
  }
}

export const isValidTime = (time: string) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
}

// Helper to get local date string (yyyy-MM-dd)
export const getLocalDateString = (date: string | Date | undefined | null) => {
  if (!date) return ""
  if (typeof date === "string") {
    // Parse as local date (not UTC)
    const [y, m, d] = date.split("-")
    return format(new Date(Number(y), Number(m) - 1, Number(d)), "yyyy-MM-dd")
  }
  return format(date, "yyyy-MM-dd")
}

// Helper to get local date
export const getLocalDate = (date: string | Date | undefined | null): Date => {
  if (!date) return new Date()
  if (typeof date === "string") {
    // Parse as local date (not UTC)
    const [y, m, d] = date.split("-")
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  return new Date(date)
}

// Helper to get the last occurrence of a weekday before or on a date
export const getLastWeekday = (date: Date, weekday: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() - ((d.getDay() - weekday + 7) % 7))
  return startOfDay(d)
}

// Helper to get the next occurrence of a weekday after a date
export const getNextWeekday = (date: Date, weekday: number) => {
  const d = new Date(date)
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7))
  return endOfDay(d)
}