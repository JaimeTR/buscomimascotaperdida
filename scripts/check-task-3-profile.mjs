import fs from "node:fs"
import assert from "node:assert/strict"

const read = (path) => fs.readFileSync(path, "utf8")
const dialog = read("src/components/auth/complete-profile-dialog.tsx")
const register = read("src/components/auth/register-form.tsx")
const selector = read("src/components/auth/profile-location-fields.tsx")
const locationPopover = read("src/components/location-popover.tsx")
const locations = read("src/lib/peru-locations.ts")

assert.match(dialog, /ProfileLocationFields/)
assert.match(register, /ProfileLocationFields/)
assert.doesNotMatch(dialog, /const PERU_DATA/)
assert.doesNotMatch(register, /const PERU_DATA/)
assert.doesNotMatch(locationPopover, /const PERU_DATA/)
assert.match(selector, /getDistrictsForDepartment/)
assert.match(locations, /export const PERU_LOCATIONS/)
assert.match(locations, /export function getDistrictsForDepartment/)
assert.match(locationPopover, /import \{ PERU_LOCATIONS, PERU_DEPARTMENTS \} from '@\/lib\/peru-locations'/)
assert.match(locationPopover, /Object\.keys\(PERU_LOCATIONS\[department\] \|\| \{\}\)/)
assert.match(locations, /"Callao": \["Bellavista"/)

// Legacy persisted district labels must remain selectable/editable.
for (const legacyValue of ["Lima", "Lurigancho", "Pachacámac", "Miraflores", "Victor Larco"]) {
    assert.match(locations, new RegExp(legacyValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
}

// A profile with a district but no department must render both selectors.
assert.match(dialog, /const showDistrict = missing\.district \|\| missing\.department/)
assert.match(dialog, /\(missing\.department \|\| showDistrict\)/)
assert.match(dialog, /setValue\("district", "", \{ shouldValidate: true \}\)/)

console.log("Task 3 profile checks passed: shared location source and partial-profile replacement flow.")
