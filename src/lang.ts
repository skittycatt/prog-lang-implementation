/* eslint-disable spaced-comment */

/***** Abstract Syntax Tree ***************************************************/

// Types

export type Typ = TyNum | TyBool | TyArr | TyPoi
export type TyNum = { tag: 'num' }
export type TyBool = { tag: 'bool' }
export type TyArr = { tag: 'arr', inputs: Typ[], output: Typ }
export type TyPoi = { tag: 'pointer', input: Typ }

export const tynum: Typ = ({ tag: 'num' })
export const tybool: Typ = ({ tag: 'bool' })
export const tyarr = (inputs: Typ[], output: Typ): TyArr => ({ tag: 'arr', inputs, output })
export const typoi = (input: Typ): TyPoi => ({ tag: 'pointer', input: input })

// Expressions

export type Exp = Var | Num | Bool | Lam | App | If | Neww | Deref | Keyword | Pointer_Arith
export type Var = { tag: 'var', value: string }
export type Num = { tag: 'num', value: number }
export type Bool = { tag: 'bool', value: boolean }
export type Lam = { tag: 'lam', param: string, typ: Typ, body: Exp }
export type App = { tag: 'app', head: Exp, args: Exp[] }
export type If = { tag: 'if', e1: Exp, e2: Exp, e3: Exp }
export type Neww = { tag: 'new', value: Exp, size: number }
export type Deref = { tag: 'deref', value: Exp }
export type Keyword = { tag: 'keyword', value: string }
export type Pointer_Arith = { tag: 'pointer_arith', func: string, e1: Exp, e2: Exp }

export const evar = (value: string): Var => ({ tag: 'var', value })
export const num = (value: number): Num => ({ tag: 'num', value })
export const bool = (value: boolean): Bool => ({ tag: 'bool', value })
export const lam = (param: string, typ: Typ, body: Exp): Lam => ({ tag: 'lam', param, typ, body })
export const app = (head: Exp, args: Exp[]): App => ({ tag: 'app', head, args })
export const ife = (e1: Exp, e2: Exp, e3: Exp): If => ({ tag: 'if', e1, e2, e3 })
export const neww = (value: Exp, size: number): Neww => ({ tag: 'new', value, size })
export const deref = (value: Exp): Deref => ({ tag: 'deref', value })
export const keyword = (value: string): Keyword => ({ tag: 'keyword', value: value })
export const pointer_arith = (func: string, e1: Exp, e2: Exp): Pointer_Arith => ({ tag: 'pointer_arith', func, e1, e2 })

// Values

export type Value = Num | Bool | Prim | Closure | Pointer | Undef | Keyword
export type Prim = { tag: 'prim', name: string, fn: (args: Value[]) => Value }
export type Closure = { tag: 'closure', param: string, body: Exp, env: Env }
export type Pointer = { tag: 'pointer', value: number, bounds: number[] }
export type Undef = { tag: 'undefined' }


export const prim = (name: string, fn: (args: Value[]) => Value): Prim => ({ tag: 'prim', name, fn })
export const closure = (param: string, body: Exp, env: Env): Closure => ({ tag: 'closure', param, body, env })
export const pointer = (value: number, bounds: number[]): Pointer => ({ tag: 'pointer', value, bounds })
export const undef: Undef = ({ tag: 'undefined' })

// Statements

export type Stmt = SDefine | SAssign | SPrint
export type SDefine = { tag: 'define', id: string, exp: Exp }
export type SAssign = { tag: 'assign', loc: Exp, exp: Exp }
export type SPrint = { tag: 'print', exp: Exp }

export const sdefine = (id: string, exp: Exp): SDefine => ({ tag: 'define', id, exp })
export const sassign = (loc: Exp, exp: Exp): SAssign => ({ tag: 'assign', loc, exp })
export const sprint = (exp: Exp): SPrint => ({ tag: 'print', exp })

// Programs

export type Prog = Stmt[]

/***** Runtime Environment ****************************************************/

export class Env {
  private outer?: Env
  private bindings: Map<string, Value>

  constructor (bindings?: Map<string, Value>) {
    this.bindings = bindings || new Map()
  }

  has (x: string): boolean {
    return this.bindings.has(x) || (this.outer !== undefined && this.outer.has(x))
  }

  get (x: string): Value {
    if (this.bindings.has(x)) {
      return this.bindings.get(x)!
    } else if (this.outer !== undefined) {
      return this.outer.get(x)
    } else {
      throw new Error(`Runtime error: unbound variable '${x}'`)
    }
  }

