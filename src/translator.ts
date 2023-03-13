import * as S from './sexp'
import * as L from './lang'

/** @return `f` but as a function that takes an array instead of 1 argument */
function wrap1<T> (f: (_x: T) => T): (_args: T[]) => T {
  return (args) => f(args[0])
}

/** @return `f` but as a function that takes an array instead of 2 arguments */
function wrap2<T> (f: (_x1: T, _x2: T) => T): (_args: T[]) => T {
  return (args) => f(args[0], args[1])
}

/** @return `f` but as a function that takes an array instead of 3 arguments */
function wrap3<T> (f: (_x1: T, _x2: T, _x3: T) => T): (_args: T[]) => T {
  return (args) => f(args[0], args[1], args[2])
}

/** An entry of the operator table. */
type OpEntry = { arity: number, ctor: (_args: L.Exp[]) => L.Exp }

/** A mapping from function symbols to AST constructors for those functions */
const operatorMap: Map<string, OpEntry> =
  new Map([
    ['not', { arity: 1, ctor: wrap1(L.not) }],
    ['+', { arity: 2, ctor: wrap2(L.plus) }],
    ['=', { arity: 2, ctor: wrap2(L.eq) }],
    ['and', { arity: 2, ctor: wrap2(L.and) }],
    ['or', { arity: 2, ctor: wrap2(L.or) }],
    ['if', { arity: 3, ctor: wrap3(L.ife) }]
  ])

/** @returns the expression parsed from the given s-expression. */
export function translateExp(e: S.Sexp): L.Exp {
  if (e.tag === 'atom') {
    if (e.value === 'true') {
      return L.bool(true)
    } else if (e.value === 'false') {
      return L.bool(false)
    } else if (/\d+$/.test(e.value)) {
        let temp: number = parseFloat(e.value)
        return Number.isInteger(temp) ? L.num(L.tynat, temp) : L.num(L.tyfloat, temp)
    } else {
      // N.B., any other chunk of text will be considered a variable
      return L.evar(e.value)
    }
  } else if (e.exps.length === 0) {
    throw new Error('Parse error: empty expression list encountered')
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !== 'atom') {
      throw new Error('Parse error: identifier expected at head of operator/form')
    } else if (operatorMap.has(head.value)) {
      return operatorMap.get(head.value)!.ctor(args.map(translateExp))
    } else {
      throw new Error(`Parse error: invalid operator given '${head.value}'`)
    }
  }
}

export function translateStmt(e: S.Sexp): L.Stmt {
  if (e.tag === 'atom') {
    throw new Error(`Parse error: an atom cannot be a statement: '${e.value}'`)
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !=='atom') {
      throw new Error('Parse error: identifier expected at head of operator/form')
    } else if (head.value === 'define') {
      if (args.length !== 2) {
        throw new Error(`Parse error: 'define' expects 2 argument but ${args.length} were given`)
      } else if (args[0].tag !== 'atom') {
        throw new Error("Parse error: 'define' expects its first argument to be an identifier")
      } else {
        return L.sdefine(args[0].value, translateExp(args[1]))
      }
    } else if (head.value === 'print') {
        if (args.length !== 1) {
          throw new Error(`Parse error: 'print' expects 1 argument but ${args.length} were given`)
        } else {
          return L.sprint(translateExp(args[0]))
        }
    } else {
      throw new Error(`Parse error: statements can only be 'print' or 'define' but ${head.value} was given`)
    }
  }
}

export function translateProg(es: S.Sexp[]): L.Prog {
  const ret: L.Stmt[] = []
  for(let i = 0; i < es.length; i++) {
    ret.push(translateStmt(es[i]))
  }
  return ret
}
