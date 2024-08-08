import sanicXML from "../lib/main.js"

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

    const obj = sanicXML.parse(xmlString)
    Assert(obj)
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

    Section `To String`

    const basicString = sanicXML.toString(obj, { indent: "  " })
    Assert(basicString)
        `length`.eq(1072)
        .includes("    <address>")

    Section `To Blob`

    const blob = sanicXML.toBlob(obj, { indent: "  " })
    Assert(blob)
        `size`.eq(1072)
}
