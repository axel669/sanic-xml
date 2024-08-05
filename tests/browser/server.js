import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"

const app = new Hono()
app.use(
    "/*",
    serveStatic({ root: "./lib" })
)
app.use(
    "/*",
    serveStatic({ root: "./tests/browser" })
)
app.use(
    "/*",
    serveStatic({ root: "./tests/files" })
)

serve({
    fetch: app.fetch,
    port: 45067,
})
console.log("Running")
