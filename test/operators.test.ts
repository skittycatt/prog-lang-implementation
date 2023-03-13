import { describe, expect, test } from '@jest/globals'
import * as L from '../src/lang'
import * as R from '../src/runtime'

const int1: L.Num = L.num(L.tynat, 4)
const int2: L.Num = L.num(L.tynat, 13)
const int3: L.Num = L.num(L.tynat, 1)
const float1: L.Num = L.num(L.tyfloat, 0.34)
const float2: L.Num = L.num(L.tyfloat, 222.22)
const float3: L.Num = L.num(L.tyfloat, 1.0)
const string1: L.SString = L.sstring('hello, world!')
const string2: L.SString = L.sstring('world..hello.')
const lam1: L.SLambda = L.slambda('test', L.tystr, L.evar('test'))
const lam2: L.SLambda = L.slambda('x', L.tystr, L.evar('x'))

const testEnv: L.Env = new Map([])

describe('not', () => {
    test('!bool', () => {
        expect(R.evaluate(L.not(L.bool(true)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.not(L.bool(false)), testEnv)).toStrictEqual(L.bool(true))
    })
    test('!number', () => {
        expect(function() {R.evaluate(L.not(int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.not(float1), testEnv)}).toThrow(TypeError)
    })
    test('!lambda', () => {
        expect(function() {R.evaluate(L.not(lam1), testEnv)}).toThrow(TypeError)
    })
    test('!string', () => {
        expect(function() {R.evaluate(L.not(string1), testEnv)}).toThrow(TypeError)
    })
})

describe('plus', () => {
    test('integer + integer', () => {
        expect(R.evaluate(L.plus(int1, int2), testEnv)).toStrictEqual(L.num(L.tynat, 17))
    })
    test('float + float', () => {
        expect(R.evaluate(L.plus(float1, float2), testEnv))
            .toStrictEqual(L.num(L.tyfloat, 222.56))
    })
    test('integer + float', () => {
        expect(R.evaluate(L.plus(int1, float2), testEnv))
            .toStrictEqual(L.num(L.tyfloat, 226.22))
    })
    test('non-number + integer', () => {
        expect(function() {R.evaluate(L.plus(string1, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(L.bool(true), int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(float1, lam1), testEnv)}).toThrow(TypeError)
    })
    test('non-number + non-number', () => {
        expect(function() {R.evaluate(L.plus(string1, L.bool(false)), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(L.bool(true), lam1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(lam1, string1), testEnv)}).toThrow(TypeError)
    })
})

describe('eq', () => {
    test('equivalence of self', () => {
        expect(R.evaluate(L.eq(int1, int1), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(float2, float2), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(lam1, lam1), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(string1, string1), testEnv)).toStrictEqual(L.bool(true))
    })
})