import { format, isSameDay, parseISO } from "date-fns"
import React, { useState } from "react"
import { Pressable } from "react-native"
import { Calendar } from "react-native-calendars"
import { Card, H5, Text, XStack, YStack, useTheme, useThemeName } from "tamagui"
import { useShifts } from "../contexts/ShiftContext"
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

  // Prepare marked dates (no-op, only needed for Calendar API compatibility)
  const markedDates = {}

  // Render custom day component
  const renderDay = (day: any) => {
    if (!day || !day.dateString) return null
    const dateStr = day.dateString
    const todayStr = format(new Date(), "yyyy-MM-dd")
    const isToday = dateStr === todayStr
    const isSelected = isSameDay(parseISO(dateStr), selectedDate)
    const hasShift = !!shifts.find((s) => s.date === dateStr)
    let backgroundColor = undefined
    let color: any = "$color"
    let fontWeight: "bold" | "normal" = "normal"
    if (isSelected) {
      backgroundColor = theme.accent6?.val
      color = "$accent11"
      fontWeight = "bold"
    } else if (isToday) {
      color = theme.accent3?.val
      fontWeight = "bold"
      if (hasShift) {
        backgroundColor = theme.purple7?.val
      }
    } else if (hasShift) {
      backgroundColor = theme.purple7?.val
      color = "$color" // fallback to theme color for Tamagui compatibility
    }
    return (
      <Pressable
        onPress={() => handleDayPress({ dateString: dateStr })}
        onLongPress={() => handleDayLongPress({ dateString: dateStr })}
        style={{ flex: 1 }}>
        <YStack
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            width: 40,
            backgroundColor,
            borderRadius: backgroundColor ? "100%" : undefined,
          }}>
          <Text fontWeight={fontWeight} color={color}>
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
        markingType="custom"
        dayComponent={({ date }) => renderDay(date)}
        theme={{
          todayTextColor:
            theme.accent6?.val ??
            (themeName === "dark"
              ? "hsla(190, 50%, 49%, 1)"
              : "hsla(190, 50%, 55%, 1)"),
          selectedDayBackgroundColor:
            theme.accent6?.val ??
            (themeName === "dark"
              ? "hsla(190, 50%, 49%, 1)"
              : "hsla(190, 50%, 55%, 1)"),
          selectedDayTextColor:
            theme.color?.val ??
            (themeName === "dark"
              ? "hsla(0, 15%, 93%, 1)"
              : "hsla(0, 15%, 15%, 1)"),
          dayTextColor:
            theme.color?.val ??
            (themeName === "dark"
              ? "hsla(0, 15%, 93%, 1)"
              : "hsla(0, 15%, 15%, 1)"),
          textDisabledColor:
            theme.gray9?.val ?? (themeName === "dark" ? "#888" : "#888"),
          monthTextColor:
            theme.color?.val ??
            (themeName === "dark"
              ? "hsla(0, 15%, 93%, 1)"
              : "hsla(0, 15%, 15%, 1)"),

          arrowColor:
            theme.accent6?.val ??
            (themeName === "dark"
              ? "hsla(190, 50%, 49%, 1)"
              : "hsla(190, 50%, 55%, 1)"),
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
              <Card key={shift.id} borderWidth={1} borderColor="$borderColor">
                <Card.Header>
                  <H5>Shift Details</H5>
                </Card.Header>

                <XStack
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  gap="$1"
                  paddingInline="$4"
                  marginBlockEnd="$4">
                  <YStack gap="$1">
                    <Text color="$purple11">
                      Start Time:{" "}
                      <Text fontWeight="bold" color="$color">
                        {shift.startTime}
                      </Text>
                    </Text>
                    <Text color="$purple11">
                      End Time:{" "}
                      <Text fontWeight="bold" color="$color">
                        {shift.endTime}
                      </Text>
                    </Text>
                    <Text color="$purple11">
                      Hours:{" "}
                      <Text fontWeight="bold" color="$color">
                        {hours.toFixed(2)}
                      </Text>
                    </Text>
                    <Text color="$purple11">
                      Hourly Rate:{" "}
                      <Text fontWeight="bold" color="$color">
                        ¥{shift.hourlyRate}
                      </Text>
                    </Text>
                    <Text color="$purple11">
                      Earnings:{" "}
                      <Text fontWeight="bold" color="$color">
                        ¥{earnings.toFixed(2)}
                      </Text>
                    </Text>
                  </YStack>
                  <Text color="$purple11">{shift.notes}</Text>
                </XStack>
              </Card>
            )
          })}
        {shifts.filter((s) => isSameDay(parseISO(s.date), selectedDate))
          .length === 0 && (
          <Text color="$purple11">No shift for this day.</Text>
        )}
      </YStack>
    </YStack>
  )
}
