export interface Shift {
  id: string
  date: string // ISO date format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  hourlyRate: number // salary per hour
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ShiftStats {
  totalHours: number
  totalEarnings: number
  dailyHours: number
  dailyEarnings: number
  weeklyHours: number
  weeklyEarnings: number
  monthlyHours: number
  monthlyEarnings: number
}

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface Settings {
  currency: string
  defaultHourlyRate: number
  weekStartDay: number
  theme: string
  lateNightStart: string // e.g. "22:00"
  lateNightRateIncrease: number // e.g. 25 for 25%
}
