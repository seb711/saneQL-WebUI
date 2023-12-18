import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import '../editor/InputEditor.scss';
import { Fragment } from "react";


interface OutputComponentProps {
    lineHeight: number | null;
    fontSize: number | null;
}

export function OutputComponent(props: OutputComponentProps) {
    const { lineHeight, fontSize } = props;

    const { queryResult, handleExpandRow } = useQueryHandlingUtils();

    const maxColLength = Math.max(...queryResult.map((line) => line.resultColumns.length));

    if (!lineHeight || !fontSize) {
        return <></>;
    }


    let startBlock = <Fragment/>
    if (queryResult.length > 0 && queryResult[0].lineRange.start > 1) {
        startBlock = (
            <Fragment>
                        <div style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(140px, 1fr)".repeat(maxColLength) }}>
                            {
                                [...Array(queryResult[0].lineRange.start - 1)].map((i: number) => (
                                    <div key={`${i}-startingBlockFillerLine`} style={{ height: lineHeight, fontSize, gridColumnStart: 1, gridColumnEnd: -1, color: "#000", userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                        </div>
                                ))
                            }
                            </div>
                    </Fragment>
        );
    }

    return (
        <div style={{ height: "90vh", width: "50vw", overflow: "scroll" }}>
            {startBlock}
            {
                (queryResult ?? []).map((line, lineIndex) => {
                    let counter = line.lineRange.end - line.lineRange.start;
                    return (line.error == "" ?
                    <Fragment  key={`${lineIndex}-resultBlockFragment`}>
                        <div key={`${lineIndex}-resultBlock`} style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(140px, 1fr)".repeat(maxColLength) }}>
                            {
                                line.resultColumns.map((col: string, i: number) => (
                                    <div key={`${lineIndex}-${i}-startingBlockFiller`} style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i + 1, gridColumnEnd: i + 2, userSelect: "none", cursor: "pointer", textAlign: 'left' }} onClick={() => handleExpandRow(lineIndex, !line.expanded)}  className={lineIndex == queryResult.length - 1 ? 'result' : `gradient-1`}>
                                        <b>{col}</b>
                                    </div>
                                ))
                            }{
                                line.expanded && line.resultRows.map((row: string[]) => {
                                    counter--;
                                    return row.map((val: string, i: number) => (
                                        <div key={`${lineIndex}-${i}-value`} style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i+ 1, gridColumnEnd: i + 2, userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                            {val}
                                        </div>
                                    ))
                                })
                            }{
                                counter > 0 && [...Array(counter)].map((_, idx: number) => (
                                    <div  key={`${lineIndex}-${idx}-endingBlockFiller`} style={{ height: lineHeight, fontSize, gridColumnStart: 1, gridColumnEnd: -1, color: "#000", userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                        </div>
                                ))
                            }
                        </div>
                    </Fragment> :
                    <Fragment key={`${lineIndex}-resultErrorFragment`}>
                        <div style={{ height: lineHeight, fontSize, color: "red" }} key={`${lineIndex}-errorBlock`} onClick={() => { }}>
                            {line.error}
                        </div>
                    </Fragment>
            );
                })
            }

        </div>
    );
}
