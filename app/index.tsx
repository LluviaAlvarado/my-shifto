import { useSettings } from "@/contexts/SettingsContext"
import { useState } from "react"
import { ScrollView, Text, YStack } from "tamagui"
import { ShiftCalendar } from "../components/ShiftCalendar"
import { StatCard } from "../components/StatCard"
import { useShifts } from "../contexts/ShiftContext"

export default function Index() {
  return <HomeScreen />
}

function HomeScreen() {
  const { getSettings } = useSettings()
  const { getStats, loading } = useShifts()
  const settings = getSettings()
  const stats = getStats()
  const [selectedDate, setSelectedDate] = useState(new Date())

  if (loading) return <Text color="$accent10">Loading...</Text>

  return (
    <ScrollView>
      <YStack flex={1} p="$4" gap="$4">
        <ShiftCalendar
          selectedDate={selectedDate}
          onDateSelected={setSelectedDate}
        />
        <YStack mt="$4">
          <StatCard
            label="Today's Hours"
            value={stats.dailyHours.toFixed(2)}
            unit="h"
          />
          <StatCard
            label="Today's Earnings"
            value={stats.dailyEarnings.toFixed(2)}
            unit={settings.currency}
          />
          <StatCard
            label={`Hours since last ${
              settings.weekStartDay === 0
                ? "Sunday"
                : settings.weekStartDay === 1
                ? "Monday"
                : settings.weekStartDay === 2
                ? "Tuesday"
                : settings.weekStartDay === 3
                ? "Wednesday"
                : settings.weekStartDay === 4
                ? "Thursday"
                : settings.weekStartDay === 5
                ? "Friday"
                : "Saturday"
            }`}
            value={stats.weeklyHours.toFixed(2)}
            unit="h"
          />
          <StatCard
            label="This Week's Earnings"
            value={stats.weeklyEarnings.toFixed(2)}
            unit={settings.currency}
          />
          <StatCard
            label="This Month's Hours"
            value={stats.monthlyHours.toFixed(2)}
            unit="h"
          />
          <StatCard
            label="This Month's Earnings"
            value={stats.monthlyEarnings.toFixed(2)}
            unit={settings.currency}
          />
          <StatCard
            label="Total Hours"
            value={stats.totalHours.toFixed(2)}
            unit="h"
          />
          <StatCard
            label="Total Earnings"
            value={stats.totalEarnings.toFixed(2)}
            unit={settings.currency}
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}
