import test from 'node:test'
import assert from 'node:assert/strict'
import { formatPhone, defaultsFromPet, FORMATS } from './poster.ts'

test('formatea celular peruano', () => {
  assert.equal(formatPhone('987654321'), '987 654 321')
  assert.equal(formatPhone('+51 987654321'), '987 654 321')
  assert.equal(formatPhone(null), '')
  assert.equal(formatPhone('01 444 5555'), '01 444 5555')
})

test('cartel inicial: perdido y encontrado', () => {
  const pet = { name: null, type: 'dog', breed: 'Labrador', gender: null, size: 'large', colors: ['Dorado'], markings: null, status: 'lost', last_seen_district: 'Miraflores', last_seen_department: 'Lima', last_seen_address: null, image_urls: ['a.jpg'] }
  const s = defaultsFromPet(pet, { phone: '987654321' })
  assert.equal(s.headline, 'SE BUSCA')
  assert.equal(s.name, 'Perro')
  assert.equal(s.details, 'Perro · Labrador · Dorado · Grande')
  assert.equal(s.place, 'Miraflores, Lima')
  assert.equal(s.phone, '987 654 321')
  assert.equal(s.whatsapp, '')
  assert.equal(defaultsFromPet({ ...pet, status: 'found' }, {}).template, 'encontrado')
})

test('formatos de papel con tamaño positivo', () => {
  for (const f of Object.values(FORMATS)) assert.ok(f.w > 0 && f.h > 0)
})
