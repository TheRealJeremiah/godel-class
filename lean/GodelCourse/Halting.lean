import GodelCourse.Machines
import GodelCourse.Basics

/-!
# Chapter 5: The halting problem

Turing's troll turns any would-be halting tester into a counterexample.
-/

namespace Computer

variable (M : Computer)

-- #snippet halts_on_self
/-- Does program `x` halt when fed its own source code? -/
def HaltsOnSelf (x : Code) : Prop := M.Halts x x
-- #end

-- #snippet has_troll
/-- Our computer can build Turing's troll out of any program `d`:
      function troll(x) {
        if (d(x)) { while (true) {} }   // d says yes: loop forever
        return true;                    // d says no: halt
      }                                                          -/
structure HasTroll where
  troll : Code → Code
  loops_if_yes : ∀ d x, M.run d x = .returns true  → M.run (troll d) x = .loops
  halts_if_no  : ∀ d x, M.run d x = .returns false → M.run (troll d) x = .returns true
-- #end

-- #snippet halting_problem
/-- No program decides whether programs halt on their own source. -/
theorem halting_problem (T : M.HasTroll) :
    ¬ ∃ d, M.Decides d M.HaltsOnSelf := by
  intro ⟨d, hd⟩                         -- suppose d is a perfect tester
  let t := T.troll d                    -- build the troll from d
  by_cases h : M.HaltsOnSelf t          -- does the troll halt on itself?
  · -- yes: then d says `true`, so the troll loops. Contradiction!
    have loops : M.run t t = .loops := T.loops_if_yes d t ((hd t).1 h)
    exact h loops
  · -- no: then d says `false`, so the troll halts. Contradiction!
    have halts : M.run t t = .returns true := T.halts_if_no d t ((hd t).2 h)
    exact h (M.halts_of_returns halts)
-- #end

-- #snippet troll_iff
/-- The heart of it: if `d` decides `HaltsOnSelf`, the troll gives a liar. -/
theorem troll_is_a_liar (T : M.HasTroll) (d : Code)
    (hd : M.Decides d M.HaltsOnSelf) :
    M.HaltsOnSelf (T.troll d) ↔ ¬ M.HaltsOnSelf (T.troll d) := by
  constructor
  · intro h h'
    exact h' (T.loops_if_yes d _ ((hd _).1 h))
  · intro h
    exact M.halts_of_returns (T.halts_if_no d _ ((hd _).2 h))
-- #end

-- #snippet halting_via_liar
/-- The same theorem, in one line, straight from the liar lemma. -/
theorem halting_problem' (T : M.HasTroll) :
    ¬ ∃ d, M.Decides d M.HaltsOnSelf :=
  fun ⟨d, hd⟩ => Basics.no_liar _ (M.troll_is_a_liar T d hd)
-- #end

end Computer
