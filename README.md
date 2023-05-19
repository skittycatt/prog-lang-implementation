
Language implemented: S-expression syntax with heap allocation of pointers. All pointers and variables are mutable. Pointers allow for arithmetic on their stored index; as long as the pointer to be passed back is within bounds. Pointers save their bounds on instantiation using an optional size argument (default is 1). Any pointers created using pointer arithmetic inherit the bounds of the original pointer to avoid unintentionally accessing memory outside the allocated space.

Usage: Any of the expressions in the Syntax section below are considered valid inputs. The test.ts file in the test folder contains functions for running expressions given a string and can be used as a basis for forming more complex usages, including providing a non-empty environment or store.

To run the program:

`test.ts` contains sample functions for running an evaluation on a single expression, or executing a set of statements.

Current language specs:

### Syntax

```
x is an identifier; n is a number; b is a boolean; k is a keyword

t ::= Num | Bool | Str | (-> t1 t2) | Pointer | Keyword

e ::= x | n | b 
    | (lambda x t e)
    | (not e)
    | (+ e1 e2) | (- e1 e2) | (/ e1 e2) | (* e1 e2)
    | (= e1 e2)
    | (and e1 e2) | (or e1 e2)
    | (if e1 e2 e3)
    | (e1 e2)
    | (new k)
    | (new k n)
    | (deref x)

v ::= n | b | (lambda (x t) e) | p | k | undef

s ::= (print e) | (assign x e) | (define x e)

prog ::= s1 ... sk
```

### Dynamic Semantics

```
σ is the runtime environment

x:v ∈ σ
---------
σ; x ⇓ v

σ; e1 ⇓ true    σ; e2 ⇓ v
-----------------
σ; (if e1 e2 e3) ⇓ v

σ; e1 ⇓ false   σ; e3 ⇓ v
-----------------
σ; (if e1 e2 e3) ⇓ v

σ; e1 ⇓ (lambda (x t) e)
σ; e2 ⇓ v
σ; [v/x] e ⇓ v'
---------------------
σ; (e1 e2) ⇓ v'

```

### Typechecking
(The language doesn't really support typechecking at this point but I thought keeping the syntax of typing here was important)

```
Γ is the typechecking context

x:t ∈ Γ
---------
Γ ⊢ x : t

----------
Γ ⊢ n : Num

----------
Γ ⊢ b : Bool

x:t1, Γ ⊢ e : t2
-------------------
Γ ⊢ (lambda (x t1) e) : (-> t1 t2)

Γ ⊢ e : Bool
--------------
Γ ⊢ (not e) : Bool

Γ ⊢ e1 : Num
Γ ⊢ e2 : Num
---------------
Γ ⊢ (+ e1 e2) : Num

Γ ⊢ e1 : t1
Γ ⊢ e2 : t2
---------------
Γ ⊢ (= e1 e2) : Bool

Γ ⊢ e1 : Bool
Γ ⊢ e2 : Bool
---------------
Γ ⊢ (and e1 e2) : Bool

Γ ⊢ e1 : Bool
Γ ⊢ e2 : Bool
----------------
Γ ⊢ (or e1 e2) : Bool

Γ ⊢ e1 : Bool
Γ ⊢ e2 : t
Γ ⊢ e3 : t
----------------
Γ ⊢ (if e1 e2 e3) : t

Γ ⊢ e1 : (-> t1 t2)
Γ ⊢ e2 : t1
------------
Γ ⊢ (e1 e2) : t2

Γ ⊢ k : Keyword
---------------
Γ ⊢ (new k) : Pointer

Γ ⊢ x : Var
----------------
Γ ⊢ (deref x) : t

```

### Default Keyword Pointer Values

Num: 0
Bool: false
