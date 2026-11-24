"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  id?: string;
  ariaLabel?: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

export function Select<T extends string>({
  id,
  ariaLabel,
  value,
  options,
  onChange,
  className = "",
  disabled = false,
  placeholder = "Pilih...",
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const selectId = useId();
  const listboxId = `${selectId}-listbox`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const isDisabled = disabled || options.length === 0;

  useEffect(() => {
    if (!isOpen || options.length === 0) {
      setPosition(null);
      if (options.length === 0) setIsOpen(false);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const desiredHeight = Math.min(320, options.length * 40 + 8);
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openBelow = spaceBelow >= desiredHeight || spaceBelow >= spaceAbove;
      const availableSpace = openBelow ? spaceBelow : spaceAbove;
      const maxHeight = Math.max(80, Math.min(desiredHeight, availableSpace - 8));
      const height = Math.min(desiredHeight, maxHeight);
      const width = Math.min(rect.width, window.innerWidth - 16);

      setPosition({
        top: openBelow ? rect.bottom + 6 : Math.max(8, rect.top - height - 6),
        left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
        width,
        maxHeight,
      });
    };

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    updatePosition();
    document.addEventListener("pointerdown", handleOutsidePointer);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  const openMenu = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const chooseOption = (option: SelectOption<T>) => {
    onChange(option.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!isOpen) {
        openMenu();
        return;
      }
      setActiveIndex((current) =>
        (current + direction + options.length) % options.length
      );
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
      } else if (options[activeIndex]) {
        chooseOption(options[activeIndex]);
      }
      return;
    }

    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && options[activeIndex]
            ? `${selectId}-option-${activeIndex}`
            : undefined
        }
        disabled={isDisabled}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-cw-line bg-cw-surface px-3 py-2 text-left text-xs text-cw-ink hover:border-cw-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cw-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 flex-shrink-0 text-cw-faint transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>

      {isOpen &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
            className="z-[70] overflow-y-auto rounded-xl border border-cw-line bg-cw-surface p-1 shadow-modal"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <div
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => chooseOption(option)}
                  className={`flex min-h-9 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs leading-snug ${
                    isActive
                      ? "bg-cw-accent-soft text-cw-ink"
                      : "text-cw-muted hover:bg-cw-subtle hover:text-cw-ink"
                  } ${isSelected ? "font-semibold text-cw-accent" : ""}`}
                >
                  <span className="min-w-0 whitespace-normal break-words">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4 flex-shrink-0 text-cw-accent"
                      strokeWidth={2}
                    />
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
