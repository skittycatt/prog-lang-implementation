import * as L from './lang'

/** Finds the next empty index of the given store */
function empty_ind(store: L.Value[], size: number): number[] {
  let lower = 0
  let upper
  for (let val of store) {
    if (val.tag === 'undefined') {
      upper = lower
      for (let i = 1; i < size; i++) {
        if (i + lower > 9) {
          throw new Error(`Runtime error: no spaces of size ${size} or larger are available in memory`)
        } else if (store[i + lower].tag !== 'undefined') {
          lower += ++i
          break // chunk of space is not large enough, move lower bound past and break
        } else {
          upper = i + lower
        }
      }
      return [lower, upper]
    } else lower++
  }
  throw new Error(`Runtime error: pointer memory is full`)
}

/** The output of our programs: a list of strings that our program printed. */
export type Output = string[]

/** @returns the value that expression `e` evaluates to. */
export function evaluate (env: L.Env, store: L.Value[], e: L.Exp): L.Value {
  switch (e.tag) {
    case 'var': {
      if (env.has(e.value)) {
        return env.get(e.value)
      } else {
        throw new Error(`Runtime error: unbound variable '${e.value}'`)
      }
    }
    case 'num':
    case 'bool':
    case 'keyword':
      return e
    case 'lam':
      return L.closure(e.param, e.body, env)
    case 'app': {
      const head = evaluate(env, store, e.head)
      const args = e.args.map(arg => evaluate(env, store, arg))
      if (head.tag === 'closure') {
        if (args.length !== 1) {
          throw new Error(`Runtime error: closure expects 1 argument but ${args.length} were given`)
        } else {
          return evaluate(head.env.extend1(head.param, args[0]), store, head.body)
        }
      } else if (head.tag === 'prim') {
        return head.fn(args)
      } else {
        throw new Error(`Runtime error: expected closure or primitive, but found '${head.tag}'`)
      }
    }
    case 'if': {
      const v = evaluate(env, store, e.e1)
      if (v.tag === 'bool') {
        return v.value ? evaluate(env, store, e.e2) : evaluate(env, store, e.e3)
      } else {
        throw new Error(`Runtime error: 'if' expects a boolean in guard position but a ${v.tag} was given`)
      }
    }
    case 'new': {
      const v = evaluate(env, store, e.value)
      if (v.tag !== 'keyword') {
        throw new Error(`Runtime error: 'new' expects a keyword (Num or Bool) but ${v.tag} was given`)
      } else {
        const [lower, upper] = empty_ind(store, e.size)
        let init 
        if (v.value === 'Num') {
          init = L.num(0)
        } else if (v.value === 'Bool') {
          init = L.bool(false)
        } else {
          throw new Error(`Runtime error: keywords can only be 'Num' or 'Bool' but ${v.value} was given`)
        }
        for (let i = lower; i <= upper; i++) {
          store[i] = init
        }
        return L.pointer(lower, [lower, upper])
      }
    }
    case 'deref': {
      const v = evaluate(env, store, e.value)
      if (v.tag !== 'pointer') {
        throw new Error(`Runtime error: 'deref' expects a pointer but a ${v.tag} was given`)
      } else if (store[v.value].tag === 'undefined') {
        throw new Error(`Runtime error: accessed memory at ${v.value} is undefined`)
      } else if (v.value < v.bounds[0] || v.value > v.bounds[1]) {
        throw new Error(`Runtime error: out of bounds access of pointer: ${L.prettyExp(e.value)}`)
      } else {
        return store[v.value]
      }
    }
    case 'pointer_arith': {
      const v1 = evaluate(env, store, e.e1)
      const v2 = evaluate(env, store, e.e2)
      const arith = ['+', '-', '/', '*']
      if (v1.tag !== 'pointer') {
        throw new Error(`Runtime error: 'pointer_arith' expects a pointer as its second argument but a ${v1.tag} was given`)
      } else if (v2.tag !== 'num') {
        throw new Error(`Runtime error: 'pointer_arith' expects a number as its third argument but a ${v2.tag} was given`)
      } else {
        let new_ind
        switch(e.func) {
          case '+': {
            new_ind = v1.value + v2.value
            break
          }
          case '-': {
            new_ind = v1.value - v2.value
            break
          }
          case '/': {
            new_ind = v1.value / v2.value
            break
          }
          case '*': {
            new_ind = v1.value * v2.value
            break
          }
          default: 
            throw new Error(`Runtime error: 'pointer_arith' expects a basic arithmetic operator as its first arugment (+, -, /, *) but ${e.func} was given`)
        }
        if (new_ind < 0 || new_ind > 9) {
          throw new Error(`Runtime error: 'pointer_arith' out of bounds. Pointers must hold values between 0 and 9 but ${new_ind} was the value after pointer arithmetic`)
        } else if (new_ind < v1.bounds[0] || new_ind > v1.bounds[1]) {
          throw new Error(`Runtime error: pointer out of bounds: ${L.prettyExp(e)}`)
        } else { return L.pointer(new_ind, v1.bounds) }
      }
    }
    default: throw new Error('scream')
  }
}

/** @returns the result of executing program `prog` under environment `env` */
export function execute(env: L.Env, store: L.Value[], prog: L.Prog): Output {
  const output: Output = []
  for (const s of prog) {
    switch (s.tag) {
      case 'define': {
        const v = evaluate(env, store, s.exp)
        env.set(s.id, v)
        break
      }
      case 'assign': {
        const lhs = evaluate(env, store, s.loc)
        const rhs = evaluate(env, store, s.exp)
        if (lhs.tag === 'pointer') {
          if (store[lhs.value].tag === 'undefined') {
            throw new Error(`Runtime Error: attempting to assign data to unbound pointer index ${lhs.value}`)
          } else if (store[lhs.value].tag !== rhs.tag){
            throw new Error(`Runtime Error: attempting to assign a ${store[lhs.value].tag} where a ${rhs.tag} is stored`)
          } else{
            store[lhs.value] = rhs
          }
        } else if (s.loc.tag === 'var') {  
          if (env.has(s.loc.value)) {   
            env.update(s.loc.value, rhs)  
          } else {
            throw new Error(`Runtime error: unbound variable: ${s.loc.value}`)
          }
        } else {
          throw new Error(`Runtime error: cannot assign to non-location '${L.prettyExp(s.loc)}'}`)
        }
        break
      }
      case 'print': {
        const v = evaluate(env, store, s.exp)
        output.push(L.prettyValue(v))
        break
      }
    }
  }
  return output
}