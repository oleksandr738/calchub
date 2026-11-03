import type { ComputeResult, OutputDef, StepsContext } from './types.ts';

/** Збирає успішний результат: прибирає похибки плаваючої крапки, ловить переповнення. */
export function done(
  outputs: OutputDef[],
  steps?: (ctx: StepsContext) => string,
): ComputeResult {
  if (outputs.some((o) => !Number.isFinite(o.value))) {
    return { ok: false, error: 'overflow' };
  }
  return {
    ok: true,
    outputs: outputs.map((o) => ({ ...o, value: Number(o.value.toPrecision(12)) })),
    steps,
  };
}
