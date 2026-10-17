import { GameControlRow } from "../core/ControlTypes.js";
import { MathEvaluator } from "../utils/MathEvaluator.js";

const STANDARD_KEYS = ["DC", "(", ")", "⌫", "AC", "7", "8", "9", "÷", "^", "4", "5", "6", "x", "SQRT", "1", "2", "3", " - ", " + ", "2nd", "0", ".", "ans", "="];

const SCIENTIFIC_KEYS = ["DC", "SIN", "COS", "TAN", "AC", "LG", "LN", "x!", "1/x", "⌫", "RND", "π", "e", "÷", "x", "(", ")", "%", " - ", " + ", "2nd", "0", ".", "ans", "="];

const INVALID_START_KEYS = ["⌫", "AC", "=", "x", "÷", "%", "^", "x!"];

export interface CalculatorState {
  expression: string;
  display: string;
  lastAnswer: string;
  is2nd: boolean;
  hasCalculated: boolean;
}

/**
 * Headless Calculator engine for web dashboards and custom clients.
 */
export class CalculatorEngine {
  private expression: string = " ";
  private lastAnswer: string = "";
  private hasCalculated: boolean = false;
  private is2nd: boolean = false;

  constructor() {}

  /**
   * Toggles between standard arithmetic keypad and 2nd / scientific keypad.
   */
  public toggle2nd(): boolean {
    this.is2nd = !this.is2nd;
    return this.is2nd;
  }

  /**
   * Clears the current expression (AC).
   */
  public clear(): void {
    this.expression = " ";
  }

  /**
   * Erases the last character or token (Backspace).
   */
  public backspace(): void {
    if (!this.expression || this.expression === " ") return;
    this.expression = this.expression.endsWith(" ") ? this.expression.slice(0, -3) : this.expression.slice(0, -1);
    if (this.expression === "") this.expression = " ";
  }

  /**
   * Alias for input(key).
   */
  public press(key: string): { result?: number | string; error?: string } | void {
    return this.input(key);
  }

  /**
   * Handles button click or input.
   */
  public input(key: string): { result?: number | string; error?: string } | void {
    if (key === "2nd") {
      this.toggle2nd();
      return;
    }
    if (key === "AC") {
      this.clear();
      return;
    }
    if (key === "⌫") {
      this.backspace();
      return;
    }
    if (key === "=") {
      return this.calculate();
    }

    let token = key;
    if (token === "×" || token === "*") token = "x";
    if (token === "+") token = " + ";
    if (token === "-") token = " - ";

    this.expression += token;
  }

  /**
   * Calculates the current expression safely using MathEvaluator.
   */
  public calculate(): { result?: number | string; error?: string } {
    if (!this.expression.trim()) return { error: "Empty expression" };

    const clean = this.expression
      .replace(/x/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi")
      .replace(/ans/g, this.lastAnswer || "0")
      .trim();

    const evalResult = MathEvaluator.evaluate(clean, Number(this.lastAnswer) || 0);
    if (evalResult.error) {
      this.expression = "Error";
      return { error: evalResult.error };
    }

    const res = evalResult.formatted;
    this.expression = String(res);
    this.lastAnswer = String(res);
    this.hasCalculated = true;
    return { result: res };
  }

  /**
   * Returns a snapshot of the calculator's current state.
   */
  public getState(): CalculatorState {
    const modeTag = this.is2nd ? " [2nd / SCI]" : "";
    return {
      expression: this.expression,
      display: `${this.expression}${modeTag}`,
      lastAnswer: this.lastAnswer,
      is2nd: this.is2nd,
      hasCalculated: this.hasCalculated,
    };
  }

  /**
   * Returns the 5x5 keypad controls schema for dashboard rendering.
   */
  public getControls(): GameControlRow[] {
    const keys = this.is2nd ? SCIENTIFIC_KEYS : STANDARD_KEYS;
    const isEmpty = this.expression.trim() === "";
    const rows: GameControlRow[] = [];

    for (let i = 0; i < keys.length; i += 5) {
      const chunk = keys.slice(i, i + 5);
      const components = chunk.map((k) => {
        let disabled = false;
        if (k === "ans" && !this.hasCalculated) disabled = true;
        else if (isEmpty && INVALID_START_KEYS.includes(k)) disabled = true;

        let style: "primary" | "secondary" | "success" | "danger" = "secondary";
        if (k === "=") style = "success";
        else if (k === "2nd") style = this.is2nd ? "success" : "primary";
        else if (k === "AC" || k === "DC") style = "danger";
        else if (["x", "÷", " - ", " + ", "^", "%"].includes(k)) style = "primary";

        return {
          id: k,
          label: k,
          emoji: k === "DC" ? "🛑" : undefined,
          style,
          disabled,
        };
      });

      rows.push({ components });
    }

    return rows;
  }
}
