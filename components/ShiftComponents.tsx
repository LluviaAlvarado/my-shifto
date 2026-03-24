import { format } from "date-fns"
import React from "react"
import { Card, Text, useThemeName, XStack, YStack } from "tamagui"

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
}) => {
  const theme = useThemeName()
  return (
    <Card
      size="$4"
      borderWidth={1}
      background={theme === "dark" ? "$accent1" : "$accent2"}
      borderColor="$accent6"
      padding="$4"
      marginBottom="$3">
      <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <YStack flex={1}>
          <Text fontSize="$2" color="$gray10" style={{ marginBottom: "$1" }}>
            {label}
          </Text>
          <XStack style={{ alignItems: "baseline" }} gap="$2">
            <Text fontSize="$6" fontWeight="bold" color="$accent10">
              {value}
            </Text>
            {unit && (
              <Text fontSize="$3" color="$gray9">
                {unit}
              </Text>
            )}
          </XStack>
        </YStack>
        {icon && <YStack>{icon}</YStack>}
      </XStack>
    </Card>
  )
}

interface ShiftItemProps {
  date: string
  startTime: string
  endTime: string
  hours: number
  earnings: number
  onEdit: () => void
  onDelete: () => void
}

export const ShiftItem: React.FC<ShiftItemProps> = ({
  date,
  startTime,
  endTime,
  hours,
  earnings,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      size="$4"
      borderWidth={1}
      background="$accent1"
      borderColor="$accent6"
      marginBottom="$3"
      pressStyle={{ scale: 0.97 }}
      onPress={onEdit}>
      <XStack
        style={{ justifyContent: "space-between", alignItems: "center" }}
        gap="$3">
        <YStack flex={1}>
          <Text
            fontWeight="bold"
            fontSize="$4"
            color="$accent10"
            style={{ marginBottom: "$2" }}>
            {format(new Date(date), "MMM dd, yyyy")}
          </Text>
          <XStack gap="$3" style={{ marginBottom: "$2" }}>
            <YStack>
              <Text fontSize="$2" color="$gray10">
                Start
              </Text>
              <Text fontWeight="600" color="$color">
                {startTime}
              </Text>
            </YStack>
            <YStack>
              <Text fontSize="$2" color="$gray10">
                End
              </Text>
              <Text fontWeight="600" color="$color">
                {endTime}
              </Text>
            </YStack>
            <YStack>
              <Text fontSize="$2" color="$gray10">
                Hours
              </Text>
              <Text fontWeight="600" color="$color">
                {hours.toFixed(1)}h
              </Text>
            </YStack>
          </XStack>
          <Text fontSize="$3" color="$green10" fontWeight="bold">
            Earned: ${earnings.toFixed(2)}
          </Text>
        </YStack>
      </XStack>
    </Card>
  )
}
