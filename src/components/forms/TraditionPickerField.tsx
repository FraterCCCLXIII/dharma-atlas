"use client";

import { useMemo, useState } from "react";
import { fieldClassName } from "@/components/forms/FormField";
import {
  getPlaceTraditionPickerOptions,
  isKnownPlaceTradition,
} from "@/lib/schools";

type TraditionPickerFieldProps = {
  id: string;
  /** When set, a hidden input is rendered for native form submission. */
  name?: string;
  value: string;
  onChange: (value: string) => void;
  faith?: string;
  placeholder?: string;
};

export function TraditionPickerField({
  id,
  name,
  value,
  onChange,
  faith,
  placeholder = "Custom tradition…",
}: TraditionPickerFieldProps) {
  const [customInput, setCustomInput] = useState("");
  const [selectKey, setSelectKey] = useState(0);

  const options = useMemo(
    () => getPlaceTraditionPickerOptions(faith, value),
    [faith, value],
  );

  const availableOptions = options;

  const buddhistOptions = availableOptions.filter((option) => option.group === "Buddhist");
  const otherOptions = availableOptions.filter((option) => option.group === "Other");

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setCustomInput("");
  }

  const trimmedValue = value.trim();
  const isCustom = trimmedValue.length > 0 && !isKnownPlaceTradition(trimmedValue);
  const displayLabel =
    options.find((option) => option.value === trimmedValue)?.label ?? trimmedValue;

  return (
    <div className="space-y-3">
      {name ? <input type="hidden" name={name} value={value} /> : null}

      {trimmedValue ? (
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-ink">
            {displayLabel}
            {isCustom ? (
              <span className="text-xs font-normal text-ink-muted">custom</span>
            ) : null}
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label={`Remove ${displayLabel}`}
              className="rounded-full p-0.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              <span aria-hidden="true">×</span>
            </button>
          </span>
        </div>
      ) : (
        <p className="text-xs text-ink-muted">Choose from the list or add a custom tradition.</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <select
          key={selectKey}
          id={id}
          value=""
          onChange={(event) => {
            const next = event.target.value;
            if (next) {
              onChange(next);
              setSelectKey((key) => key + 1);
            }
          }}
          disabled={availableOptions.length === 0}
          className={`${fieldClassName} sm:max-w-[14rem]`}
          aria-label="Add tradition from list"
        >
          <option value="">Add from list…</option>
          {buddhistOptions.length > 0 ? (
            <optgroup label="Buddhist">
              {buddhistOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : null}
          {otherOptions.length > 0 ? (
            <optgroup label="Other traditions">
              {otherOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>

        <div className="flex min-w-0 flex-1 gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            placeholder={placeholder}
            className={fieldClassName}
            aria-label="Custom tradition"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="shrink-0 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
