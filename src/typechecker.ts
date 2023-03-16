import * as L from './lang'

function expectedTypeMsg(expected: string, pos: number, fn: string, found: string) {
  return `Type error: Expected ${expected} in position ${pos} of ${fn} but found ${found}`
}

/** @return the type of expression `e` */
export function typecheck (ctx: L.Ctx, e: L.Exp): L.Typ {
  switch (e.tag) {
    case 'lambda': {
      ctx = L.extendCtx(e.value, e.t, ctx)
      const t1 = typecheck(ctx, e.e1)
      return t1
    }
    case 'var':
      if (ctx.has(e.value)) {
        return ctx.get(e.value)!
      } else {
        throw new Error(`variable ${e.value} is not in context map.`)
      }
    case 'num':
      return e.numtype
    case 'bool':
      return L.tybool
    case 'not': {
      const t = typecheck(ctx, e.e1)
      if (t.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, `not`, t.tag))
      } else {
        return L.tybool
      }
    }
    case 'plus': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'nat') {
        throw new Error(expectedTypeMsg('nat', 1, 'plus', t1.tag))
      } else if (t2.tag !== 'nat') {
        throw new Error(expectedTypeMsg('nat', 2, 'plus', t2.tag))
      }
      return L.tynat
    }
    case 'eq': {
      const _t1 = typecheck(ctx, e.e1)
      const _t2 = typecheck(ctx, e.e2)
      return L.tybool
    }
    case 'and': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'and', t1.tag))
      } else if (t2.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 2, 'and', t2.tag))
      }
      return L.tybool
    }
    case 'or': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'or', t1.tag))
      } else if (t2.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 2, 'or', t2.tag))
      }
      return L.tybool
    }
    case 'if': {
      const t1 = typecheck(ctx, e.e1)
      const t2 = typecheck(ctx, e.e2)
      const t3 = typecheck(ctx, e.e3)
      if (t1.tag !== 'bool') {
        throw new Error(expectedTypeMsg('bool', 1, 'if', t1.tag))
      } else if (t2.tag !== t3.tag) {
        throw new Error(expectedTypeMsg(t2.tag, 3, 'if', t3.tag))
      }
      return t3
    }
    default: throw new Error('something is wrong with typechecker')
  }
}

export function checkWF(ctx: L.Ctx, prog: L.Prog) {
  // TODO: implement me!
}