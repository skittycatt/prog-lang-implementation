import * as S from './sexp'
import * as L from './lang'

export function translateTyp (e: S.Sexp): L.Typ {
  if (e.tag === 'atom') {
    if (e.value === 'Nat') {
      return L.tynat
    } else if (e.value === 'Bool') {
      return L.tybool
    } else {
      throw new Error(`Parse error: unknown type '${e.value}'`)
    }
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag === 'atom' && head.value === '->') {
      if (args.length < 2) {
        throw new Error(`Parse error: '->' expects at least 2 arguments but ${args.length} were given`)
      } else {
        return L.tyarr(args.slice(0, args.length - 1).map(translateTyp), translateTyp(args[args.length - 1]))
      }
    } else if (head.tag === 'atom' && head.value === 'rec') {
      if (args.length % 2 !== 0) {
        throw new Error(`Parse error: 'rec' expects an even number of arugments but was given ${args.length}`)
      } else {
        const temp: Map<string, L.Typ> = new Map([])
        for (let x = 0; x < args.length; x += 2) {
          const key = args[x]
          const val = args[x + 1]
          if(key.tag === 'atom') {
            temp.set(key.value, translateTyp(val))
          }
        }
        return L.tyrec(temp)
      }
    } else {
      throw new Error(`Parse error: unknown type '${S.sexpToString(e)}'`)
    }
  }
}

/** @returns the expression parsed from the given s-expression. */
export function translateExp (e: S.Sexp): L.Exp {
  if (e.tag === 'atom') {
    if (e.value === 'true') {
      return L.bool(true)
    } else if (e.value === 'false') {
      return L.bool(false)
    } else if (/\d+$/.test(e.value)) {
      return L.num(parseInt(e.value))
    } else {
      // N.B., any other chunk of text will be considered a variable
      return L.evar(e.value)
    }
  } else if (e.exps.length === 0) {
    throw new Error('Parse error: empty expression list encountered')
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag === 'atom' && head.value === 'lambda') {
      if (args.length !== 3) {
        throw new Error(`Parse error: 'lambda' expects 3 arguments but ${args.length} were given`)
      } else if (args[0].tag !== 'atom') {
        throw new Error(`Parse error: 'lambda' expects its first argument to be an identifier but ${S.sexpToString(args[0])} was given`)
      } else {
        return L.lam(args[0].value, translateTyp(args[1]), translateExp(args[2]))
      }
    } else if (head.tag === 'atom' && head.value === 'if') {
      if (args.length !== 3) {
        throw new Error(`Parse error: 'if' expects 3 arguments but ${args.length} were given`)
      } else {
        return L.ife(translateExp(args[0]), translateExp(args[1]), translateExp(args[2]))
      }
    
    } else if (head.tag === 'atom' && head.value === 'rec') {
      if (args.length % 2 !== 0) {
        throw new Error(`Parse error: 'rec' expects an even number of arguments but was given ${args.length}`)
      } else {
        const vals = new Map<string, L.Exp>()
        const translatedArgs = args.map(translateExp)
        for (let i = 0; i < args.length; i += 2) {
          const fie = translatedArgs[i]
          const expre = translatedArgs[i + 1]
          if (fie.tag !== 'var') {
            throw new Error(`Parse error: 'rec' expects an identifier in even argument indexes but was given ${translatedArgs[i].tag}`)
          } else {
            vals.set(fie.value, expre)
          }
        }
        return L.rec(vals)
      }
    } else if (head.tag === 'atom' && head.value === 'field') {
      if (args.length !== 2) {
        throw new Error(`Parse error: 'field' expects two arguments but was given ${args.length}`)
      } else if (args[1].tag !== 'atom') {
        throw new Error(`Parse error: 'field' expects an identifier as the second argument but was given ${S.sexpToString(args[2])}`)
      } else {
        return L.field(translateExp(args[0]), args[1].value)
      }
    } else {
      return L.app(translateExp(head), args.map(translateExp))
    }
  }
}

export function translateStmt (e: S.Sexp): L.Stmt {
  if (e.tag === 'atom') {
    throw new Error(`Parse error: an atom cannot be a statement: '${e.value}'`)
  } else {
    const head = e.exps[0]
    const args = e.exps.slice(1)
    if (head.tag !== 'atom') {
      throw new Error('Parse error: identifier expected at head of operator/form')
    } else if (head.value === 'define') {
      if (args.length !== 2) {
        throw new Error(`Parse error: 'define' expects 2 argument but ${args.length} were given`)
      } else if (args[0].tag !== 'atom') {
        throw new Error("Parse error: 'define' expects its first argument to be an identifier")
      } else {
        return L.sdefine(args[0].value, translateExp(args[1]))
      }
    } else if (head.value === 'assign') {
      if (args.length !== 2) {
        throw new Error(`Parse error: 'assign' expects 2 argument but ${args.length} were given`)
      } else {
        return L.sassign(translateExp(args[0]), translateExp(args[1]))
      }
    } else if (head.value === 'print') {
      if (args.length !== 1) {
        throw new Error(`Parse error: 'print' expects 1 argument but ${args.length} were given`)
      } else {
        return L.sprint(translateExp(args[0]))
      }
    } else {
      throw new Error(`Parse error: unknown statement form '${S.sexpToString(e)}'`)
    }
  }
}

export function translateProg (es: S.Sexp[]): L.Prog {
  return es.map(translateStmt)
}
