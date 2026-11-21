import assert from "node:assert/strict"
import { reminderDue, reunionDays, daysBetween } from "./reunion.ts"

const now = new Date("2026-12-01T00:00:00Z")
const ago = (d) => new Date(now.getTime() - d * 86_400_000).toISOString()

assert.equal(daysBetween(ago(3), now), 3)
assert.equal(reminderDue({ status: "lost", created_at: ago(3) }, now), false)
assert.equal(reminderDue({ status: "lost", created_at: ago(8) }, now), true)
assert.equal(reminderDue({ status: "lost", created_at: ago(30), reminded_at: ago(5) }, now), false)
assert.equal(reminderDue({ status: "lost", created_at: ago(30), reminded_at: ago(14) }, now), true)
assert.equal(reminderDue({ status: "reunited", created_at: ago(30) }, now), false)
assert.equal(reunionDays({ created_at: ago(10), reunited_at: ago(4) }), 6)
assert.equal(reunionDays({ created_at: ago(10) }), null)
console.log("reunion cases passed")
