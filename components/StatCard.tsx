import React from "react"
import { Card, Label, Text, useThemeName, XStack, YStack } from "tamagui"

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
      borderColor="$borderColor"
      padding="$3"
      marginBottom="$3">
      <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <YStack flex={1}>
          <Label color="$color">{label}</Label>
          <XStack style={{ alignItems: "baseline" }} gap="$2">
            <Text fontSize="$6" fontWeight="bold" color="$accent5">
              {value}
            </Text>
            {unit && (
              <Text fontSize="$3" color="$purple10">
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
