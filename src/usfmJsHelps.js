const flattenZalns = vos => {
    const ret = [];
    for (const vo of vos) {
        if (vo.tag && vo.tag === "zaln") {
            if (vo.children[0].tag === "w") {
                ret.push(vo);
            } else {
                const childZalns = flattenZalns(vo.children);
                const payload = childZalns[childZalns.length - 1].children;
                for (const childZaln of [vo, ...childZalns]) {
                    childZaln.children = payload;
                    ret.push(childZaln);
                }
            }
        }
    }
    return ret;
}

const alignmentLookupFromUsfmJs = usfmJs => {
    let ret = {};
    for (const [chapterN, chapter] of Object.entries(usfmJs.chapters)) {
        ret[chapterN] = {};
        for (const [verseN, verse] of Object.entries(chapter)) {
            ret[chapterN][verseN] = {
                "before": {},
                "after": {}
            };
            for (const verseObject of flattenZalns(verse.verseObjects)) {
                const startAlignmentKey = `${verseObject.children[0].text}_${verseObject.children[0].occurrence}`;
                if (!(startAlignmentKey in ret[chapterN][verseN]["before"])) {
                    ret[chapterN][verseN]["before"][startAlignmentKey] = [];
                }
                let vo = {
                    strong: verseObject.strong,
                    lemma: verseObject.lemma,
                    morph: verseObject.morph,
                    occurrence: verseObject.occurrence,
                    occurrences: verseObject.occurrences,
                    content: verseObject.content
                }
                ret[chapterN][verseN]["before"][startAlignmentKey].push(vo);
                const endAlignmentKey = `${verseObject.children[verseObject.children.length - 1].text}_${verseObject.children[verseObject.children.length - 1].occurrence}`;
                if (!(endAlignmentKey in ret[chapterN][verseN]["after"])) {
                    ret[chapterN][verseN]["after"][endAlignmentKey] = [];
                }
                vo = {
                    strong: verseObject.strong,
                    lemma: verseObject.lemma,
                    morph: verseObject.morph,
                    occurrence: verseObject.occurrence,
                    occurrences: verseObject.occurrences,
                    content: verseObject.content
                }
                ret[chapterN][verseN]["after"][endAlignmentKey].unshift(vo);
            }
        }
    }
    return ret;
}

module.exports = {alignmentLookupFromUsfmJs};
