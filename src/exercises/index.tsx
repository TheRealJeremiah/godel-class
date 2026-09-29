import { codeExercise } from './CodeExercise'
import { orderExercise } from './OrderExercise'
import * as code from './code'
import * as proofs from './proofs'
import type { ExerciseDef } from './types'

/**
 * Every exercise, by the id used in `::: exercise <id> Title` in the chapters.
 * (scripts/check-content.ts reads the ids from this list.)
 */
export const exercises: Record<string, ExerciseDef> = {
  // Chapter 1
  'evens-checker': { kind: 'code', Widget: codeExercise(code.EVENS_CHECKER) },
  'liar-order': { kind: 'order', Widget: orderExercise(proofs.LIAR, 11) },
  // Chapter 2
  'not-in-list': { kind: 'code', Widget: codeExercise(code.NOT_IN_LIST) },
  'cantor-order': { kind: 'order', Widget: orderExercise(proofs.CANTOR, 21) },
  // Chapter 3
  'lawvere-order': { kind: 'order', Widget: orderExercise(proofs.LAWVERE, 7) },
  'russell-order': { kind: 'order', Widget: orderExercise(proofs.RUSSELL, 31) },
  // Chapter 4
  'finite-halts': { kind: 'code', Widget: codeExercise(code.FINITE_HALTS) },
  'invariant-order': { kind: 'order', Widget: orderExercise(proofs.INVARIANT, 41) },
  // Chapter 5
  'race-decider': { kind: 'code', Widget: codeExercise(code.RACE_DECIDER) },
  'dovetail': { kind: 'code', Widget: codeExercise(code.DOVETAIL) },
  'post-order': { kind: 'order', Widget: orderExercise(proofs.POST, 51) },
  // Chapter 6
  'troll': { kind: 'code', Widget: codeExercise(code.TROLL) },
  'halting-order': { kind: 'order', Widget: orderExercise(proofs.HALTING, 61) },
  // Chapter 7
  'classify-systems': { kind: 'code', Widget: codeExercise(code.CLASSIFY) },
  'sound-consistent-order': { kind: 'order', Widget: orderExercise(proofs.SOUND_CONSISTENT, 71) },
  // Chapter 8
  'complete-decider': { kind: 'code', Widget: codeExercise(code.COMPLETE_DECIDER) },
  'take-one-order': { kind: 'order', Widget: orderExercise(proofs.TAKE_ONE, 81) },
  // Chapter 9
  'godel-program': { kind: 'code', Widget: codeExercise(code.GODEL_PROGRAM) },
  'godel-order': { kind: 'order', Widget: orderExercise(proofs.GODEL, 91) },
  // Chapter 10
  'rosser-program': { kind: 'code', Widget: codeExercise(code.ROSSER_PROGRAM) },
  'rosser-order': { kind: 'order', Widget: orderExercise(proofs.ROSSER, 101) },
  // Chapter 11
  'second-order': { kind: 'order', Widget: orderExercise(proofs.SECOND, 111) },
  'not-con-order': { kind: 'order', Widget: orderExercise(proofs.NOT_CON, 113) },
  // Chapter 12
  'big-picture-order': { kind: 'order', Widget: orderExercise(proofs.BIG_PICTURE, 121) },
}
