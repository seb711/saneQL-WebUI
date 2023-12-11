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

    return (
        <div style={{ height: "90vh", width: "50vw", overflow: "scroll" }}>
            {
                (queryResult ?? []).map((line, lineIndex) => (
                    line.error == "" ?
                        <Fragment>
                            <div style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(140px, 1fr)".repeat(maxColLength) }}>
                                {
                                    line.resultColumns.map((col: string, i: number) => (
                                        <div style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i + 1, gridColumnEnd: i + 2, userSelect: "none", cursor: "pointer", textAlign: 'left' }} key={col} onClick={() => handleExpandRow(lineIndex, !line.expanded)}  className={lineIndex == queryResult.length - 1 ? 'result' : `gradient-${(lineIndex) % 15}`}>
                                            <b>{col}</b>
                                        </div>
                                    ))
                                }{
                                    line.expanded && line.resultRows.map((row: string[]) => {
                                        return row.map((val: string, i: number) => (
                                            <div style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i+ 1, gridColumnEnd: i + 2, userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>
                                                {val}
                                            </div>
                                        ))
                                    })
                                }
                            </div>
                        </Fragment> :
                        <Fragment>
                            <div style={{ height: lineHeight, fontSize, color: "red" }} key={lineIndex} onClick={() => { }}>
                                {line.error}
                            </div>
                        </Fragment>
                ))
            }

        </div>
    );
}
