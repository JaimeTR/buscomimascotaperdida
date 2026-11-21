import assert from "node:assert/strict"
import { isProtectedPath, isGuestOnlyPath, loginReason } from "./auth-guard.ts"

assert.ok(isProtectedPath("/reportar"))
assert.ok(isProtectedPath("/dashboard/reports"))
assert.ok(isProtectedPath("/mascotas/abc/avistamiento"))
assert.ok(!isProtectedPath("/mascotas/abc"))
assert.ok(!isProtectedPath("/mascotas"))
assert.ok(!isProtectedPath("/reportar-algo"))
assert.ok(isGuestOnlyPath("/login") && isGuestOnlyPath("/register/"))
assert.ok(!isGuestOnlyPath("/login/x"))
assert.equal(loginReason("/reportar"), "report")
assert.equal(loginReason("/dashboard"), undefined)
console.log("auth-guard cases passed")
