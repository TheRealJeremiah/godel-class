/-!
# Chapter 7 (part): listing every proof

Every proof is a string of bits, and we can list all bit strings.
So a program can search through every proof, one by one.
-/

namespace Enumerate

-- #snippet nth_string
/-- The `n`-th bit string: [], [false], [true], [false,false], [true,false], ... -/
def nthString : Nat → List Bool
  | 0     => []
  | n + 1 => (n % 2 == 1) :: nthString (n / 2)

/-- Where a string appears in the list. -/
def indexOf : List Bool → Nat
  | []     => 0
  | b :: s => 2 * indexOf s + (if b then 2 else 1)
-- #end

-- #snippet every_string_listed
theorem nthString_indexOf (s : List Bool) : nthString (indexOf s) = s := by
  induction s with
  | nil => simp [indexOf, nthString]
  | cons b s ih =>
    cases b
    · have h : indexOf (false :: s) = (2 * indexOf s) + 1 := by simp [indexOf]
      rw [h, nthString]
      have h1 : (2 * indexOf s) % 2 = 0 := by omega
      have h2 : (2 * indexOf s) / 2 = indexOf s := by omega
      simp [h1, h2, ih]
    · have h : indexOf (true :: s) = (2 * indexOf s + 1) + 1 := by simp [indexOf]
      rw [h, nthString]
      have h1 : (2 * indexOf s + 1) % 2 = 1 := by omega
      have h2 : (2 * indexOf s + 1) / 2 = indexOf s := by omega
      simp [h1, h2, ih]

/-- Every bit string appears somewhere in the list. -/
theorem every_string_listed (s : List Bool) : ∃ n, nthString n = s :=
  ⟨indexOf s, nthString_indexOf s⟩
-- #end

section Search

variable {Stmt : Type} [DecidableEq Stmt]

-- #snippet search
/-- `check proof` returns the statement a proof proves, or `none` for nonsense. -/
def ProvableBy (check : List Bool → Option Stmt) (stmt : Stmt) : Prop :=
  ∃ proof, check proof = some stmt

/-- Try the first `fuel` strings as proofs of `stmt`. -/
def searchUpTo (check : List Bool → Option Stmt) (stmt : Stmt) : Nat → Bool
  | 0        => false
  | fuel + 1 => searchUpTo check stmt fuel || check (nthString fuel) == some stmt
-- #end

theorem searchUpTo_sound (check : List Bool → Option Stmt) (stmt : Stmt) :
    ∀ fuel, searchUpTo check stmt fuel = true → ProvableBy check stmt := by
  intro fuel
  induction fuel with
  | zero => intro h; simp [searchUpTo] at h
  | succ n ih =>
    intro h
    simp only [searchUpTo, Bool.or_eq_true, beq_iff_eq] at h
    rcases h with h | h
    · exact ih h
    · exact ⟨nthString n, h⟩

-- #snippet search_spec
/-- Searching eventually succeeds exactly when a proof exists. -/
theorem search_finds_proof (check : List Bool → Option Stmt) (stmt : Stmt) :
    (∃ fuel, searchUpTo check stmt fuel = true) ↔ ProvableBy check stmt := by
  constructor
  · intro ⟨fuel, h⟩
    exact searchUpTo_sound check stmt fuel h
  · intro ⟨proof, hp⟩
    refine ⟨indexOf proof + 1, ?_⟩
    simp [searchUpTo, nthString_indexOf, hp]
-- #end

end Search

end Enumerate
