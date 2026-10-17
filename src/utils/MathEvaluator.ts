/**
 * Ultra-safe, AST-free mathematical expression parser and evaluator.
 * No eval(), no Function constructor, completely immune to code injection.
 */

export interface EvaluationResult {
  result: number | null;
  formatted: string;
  error?: string;
}

export class MathEvaluator {
  private static factorial(n: number): number {
    if (!Number.isInteger(n) || n < 0) throw new Error("Factorial is only defined for non-negative integers");
    if (n > 170) throw new Error("Factorial overflow (max 170)");
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  /**
   * Evaluates a mathematical expression safely.
   * @param expression The mathematical string.
   * @param lastAnswer The previous answer value for 'ans'.
   */
  public static evaluate(expression: string, lastAnswer: number = 0): EvaluationResult {
    try {
      if (!expression || expression.trim().length === 0) {
        return { result: null, formatted: "0", error: "Empty expression" };
      }

      // Pre-process symbols
      let clean = expression.replace(/×/g, "*").replace(/x/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").trim();

      // Tokenize
      const tokens = this.tokenize(clean, lastAnswer);
      const rpn = this.toRPN(tokens);
      const result = this.evaluateRPN(rpn);

      if (!Number.isFinite(result)) {
        return { result: null, formatted: "Error", error: "Result is infinite or undefined" };
      }

      // Format cleanly (truncate float noise like 0.30000000000000004)
      const formatted = this.formatNumber(result);
      return { result, formatted };
    } catch (err: any) {
      return {
        result: null,
        formatted: "Error",
        error: err.message || "Invalid expression",
      };
    }
  }

  private static formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    const str = parseFloat(n.toFixed(10)).toString();
    return str;
  }

  private static tokenize(expr: string, lastAnswer: number): (number | string)[] {
    const tokens: (number | string)[] = [];
    let i = 0;

    while (i < expr.length) {
      const char = expr[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Numbers
      if (/\d/.test(char) || (char === "." && /\d/.test(expr[i + 1] || ""))) {
        let numStr = "";
        while (i < expr.length && (/[\d.]/.test(expr[i]) || (expr[i] === "e" && /[\d+-]/.test(expr[i + 1] || "")))) {
          numStr += expr[i];
          i++;
        }
        tokens.push(parseFloat(numStr));
        continue;
      }

      // Identifiers / Constants / Functions
      if (/[a-zA-Z]/.test(char)) {
        let ident = "";
        while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
          ident += expr[i].toLowerCase();
          i++;
        }

        if (ident === "pi") {
          tokens.push(Math.PI);
        } else if (ident === "e") {
          tokens.push(Math.E);
        } else if (ident === "ans") {
          tokens.push(lastAnswer);
        } else if (["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(ident)) {
          tokens.push(ident);
        } else {
          throw new Error(`Unknown function or symbol: ${ident}`);
        }
        continue;
      }

      // Multi-character or single-character operators
      if (char === "+" || char === "-" || char === "*" || char === "/" || char === "^" || char === "%" || char === "!" || char === "(" || char === ")") {
        // Detect unary minus: if '-' follows an operator or start of expression or '('
        if (char === "-") {
          const prev = tokens[tokens.length - 1];
          if (tokens.length === 0 || prev === "(" || (typeof prev === "string" && prev !== "!")) {
            tokens.push("u-");
            i++;
            continue;
          }
        }
        tokens.push(char);
        i++;
        continue;
      }

      throw new Error(`Invalid character: '${char}'`);
    }

    return tokens;
  }

  private static toRPN(tokens: (number | string)[]): (number | string)[] {
    const output: (number | string)[] = [];
    const stack: string[] = [];

    const precedence: Record<string, number> = {
      "+": 1,
      "-": 1,
      "*": 2,
      "/": 2,
      "%": 2,
      "^": 3,
      "u-": 4,
      "!": 5,
    };

    const isRightAssociative = (op: string) => op === "^" || op === "u-";

    for (const token of tokens) {
      if (typeof token === "number") {
        output.push(token);
      } else if (["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(token)) {
        stack.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length > 0 && stack[stack.length - 1] !== "(") {
          output.push(stack.pop()!);
        }
        if (stack.length === 0) throw new Error("Mismatched parentheses");
        stack.pop(); // Remove '('
        if (stack.length > 0 && ["sin", "cos", "tan", "sqrt", "log", "log10", "ln", "round", "abs"].includes(stack[stack.length - 1])) {
          output.push(stack.pop()!);
        }
      } else {
        // Operator
        const op = token;
        while (stack.length > 0 && stack[stack.length - 1] !== "(" && ((!isRightAssociative(op) && precedence[stack[stack.length - 1]] >= precedence[op]) || (isRightAssociative(op) && precedence[stack[stack.length - 1]] > precedence[op]))) {
          output.push(stack.pop()!);
        }
        stack.push(op);
      }
    }

    while (stack.length > 0) {
      const top = stack.pop()!;
      if (top === "(" || top === ")") throw new Error("Mismatched parentheses");
      output.push(top);
    }

    return output;
  }

  private static evaluateRPN(rpn: (number | string)[]): number {
    const stack: number[] = [];

    for (const token of rpn) {
      if (typeof token === "number") {
        stack.push(token);
        continue;
      }

      switch (token) {
        case "u-": {
          if (stack.length < 1) throw new Error("Invalid unary minus syntax");
          stack.push(-stack.pop()!);
          break;
        }
        case "!": {
          if (stack.length < 1) throw new Error("Invalid factorial syntax");
          stack.push(this.factorial(stack.pop()!));
          break;
        }
        case "+": {
          if (stack.length < 2) throw new Error("Invalid addition syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(a + b);
          break;
        }
        case "-": {
          if (stack.length < 2) throw new Error("Invalid subtraction syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(a - b);
          break;
        }
        case "*": {
          if (stack.length < 2) throw new Error("Invalid multiplication syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(a * b);
          break;
        }
        case "/": {
          if (stack.length < 2) throw new Error("Invalid division syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          if (b === 0) throw new Error("Cannot divide by zero");
          stack.push(a / b);
          break;
        }
        case "%": {
          if (stack.length < 2) throw new Error("Invalid modulo syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          if (b === 0) throw new Error("Cannot divide by zero");
          stack.push(a % b);
          break;
        }
        case "^": {
          if (stack.length < 2) throw new Error("Invalid exponent syntax");
          const b = stack.pop()!;
          const a = stack.pop()!;
          if (b > 1000 || (a > 100 && b > 100)) throw new Error("Exponent too large");
          stack.push(Math.pow(a, b));
          break;
        }
        case "sin": {
          if (stack.length < 1) throw new Error("Missing argument for sin");
          stack.push(Math.sin(stack.pop()!));
          break;
        }
        case "cos": {
          if (stack.length < 1) throw new Error("Missing argument for cos");
          stack.push(Math.cos(stack.pop()!));
          break;
        }
        case "tan": {
          if (stack.length < 1) throw new Error("Missing argument for tan");
          stack.push(Math.tan(stack.pop()!));
          break;
        }
        case "sqrt": {
          if (stack.length < 1) throw new Error("Missing argument for sqrt");
          const val = stack.pop()!;
          if (val < 0) throw new Error("Cannot calculate square root of a negative number");
          stack.push(Math.sqrt(val));
          break;
        }
        case "log":
        case "log10": {
          if (stack.length < 1) throw new Error("Missing argument for log");
          const val = stack.pop()!;
          if (val <= 0) throw new Error("Logarithm argument must be positive");
          stack.push(Math.log10(val));
          break;
        }
        case "ln": {
          if (stack.length < 1) throw new Error("Missing argument for ln");
          const val = stack.pop()!;
          if (val <= 0) throw new Error("Logarithm argument must be positive");
          stack.push(Math.log(val));
          break;
        }
        case "round": {
          if (stack.length < 1) throw new Error("Missing argument for round");
          stack.push(Math.round(stack.pop()!));
          break;
        }
        case "abs": {
          if (stack.length < 1) throw new Error("Missing argument for abs");
          stack.push(Math.abs(stack.pop()!));
          break;
        }
        default:
          throw new Error(`Unknown operator: ${token}`);
      }
    }

    if (stack.length !== 1) throw new Error("Invalid expression");
    return stack[0];
  }
}
