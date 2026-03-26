import React from 'react'
import { Flex, HStack, IconButton, Input, Tooltip } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaAngleLeft, FaAngleRight, FaSearch, FaTimes } from 'react-icons/fa'

interface PanelHeaderProps {
  isPanelOpen: boolean
  isSearchOpen: boolean
  searchQuery: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onTogglePanel: () => void
  onToggleMouseEnter: (e: React.MouseEvent) => void
  onToggleMouseLeave: (e: React.MouseEvent) => void
  onOpenSearch: () => void
  onSearchChange: (value: string) => void
  onSearchBlur: () => void
  onClearSearch: () => void
}

export function PanelHeader({
  isPanelOpen,
  isSearchOpen,
  searchQuery,
  searchInputRef,
  onTogglePanel,
  onToggleMouseEnter,
  onToggleMouseLeave,
  onOpenSearch,
  onSearchChange,
  onSearchBlur,
  onClearSearch
}: PanelHeaderProps): React.JSX.Element {
  return (
    <HStack h="42px" justifyContent="flex-start" alignItems="center">
      <Tooltip label={!isPanelOpen ? '開く' : '閉じる'} placement="right">
        <IconButton
          aria-label="Toggle Panel"
          icon={isPanelOpen ? <FaAngleLeft /> : <FaAngleRight />}
          variant="ghost"
          onClick={onTogglePanel}
          onMouseEnter={onToggleMouseEnter}
          onMouseLeave={onToggleMouseLeave}
        />
      </Tooltip>

      {isPanelOpen && (
        <Flex flex="1" justifyContent="flex-end" alignItems="center" overflow="hidden">
          <motion.div
            layout
            initial={false}
            animate={{
              width: isSearchOpen ? '100%' : '32px',
              opacity: 1
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <HStack
              spacing={isSearchOpen ? 2 : 0}
              bg="gray.100"
              borderRadius="full"
              pl={isSearchOpen ? 2 : 0}
              pr={isSearchOpen ? 1 : 0}
              py={isSearchOpen ? 1 : 0}
              border={isSearchOpen ? '1px solid' : 'none'}
              borderColor="brand.accent"
              cursor={!isSearchOpen ? 'pointer' : 'default'}
              onClick={!isSearchOpen ? onOpenSearch : undefined}
              w="100%"
            >
              <IconButton
                aria-label="Search Scenarios"
                icon={<FaSearch />}
                variant="ghost"
                size="sm"
                onClick={isSearchOpen ? undefined : onOpenSearch}
                _hover={{ bg: 'transparent' }}
                _active={{ bg: 'transparent' }}
                pointerEvents={isSearchOpen ? 'none' : 'auto'}
              />

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', flexGrow: 1 }}
                  >
                    <Input
                      ref={searchInputRef}
                      placeholder="検索..."
                      size="md"
                      value={searchQuery}
                      onChange={(e): void => onSearchChange(e.target.value)}
                      variant="unstyled"
                      flex="1"
                      h="auto"
                      onBlur={onSearchBlur}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isSearchOpen && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <IconButton
                      aria-label="Clear Search"
                      icon={<FaTimes />}
                      size="xs"
                      variant="ghost"
                      onClick={onClearSearch}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </HStack>
          </motion.div>
        </Flex>
      )}
    </HStack>
  )
}
