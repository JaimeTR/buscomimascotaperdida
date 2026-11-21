import test from 'node:test'
import assert from 'node:assert/strict'
import { retrieveKnowledge } from './knowledge.ts'
import { extractFilters, rankPets } from './search.ts'

const row = (o) => ({ id: 'x', name: null, type: 'dog', breed: null, size: null, status: 'lost', colors: [], last_seen_district: null, last_seen_date: '2026-11-01', image_urls: null, last_seen_lat: null, last_seen_lng: null, ...o })

test('extractFilters entiende tipo, color y distrito (con alias)', () => {
    assert.deepEqual(extractFilters('Busco un perro negro en Surco'), { type: 'dog', district: 'Santiago de Surco', color: 'negro' })
    assert.equal(extractFilters('perdí a mi gatito en Miraflores').type, 'cat')
    assert.equal(extractFilters('perdí a mi gatito en Miraflores').district, 'Miraflores')
    assert.deepEqual(extractFilters('hola'), {})
})

test('rankPets prioriza coincidencias y descarta otra especie', () => {
    const rows = [
        row({ id: 'a', type: 'cat', last_seen_district: 'Surco' }),
        row({ id: 'b', type: 'dog', colors: ['negro'], last_seen_district: 'Surco' }),
        row({ id: 'c', type: 'dog', last_seen_district: 'Lince' }),
    ]
    const out = rankPets(rows, { type: 'dog', district: 'Santiago de Surco', color: 'negro' }, 'perro negro surco')
    assert.equal(out[0].id, 'b')
    assert.ok(!out.find((p) => p.id === 'a'))
})

test('rankPets sin coincidencias devuelve vacío; sin criterios, los recientes', () => {
    assert.equal(rankPets([row({ type: 'cat' })], { type: 'dog' }, 'perro').length, 0)
    assert.equal(rankPets([row({ id: '1' }), row({ id: '2' })], {}, '').length, 2)
})

test('retrieveKnowledge responde con el fragmento correcto', () => {
    assert.equal(retrieveKnowledge('cómo genero un cartel para imprimir')[0].id, 'cartel')
    assert.equal(retrieveKnowledge('encontré un perro en la calle')[0].id, 'encontre')
    assert.deepEqual(retrieveKnowledge('qué opinas del clima de marte'), [])
})
