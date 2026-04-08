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
  const {
    getSettings,
    setCurrency,
    setDefaultHourlyRate,
    setTheme,
    setWeekStartDay,
    setLateNightStart,
    setLateNightRateIncrease,
    setTransportationCost,
  } = useSettings()
  const settings = getSettings()
  const [hourlyRate, stHourlyRate] = useState(
    settings.defaultHourlyRate.toString()
  )
  const [lateNightStart, stLateNightStart] = useState(settings.lateNightStart)
  const [lateNightRateIncrease, stLateNightRateIncrease] = useState(
    settings.lateNightRateIncrease.toString()
  )
  const [transportationCost, stTransportationCost] = useState(
    settings.transportationCost.toString()
  )
  const [rateError, setRateError] = useState("")
  const [nightError, setNightError] = useState("")
  const [percentageError, setPercentageError] = useState("")
  const [transportationCostError, setTransportationCostError] = useState("")

  const onCurrencyChange = async (currency: string) => {
    setCurrency(currency)
  }

  const onRateChange = async (rate: string) => {
    const ra = parseFloat(rate)
    stHourlyRate(rate)
    if (isNaN(ra) || ra < 0) {
      setRateError("Please enter a valid number for hourly rate.")
      return
    } else {
      setRateError("")
    }
    setDefaultHourlyRate(ra)
  }

  const onThemeChange = async (dark: boolean) => {
    settings.theme = dark ? "dark" : "light"
    setTheme(dark ? "dark" : "light")
  }

  const onDayChange = async (day: string) => {
    settings.weekStartDay = parseInt(day)
    setWeekStartDay(parseInt(day))
  }

  const onLateNightStartChange = (hour: string) => {
    stLateNightStart(hour)
    if (!isValidTime(hour)) {
      setNightError("Invalid time format. Please use HH:mm (00:00 to 23:59).")
      return
    } else {
      setNightError("")
    }
    setLateNightStart(hour)
  }

  const onLateNightRateIncreaseChange = (percentage: string) => {
    const perc = parseFloat(percentage)
    stLateNightRateIncrease(percentage)
    if (isNaN(perc) || perc < 0) {
      setPercentageError("Please enter a valid percentage (e.g., 25 for 25%).")
      return
    } else {
      setPercentageError("")
    }
    setLateNightRateIncrease(perc)
  }

  const onTransportationCostChange = (costS: string) => {
    const cost = parseFloat(costS)
    stTransportationCost(costS)
    if (isNaN(cost) || cost < 0) {
      setTransportationCostError(
        "Please enter a valid number for transportation cost."
      )
      return
    } else {
      setTransportationCostError("")
    }
    setTransportationCost(cost)
  }

  // Currency options
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
                  defaultValue={settings.currency}
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
                Default Hourly Rate
              </Text>
              <Input
                value={hourlyRate}
                onChangeText={onRateChange}
                placeholder="e.g., 1122"
                keyboardType="numeric"
              />
              {rateError && rateError !== "" && (
                <Text color="$red10">{rateError}</Text>
              )}
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
                value={settings.weekStartDay.toString()}
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
              {nightError && nightError !== "" && (
                <Text color="$red10">{nightError}</Text>
              )}
              <Text fontWeight="bold" color="$color">
                Late Night Rate Increase (%)
              </Text>
              <Input
                value={lateNightRateIncrease}
                onChangeText={onLateNightRateIncreaseChange}
                placeholder="e.g., 25 for 25%"
                keyboardType="numeric"
              />
              {percentageError && percentageError !== "" && (
                <Text color="$red10">{percentageError}</Text>
              )}
              <Text fontSize="$3" color="$gray10">
                Hours after this time will earn extra. Example: 25 means 25%
                more per hour after 22:00.
              </Text>
            </YStack>
            {/* Transportation Cost round trip */}
            <YStack gap="$2">
              <Text fontWeight="bold" color="$color">
                Transportation Cost (Round Trip)
              </Text>
              <Input
                value={transportationCost}
                onChangeText={onTransportationCostChange}
                placeholder="e.g., 440"
                keyboardType="numeric"
              />
              {transportationCostError && transportationCostError !== "" && (
                <Text color="$red10">{transportationCostError}</Text>
              )}
              <Text fontSize="$3" color="$gray10">
                This is to include the transportation cost when it is paid by
                your employer. If you pay for transportation yourself, you can
                leave this as 0 and it won&apos;t be included in the earnings
                calculation.
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
                <Switch
                  checked={settings.theme === "dark"}
                  onCheckedChange={onThemeChange}>
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
