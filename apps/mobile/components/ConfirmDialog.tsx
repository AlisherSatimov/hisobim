import React from 'react';
import { Dialog, Portal, Button, Text } from 'react-native-paper';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onDismiss: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  onConfirm,
  onDismiss,
  confirmLabel = "O'chirish",
  cancelLabel = 'Bekor qilish',
}: Props) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>{cancelLabel}</Button>
          <Button onPress={onConfirm} textColor="#C0392B">
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
