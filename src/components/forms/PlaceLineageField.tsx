"use client";

import { useMemo, useState } from "react";
import { fieldClassName } from "@/components/forms/FormField";
import {
  addCustomPlaceLineageSelection,
  addPlaceLineageSelection,
  getPlaceLineagePickerOptions,
  getPlaceLineageSelectionChips,
  getSelectedPlaceLineageKeys,
  removePlaceLineageSelection,
  type PlaceLineageValue,
} from "@/lib/schools";
import type { Faith } from "@/types/place";

type PlaceLineageFieldProps = {
  id: string;
  /** When set, hidden inputs are rendered for native form submission. */
  namePrefix?: string;
  value: PlaceLineageValue;
  onChange: (value: PlaceLineageValue) => void;
};

export function PlaceLineageField({
  id,
  namePrefix,
  value,
  onChange,
}: PlaceLineageFieldProps) {
  const [customInput, setCustomInput] = useState("");
  const [selectKey, setSelectKey] = useState(0);

  const options = getPlaceLineagePickerOptions();
  const chips = useMemo(() => getPlaceLineageSelectionChips(value), [value]);
  const selectedKeys = useMemo(() => new Set(getSelectedPlaceLineageKeys(value)), [value]);

  function addOptionKey(key: string) {
    const option = options.find((entry) => entry.key === key);
    if (!option) return;
    onChange(addPlaceLineageSelection(value, option));
    setSelectKey((current) => current + 1);
  }

  function removeChip(key: string) {
    onChange(removePlaceLineageSelection(value, key));
  }

  function addCustom() {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onChange(addCustomPlaceLineageSelection(value, trimmed));
    setCustomInput("");
    setSelectKey((current) => current + 1);
  }

  return (
    <div className="space-y-3">
      {namePrefix ? (
        <>
          <input type="hidden" name={`${namePrefix}Faith`} value={value.faith} />
          <input type="hidden" name={`${namePrefix}Tradition`} value={value.tradition} />
          <input
            type="hidden"
            name={`${namePrefix}Schools`}
            value={(value.schools ?? []).join(",")}
          />
        </>
      ) : null}

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-ink"
            >
              <span>{chip.pathLabel}</span>
              <button
                type="button"
                onClick={() => removeChip(chip.key)}
                aria-label={`Remove ${chip.label}`}
                className="rounded-full p-0.5 text-ink-muted transition hover:bg-surface-muted hover:text-ink"
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted">
          Add one or more traditions or schools. Nested schools also select their parents.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <select
          key={selectKey}
          id={id}
          value=""
          onChange={(event) => {
            if (event.target.value) addOptionKey(event.target.value);
          }}
          className={`${fieldClassName} sm:max-w-xs`}
          aria-label="Add tradition or school"
        >
          <option value="">Add from list…</option>
          {options.map((option) => (
            <option
              key={option.key}
              value={option.key}
              disabled={selectedKeys.has(option.key)}
            >
              {`${"\u00A0".repeat(option.depth * 2)}${option.label}`}
            </option>
          ))}
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
            placeholder="Custom tradition…"
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

export function emptyPlaceLineage(faith: Faith = "Buddhist"): PlaceLineageValue {
  return { faith, tradition: "", schools: [] };
}
