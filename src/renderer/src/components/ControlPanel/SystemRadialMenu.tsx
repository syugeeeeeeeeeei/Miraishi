import React, { useMemo, useState } from 'react'
import { Box, IconButton, Tooltip } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaCog } from 'react-icons/fa'
import type { IconType } from 'react-icons'

interface SystemRadialMenuItem {
  id: string
  label: string
  icon: IconType
  onClick: () => void
}

interface SystemRadialMenuProps {
  items: SystemRadialMenuItem[]
}

const MotionBox = motion.create(Box)

export function SystemRadialMenu({ items }: SystemRadialMenuProps): React.JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const itemOffsets = useMemo(() => {
    if (items.length === 0) {
      return []
    }
    const radius = 66
    const startAngle = -78
    const endAngle = 10
    const step = items.length > 1 ? (endAngle - startAngle) / (items.length - 1) : 0
    return items.map((_, index) => {
      const angle = ((startAngle + step * index) * Math.PI) / 180
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      }
    })
  }, [items])

  return (
    <Box
      position="relative"
      w="120px"
      h="112px"
    >
      <Box
        position="absolute"
        left={0}
        transform="none"
        bottom="12px"
      >
        <AnimatePresence>
          {isMenuOpen &&
            items.map((item, index) => {
              const ItemIcon = item.icon
              const offset = itemOffsets[index] ?? { x: 0, y: 0 }
              return (
                <MotionBox
                  key={item.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                  animate={{ x: offset.x, y: offset.y, opacity: 1, scale: 1 }}
                  exit={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  position="absolute"
                  bottom={0}
                  left={0}
                  zIndex={5}
                >
                  <Tooltip label={item.label} placement="right">
                    <IconButton
                      aria-label={item.label}
                      icon={<ItemIcon size={18} />}
                      size="md"
                      w="44px"
                      h="44px"
                      colorScheme="teal"
                      variant="solid"
                      isRound
                      boxShadow="md"
                      onClick={(): void => {
                        item.onClick()
                        setIsMenuOpen(false)
                      }}
                    />
                  </Tooltip>
                </MotionBox>
              )
            })}
        </AnimatePresence>

        <Tooltip label="システムメニュー" placement="right">
          <IconButton
            aria-label="システムメニュー"
            icon={<FaCog size={20} />}
            isRound
            size="md"
            w="46px"
            h="46px"
            colorScheme="teal"
            variant={isMenuOpen ? 'solid' : 'outline'}
            boxShadow="md"
            onClick={(): void => setIsMenuOpen((prev) => !prev)}
          />
        </Tooltip>
      </Box>
    </Box>
  )
}
