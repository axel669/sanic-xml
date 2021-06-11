# sanic-xml
A high brow, fast xml parsing library.

![Sanic](sanic.jpg)

## Installation

With NPM
```bash
npm i @axel669/sanic-xml
```

With Yarn
```bash
yarn add @axel669/sanic-xml
```

## API

```javascript
//  bring in both functions
const sanic = require("@axel669/sanic-xml")
//  bring in specific functions
const parseXML = require("@axel669/sanic-xml/parse")
const toXML = require("@axel669/sanic-xml/stringify")

const xml = fs.readFile("file.xml", "utf8")

const data = sanic.parse(xml)
console.log( sanic.stringify(data) )

//  minification
console.log(
    sanic.stringify(xml, {minify: true})
)
```
