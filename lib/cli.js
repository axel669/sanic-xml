#! /usr/bin/env node

import { parseArgs } from "node:util"
import fs from "node:fs"

import sanicXML from "./node.js"

const args = parseArgs({
    options: {
        out: {
            type: "string",
            short: "o",
        },
        print: {
            type: "boolean",
            short: "p",
            default: false,
        },
    },
    allowPositionals: true
})

const sourceFile = args.positionals[0]
const destFile = args.values.out

if (sourceFile === undefined) {
    console.log("No input file given")
    process.exit(0)
}

console.log(`Loading: ${sourceFile}`)
const obj = await sanicXML.parseFile(sourceFile)

const json = JSON.stringify(obj, null, 4)
if (destFile !== undefined) {
    console.log(`Writing: ${destFile}`)
    fs.writeFileSync(destFile, json)
    if (args.values.print === true) {
        console.log(json)
    }
    console.log("Done")
    process.exit(0)
}

console.log(json)
