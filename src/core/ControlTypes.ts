/**
 * Universal Game Control item for web dashboards, custom UI, and Discord components.
 */
export interface GameControlItem {
  /** Unique action or control identifier (e.g. 'up', 'hit', 'cal7') */
  id: string;
  /** Visible label on the button */
  label: string;
  /** Optional icon or emoji */
  emoji?: string;
  /** Button color theme / visual intent */
  style: "primary" | "secondary" | "success" | "danger";
  /** Whether the control button is currently disabled */
  disabled: boolean;
}

/**
 * Row containing a list of control items (matches a keypad row or Discord ActionRow).
 */
export interface GameControlRow {
  components: GameControlItem[];
}
