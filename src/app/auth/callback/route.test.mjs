import assert from "node:assert/strict"
import { handleAuthCallback } from "./route.ts"

const request = (query = "") => new Request(`https://app.example${query}`)
const success = { data: { session: { user: { id: "user-1" } } }, error: null }

const redirectLocation = (response) => response.headers.get("location")

{
    const response = await handleAuthCallback(
        request("?code=valid"),
        async () => success,
    )
    assert.equal(response.status, 307)
    assert.equal(redirectLocation(response), "https://app.example/dashboard")
}

{
    const response = await handleAuthCallback(
        request("?code=valid&next=%2Fmascotas%2Fabc"),
        async () => success,
    )
    assert.equal(redirectLocation(response), "https://app.example/mascotas/abc")
}

for (const query of ["", "?next=%2Freportar"]) {
    const response = await handleAuthCallback(
        request(query),
        async () => success,
    )
    assert.equal(response.status, 307)
    assert.equal(redirectLocation(response), "https://app.example/login?error=auth-callback-failed")
}

for (const query of ["?code=valid&next=https%3A%2F%2Fexample.com", "?code=valid&next=%2F%2Fexample.com"]) {
    const response = await handleAuthCallback(
        request(query),
        async () => success,
    )
    assert.equal(redirectLocation(response), "https://app.example/dashboard")
}

{
    const response = await handleAuthCallback(
        request("?code=invalid"),
        async () => ({ data: { session: null }, error: new Error("provider secret details") }),
    )
    const location = redirectLocation(response)
    assert.equal(location, "https://app.example/login?error=auth-callback-failed")
    assert.equal(location.includes("provider secret details"), false)
}

console.log("auth callback route cases: 7 passed")
