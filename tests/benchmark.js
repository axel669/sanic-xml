import sanicXML from "../lib/node.js"
import { Bench } from "tinybench"
import fs from "node:fs/promises"

const bench = new Bench({ time: 5000 })
const xml = await fs.readFile("tests/files/multiple.xml", "utf8")

bench.add(
    "sanic",
    () => sanicXML.parse(xml)
)

await bench.warmup()
await bench.run()

console.table(bench.table())
