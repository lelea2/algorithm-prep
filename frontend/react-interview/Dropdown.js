import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type Option = {
  id: string;
  label: string;
  value: string;
};

type DropdownProps = {
  options: Option[];
  value?: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
};

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = true,
}: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized)
    );
  }, [options, query]);

  function updatePosition() {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }

  function openDropdown() {
    updatePosition();
    setOpen(true);
    setActiveIndex(0);
  }

  function closeDropdown() {
    setOpen(false);
    setQuery("");
  }

  function handleSelect(option: Option) {
    onChange?.(option.value);
    closeDropdown();
    triggerRef.current?.focus();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((index) =>
        Math.min(index + 1, filteredOptions.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((index) =>
        Math.max(index - 1, 0)
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const option = filteredOptions[activeIndex];

      if (option) {
        handleSelect(option);
      }
    }

    if (event.key === "Escape") {
      closeDropdown();
      triggerRef.current?.focus();
    }
  }

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      closeDropdown();
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    window.addEventListener(
      "resize",
      handleReposition
    );

    window.addEventListener(
      "scroll",
      handleReposition,
      true
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      window.removeEventListener(
        "resize",
        handleReposition
      );

      window.removeEventListener(
        "scroll",
        handleReposition,
        true
      );
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      role="listbox"
      className="dropdown-menu"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 1000,
      }}
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <input
          autoFocus
          value={query}
          placeholder="Search..."
          className="dropdown-search"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
        />
      )}

      <div className="dropdown-options">
        {filteredOptions.length === 0 ? (
          <div className="dropdown-empty">
            No results
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            const active = index === activeIndex;
            const selected = option.value === value;

            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`dropdown-option ${
                  active ? "active" : ""
                }`}
                onMouseEnter={() =>
                  setActiveIndex(index)
                }
                onClick={() =>
                  handleSelect(option)
                }
              >
                {option.label}
              </button>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() =>
          open ? closeDropdown() : openDropdown()
        }
      >
        {selectedOption?.label ?? placeholder}
      </button>

      {menu &&
        typeof document !== "undefined" &&
        createPortal(menu, document.body)}
    </>
  );
}

export default Dropdown;