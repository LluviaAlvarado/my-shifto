import { format } from "date-fns"

export const calculateHours = (
    startTime: string,
    endTime: string,
    lateNightStart?: string,
    lateNightRateIncrease?: number,
    hourlyRate?: number
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
    if (lateNightStart && lateNightRateIncrease && hourlyRate) {
      // Convert percentage if user entered 25 instead of 0.25
      let rateIncrease =
        (lateNightRateIncrease > 1
          ? lateNightRateIncrease / 100
          : lateNightRateIncrease) + 1
      const [lnH, lnM] = lateNightStart.split(":").map(Number)
      const lateNightStartDate = new Date(2000, 0, 1, lnH, lnM)
      // If shift crosses late night start
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
        extraEarnings = lateNightHours * hourlyRate * rateIncrease
      }
    }
    return { hours, normalHours, lateNightHours,extraEarnings }
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