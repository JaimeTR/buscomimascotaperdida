import assert from "node:assert/strict"
import { getForgotPasswordPath, getRecoveryPath } from "./auth-redirects.ts"

const loginNext = "/reportar"
const forgotPasswordPath = getForgotPasswordPath(loginNext)
const recoveryPath = getRecoveryPath(new URLSearchParams(forgotPasswordPath.split("?")[1]).get("next"))

assert.equal(forgotPasswordPath, "/forgot-password?next=%2Freportar")
assert.equal(recoveryPath, "/update-password?next=%2Freportar")

assert.equal(
    getForgotPasswordPath("https://example.com"),
    "/forgot-password?next=%2Fdashboard",
)

console.log("recovery redirect chain cases: 3 passed")
