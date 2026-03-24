import { format, isSameDay, parseISO } from "date-fns"
import React, { useMemo, useState } from "react"
import { Pressable } from "react-native"
import { Calendar } from "react-native-calendars"
import { Card, Text, XStack, YStack, useTheme, useThemeName } from "tamagui"
import { useShifts } from "../contexts/ShiftContext"
import { accentDark, accentLight } from "../themes"
import { ShiftModal } from "./ShiftModal"

interface ShiftCalendarProps {
  selectedDate: Date
  onDateSelected: (date: Date) => void
}

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  selectedDate,
  onDateSelected,
}) => {
  const { shifts, addShift, updateShift, deleteShift } = useShifts()
  const themeName = useThemeName()
  const theme = useTheme()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalDate, setModalDate] = useState<Date | null>(null)
  const [modalShift, setModalShift] = useState<any>(null)

  // Prepare marked dates and custom day content
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {}
    const accent =
      themeName === "dark" ? accentDark.accent6 : accentLight.accent6
    shifts.forEach((shift) => {
      const dateStr = shift.date
      marks[dateStr] = {
        marked: true,
        customStyles: {
          container: { backgroundColor: accent, borderRadius: 8 },
          text: { color: theme.color?.val ?? "#fff", fontWeight: "bold" },
        },
        shift,
      }
    })
    // Highlight selected date
    const sel = format(selectedDate, "yyyy-MM-dd")
    marks[sel] = marks[sel] || {}
    marks[sel].selected = true
    marks[sel].selectedColor = accent
    return marks
  }, [shifts, selectedDate, themeName, theme])

  // Render custom day component
  const renderDay = (day: any) => {
    if (!day || !day.dateString) return null
    const dateStr = day.dateString
    return (
      <Pressable
        onPress={() => handleDayPress({ dateString: dateStr })}
        onLongPress={() => handleDayLongPress({ dateString: dateStr })}
        style={{ flex: 1 }}>
        <YStack
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            backgroundColor: isSameDay(parseISO(dateStr), selectedDate)
              ? theme.accent2?.val
              : undefined,
            borderRadius: isSameDay(parseISO(dateStr), selectedDate)
              ? 8
              : undefined,
          }}>
          <Text
            fontWeight={
              isSameDay(parseISO(dateStr), selectedDate) ? "bold" : "normal"
            }
            color={
              isSameDay(parseISO(dateStr), selectedDate)
                ? "$accent10"
                : "$color"
            }>
            {day.day}
          </Text>
        </YStack>
      </Pressable>
    )
  }

  // Handle day press: open modal, set date, set shift if exists
  const handleDayPress = (dateObj: any) => {
    console.log(theme)
    const date = parseISO(dateObj.dateString)
    onDateSelected(date)
  }

  const handleDayLongPress = (dateObj: any) => {
    const date = parseISO(dateObj.dateString)
    onDateSelected(date)
    setModalDate(date)
    setModalShift(shifts.find((s) => s.date === dateObj.dateString) || null)
    setModalVisible(true)
  }

  // Modal handlers
  const handleAdd = async (shiftData: any) => {
    await addShift({
      ...shiftData,
      id: Date.now().toString(),
      date: format(modalDate!, "yyyy-MM-dd"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setModalVisible(false)
  }
  const handleEdit = async (shiftData: any) => {
    if (!modalShift) return
    await updateShift(modalShift.id, {
      ...shiftData,
      updatedAt: new Date().toISOString(),
    })
    setModalVisible(false)
  }
  const handleDelete = async () => {
    if (!modalShift) return
    await deleteShift(modalShift.id)
    setModalVisible(false)
  }

  return (
    <YStack>
      <Calendar
        current={format(selectedDate, "yyyy-MM-dd")}
        onDayPress={handleDayPress}
        onDayLongPress={handleDayLongPress}
        markedDates={markedDates}
        dayComponent={({ date }) => renderDay(date)}
        theme={{
          todayTextColor:
            theme.accent6?.val ??
            (themeName === "dark" ? "#4dd0e1" : "#007aff"),
          selectedDayBackgroundColor:
            theme.accent6?.val ??
            (themeName === "dark" ? "#4dd0e1" : "#007aff"),
          selectedDayTextColor:
            theme.color?.val ?? (themeName === "dark" ? "#fff" : "#111"),
          dayTextColor:
            theme.color?.val ?? (themeName === "dark" ? "#fff" : "#222"),
          textDisabledColor:
            theme.gray8?.val ?? (themeName === "dark" ? "#888" : "#888"),
          monthTextColor:
            theme.color?.val ?? (themeName === "dark" ? "#fff" : "#222"),
          arrowColor:
            theme.accent6?.val ?? (themeName === "dark" ? "#fff" : "#007aff"),
          backgroundColor: "transparent",
          calendarBackground: "transparent",
        }}
        style={{ borderRadius: 12, marginBottom: 12, paddingBottom: 12 }}
      />
      <ShiftModal
        visible={modalVisible}
        shift={modalShift}
        date={modalDate}
        onClose={() => setModalVisible(false)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* Show shift info for selected day */}
      <YStack mt="$2">
        {shifts
          .filter((s) => isSameDay(parseISO(s.date), selectedDate))
          .map((shift) => {
            const hours = (() => {
              const [startH, startM] = shift.startTime.split(":").map(Number)
              const [endH, endM] = shift.endTime.split(":").map(Number)
              let h = endH + endM / 60 - (startH + startM / 60)
              if (h < 0) h += 24
              return h
            })()
            const earnings = hours * (shift.hourlyRate || 0)
            return (
              <Card
                key={shift.id}
                p="$3"
                mb="$2"
                background="$accent1"
                borderColor="$accent6"
                borderWidth={1}>
                <XStack
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <YStack>
                    <Text fontWeight="bold" color="$accent10">
                      Shift Details
                    </Text>
                    <Text color="$gray10">
                      Start Time:{" "}
                      <Text fontWeight="bold" color="$color">
                        {shift.startTime}
                      </Text>
                    </Text>
                    <Text color="$gray10">
                      End Time:{" "}
                      <Text fontWeight="bold" color="$color">
                        {shift.endTime}
                      </Text>
                    </Text>
                    <Text color="$gray10">
                      Hours:{" "}
                      <Text fontWeight="bold" color="$color">
                        {hours.toFixed(2)}
                      </Text>
                    </Text>
                    <Text color="$gray10">
                      Hourly Rate:{" "}
                      <Text fontWeight="bold" color="$color">
                        ${shift.hourlyRate}
                      </Text>
                    </Text>
                    <Text color="$gray10">
                      Earnings:{" "}
                      <Text fontWeight="bold" color="$color">
                        ${earnings.toFixed(2)}
                      </Text>
                    </Text>
                  </YStack>
                  <Text color="$gray10">{shift.notes}</Text>
                </XStack>
              </Card>
            )
          })}
        {shifts.filter((s) => isSameDay(parseISO(s.date), selectedDate))
          .length === 0 && <Text color="$gray8">No shift for this day.</Text>}
      </YStack>
    </YStack>
  )
}
