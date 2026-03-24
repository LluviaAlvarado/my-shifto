import React from "react"
import { Button, Dialog, Input, Text, XStack, YStack } from "tamagui"
import { Shift } from "../types/shift"

interface ShiftModalProps {
  visible: boolean
  shift: Shift | null
  date?: Date | null
  onClose: () => void
  onAdd?: (shiftData: Partial<Shift>) => void
  onEdit?: (shiftData: Partial<Shift>) => void
  onDelete?: () => void
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  visible,
  shift,
  date,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const [form, setForm] = React.useState({
    startTime: "",
    endTime: "",
    hourlyRate: "",
    notes: "",
  })
  const [editMode, setEditMode] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
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
                  <Text fontWeight="bold" fontSize="$6" color="$accent10">
                    Shift Details
                  </Text>
                  <Text color="$gray10">
                    Date: <Text color="$color">{shift.date}</Text>
                  </Text>
                  <Text color="$gray10">
                    Start: <Text color="$color">{shift.startTime}</Text>
                  </Text>
                  <Text color="$gray10">
                    End: <Text color="$color">{shift.endTime}</Text>
                  </Text>
                  <Text color="$gray10">
                    Hourly Rate: <Text color="$color">${shift.hourlyRate}</Text>
                  </Text>
                  <Text color="$gray10">
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
                  <Text fontWeight="bold" fontSize="$6" color="$accent10">
                    {shift ? "Edit Shift" : "Add Shift"}
                  </Text>
                  <Text color="$gray10">
                    Date:{" "}
                    <Text color="$color">
                      {date ? date.toISOString().slice(0, 10) : shift?.date}
                    </Text>
                  </Text>
                  <YStack gap="$2">
                    <Text color="$gray10">Start Time</Text>
                    <Input
                      value={form.startTime}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, startTime: text }))
                      }
                      placeholder="e.g. 09:00"
                      mb="$2"
                      background="$accent2"
                      color="$color"
                      borderColor="$accent6"
                    />
                    <Text color="$gray10">End Time</Text>
                    <Input
                      value={form.endTime}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, endTime: text }))
                      }
                      placeholder="e.g. 17:00"
                      mb="$2"
                      background="$accent2"
                      color="$color"
                      borderColor="$accent6"
                    />
                    <Text color="$gray10">Hourly Rate</Text>
                    <Input
                      value={form.hourlyRate}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, hourlyRate: text }))
                      }
                      placeholder="e.g. 15"
                      keyboardType="numeric"
                      mb="$2"
                      background="$accent2"
                      color="$color"
                      borderColor="$accent6"
                    />
                    <Text color="$gray10">Notes</Text>
                    <Input
                      value={form.notes}
                      onChangeText={(text) =>
                        setForm((f) => ({ ...f, notes: text }))
                      }
                      placeholder="Optional notes"
                      mb="$2"
                      background="$accent2"
                      color="$color"
                      borderColor="$accent6"
                    />
                  </YStack>
                  {error && <Text color="$red10">{error}</Text>}
                  <XStack gap="$3" mt="$2">
                    {shift ? (
                      <>
                        <Button onPress={handleSave} theme="green">
                          Save
                        </Button>
                        <Button
                          onPress={() => {
                            setEditMode(false)
                            onClose()
                          }}
                          theme="gray">
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onPress={handleAdd} theme="green">
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
