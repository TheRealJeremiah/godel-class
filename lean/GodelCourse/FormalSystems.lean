import GodelCourse.Recognize

/-!
# Chapter 7: Formal systems

A formal system is anything that proves statements: Lean, ZFC, Peano arithmetic...
We only need to know a few things about it.
-/

-- #snippet formal_system
/-- A formal system that can talk about the programs of computer `M`. -/
structure FormalSystem (M : Computer) where
  /-- The statements it can make. -/
  Stmt : Type
  /-- Which statements it can prove. -/
  Provable : Stmt → Prop
  /-- Negation: `neg s` is the statement "not s". -/
  neg : Stmt → Stmt
  /-- `halts p x` is the statement "program p halts on input x". -/
  halts : Code → Code → Stmt
-- #end

namespace FormalSystem

variable {M : Computer} (S : FormalSystem M)

-- #snippet consistent_complete
/-- Never proves a statement and its negation. -/
def Consistent : Prop :=
  ∀ stmt, ¬ (S.Provable stmt ∧ S.Provable (S.neg stmt))

/-- Proves or disproves every statement. -/
def Complete : Prop :=
  ∀ stmt, S.Provable stmt ∨ S.Provable (S.neg stmt)
-- #end

-- #snippet sound
/-- Never lies about halting. -/
def Sound : Prop :=
  ∀ p x, (S.Provable (S.halts p x) → M.Halts p x) ∧
         (S.Provable (S.neg (S.halts p x)) → ¬ M.Halts p x)
-- #end

-- #snippet proves_halting
/-- Can confirm any computation that halts (by, in effect, running it). -/
def ProvesHalting : Prop :=
  ∀ p x, M.Halts p x → S.Provable (S.halts p x)
-- #end

-- #snippet effective
/-- A program can search through S's proofs. In particular, this one:
      findLoopProof(x): halts iff S proves "x doesn't halt on x"        -/
structure Effective where
  findLoopProof : Code
  findLoopProof_spec :
    M.Recognizes findLoopProof (fun x => S.Provable (S.neg (S.halts x x)))
-- #end

-- #snippet sound_consistent
/-- A sound system can't contradict itself about halting. -/
theorem sound_no_halting_contradiction (hs : S.Sound) (p x : Code) :
    ¬ (S.Provable (S.halts p x) ∧ S.Provable (S.neg (S.halts p x))) := by
  intro ⟨hyes, hno⟩
  exact (hs p x).2 hno ((hs p x).1 hyes)
-- #end

end FormalSystem
