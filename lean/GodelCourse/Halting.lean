import GodelCourse.Recognize
import GodelCourse.Basics

/-!
# Chapter 6: The halting problem

Turing's troll turns any would-be halting tester into a counterexample.
Then, with Post's theorem: halting is recognizable, so looping is not.
-/

namespace Computer

variable {M : Computer}

-- #snippet halts_on_self
/-- Does program `x` halt when fed its own source code? -/
def HaltsOnSelf (M : Computer) (x : Code) : Prop := M.Halts x x
-- #end

-- #snippet troll_def
/-- Turing's troll, built from a would-be tester `d`: it asks `d` about its
    input and does the opposite. It's exactly `haltIfNo d` from chapter 5:
      function troll(x) { if (d(x)) while (true) {} }                    -/
def troll (G : M.HasGuards) (d : Code) : Code := G.haltIfNo d
-- #end

-- #snippet troll_iff
/-- If `d` really decides `HaltsOnSelf`, the troll halts on itself
    exactly when it doesn't. -/
theorem troll_is_a_liar (G : M.HasGuards) (d : Code)
    (hd : M.Decides d M.HaltsOnSelf) :
    M.HaltsOnSelf (troll G d) ↔ ¬ M.HaltsOnSelf (troll G d) := by
  constructor
  · -- if the troll halts on itself, d says "yes", so the troll loops
    intro h h'
    exact h' (G.haltIfNo_yes d _ ((hd _).1 h))
  · -- if the troll loops on itself, d says "no", so the troll halts
    intro h
    exact G.haltIfNo_no d _ ((hd _).2 h)
-- #end

-- #snippet halting_problem
/-- The halting problem: no program decides whether programs halt on themselves. -/
theorem halting_problem (G : M.HasGuards) : ¬ M.IsDecidable M.HaltsOnSelf :=
  fun ⟨d, hd⟩ => Basics.no_liar _ (troll_is_a_liar G d hd)
-- #end

-- #snippet has_self_runner
/-- Our computer has an interpreter that runs its input on itself:
      function selfRun(x) { run(x, x) }                                   -/
structure HasSelfRunner (M : Computer) where
  selfRun : Code
  selfRun_spec : ∀ x, M.Halts selfRun x ↔ M.Halts x x
-- #end

-- #snippet looping_not_recognizable
/-- Halting is recognizable: just run it. -/
theorem halting_recognizable (U : HasSelfRunner M) :
    M.IsRecognizable M.HaltsOnSelf :=
  ⟨U.selfRun, U.selfRun_spec⟩

/-- So, by Post's theorem, looping can't be recognizable. -/
theorem looping_not_recognizable (G : M.HasGuards) (R : M.HasRace)
    (U : HasSelfRunner M) :
    ¬ M.IsRecognizable (fun x => ¬ M.HaltsOnSelf x) := by
  intro hloop
  exact halting_problem G (decidable_of_both R (halting_recognizable U) hloop)
-- #end

end Computer
