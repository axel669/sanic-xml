# sanic-xml
A high brow, fast xml parsing library.

![Sanic](sanic.jpg)

## Installation

With NPM/Yarn/PNPM
```bash
pnpm i @axel669/sanic-xml
```

In Browser (no installs)
```js
import sanicXML from "https://esm.sh/@axel669/sanicXML"
```

## Core API (Available in all JS environments)
These functions are part of the default export and use the web standard objects
that are available in browsers, node (18+), and Cloudflare workers.

### `parse(xml)`
`(String) -> object|Error`
Parses an xml string synchronously, and returns either an object or an error
with information about where the parsing failed.

### `parseStream(stream)`
`(Stream) -> Promise<object|Error>`
Parses a stream that outputs xml returning the same thing as parse.

### `toString(obj[, options])`
`(Object[, Object]) -> String`
Converts an XML Object to a string in memory.

### `toStream(obj[, options])`
`(Object[, Object]) -> Generator<string>`
Converts an XMLObject into a generator that outputs each line of the xml.

## Node-spcific API

### `parseFile(filename)`
`(String) -> Promise<object|Error>`
Parses a file by reading the file as a stream and parsing the stream.

### `toFile(filename, obj[, opt])`
`(String, XMLObject[, Object]) -> void`
Converts an XMLObject into xml and writes it to a file.

## Usage
```javascript
import sanicXML from "@axel669/sanic-xml"

const data = sanicXML.parse(`
<tag>
    <nested>some value</nested>
</tag>
`)
console.log( sanicXML.toString(data) )

console.log(
    await sanicXML.parseURL(
        "https://boardgamegeek.com/xmlapi//boardgame/69?stats=1"
    )
)
```
