import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import '../editor/InputEditor.scss';
import { Fragment } from "react";
import { Typography, useTheme } from "@mui/material";
import { DARK_MODE } from "../../main";


interface OutputComponentProps {
    lineHeight: number | null;
    fontSize: number | null;
}

export function OutputComponent(props: OutputComponentProps) {
    const { palette } = useTheme();

    const { lineHeight, fontSize } = props;

    const { queryResult, handleExpandRow } = useQueryHandlingUtils();

    const maxColLength = Math.max(...queryResult.map((line) => line.resultColumns.length));

    if (!lineHeight || !fontSize) {
        return <></>;
    }


    let startBlock = <Fragment />
    if (queryResult.length > 0 && queryResult[0].lineRange.start > 1) {
        startBlock = (
            <Fragment>
                <div style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(140px, 1fr)".repeat(maxColLength) }}>
                    {
                        [...Array(queryResult[0].lineRange.start - 1)].map((i: number, idx: number) => (
                            <div key={`${idx}-startingBlockFillerLine`} style={{ height: lineHeight, fontSize, gridColumnStart: 1, gridColumnEnd: -1, color: "#000", userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                            </div>
                        ))
                    }
                </div>
            </Fragment>
        );
    }

    return (
        <div style={{ height: "87vh", width: "49.5vw", overflow: "scroll", backgroundColor: palette.background.paper, display: "flex", flexDirection: "column" }}>
            {startBlock}
            {
                (queryResult ?? []).map((line, lineIndex) => {
                    let counter = line.lineRange.end - line.lineRange.start;
                    return (line.error == "" ?
                        <Fragment key={`${lineIndex}-resultBlockFragment`}>
                            <div key={`${lineIndex}-resultBlock`} style={{ flex: "0", width: "min-content", display: "grid", gridTemplateColumns: "minmax(140px, 1fr)".repeat(maxColLength) }}>
                                {
                                    line.resultColumns.map((col: string, i: number) => (
                                        <div key={`${lineIndex}-${i}-startingBlockFiller`} style={{ height: lineHeight, gridColumnStart: i + 1, gridColumnEnd: i + 2, userSelect: "none", cursor: "pointer", textAlign: 'left', paddingLeft: 2, paddingRight: 2 }} onClick={() => handleExpandRow(lineIndex, !line.expanded)} className={lineIndex == queryResult.length - 1 ? DARK_MODE ? 'result-dark' : 'result' : `gradient-1`}>
                                            <Typography fontWeight={"bold"} fontSize={fontSize} style={{ opacity: line.expanded ? 1.0 : 0.5 }}>{col}</Typography>
                                        </div>
                                    ))
                                }{
                                    line.expanded && line.resultRows.slice(0, lineIndex + 1 < queryResult.length ? 5 : line.resultRows.length).map((row: string[]) => {
                                        counter--;
                                        return row.map((val: string, i: number) => (
                                            <div key={`${lineIndex}-${i}-value`} style={{ height: lineHeight, fontSize, gridColumnStart: i + 1, gridColumnEnd: i + 2, userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: 2, paddingRight: 2 }}>
                                                <Typography fontSize={fontSize - 1} textOverflow={'ellipsis'} overflow={'hidden'}>{val}</Typography>
                                            </div>
                                        ))
                                    })
                                }
                                {
                                    line.expanded && line.resultRows.length > (lineIndex + 1 < queryResult.length ? 5 : 25) &&
                                        <div key={`${lineIndex}-moreEntriesBlockFiller`} style={{ height: lineHeight, fontSize, gridColumnStart: 1, gridColumnEnd: -1, color: "#000", userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: 2, paddingRight: 2 }}>
                                            ...
                                        </div>
                                }
                                {
                                    counter > 0 && [...Array(counter)].map((_, idx: number) => (
                                        <div key={`${lineIndex}-${idx}-endingBlockFiller`} style={{ height: lineHeight, fontSize, gridColumnStart: 1, gridColumnEnd: -1, color: "#000", userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: 2, paddingRight: 2 }}>
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
