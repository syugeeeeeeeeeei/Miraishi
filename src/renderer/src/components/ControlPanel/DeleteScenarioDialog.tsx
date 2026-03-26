import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button
} from '@chakra-ui/react'

interface DeleteScenarioDialogProps {
  isOpen: boolean
  cancelRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
  onConfirmDelete: () => void
}

export function DeleteScenarioDialog({
  isOpen,
  cancelRef,
  onClose,
  onConfirmDelete
}: DeleteScenarioDialogProps): React.JSX.Element {
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            シナリオを削除
          </AlertDialogHeader>
          <AlertDialogBody>
            本当にこのシナリオを削除しますか？この操作は元に戻せません。
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="red" onClick={onConfirmDelete} ml={3}>
              削除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
