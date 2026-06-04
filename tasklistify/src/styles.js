// Shared inline-style helpers, so the same button styling isn't copy-pasted
// across every component.

const baseButton = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  fontSize: "1em",
};

/**
 * A full-width button style with the given background colour.
 * Pass `overrides` to tweak individual properties (e.g. a larger marginTop).
 */
export const button = (backgroundColor, overrides = {}) => ({
  ...baseButton,
  backgroundColor,
  ...overrides,
});

// Background colour used for "save"/confirm actions throughout the app.
export const SAVE_GREEN = "#009605";
