import test from 'node:test'
import assert from 'node:assert/strict'
import { whatsappLink } from './whatsapp.ts'

test('celular peruano sin código recibe 51', () => assert.equal(whatsappLink('987 654 321'), 'https://wa.me/51987654321'))
test('acepta +51 y 0051', () => {
  assert.equal(whatsappLink('+51 987654321'), 'https://wa.me/51987654321')
  assert.equal(whatsappLink('0051987654321'), 'https://wa.me/51987654321')
})
test('codifica el mensaje', () => assert.equal(whatsappLink('987654321', 'Hola, vi a Kira'), 'https://wa.me/51987654321?text=Hola%2C%20vi%20a%20Kira'))
test('rechaza vacío o basura', () => {
  assert.equal(whatsappLink(''), null)
  assert.equal(whatsappLink(null), null)
  assert.equal(whatsappLink('12345'), null)
})
