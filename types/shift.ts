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
