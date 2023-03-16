/***** Abstract Syntax Tree ***************************************************/

// Types

export type TyNat = { tag: 'nat' }
export const tynat: Typ = ({ tag: 'nat' })

export type TyFloat = { tag: 'float' }
export const tyfloat: Typ = ({ tag: 'float' })

export type TyBool = { tag: 'bool' }
export const tybool: Typ = ({ tag: 'bool' })

export type TyArr = { tag: 'arr', t1: Typ, t2: Typ }
export const tyarr = (t1: Typ, t2: Typ): Typ => ({ tag: 'arr', t1, t2 })

export type TyStr = { tag: 'string' }
export const tystr: Typ = ({ tag: 'string' })

export type Typ = TyNat | TyBool | TyArr | TyFloat | TyStr 

// Expressions

export type Var = { tag: 'var', value: string }
export const evar = (value: string): Var => ({ tag: 'var', value })

export type Num = { tag: 'num', numtype: Typ, value: number }
export const num = (numtype: Typ, value: number): Num => ({ tag: 'num', numtype, value })

export type Bool = { tag: 'bool', value: boolean }
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })

export type SString = { tag: 'string', value: string }
export const sstring = (value: string): SString => ({ tag: 'string', value })

export type Not = { tag: 'not', e1: Exp }
export const not = (e1: Exp): Exp => ({ tag: 'not', e1 })

export type Plus = { tag: 'plus', e1: Exp, e2: Exp }
export const plus = (e1: Exp, e2: Exp): Exp => ({ tag: 'plus', e1, e2 })

export type Eq = { tag: 'eq', e1: Exp, e2: Exp }
export const eq = (e1: Exp, e2: Exp): Exp => ({ tag: 'eq', e1, e2 })

export type And = { tag: 'and', e1: Exp, e2: Exp }
export const and = (e1: Exp, e2: Exp): Exp => ({ tag: 'and', e1, e2 })

export type Or = { tag: 'or', e1: Exp, e2: Exp }
export const or = (e1: Exp, e2: Exp): Exp => ({ tag: 'or', e1, e2 })

export type If = { tag: 'if', e1: Exp, e2: Exp, e3: Exp }
export const ife = (e1: Exp, e2: Exp, e3: Exp): Exp =>
  ({ tag: 'if', e1, e2, e3 })

export type SLambda = { tag: 'lambda', value: string, t: Typ, e1: Exp }
export const slambda = (value: string, t: Typ, e1: Exp): SLambda => 
  ({ tag: 'lambda', value, t, e1 })

export type App = { tag: 'app', e1: Exp, e2: Exp }
export const app = (e1: Exp, e2: Exp): Exp => ({ tag: 'app', e1, e2 })

export type Exp = Var | Num | Bool | Not | Plus | Eq | And | Or | If | SLambda | App | SString

// Values

export type Value = Num | Bool | SLambda | SString

// Statements

export type SDefine = { tag: 'define', id: string, exp: Exp }
export const sdefine = (id: string, exp: Exp): Stmt => ({ tag: 'define', id, exp })

export type SPrint = { tag: 'print', exp: Exp }
export const sprint = (exp: Exp): Stmt => ({ tag: 'print', exp })

export type Stmt = SDefine | SPrint

// Programs

export type Prog = Stmt[]

/***** Pretty-printer *********************************************************/

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'var': return `${e.value}`
    case 'num': return `${e.value}`
    case 'bool': return e.value ? 'true' : 'false'
    case 'string': return e.value
    case 'not': return `(not ${prettyExp(e.e1)})`
    case 'plus': return `(+ ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'eq': return `(= ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'and': return `(and ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'or': return `(or ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
    case 'if': return `(if ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'lambda': return `(lambda (${e.value} ${e.t.tag}) ${prettyExp(e.e1)})`
    case 'app': return `(${prettyExp(e.e1)} ${prettyExp(e.e2)})`
  }
}

/** @returns a pretty version of the type `t`. */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'nat': 
    case 'bool': 
    case 'arr': 
    case 'float': 
    case 'string': 
      return t.tag
  }
}

/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'define': return `(define ${s.id} ${prettyExp(s.exp)})`
    case 'print': return `(print ${prettyExp(s.exp)})`
  }
}

/***** Equality ***************************************************************/

/** @returns true iff t1 and t2 are equivalent types */
export function typEquals (t1: Typ, t2: Typ): boolean {
  // N.B., this could be collapsed into a single boolean expression. But we
  // maintain this more verbose form because you will want to follow this
  // pattern of (a) check the tags and (b) recursively check sub-components
  // if/when you add additional types to the language.
  switch(t1.tag) {
    case 'arr':
      if (t2.tag === 'arr') {
      return typEquals(t1.t1, t2.t1) && typEquals(t1.t2, t2.t2)
      } else return false
    case 'nat':
    case 'bool':
    case 'float':
    case 'string':
      return (t1.tag === t2.tag) ? true : false
  }
}

/***** Environments and Contexts **********************************************/

/** A runtime environment maps names of variables to their bound variables. */
export type Env = Map<string, Value>

/** @returns a copy of `env` with the additional binding `x:v` */
export function extendEnv(x: string, v: Value, env: Env): Env {
  const ret = new Map(env.entries())
  ret.set(x, v)
  return ret
}

/** A context maps names of variables to their types. */
export type Ctx = Map<string, Typ>

/** @returns a copy of `ctx` with the additional binding `x:t` */
export function extendCtx(x: string, t: Typ, ctx: Ctx): Ctx {
  const ret = new Map(ctx.entries())
  ret.set(x, t)
  return ret
}

/***** Substitution ***********************************************************/

/**
 * @param v the value that is being substituted
 * @param x the variable being replaced
 * @param e the expression in which substitution occurs
 * @returns `e` but with every occurrence of `x` replaced with `v`
 */
export function substitute (v: Value, x: string, e: Exp): Exp {
  switch (e.tag) {
    case 'var': return (x === e.value) ? v : e
    case 'num': 
    case 'bool': 
    case 'string': 
      return e
    case 'not': return not(substitute(v, x, e.e1))
    case 'plus': return plus(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'eq': return eq(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'and': return and(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'or': return or(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'app': return app(substitute(v, x, e.e1), substitute(v, x, e.e2))
    case 'if': return ife(substitute(v, x, e.e1), substitute(v, x, e.e2), substitute(v, x, e.e3))
    default: throw new Error('what did you break bro??? check substitute')
  }
}