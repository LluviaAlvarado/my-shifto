import { useSettings } from "@/contexts/SettingsContext"
import { useEffect, useState } from "react"
import { Button, Dialog, H5, Input, Text, XStack, YStack } from "tamagui"
import { Shift } from "../types/types"

interface ShiftModalProps {
  visible: boolean
  shift: Shift | null
  date?: Date | null
  onClose: () => void
  onAdd?: (shiftData: Partial<Shift>) => void
  onEdit?: (shiftData: Partial<Shift>) => void
  onDelete?: () => void
}

export const ShiftModal = ({
  visible,
  shift,
  date,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: ShiftModalProps) => {
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    hourlyRate: "",
    notes: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState("")
  const { getSettings } = useSettings()
  const settings = getSettings()

  useEffect(() => {
    if (shift) {
      setForm({
        startTime: shift.startTime,
        endTime: shift.endTime,
        hourlyRate: String(shift.hourlyRate),
        notes: shift.notes || "",
      })
      setEditMode(false)
    } else {
      setForm({ startTime: "", endTime: "", hourlyRate: "", notes: "" })
      setEditMode(true)
    }
    setError("")
  }, [shift, date, visible])

  const handleSave = () => {
    if (!form.startTime || !form.endTime || !form.hourlyRate) {
      setError("Start time, end time, and hourly rate are required.")
      return
    }
    if (onEdit && shift) {
      onEdit({ ...form, hourlyRate: Number(form.hourlyRate) })
    }
    setEditMode(false)
    onClose()
  }

  const handleAdd = () => {
    if (!form.startTime || !form.endTime || !form.hourlyRate) {
      setError("Start time, end time, and hourly rate are required.")
      return
    }
    if (onAdd) {
      onAdd({ ...form, hourlyRate: Number(form.hourlyRate) })
    }
    onClose()
  }

  return (
    <Dialog
      modal
      open={visible}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}>
      <Dialog.Portal>
        <Dialog.Overlay key="overlay" background="$accent1" opacity={0.7} />

        <Dialog.FocusScope focusOnIdle>
          <Dialog.Content
            bordered
            elevate
            width={340}
            background="$background"
            borderColor="$accent6"
            borderWidth={2}
            shadowColor="$accent8">
            <YStack gap="$3">
              {shift && !editMode ? (
                <>
                  <H5>Shift Details</H5>
                  <Text color="$purple9">
                    Date: <Text color="$color">{shift.date}</Text>
                  </Text>
                  <Text color="$purple9">
                    Start: <Text color="$color">{shift.startTime}</Text>
                  </Text>
                  <Text color="$purple9">
                    End: <Text color="$color">{shift.endTime}</Text>
                  </Text>
                  <Text color="$purple9">
                    Hourly Rate: <Text color="$color">{ settings.currency + shift.hourlyRate}</Text>
                  </Text>
                  <Text color="$purple9">
                    Notes: <Text color="$color">{shift.notes || "-"}</Text>
                  </Text>
                  <XStack gap="$3" mt="$2">
                    <Button onPress={() => setEditMode(true)} theme="accent">
                      Edit
                    </Button>
                    {onDelete && (
                      <Button onPress={onDelete} theme="red">
                        Delete
                      </Button>
                    )}
                    <Button onPress={onClose} theme="gray">
                      Close
                    </Button>
                  </XStack>
                </>
              ) : (
                <>
                  <H5>{shift ? "Edit Shift" : "Add Shift"}</H5>
                  <Text color="$purple9">
                    Date:{" "}
                    <Text color="$color">
                      {date ? date.toISOString().slice(0, 10) : shift?.date}
                    </Text>
                  </Text>
                  <YStack gap="$2">
                    <Text color="$purple9">Start Time</Text>
                    <Input
                      value={form.startTime}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, startTime: text }))
                      }
                      placeholder="e.g. 09:00"
                      mb="$2"
                    />
                    <Text color="$purple9">End Time</Text>
                    <Input
                      value={form.endTime}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, endTime: text }))
                      }
                      placeholder="e.g. 17:00"
                      mb="$2"
                    />
                    <Text color="$purple9">Hourly Rate</Text>
                    <Input
                      value={form.hourlyRate}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, hourlyRate: text }))
                      }
                      placeholder="e.g. 1122"
                      keyboardType="numeric"
                      mb="$2"
                    />
                    <Text color="$purple9">Notes</Text>
                    <Input
                      value={form.notes}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, notes: text }))
                      }
                      placeholder="Optional notes"
                      mb="$2"
                    />
                  </YStack>
                  {error && <Text color="$red10">{error}</Text>}
                  <XStack gap="$3" mt="$2">
                    {shift ? (
                      <>
                        <Button onPress={handleSave} theme="accent">
                          Save
                        </Button>
                        <Button
                          onPress={() => {
                            setEditMode(false)
                            onClose()
                          }}
                          theme="red">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onPress={handleAdd} theme="accent">
                        Add
                      </Button>
                    )}
                    <Button onPress={onClose} theme="gray">
                      Close
                    </Button>
                  </XStack>
                </>
              )}
            </YStack>
          </Dialog.Content>
        </Dialog.FocusScope>
      </Dialog.Portal>
    </Dialog>
  )
}
