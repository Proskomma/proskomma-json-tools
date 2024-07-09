const renderers = {
    text: text => text.replace(/{/g, "<i>").replace(/}/g, "</i>"),
    chapter_label: number => `<span class="marks_chapter_label">${number}</span>`,
    verses_label: number => `<span class="marks_verses_label">${number}</span>`,
    paragraph: (subType, content, footnoteNo) => {
        const paraClass = subType.split(':')[1];
        let paraHtmlTag = "p";
        if (["f", "x"].includes(paraClass)) {
            paraHtmlTag = "span";
        } else if (["s", "ms", "imt", "imte", "mt"].includes(paraClass)) {
            paraHtmlTag = "h1";
        } else if (["s2", "ms2", "imt2", "imte2", "mt2", "mr", "sr"].includes(paraClass)) {
            paraHtmlTag = "h2";
        } else if (["s3", "ms3", "imt3", "imte3", "mt3", "r", "d"].includes(paraClass)) {
            paraHtmlTag = "h3";
        } else if (["s4", "ms4",  "imt4", "imte4", "mt4"].includes(paraClass)) {
            paraHtmlTag = "h4";
        }
        return `<${paraHtmlTag} class="${`paras_usfm_${paraClass}`}">${content.join('')}</${paraHtmlTag}>`
    },
    wrapper: (atts, subType, content) => subType === 'cell' ?

        atts.role === 'body' ?
            `<td colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</td>`
            :
            `<th colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</th>`
        :

        `<span class="${`wrappers_usfm_${subType.split(':')[1]}`}">${content.join("")}</span>`,
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
    milestone: (tags, atts) => "", // Do not write milestones in HTML for now.
    startChapters: nCols => `<section class="chapters" style="columns: ${nCols}">`,
    endChapters: () => "</section>",
    mergeParas: paras => paras.join('\n'),
    row: (content) => {
        return (`<tr>${content.join("")}</tr>`)
    },
    table: (content) => {
        return (`<table border>${content.join(" ")}</table>`)
    }
}

module.exports = { renderers };
