import GodelCourse.Halting
import GodelCourse.FormalSystems

/-!
# Chapters 7–8: Gödel's first incompleteness theorem

Take one: a complete, sound system would solve the halting problem.
Take two: an explicit sentence that says "I am not provable".
-/

namespace Computer

variable (M : Computer)

-- #snippet has_race
/-- Our computer can race two programs, step by step, on the same input
    and report which one finishes. (If both would finish we promise nothing.) -/
structure HasRace where
  race : Code → Code → Code
  left_wins  : ∀ p q x, M.Halts p x → ¬ M.Halts q x →
    M.run (race p q) x = .returns true
  right_wins : ∀ p q x, ¬ M.Halts p x → M.Halts q x →
    M.run (race p q) x = .returns false
-- #end

end Computer

namespace FormalSystem

variable {M : Computer} (S : FormalSystem M)

-- #snippet take_one
/-- Take one: a sound, effective system can't be complete —
    otherwise racing its proof searches would solve the halting problem. -/
theorem incomplete_via_halting (T : M.HasTroll) (R : M.HasRace)
    (E : S.Effective) (hsound : S.Sound) : ¬ S.Complete := by
  intro hcomplete
  apply M.halting_problem T
  -- the would-be halting tester:
  refine ⟨R.race E.findHaltProof E.findLoopProof, fun x => ⟨?_, ?_⟩⟩
  · intro hx                                  -- x halts on x
    have no_loop_proof : ¬ S.Provable (S.neg (S.halts x x)) :=
      fun h => (hsound x x).2 h hx
    have halt_proof : S.Provable (S.halts x x) :=
      (hcomplete _).resolve_right no_loop_proof
    exact R.left_wins _ _ x
      ((E.findHaltProof_spec x).2 halt_proof)
      (fun h => no_loop_proof ((E.findLoopProof_spec x).1 h))
  · intro hx                                  -- x loops on x
    have no_halt_proof : ¬ S.Provable (S.halts x x) :=
      fun h => hx ((hsound x x).1 h)
    have loop_proof : S.Provable (S.neg (S.halts x x)) :=
      (hcomplete _).resolve_left no_halt_proof
    exact R.right_wins _ _ x
      (fun h => no_halt_proof ((E.findHaltProof_spec x).1 h))
      ((E.findLoopProof_spec x).2 loop_proof)
-- #end

-- #snippet godel_def
/-- Gödel's program: given x, search for a proof that "x loops on x". -/
def godelProgram (E : S.Effective) : Code := E.findLoopProof

/-- Gödel's sentence: "the Gödel program loops when run on itself". -/
def godelSentence (E : S.Effective) : S.Stmt :=
  S.neg (S.halts (S.godelProgram E) (S.godelProgram E))
-- #end

-- #snippet godel_key
/-- The key fact: the Gödel program halts on itself
    exactly when the Gödel sentence is provable. -/
theorem godel_key (E : S.Effective) :
    M.Halts (S.godelProgram E) (S.godelProgram E) ↔
      S.Provable (S.godelSentence E) :=
  E.findLoopProof_spec (S.godelProgram E)
-- #end

-- #snippet godel_sound
/-- If S is sound, the Gödel sentence is true ... -/
theorem godel_true (E : S.Effective) (hsound : S.Sound) :
    ¬ M.Halts (S.godelProgram E) (S.godelProgram E) := by
  intro hhalts
  have hprov := (S.godel_key E).mp hhalts        -- so S proves "g loops on g"
  exact (hsound _ _).2 hprov hhalts              -- S lied. But S is sound!

/-- ... but not provable. -/
theorem godel_unprovable (E : S.Effective) (hsound : S.Sound) :
    ¬ S.Provable (S.godelSentence E) := by
  intro hprov
  exact S.godel_true E hsound ((S.godel_key E).mpr hprov)
-- #end

-- #snippet godel_independent
/-- Neither "g halts on g" nor its negation is provable in a sound system. -/
theorem first_incompleteness_sound (E : S.Effective) (hsound : S.Sound) :
    ∃ φ, ¬ S.Provable φ ∧ ¬ S.Provable (S.neg φ) := by
  let g := S.godelProgram E
  refine ⟨S.halts g g, ?_, S.godel_unprovable E hsound⟩
  intro hprov                                    -- S proves "g halts on g"
  exact S.godel_true E hsound ((hsound g g).1 hprov)
-- #end

-- #snippet godel_consistent
/-- Gödel's first incompleteness theorem, consistency version:
    if S is consistent and can confirm halting computations,
    the Gödel sentence is true and unprovable. -/
theorem godel_first (E : S.Effective)
    (hcon : S.Consistent) (hph : S.ProvesHalting) :
    ¬ S.Provable (S.godelSentence E) ∧
      ¬ M.Halts (S.godelProgram E) (S.godelProgram E) := by
  let g := S.godelProgram E
  have unprovable : ¬ S.Provable (S.godelSentence E) := by
    intro hprov                                  -- S proves "g loops on g"
    have hhalts : M.Halts g g := (S.godel_key E).mpr hprov  -- so g halts on g
    have hprov2 : S.Provable (S.halts g g) := hph g g hhalts -- S confirms it
    exact hcon _ ⟨hprov2, hprov⟩                 -- S proved φ and ¬ φ
  exact ⟨unprovable, fun h => unprovable ((S.godel_key E).mp h)⟩
-- #end

end FormalSystem
