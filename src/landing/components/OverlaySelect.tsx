import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

type OverlaySelectOption = {
  value: string
  label: ReactNode
}

type OverlaySelectProps = {
  value: string
  options: OverlaySelectOption[]
  placeholder: string
  disabled?: boolean
  ariaLabel: string
  ariaInvalid?: boolean
  ariaDescribedBy?: string
  onValueChange: (value: string) => void
  onBlur?: () => void
  triggerClassName: string
  contentClassName: string
  itemClassName: string
  showChevron?: boolean
}

type MenuPosition = {
  top: number
  left: number
  width: number
}

const MENU_GAP = 6
const MENU_MAX_HEIGHT = 280

export function OverlaySelect({
  value,
  options,
  placeholder,
  disabled = false,
  ariaLabel,
  ariaInvalid = false,
  ariaDescribedBy,
  onValueChange,
  onBlur,
  triggerClassName,
  contentClassName,
  itemClassName,
  showChevron = true,
}: OverlaySelectProps) {
  const listboxId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const updateMenuPosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const estimatedHeight = Math.min(MENU_MAX_HEIGHT, options.length * 42 + 8)
    const spaceBelow = window.innerHeight - rect.bottom
    const shouldOpenAbove = spaceBelow < estimatedHeight + MENU_GAP && rect.top > estimatedHeight
    const top = shouldOpenAbove
      ? Math.max(8, rect.top - Math.min(estimatedHeight, MENU_MAX_HEIGHT) - MENU_GAP)
      : Math.min(window.innerHeight - 8, rect.bottom + MENU_GAP)

    setMenuPosition({
      top,
      left: rect.left,
      width: rect.width,
    })
  }

  const closeMenu = (shouldNotifyBlur = true) => {
    setIsOpen(false)
    if (shouldNotifyBlur) {
      onBlur?.()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    updateMenuPosition()

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }

      closeMenu()
    }

    const handleViewportChange = () => {
      updateMenuPosition()
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      closeMenu()
      triggerRef.current?.focus()
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, options.length])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen((current) => !current)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        data-placeholder={!selectedOption ? '' : undefined}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          setIsOpen((current) => !current)
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        {showChevron ? (
          <img
            className="ui-select-trigger-icon"
            src="/landing/lead-chevron-down.svg"
            alt=""
            aria-hidden="true"
          />
        ) : null}
      </button>

      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              className={contentClassName}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 2500,
              }}
            >
              <div className="ui-select-viewport">
                {options.map((option) => {
                  const isSelected = option.value === value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${itemClassName}${isSelected ? ' is-selected' : ''}`}
                      onClick={() => {
                        onValueChange(option.value)
                        closeMenu(false)
                        triggerRef.current?.focus()
                      }}
                    >
                      <span>{option.label}</span>
                      {isSelected ? (
                        <span className="ui-select-item-indicator" aria-hidden="true">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
