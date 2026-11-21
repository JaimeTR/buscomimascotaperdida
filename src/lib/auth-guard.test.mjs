import assert from "node:assert/strict"
import { isProtectedPath, isGuestOnlyPath, loginReason } from "./auth-guard.ts"

assert.ok(isProtectedPath("/reportar"))
assert.ok(isProtectedPath("/panel/reportes"))
assert.ok(isProtectedPath("/mascotas/abc/avistamiento"))
assert.ok(!isProtectedPath("/mascotas/abc"))
assert.ok(!isProtectedPath("/mascotas"))
assert.ok(!isProtectedPath("/reportar-algo"))
assert.ok(isGuestOnlyPath("/ingresar") && isGuestOnlyPath("/registro/"))
assert.ok(!isGuestOnlyPath("/ingresar/x"))
assert.equal(loginReason("/reportar"), "report")
assert.equal(loginReason("/panel"), undefined)
console.log("auth-guard cases passed")
