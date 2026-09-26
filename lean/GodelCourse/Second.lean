import GodelCourse.Incompleteness

/-!
# Chapter 10: The second incompleteness theorem

If S can follow our proof of the first theorem, S can't prove it is consistent.
-/

-- #snippet logical_system
/-- A formal system with implication, modus ponens,
    and a sentence `Con` that says "S is consistent". -/
structure LogicalSystem (M : Computer) extends FormalSystem M where
  imp : Stmt → Stmt → Stmt
  modus_ponens : ∀ φ ψ, Provable (imp φ ψ) → Provable φ → Provable ψ
  Con : Stmt
-- #end

namespace LogicalSystem

variable {M : Computer} (S : LogicalSystem M)

-- #snippet second
/-- Gödel's second incompleteness theorem.
    `formalized_first` says: S itself can prove "if I'm consistent,
    then the Gödel sentence holds" — i.e. S can follow chapter 8. -/
theorem second_incompleteness (E : S.Effective)
    (hcon : S.Consistent) (hph : S.ProvesHalting)
    (formalized_first : S.Provable (S.imp S.Con (S.godelSentence E))) :
    ¬ S.Provable S.Con := by
  intro hConProof                                  -- suppose S proves Con
  have hG : S.Provable (S.godelSentence E) :=
    S.modus_ponens _ _ formalized_first hConProof  -- then S proves G ...
  exact (S.godel_first E hcon hph).1 hG            -- ... but G is unprovable!
-- #end

end LogicalSystem
