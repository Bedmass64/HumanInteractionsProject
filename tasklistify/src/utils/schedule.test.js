import {
  DAYS_OF_WEEK,
  getPriorityValue,
  clampInt,
  buildTimeString,
  makeEventKey,
  getOrderedDays,
  getVisibleDays,
} from "./schedule";

describe("getPriorityValue", () => {
  it("maps known priorities to descending weights", () => {
    expect(getPriorityValue("High")).toBe(3);
    expect(getPriorityValue("Medium")).toBe(2);
    expect(getPriorityValue("Low")).toBe(1);
  });

  it("returns 0 for empty or unknown priorities", () => {
    expect(getPriorityValue("")).toBe(0);
    expect(getPriorityValue(undefined)).toBe(0);
    expect(getPriorityValue("Urgent")).toBe(0);
  });
});

describe("clampInt", () => {
  it("clamps numbers into the [min, max] range", () => {
    expect(clampInt("5", 1, 12)).toBe("5");
    expect(clampInt("0", 1, 12)).toBe("1");
    expect(clampInt("99", 1, 12)).toBe("12");
  });

  it("returns an empty string for non-numeric input", () => {
    expect(clampInt("abc", 1, 12)).toBe("");
    expect(clampInt("", 0, 59)).toBe("");
  });
});

describe("buildTimeString", () => {
  it("formats a valid time, zero-padding hour and minute", () => {
    expect(buildTimeString({ hour: "9", minute: "5", amPm: "AM" })).toBe(
      "09:05 AM"
    );
    expect(buildTimeString({ hour: "12", minute: "30", amPm: "PM" })).toBe(
      "12:30 PM"
    );
  });

  it("clamps out-of-range hours and minutes", () => {
    expect(buildTimeString({ hour: "13", minute: "75", amPm: "PM" })).toBe(
      "12:59 PM"
    );
  });

  it("returns an empty string when any field is missing or invalid", () => {
    expect(buildTimeString({ hour: "", minute: "30", amPm: "AM" })).toBe("");
    expect(buildTimeString({ hour: "9", minute: "30", amPm: "" })).toBe("");
    expect(buildTimeString({ hour: "9", minute: "30", amPm: "noon" })).toBe("");
  });
});

describe("makeEventKey", () => {
  it("joins the identifying parts with a stable separator", () => {
    expect(makeEventKey(7, "Monday", 2)).toBe("7::Monday::2");
  });
});

describe("getOrderedDays", () => {
  it("rotates the week so the chosen day is first", () => {
    expect(getOrderedDays("Monday")).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });

  it("returns the canonical order when the first day is Sunday", () => {
    expect(getOrderedDays("Sunday")).toEqual(DAYS_OF_WEEK);
  });

  it("falls back to the canonical order for an unknown day", () => {
    expect(getOrderedDays("Funday")).toEqual(DAYS_OF_WEEK);
  });
});

describe("getVisibleDays", () => {
  it("removes hidden days while preserving order", () => {
    const ordered = getOrderedDays("Monday");
    expect(getVisibleDays(ordered, ["Saturday", "Sunday"])).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
  });

  it("returns all days when nothing is hidden", () => {
    expect(getVisibleDays(DAYS_OF_WEEK)).toEqual(DAYS_OF_WEEK);
  });
});