  set (x: string, v: Value): void {
    if (this.bindings.has(x)) {
      throw new Error(`Runtime error: redefinition of variable '${x}'`)
    } else {
      this.bindings.set(x, v)
    }
  }

  update (x: string, v: Value): void {
    this.bindings.set(x, v)
    if (this.bindings.has(x)) {
      this.bindings.set(x, v)
    } else if (this.outer !== undefined) {
      return this.outer.update(x, v)
    } else {
      throw new Error(`Runtime error: unbound variable '${x}'`)
    }
  }

  extend1 (x: string, v: Value): Env {
    const ret = new Env()
    ret.outer = this
    ret.bindings = new Map([[x, v]])
    return ret
  }
}

/***** Typechecking Context ***************************************************/

/** A context maps names of variables to their types. */
export type Ctx = Map<string, Typ>

/** @returns a copy of `ctx` with the additional binding `x:t` */
export function extendCtx(x: string, t: Typ, ctx: Ctx): Ctx {
  const ret = new Map(ctx.entries())
  ret.set(x, t)
  return ret
}

/***** Pretty-printer *********************************************************/

/** @returns a pretty version of the expression `e`, suitable for debugging. */
export function prettyExp (e: Exp): string {
  switch (e.tag) {
    case 'var':
    case 'num':
    case 'keyword': return `${e.value}`
    case 'bool': return e.value ? 'true' : 'false'
    case 'lam': return `(lambda ${e.param} ${prettyTyp(e.typ)} ${prettyExp(e.body)})`
    case 'app': return `(${prettyExp(e.head)} ${e.args.map(prettyExp).join(' ')})`
    case 'if': return `(if ${prettyExp(e.e1)} ${prettyExp(e.e2)} ${prettyExp(e.e3)})`
    case 'new': return `(neww ${prettyExp(e.value)} ${e.size})`
    case 'deref': return `(deref ${prettyExp(e.value)})`
    case 'pointer_arith': return `(pointer_arith ${e.func} ${prettyExp(e.e1)} ${prettyExp(e.e2)})`
  }
}

/** @returns a pretty version of the value `v`, suitable for debugging. */
export function prettyValue (v: Value): string {
  switch (v.tag) {
    case 'num': 
    case 'keyword': return `${v.value}`
    case 'pointer': return `index: ${v.value} low-bound: ${v.bounds[0]} up-bound: ${v.bounds[1]}`
    case 'bool': return v.value ? 'true' : 'false'
    case 'closure': return `<closure>`
    case 'prim': return `<prim ${v.name}>`
    case 'undefined': return v.tag
  }
}

/** @returns a pretty version of the type `t`. */
export function prettyTyp (t: Typ): string {
  switch (t.tag) {
    case 'num': 
    case 'bool': 
    case 'pointer':
    return t.tag;
    case 'arr': return `(-> ${t.inputs.map(prettyTyp).join(' ')} ${prettyTyp(t.output)})`
  }
}

/** @returns a pretty version of the statement `s`. */
export function prettyStmt (s: Stmt): string {
  switch (s.tag) {
    case 'define': return `(define ${s.id} ${prettyExp(s.exp)})`
    case 'assign': return `(assign ${prettyExp(s.loc)} ${prettyExp(s.exp)}))`
    case 'print': return `(print ${prettyExp(s.exp)})`
  }
}

/** @returns a pretty version of the program `p`. */
export function prettyProg (p: Prog): string {
  return p.map(prettyStmt).join('\n')
}

/***** Equality ***************************************************************/ 

/** @returns true iff t1 and t2 are equivalent types */
export function typEquals (t1: Typ, t2: Typ): boolean {
  // N.B., this could be collapsed into a single boolean expression. But we
  // maintain this more verbose form because you will want to follow this
  // pattern of (a) check the tags and (b) recursively check sub-components
  // if/when you add additional types to the language.
  if (t1.tag === 'num' && t2.tag === 'num') {
    return true
  } else if (t1.tag === 'bool' && t2.tag === 'bool') {
    return true
  } else if (t1.tag === 'arr' && t2.tag === 'arr') {
    return typEquals(t1.output, t2.output) &&
      t1.inputs.length === t2.inputs.length &&
      t1.inputs.every((t, i) => typEquals(t, t2.inputs[i])) 
  } else if (t1.tag === 'pointer' && t2.tag === 'pointer') {
    return (t1.input.tag === t2.input.tag)
  } else return false
}
