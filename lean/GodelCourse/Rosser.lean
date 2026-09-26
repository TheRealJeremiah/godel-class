import GodelCourse.Incompleteness

/-!
# Chapter 9: Rosser's trick

Gödel's sentence needs more than consistency to be *unrefutable*.
Rosser's program races a proof against a disproof, and needs only consistency.
-/

-- #snippet rosser_system
/-- A formal system that can also talk about what programs *return*. -/
structure RosserSystem (M : Computer) extends FormalSystem M where
  /-- `says p x b` is the statement "program p, run on input x, returns b". -/
  says : Code → Code → Bool → Stmt
-- #end

namespace RosserSystem

variable {M : Computer} (S : RosserSystem M)

-- #snippet proves_outputs
/-- S can check finished computations: if p really returns b on x,
    S proves "p returns b on x" and "p doesn't return !b on x". -/
def ProvesOutputs : Prop :=
  ∀ p x b, M.run p x = .returns b →
    S.Provable (S.says p x b) ∧ S.Provable (S.neg (S.says p x (!b)))
-- #end

-- #snippet rosser_effective
/-- Proof search for statements about what programs say about themselves:
      findYes(x):  halts iff S proves   "x says true on x"
      findNo(x):   halts iff S proves "¬ x says true on x"                -/
structure Effective where
  findYes : Code
  findNo  : Code
  findYes_spec : M.Recognizes findYes (fun x => S.Provable (S.says x x true))
  findNo_spec  : M.Recognizes findNo  (fun x => S.Provable (S.neg (S.says x x true)))
-- #end

-- #snippet rosser_program
/-- Rosser's program: race a disproof of "x says true on x"
    against a proof of it, and do the opposite of whatever S finds first.
      disproof found first → return true
      proof found first    → return false                                  -/
def rosserProgram (R : M.HasRace) (E : S.Effective) : Code :=
  R.race E.findNo E.findYes

/-- Rosser's sentence: "Rosser's program says true about itself". -/
def rosserSentence (R : M.HasRace) (E : S.Effective) : S.Stmt :=
  S.says (S.rosserProgram R E) (S.rosserProgram R E) true
-- #end

-- #snippet rosser
/-- Gödel–Rosser: a consistent, effective system that checks computations
    can neither prove nor disprove Rosser's sentence. -/
theorem rosser (R : M.HasRace) (E : S.Effective)
    (hcon : S.Consistent) (hout : S.ProvesOutputs) :
    ¬ S.Provable (S.rosserSentence R E) ∧
    ¬ S.Provable (S.neg (S.rosserSentence R E)) := by
  let ρ := S.rosserProgram R E
  constructor
  · intro hyes                             -- suppose S proves "ρ says true"
    have hno : ¬ S.Provable (S.neg (S.rosserSentence R E)) :=
      fun hno => hcon _ ⟨hyes, hno⟩        -- consistency: no disproof
    -- so only the proof search halts, and ρ returns false ...
    have hrun : M.run ρ ρ = .returns false :=
      R.right_wins _ _ ρ
        (fun h => hno ((E.findNo_spec ρ).1 h))
        ((E.findYes_spec ρ).2 hyes)
    -- ... which S can check, disproving "ρ says true"
    exact hno (hout ρ ρ false hrun).2
  · intro hno                              -- suppose S proves "¬ ρ says true"
    have hyes : ¬ S.Provable (S.rosserSentence R E) :=
      fun hyes => hcon _ ⟨hyes, hno⟩       -- consistency: no proof
    -- so only the disproof search halts, and ρ returns true ...
    have hrun : M.run ρ ρ = .returns true :=
      R.left_wins _ _ ρ
        ((E.findNo_spec ρ).2 hno)
        (fun h => hyes ((E.findYes_spec ρ).1 h))
    -- ... which S can check, proving "ρ says true"
    exact hyes (hout ρ ρ true hrun).1
-- #end

end RosserSystem
