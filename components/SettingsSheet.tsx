import { useSettings } from "@/contexts/SettingsContext"
import { isValidTime } from "@/utils/shiftUtils"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useState } from "react"
import {
  Adapt,
  Button,
  Input,
  Label,
  RadioGroup,
  Select,
  Sheet,
  Switch,
  Text,
  Theme,
  XStack,
  YStack,
} from "tamagui"

const WDAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
]

interface SettingsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const { getSettings, saveSettings, setTheme } = useSettings()
  const settings = getSettings()
  const [currency, setCurrency] = useState(settings.currency)
  const [hourlyRate, setHourlyRate] = useState(
    settings.defaultHourlyRate.toString()
  )
  const [isDarkMode, setIsDarkMode] = useState(settings.theme === "dark")
  const [weekStartDay, setWeekStartDay] = useState(
    settings.weekStartDay.toString()
  )

  const [lateNightStart, setLateNightStart] = useState(
    settings.lateNightStart || "22:00"
  )
  const [lateNightRateIncrease, setLateNightRateIncrease] = useState(
    settings.lateNightRateIncrease?.toString() || "0.25"
  )
  const [error, setError] = useState("")

  const onLateNightStartChange = (hour: string) => {
    setLateNightStart(hour)
    if (!isValidTime(hour)) {
      setError("Invalid time format. Please use HH:mm (00:00 to 23:59).")
      return
    } else {
      setError("")
    }
    settings.lateNightStart = hour
    saveSettings(settings)
  }

  const onLateNightRateIncreaseChange = (percentage: string) => {
    setLateNightRateIncrease(percentage)
    settings.lateNightRateIncrease = parseFloat(percentage)
    saveSettings(settings)
  }

  const onCurrencyChange = async (currency: string) => {
    setCurrency(currency)
    settings.currency = currency
    saveSettings(settings)
  }

  const onRateChange = async (rate: string) => {
    setHourlyRate(rate)
    settings.defaultHourlyRate = parseFloat(rate)
    saveSettings(settings)
  }

  const onDayChange = async (day: string) => {
    setWeekStartDay(day)
    settings.weekStartDay = parseInt(day)
    saveSettings(settings)
  }

  const onThemeChange = async (dark: boolean) => {
    setIsDarkMode(dark)
    settings.theme = dark ? "dark" : "light"
    setTheme(dark ? "dark" : "light")
  }

  // Common currency options
  const currencyOptions = ["¥", "$"]

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom>
      <Sheet.Overlay
        backgroundColor="$accent1"
        opacity={0.5}
        onPress={() => onOpenChange(false)}
      />

      <Sheet.Handle />

      <Sheet.Frame borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <Sheet.ScrollView>
          <YStack gap="$4" flex={1} overflow="scroll" p="$4">
            <XStack
              // @ts-ignore
              justifyContent="space-between">
              <Text fontSize="$8" fontWeight="bold" color="$color">
                Settings
              </Text>
              <Button chromeless onPress={() => onOpenChange(false)}>
                <AntDesign name="close" size={16} color="purple" />
              </Button>
            </XStack>

            {/* Currency Selection */}
            <YStack gap="$2">
              <Text fontWeight="bold" color="$color">
                Currency Symbol
              </Text>
              <Theme name="surface2">
                <RadioGroup
                  aria-labelledby="Select one item"
                  defaultValue={currency}
                  onValueChange={onCurrencyChange}
                  name="form">
                  <YStack gap="$2">
                    {currencyOptions.map((sym) => (
                      <XStack items="center" gap="$2" key={sym}>
                        <RadioGroup.Item value={sym} id={sym}>
                          <RadioGroup.Indicator />
                        </RadioGroup.Item>
                        <Label htmlFor={sym}>{sym}</Label>
                      </XStack>
                    ))}
                  </YStack>
                </RadioGroup>
              </Theme>

              {/* <Input
                value={currency}
                onChangeText={setCurrency}
                placeholder="Custom currency"
                borderColor="$accent6"
              /> */}
            </YStack>

            {/* Default Hourly Rate */}
            <YStack gap="$2">
              <Text fontWeight="bold" color="$color">
                Default Hourly Rate ({currency})
              </Text>
              <Input
                value={hourlyRate}
                onChangeText={onRateChange}
                placeholder="e.g., 1122"
                keyboardType="numeric"
              />
            </YStack>

            {/* Week Start Day Selector */}
            <YStack gap="$2">
              <Text fontWeight="bold" color="$color">
                First Day of the Week
              </Text>
              <Text fontSize="$3" color="$gray10">
                This determines how your weekly summary is calculated
              </Text>

              <Select
                value={weekStartDay}
                onValueChange={onDayChange}
                // disablePreventBodyScroll
                defaultValue="monday">
                <Select.Trigger borderRadius="$4">
                  <Select.Value placeholder="Select day" />
                </Select.Trigger>
                <Adapt when="max-md" platform="touch">
                  <Sheet modal dismissOnSnapToBottom transition="quick">
                    <Sheet.Frame>
                      <Adapt.Contents />
                    </Sheet.Frame>
                    <Sheet.Overlay
                      transition="quick"
                      enterStyle={{ opacity: 0 }}
                      exitStyle={{ opacity: 0 }}
                    />
                  </Sheet>
                </Adapt>

                <Select.Content>
                  <Select.ScrollUpButton />
                  <Select.Viewport>
                    <Select.Group>
                      {WDAYS.map((day) => (
                        <Select.Item
                          key={day.value}
                          value={day.value}
                          index={WDAYS.findIndex((d) => d.value === day.value)}>
                          <Select.ItemText>{day.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Viewport>
                  <Select.ScrollDownButton />
                </Select.Content>
              </Select>
            </YStack>
            {/* Late Night Settings */}
            <YStack gap="$2">
              <Text fontWeight="bold" color="$color">
                Late Night Start Time
              </Text>
              <Input
                value={lateNightStart}
                onChangeText={onLateNightStartChange}
                placeholder="e.g., 22:00"
              />
              {error && error !== "" && <Text color="$red10">{error}</Text>}
              <Text fontWeight="bold" color="$color">
                Late Night Rate Increase (%)
              </Text>
              <Input
                value={lateNightRateIncrease}
                onChangeText={onLateNightRateIncreaseChange}
                placeholder="e.g., 25 for 25%"
                keyboardType="numeric"
              />
              <Text fontSize="$3" color="$gray10">
                Hours after this time will earn extra. Example: 25 means 25%
                more per hour after 22:00.
              </Text>
            </YStack>
            {/* Theme Toggle */}
            <YStack gap="$2">
              <XStack
                gap="$4"
                // @ts-ignore
                alignItems="center">
                <Text fontWeight="bold" color="$color">
                  Dark Mode
                </Text>
                <Switch checked={isDarkMode} onCheckedChange={onThemeChange}>
                  <Switch.Thumb />
                </Switch>
              </XStack>
              <Text fontSize="$3" color="$gray10">
                Toggle between light and dark theme
              </Text>
            </YStack>
          </YStack>
        </Sheet.ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
