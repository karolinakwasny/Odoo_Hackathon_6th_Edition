import { Button, Modal, Text } from '@mantine/core'

interface ConfirmDialogProps {
  opened: boolean
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({ opened, title, message, onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onCancel} title={title} centered>
      <Text size="sm">{message}</Text>
      <div className="modal-actions">
        <Button variant="default" onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </div>
    </Modal>
  )
}
