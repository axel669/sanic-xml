import sanicXML from "../lib/node.js"

console.dir(
    sanicXML.parse(`
<?xml ?>
<!doctype testing>
<div>hi</div>
<!DOCTYPE [
	testing]
] test>
    `),
    { depth: null }
)

console.dir(
    await sanicXML.parseFile("tests/files/multiple.xml"),
    { depth: null }
)
console.dir(
    await sanicXML.parseFile("tests/files/empty-header.xml"),
    { depth: null }
)
console.time("large")
await sanicXML.parseFile("tests/files/large.xml")
console.timeEnd("large")

console.time("huge")
await sanicXML.parseFile("tests/files/huge.xml")
console.timeEnd("huge")
