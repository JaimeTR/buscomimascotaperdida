import test from 'node:test'
import assert from 'node:assert/strict'
import { matchScore } from './matches.ts'

const lost = { id: '1', type: 'dog', status: 'lost', breed: 'Pug', colors: ['beige'], last_seen_district: 'Lince', last_seen_date: '2026-11-18' }
const found = { id: '2', type: 'dog', status: 'found', breed: 'pug', colors: ['Beige'], last_seen_district: 'lince', last_seen_date: '2026-11-19' }

test('mismo perro, mismo distrito y color: puntaje alto', () => assert.ok(matchScore(lost, found) >= 85))
test('misma especie requerida', () => assert.equal(matchScore(lost, { ...found, type: 'cat' }), 0))
test('mismo estado no es coincidencia', () => assert.equal(matchScore(lost, { ...found, status: 'lost' }), 0))
test('más de 30 días no compara', () => assert.equal(matchScore(lost, { ...found, last_seen_date: '2026-09-01' }), 0))
test('distrito distinto baja el puntaje', () => assert.ok(matchScore(lost, { ...found, last_seen_district: 'Surco' }) < matchScore(lost, found)))
