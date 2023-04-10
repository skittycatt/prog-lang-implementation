Current language plan: Keep S-expression style syntax. Adding classes, static typing, and (???).

Current language specs:

### Syntax

```
x, f are identifiers; n is a number; b is a boolean; s is a string

t ::= Nat | Float | Bool | Str | (-> t1 t2) | (Rec f1 t1 ... fk tk)

e ::= x | n | b | "s"
    | (lambda (x t) e)
    | (not e)
    | (+ e1 e2) | (- e1 e2) | (/ e1 e2) | (* e1 e2)
    | (= e1 e2)
    | (and e1 e2) | (or e1 e2)
    | (if e1 e2 e3)
    | (e1 e2)
    | (rec f1 e1 ... fk ek)
    | (field e f)

v ::= n | b | "s" | (lambda (x t) e) | (rec f1 v1 ... fk vk)

s ::= (print e) (define x e)

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

σ; e ⇓ (rec f1 v1 ... f v ... fk vk)
---------------------
σ; (field e f) ⇓ v


```

### Typechecking

```
Γ is the typechecking context

x:t ∈ Γ
---------
Γ ⊢ x : t

----------
Γ ⊢ n : Nat | Float

----------
Γ ⊢ b : Bool

----------
Γ ⊢ "s": String

x:t1, Γ ⊢ e : t2
-------------------
Γ ⊢ (lambda (x t1) e) : (-> t1 t2)

Γ ⊢ e : Bool
--------------
Γ ⊢ (not e) : Bool

Γ ⊢ e1 : Nat
Γ ⊢ e2 : Nat
---------------
Γ ⊢ (+ e1 e2) : Nat

Γ ⊢ e1 : Nat | Float
Γ ⊢ e2 : Nat | Float
--------------
Γ ⊢ (+ e1 e2) : Float

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

Γ ⊢ ek : tk
------------------
Γ ⊢ (rec f1 e1 ... fk ek) : (Rec f1 t1 ... fk tk)

Γ ⊢ e : (Rec f1 t1 ... f t ... fk tk)
-------------------------
Γ ⊢ (field e f) : t

```
