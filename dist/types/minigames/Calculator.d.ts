import type { CalcTypes, CustomOptions } from "../Types/index.js";
import type { WekyManager } from "../index.js";
declare const Calculator: (weky: WekyManager, options: CustomOptions<CalcTypes>) => Promise<void>;
export default Calculator;
