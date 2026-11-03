export type Values = Record<string, number | string>;

export interface ShowWhen {
  /** id поля-селектора, від якого залежить видимість */
  field: string;
  /** при яких значеннях селектора поле видно */
  values: string[];
}

export type FieldDef =
  | { id: string; type: 'number'; placeholder?: string; min?: number; showWhen?: ShowWhen }
  | { id: string; type: 'select'; options: string[]; default?: string; showWhen?: ShowWhen };

export interface OutputDef {
  id: string;
  value: number;
  /** ключ з розділу units у перекладах (m2, kg, L ...) або '%' */
  unit?: string;
  /** максимум знаків після коми (за замовчуванням 6) */
  decimals?: number;
  /** показувати рівно стільки знаків (для грошей: 2) */
  fixed?: boolean;
  primary?: boolean;
}

export interface StepsContext {
  fmt: (n: number) => string;
  unit: (key: string) => string;
}

export type ComputeError = 'divisionByZero' | 'overflow' | 'outOfRange' | 'negative';

export type ComputeResult =
  | { ok: true; outputs: OutputDef[]; steps?: (ctx: StepsContext) => string }
  | { ok: false; error: ComputeError; field?: string };

export interface CalculatorDef {
  /** Формула для сторінки (однакова для всіх мов). Необов’язкова. */
  formula?: string;
  fields: FieldDef[];
  /** Усі id результатів: для них потрібні переклади outputs.<id> */
  outputs: string[];
  compute: (values: Values) => ComputeResult;
}
