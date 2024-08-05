# sanic-xml
A high brow, fast xml parsing library.

![Sanic](sanic.jpg)

## Installation

With NPM/Yarn/PNPM
```bash
pnpm i @axel669/sanic-xml
```

## Core API (Available to Node and Browser)

### `parse(xml)`
`(String) -> object|Error`
Parses an xml string synchronously, and returns either an object or an error
with information about where the parsing failed.

### `stringify(obj[, options])`
`(Object[, Object]) -> String`


## Node API

### `parse(xml)`
`(String) -> object|Error`
Parses an xml string synchronously, and returns either an object or an error
with information about where the parsing failed.

### `parseStream(stream)`
`(Stream) -> Promise<object|Error>`
Parses a stream that outputs xml returning the same thing as parse.
`parseStream` will finish when it recieves an `"end"` event from the stream.

### `parseFile(filename)`
`(String) -> Promise<object|Error>`
Parses a file by reading the file as a stream and parsing the stream.

### Usage
```javascript
import fs from "node:fs"

import sanicXML from "@axel669/sanic-xml/node"

const xml = fs.readFileSync("file.xml", "utf8")

const data = sanicXML.parse(xml)
console.log( sanicXML.stringify(data) )

//  minification
console.log(
    sanicXML.stringify(xml, {minify: true})
)

console.log(
    await sanicXML.parseStream(
        fs.createReadStream("large.xml")
    )
)

console.log(
    await sanicXML.parseFile("biggest.xml")
)
```

## Browser API

### `parseStream(stream)`
`(ReadableStream) -> Promise<object|Error>`
Parses a stream that outputs xml returning the same thing as parse. Takes the
given stream and pipes into a TextDecoderStream for utf8.

### `parseURL(url)`
`(String) -> Promise<object|Error>`
Fetches and parses xml from a url. Uses the streaming API to read the loaded
content so the content size can be quite large.

### Usage
```javascript
import sanicXML from "@axel669/sanic-xml"

const response = await fetch("file.xml")
const xml = await response.text()
const data = sanicXML.parse(xml)
console.log( sanicXML.stringify(data) )

//  minification
console.log(
    sanicXML.stringify(xml, {minify: true})
)

const streamResponse = await fetch("large.xml")
console.log(
    await sanicXML.parseStream(streamResponse)
)

console.log(
    await sanicXML.parseURL("biggest.xml")
)
```
