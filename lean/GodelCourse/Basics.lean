/-!
# Chapter 1: Lean as a formal system

Statements are `Prop`s, and proofs are values that Lean's checker accepts.
Snippets between `-- #snippet name` and `-- #end` are shown in the course.
-/

namespace Basics

-- #snippet tiny_theorem
theorem two_plus_two : 2 + 2 = 4 := rfl
-- #end

-- #snippet exists_proof
/-- "Some natural number squares to 49." The proof names the number, 7,
    and Lean checks that 7 * 7 really is 49. -/
theorem seven_squared : ∃ n : Nat, n * n = 49 := ⟨7, rfl⟩
-- #end

-- #snippet no_liar
/-- No statement can be equivalent to its own negation. -/
theorem no_liar (P : Prop) : ¬ (P ↔ ¬ P) := by
  intro h                          -- suppose P ↔ ¬ P
  have hnp : ¬ P := by             -- step 1: P is false ...
    intro hp                       --   (if P were true,
    exact (h.mp hp) hp             --    then ¬ P too: contradiction)
  exact hnp (h.mpr hnp)            -- step 2: ... so ¬ P gives P: contradiction
-- #end

end Basics
