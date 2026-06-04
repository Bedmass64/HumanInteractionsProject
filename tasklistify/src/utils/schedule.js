// Pure, framework-free helpers for building and ordering the weekly schedule.
// Kept free of React so they can be unit tested in isolation.

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PRIORITY_VALUES = { High: 3, Medium: 2, Low: 1 };

/** Numeric weight for a priority label; unknown/empty -> 0 (used for sorting). */
export const getPriorityValue = (priority) => PRIORITY_VALUES[priority] || 0;

/**
 * Parse `v` as an integer and clamp it to [min, max].
 * Returns "" when the value is not a number, so callers can treat it as blank.
 */
export const clampInt = (v, min, max) => {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return "";
  return String(Math.min(Math.max(n, min), max));
};

/**
 * Build a "HH:MM AM/PM" string from time-picker fields.
 * Any missing/invalid field yields "" (treated as a blank time).
 */
export const buildTimeString = ({ hour, minute, amPm }) => {
  if (!hour || !minute || !amPm) return "";
  const hh = clampInt(hour, 1, 12);
  const mm = clampInt(minute, 0, 59);
  if (!hh || mm === "" || !["AM", "PM"].includes(amPm)) return "";
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")} ${amPm}`;
};

/** Stable key identifying a single occurrence of a task on a given day. */
export const makeEventKey = (taskId, day, occurrenceIndex) =>
  `${taskId}::${day}::${occurrenceIndex}`;

/**
 * Days of the week rotated so `firstDayOfWeek` comes first.
 * Falls back to the canonical order if the day is unrecognized.
 */
export const getOrderedDays = (firstDayOfWeek, days = DAYS_OF_WEEK) => {
  const firstDayIndex = days.indexOf(firstDayOfWeek);
  if (firstDayIndex === -1) return [...days];
  return [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
};

/** Filter an ordered day list down to the days that are not hidden. */
export const getVisibleDays = (orderedDays, hiddenDays = []) =>
  orderedDays.filter((day) => !hiddenDays.includes(day));
