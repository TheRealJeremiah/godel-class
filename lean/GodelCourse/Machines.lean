/-!
# Chapter 4: Programs as data

First a toy machine to see what "halting" means in Lean.
Then the abstract `Computer` that the rest of the course is built on.
-/

namespace Toy

-- #snippet toy_machine
/-- Run the step function `f` for `fuel` steps, starting in state `s`.
    State `0` means "halted". -/
def runFor (f : Nat → Nat) : Nat → Nat → Nat
  | 0,        s => s
  | fuel + 1, s => if s = 0 then 0 else runFor f fuel (f s)

def HaltsFrom (f : Nat → Nat) (s : Nat) : Prop :=
  ∃ fuel, runFor f fuel s = 0
-- #end

-- #snippet toy_halts
/-- Counting down from 3 halts: just run it for 3 steps and look. -/
theorem countdown_halts : HaltsFrom (fun n => n - 1) 3 := ⟨3, rfl⟩
-- #end

-- #snippet toy_loops
/-- Staying put at 5 never halts. Running it can't show this: we need induction. -/
theorem stuck_loops : ¬ HaltsFrom (fun n => n) 5 := by
  intro ⟨fuel, h⟩
  have always5 : ∀ k, runFor (fun n => n) k 5 = 5 := by
    intro k
    induction k with
    | zero => rfl
    | succ k ih => simp [runFor, ih]
  rw [always5] at h                     -- h : 5 = 0
  contradiction
-- #end

end Toy

-- #snippet result
/-- What can happen when you run a program: it loops forever,
    or it returns an answer. -/
inductive Result where
  | loops
  | returns (answer : Bool)
deriving DecidableEq
-- #end

-- #snippet code_computer
/-- Programs, and their inputs, are source code strings. -/
abbrev Code := String

/-- A computer knows what every program does on every input.
    (`run` is a mathematical description, not something Lean executes.) -/
structure Computer where
  run : Code → Code → Result
-- #end

namespace Computer

variable (M : Computer)

-- #snippet halts_decides
/-- `p` halts on input `x`. -/
def Halts (p x : Code) : Prop := M.run p x ≠ .loops

/-- `d` is a bug-free yes/no tester for the property `P`. -/
def Decides (d : Code) (P : Code → Prop) : Prop :=
  ∀ x, (P x → M.run d x = .returns true) ∧
       (¬ P x → M.run d x = .returns false)

/-- `r` halts on exactly the inputs with property `P`
    (it may loop forever on the others). -/
def Recognizes (r : Code) (P : Code → Prop) : Prop :=
  ∀ x, M.Halts r x ↔ P x
-- #end

-- #snippet returns_halts
theorem halts_of_returns {p x : Code} {b : Bool}
    (h : M.run p x = .returns b) : M.Halts p x := by
  intro hl                              -- hl : M.run p x = .loops
  rw [h] at hl                          -- hl : .returns b = .loops
  contradiction
-- #end

end Computer
