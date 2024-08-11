import sanicXML from "../lib/node.js"

const xmlString = `
<?xml version="1.0" encoding="ISO-8859-1" ?>
<any_name>
    <person>
        <phone>122233344550</phone>
        <phone>122233344551</phone>
        <name>Jack</name>
        <age>33</age>
        <married>Yes</married>
        <birthday>Wed, 28 Mar 1979 12:13:14 +0300</birthday>
        <address>
            <city>New York</city>
            <street>Park Ave</street>
            <buildingNo>1</buildingNo>
            <flatNo>1</flatNo>
        </address>
        <address>
            <city>Boston</city>
            <street>Centre St</street>
            <buildingNo>33</buildingNo>
            <flatNo>24</flatNo>
        </address>
    </person>
    <person>
        <phone>122233344553</phone>
        <phone>122233344554</phone>
        <name>Boris</name>
        <age>34</age>
        <married>Yes</married>
        <birthday>Mon, 31 Aug 1970 02:03:04 +0300</birthday>
        <address>
            <city>Moscow</city>
            <street>Kahovka</street>
            <buildingNo>1</buildingNo>
            <flatNo>2</flatNo>
        </address>
        <address>
            <city>Tula</city>
            <street>Lenina</street>
            <buildingNo>3</buildingNo>
            <flatNo>78</flatNo>
        </address>
    </person>
</any_name>
`

export const test = async ({ Assert, Section }) => {
    Section `String`

    const str = sanicXML.parse(xmlString)
    Assert(str)
        .has("any_name")
        `any_name.person.length`.eq(2)
        `any_name.person.1.address.0.city`.eq("Moscow")

    Section `Stream & URL`

    const bgg = await sanicXML.parseURL("https://boardgamegeek.com/xmlapi//boardgame/69?stats=1")
    Assert(bgg)
        .has("boardgames")
        `boardgames.boardgame.yearpublished`.eq("1999")
        `boardgames.boardgame.boardgamepublisher`(list => list.find(
            item => item._objectid === "553"
        ))`__text`.eq("Cadaco")

    Section `From File`

    const file = await sanicXML.parseFile("tests/files/multiple.xml")
    Assert(file)
        .has("soap:Envelope")
        `soap:Envelope.soap:Body.rpt:loadReportFileResponseElem.rpt:result.rpt:file`.has("__cdata")

    Section `To String`

    const basicString = sanicXML.toString(str, { indent: "  " })
    Assert(basicString)
        `length`.gt(0)
        .includes("    <address>")

    Section `To Blob`

    const blob = sanicXML.toBlob(str, { indent: "  " })
    Assert(blob)
        `size`.gt(0)
        `size`.eq(basicString.length)

    Section `Invlaid Attributes`

    const invalidAttrMid = await sanicXML.parseFile("tests/files/invalid-attr.xml")
    Assert(invalidAttrMid)
        .is(Error)
        `message`.includes("invalid")
        `detail.text`.includes("invalid")
    const invalidAttrEnd = await sanicXML.parseFile("tests/files/invalid-attr2.xml")
    Assert(invalidAttrEnd)
        .is(Error)
        `message`.includes("invalid")
        `detail.text`.includes("invalid")

    Section `Mismatched Close Tags`

    const mismatch = await sanicXML.parseFile("tests/files/mismatch-close.xml")
    Assert(mismatch)
        .is(Error)
        `detail.found`.eq("hi")
        `detail.expected`.eq("test")
}
