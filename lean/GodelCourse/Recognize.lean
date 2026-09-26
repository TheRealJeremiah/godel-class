import GodelCourse.Machines

/-!
# Chapter 5: Deciding, recognizing, listing

A property of inputs is *decidable* if a program always answers it correctly,
and *recognizable* if a program halts on exactly the inputs that have it.
Post's theorem: decidable = recognizable, and its opposite is recognizable too.
-/

namespace Computer

variable (M : Computer)

-- #snippet decides_def
/-- `d` answers the yes/no question `P` correctly on every input. -/
def Decides (d : Code) (P : Code → Prop) : Prop :=
  ∀ x, (P x → M.run d x = .returns true) ∧
       (¬ P x → M.run d x = .returns false)

/-- Some program decides `P`. -/
def IsDecidable (P : Code → Prop) : Prop := ∃ d, M.Decides d P
-- #end

-- #snippet recognizes_def
/-- `r` halts on exactly the inputs with property `P`, and loops on the rest. -/
def Recognizes (r : Code) (P : Code → Prop) : Prop :=
  ∀ x, M.Halts r x ↔ P x

/-- Some program recognizes `P`. -/
def IsRecognizable (P : Code → Prop) : Prop := ∃ r, M.Recognizes r P
-- #end

-- #snippet has_guards
/-- From any yes/no program `d`, we can build two "guarded" programs:
      function haltIfYes(x) { if (!d(x)) while (true) {} }
      function haltIfNo(x)  { if ( d(x)) while (true) {} }              -/
structure HasGuards where
  haltIfYes : Code → Code
  haltIfNo  : Code → Code
  haltIfYes_yes : ∀ d x, M.run d x = .returns true  → M.Halts (haltIfYes d) x
  haltIfYes_no  : ∀ d x, M.run d x = .returns false → M.run (haltIfYes d) x = .loops
  haltIfNo_no   : ∀ d x, M.run d x = .returns false → M.Halts (haltIfNo d) x
  haltIfNo_yes  : ∀ d x, M.run d x = .returns true  → M.run (haltIfNo d) x = .loops
-- #end

-- #snippet has_race
/-- From two programs `p` and `q` we can build `race p q`, which runs both
    side by side, one step at a time, and reports which one finishes:
    `true` if `p` finishes, `false` if `q` does.
    (If both would finish, we promise nothing.) -/
structure HasRace where
  race : Code → Code → Code
  left_wins  : ∀ p q x, M.Halts p x → ¬ M.Halts q x →
    M.run (race p q) x = .returns true
  right_wins : ∀ p q x, ¬ M.Halts p x → M.Halts q x →
    M.run (race p q) x = .returns false
-- #end

variable {M}

-- #snippet decidable_recognizable
/-- A decidable property is recognizable ... -/
theorem recognizable_of_decidable (G : M.HasGuards) {P : Code → Prop}
    (h : M.IsDecidable P) : M.IsRecognizable P := by
  obtain ⟨d, hd⟩ := h
  refine ⟨G.haltIfYes d, fun x => ⟨fun hh => ?_, fun hp => ?_⟩⟩
  · -- if haltIfYes halts, d can't have said no, so P x holds
    by_cases hp : P x
    · exact hp
    · exact absurd (G.haltIfYes_no d x ((hd x).2 hp)) hh
  · exact G.haltIfYes_yes d x ((hd x).1 hp)

/-- ... and so is its opposite. -/
theorem co_recognizable_of_decidable (G : M.HasGuards) {P : Code → Prop}
    (h : M.IsDecidable P) : M.IsRecognizable (fun x => ¬ P x) := by
  obtain ⟨d, hd⟩ := h
  refine ⟨G.haltIfNo d, fun x => ⟨fun hh hp => ?_, fun hp => ?_⟩⟩
  · exact absurd (G.haltIfNo_yes d x ((hd x).1 hp)) hh
  · exact G.haltIfNo_no d x ((hd x).2 hp)
-- #end

-- #snippet decidable_of_both
/-- If both `P` and its opposite are recognizable, race the two recognizers. -/
theorem decidable_of_both (R : M.HasRace) {P : Code → Prop}
    (hyes : M.IsRecognizable P) (hno : M.IsRecognizable (fun x => ¬ P x)) :
    M.IsDecidable P := by
  obtain ⟨r1, h1⟩ := hyes
  obtain ⟨r2, h2⟩ := hno
  refine ⟨R.race r1 r2, fun x => ⟨fun hp => ?_, fun hp => ?_⟩⟩
  · -- P x: only r1 halts, so the race says true
    exact R.left_wins r1 r2 x ((h1 x).2 hp) (fun h => (h2 x).1 h hp)
  · -- not P x: only r2 halts, so the race says false
    exact R.right_wins r1 r2 x (fun h => hp ((h1 x).1 h)) ((h2 x).2 hp)
-- #end

-- #snippet post
/-- Post's theorem: decidable exactly when both it and its opposite are recognizable. -/
theorem post (G : M.HasGuards) (R : M.HasRace) (P : Code → Prop) :
    M.IsDecidable P ↔
      (M.IsRecognizable P ∧ M.IsRecognizable (fun x => ¬ P x)) :=
  ⟨fun h => ⟨recognizable_of_decidable G h, co_recognizable_of_decidable G h⟩,
   fun ⟨hyes, hno⟩ => decidable_of_both R hyes hno⟩
-- #end

end Computer
