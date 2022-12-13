import PerfRenderFromJson from '../../PerfRenderFromJson';
import mergeActions from '../../mergeActions';
import transforms from '..';
import longVerseCheckActions from './longVerseCheckActions';

const longVerseCheckCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    longVerseCheckActions,
                    transforms.perf2perf.identityActions,
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const longVerseCheck = {
    name: "longVerseCheck",
    type: "Transform",
    description: "PERF=>PERF: Strips most markup",
    documentation: "This transform removes milestones, wrappers and most marks. It has been used in several pipelines. It may also be stripping metaContent.",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: longVerseCheckCode
}
export default longVerseCheck;