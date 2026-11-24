import test from 'node:test'
import assert from 'node:assert/strict'
import { slugify, districtFromSlug, isSpecies } from './seo-zones.ts'

test('slugify quita tildes y símbolos', () => {
    assert.equal(slugify('San Martín de Porres'), 'san-martin-de-porres')
    assert.equal(slugify('Lima (Cercado)'), 'lima-cercado')
})

test('districtFromSlug devuelve el nombre real o null', () => {
    assert.equal(districtFromSlug('miraflores'), 'Miraflores')
    assert.equal(districtFromSlug('san-martin-de-porres'), 'San Martín de Porres')
    assert.equal(districtFromSlug('no-existe'), null)
})

test('isSpecies solo acepta perros y gatos', () => {
    assert.ok(isSpecies('perros'))
    assert.ok(isSpecies('gatos'))
    assert.ok(!isSpecies('dragones'))
})
