const renderers = {
    text: text => `${text}`,
    chapter_label: number => `<span class="marks_chapter_label">${number}</span>`,
    verses_label: number => `<span class="marks_verses_label">${number}</span>`,
    paragraph: (subType, content, footnoteNo) => {
        return `<p class="${`paras_usfm_${subType.split(':')[1]}`}">${content.join('')}</p>`
    },
    wrapper: (atts, subType, content) => subType === 'cell' ?

        atts.role === 'body' ?
            `<td colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</td>`
            :
            `<th colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</th>`
        :

        `<span class="${`paras_usfm_${subType.split(':')[1]}`}">${content.join("")}</span>`,
    wWrapper: (atts, content) => Object.keys(atts).length === 0 ?
        content :
        `<span
            style={{
                display: "inline-block",
                verticalAlign: "top",
                textAlign: "center"
            }}
        >
        <div>${content}</div>${Object.entries(atts).map(
            a =>
                `<div
                            style={{
                                fontSize: "xx-small",
                                fontWeight: "bold"
                            }}
                        >
                        {${a[0]} = ${a[1]}} 
                        </div>`
        ).join('')
        }</span>`,
    mergeParas: paras => paras.join('\n'),
    row: (content) => {
        return (`<tr>${content.join("")}</tr>`)
    },
    table: (content) => {
        return (`<table border>${content.join(" ")}</table>`)
    }
}

module.exports = { renderers };
