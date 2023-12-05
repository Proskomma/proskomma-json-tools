const { styles } = require('./renderStyles');

const camelToKebabCase = (str) =>
    str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const getStyles = (type, subType) => {

    if (!styles[type]) {
        throw new Error(`Unknown style type '${type}'`);
    }
    if (!styles[type][subType]) {
        console.log(`No styles for ${type}/${subType}`)
        return styles[type].default;
    }
    const retObj = { ...styles[type].default, ...styles[type][subType] };
    let retArr = []
    Object.entries(retObj).forEach(([key, value]) => {
        retArr.push(`${camelToKebabCase(key)}: ${value}`)
    })
    return retArr.join("; ");
}

function InlineElement(props) {
    return `<span
            style={{
                ...props.style,
                paddingLeft: "0.5em",
                paddingRight: "0.5em",
                backgroundColor: "#CCC",
                marginTop: "1em",
                marginBottom: "1em"
            }}
            onClick={toggleDisplay}
        >
            ${props.children}
        </span>`
    /* if not display
        } else {
            return `<span
                style={{
                    verticalAlign: "super",
                    fontSize: "x-small",
                    fontWeight: "bold",
                    marginRight: "0.25em",
                    padding: "2px",
                    backgroundColor: "#CCC"
                }}
                onClick={toggleDisplay}
            >
            ${props.linkText}
        </span>`
        }
    */
}

const renderers = {
    text: text => `${text}`,
    chapter_label: number => `<span style="${getStyles('marks', "chapter_label")}">${number}</span>`,
    verses_label: number => `<span style="${getStyles('marks', "verses_label")}">${number}</span>`,
    paragraph: (subType, content, footnoteNo) => {
        return ["usfm:f", "usfm:x"].includes(subType) ?
            InlineElement({
                style: getStyles('paras', subType),
                linkText: (subType === "usfm:f") ? footnoteNo : "*",
                children: content.join('')
            })
            : `<p style="${getStyles('paras', subType)}">${content.join('')}</p>`
    },
    wrapper: (atts, subType, content) => subType === 'cell' ?

        atts.role === 'body' ?
            `<td colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</td>`
            :
            `<th colspan=${atts.nCols} style="text-align:${atts.alignment}">${content.join("")}</th>`
        :

        `<span style="${getStyles('wrappers', subType)}">${content}</span>`,
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
