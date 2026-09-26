import GodelCourse.Basics

/-!
# Chapters 2–3: Diagonalization and Lawvere's fixed-point theorem

Cantor's trick: flip the diagonal of any table to get a row that is not in it.
Lawvere's fixed point theorem packages the trick once and for all.
-/

namespace Diagonal

-- #snippet diag_def
/-- Row `n` of the table is `table n`. Flip the diagonal entry of every row. -/
def diag (table : Nat → Nat → Bool) : Nat → Bool :=
  fun n => !(table n n)
-- #end

-- #snippet cantor
theorem diag_not_a_row (table : Nat → Nat → Bool) (n : Nat) :
    table n ≠ diag table := by
  intro h                               -- h : table n = diag table
  have hn := congrFun h n               -- table n n = diag table n
  simp [diag] at hn                     -- table n n = !(table n n) is absurd

/-- No list of infinite bit-streams contains every stream. -/
theorem cantor (table : Nat → Nat → Bool) :
    ∃ g : Nat → Bool, ∀ n, table n ≠ g :=
  ⟨diag table, diag_not_a_row table⟩
-- #end

-- #snippet lawvere
/-- Lawvere: if every function `A → B` appears as a row of `e`,
    then every `f : B → B` has a fixed point. -/
theorem lawvere {A B : Type} (e : A → A → B)
    (every_row : ∀ g : A → B, ∃ a, e a = g) (f : B → B) :
    ∃ b, f b = b := by
  obtain ⟨a, ha⟩ := every_row (fun x => f (e x x))   -- the diagonal row
  exact ⟨e a a, (congrFun ha a).symm⟩                -- plug in a itself
-- #end

-- #snippet cantor_again
/-- `not` has no fixed point, so Lawvere gives Cantor for free. -/
theorem cantor_again {A : Type} (e : A → A → Bool) :
    ¬ ∀ g : A → Bool, ∃ a, e a = g := by
  intro every_row
  obtain ⟨b, hb⟩ := lawvere e every_row (fun b => !b)
  cases b <;> simp at hb
-- #end

-- #snippet no_property_list
/-- Negation has no fixed point either (that's the liar lemma), so no table
    lists every property of `A`s. This is the shape of Russell's paradox. -/
theorem no_list_of_all_properties {A : Type} (e : A → A → Prop) :
    ¬ ∀ P : A → Prop, ∃ a, e a = P := by
  intro every_row
  obtain ⟨b, hb⟩ := lawvere e every_row Not     -- hb : ¬ b = b
  exact Basics.no_liar b (by rw [hb])           -- so b ↔ ¬ b, impossible
-- #end

end Diagonal
