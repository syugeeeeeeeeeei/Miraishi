import React from 'react'
import { Button } from '@chakra-ui/react'
import { FaChartLine } from 'react-icons/fa'

interface OpenGraphButtonProps {
  isDisabled: boolean
  onOpen: () => void
}

export function OpenGraphButton({ isDisabled, onOpen }: OpenGraphButtonProps): React.JSX.Element {
  return (
    <Button leftIcon={<FaChartLine />} colorScheme="purple" onClick={onOpen} size="sm" isDisabled={isDisabled}>
      グラフ表示
    </Button>
  )
}
