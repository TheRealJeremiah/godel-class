/-!
# Chapters 1–2: Lean as a formal system

Statements are `Prop`s. Proofs are programs. Lean's kernel checks them.
Snippets between `-- #snippet name` and `-- #end` are shown in the course.
-/

namespace Basics

-- #snippet first_theorems
theorem two_plus_two : 2 + 2 = 4 := rfl

theorem small_check : 10 < 100 := by decide

theorem seven_squared : ∃ n : Nat, n * n = 49 := ⟨7, rfl⟩
-- #end

-- #snippet props_are_values
def claim1 : Prop := 2 + 2 = 4      -- true
def claim2 : Prop := 2 + 2 = 5      -- false, but still a Prop!
def claim3 : Prop := ∃ n : Nat, n = n + 1
-- #end

-- #snippet and_swap
theorem and_swap (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h                -- h : P ∧ Q
  exact ⟨h.2, h.1⟩       -- build the pair the other way round
-- #end

-- #snippet not_is_function
-- `¬ P` is just shorthand for `P → False`
theorem not_two_eq_three : ¬ (2 = 3) := by
  intro h                -- h : 2 = 3, and we must produce False
  contradiction          -- Lean sees 2 = 3 is impossible
-- #end

-- #snippet modus_tollens
theorem modus_tollens (P Q : Prop) (hpq : P → Q) (hnq : ¬ Q) : ¬ P := by
  intro hp               -- assume P ...
  exact hnq (hpq hp)     -- ... then Q, contradicting ¬ Q
-- #end

-- #snippet by_cases_demo
theorem excluded_middle_demo (P : Prop) : P ∨ ¬ P := by
  by_cases h : P
  · exact Or.inl h       -- case 1: h : P
  · exact Or.inr h       -- case 2: h : ¬ P
-- #end

-- #snippet iff_demo
theorem iff_demo (P Q : Prop) (h : P ↔ Q) (hq : Q) : P :=
  h.mpr hq               -- .mp goes left→right, .mpr goes right→left
-- #end

-- #snippet no_liar
/-- No statement can be equivalent to its own negation. -/
theorem no_liar (P : Prop) : ¬ (P ↔ ¬ P) := by
  intro h                          -- h : P ↔ ¬ P
  have hnp : ¬ P := by
    intro hp                       -- suppose P
    exact (h.mp hp) hp             -- then ¬ P too: contradiction
  exact hnp (h.mpr hnp)            -- but ¬ P gives P: contradiction
-- #end

-- #snippet obtain_demo
theorem exists_even_after (n : Nat) : ∃ m, m > n ∧ m % 2 = 0 := by
  refine ⟨2 * n + 2, ?_, ?_⟩       -- pick the witness, leave two goals
  · omega                          -- 2n + 2 > n
  · omega                          -- (2n + 2) % 2 = 0

theorem use_exists (h : ∃ n : Nat, n > 5) : ∃ n : Nat, n > 3 := by
  obtain ⟨n, hn⟩ := h              -- unpack the witness n and hn : n > 5
  exact ⟨n, by omega⟩
-- #end

end Basics
