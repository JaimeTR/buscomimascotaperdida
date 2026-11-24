// Prueba de carga con k6 (https://k6.io). NO la corras contra producción sin avisar: usa la vista previa (dev).
//   k6 run -e BASE=https://<vista-previa>.vercel.app scripts/load-test.k6.js
// Simula visitantes que abren la portada, el listado, una zona y la guía. Meta: p95 < 1,5 s y menos de 1 % de errores.
import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE = __ENV.BASE || 'http://localhost:3000'

export const options = {
    stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
    ],
    thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<1500'] },
}

const PAGES = ['/', '/mascotas', '/mascotas/especie/perros', '/mascotas/distrito/miraflores', '/guias', '/transparencia']

export default function () {
    const res = http.get(BASE + PAGES[Math.floor(Math.random() * PAGES.length)])
    check(res, { 'status 200': (r) => r.status === 200 })
    sleep(1 + Math.random() * 2)
}
