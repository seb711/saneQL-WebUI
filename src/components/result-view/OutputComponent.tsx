import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import '../editor/InputEditor.css';
import { Fragment } from "react";


interface OutputComponentProps {
    lineHeight: number | null;
    fontSize: number | null;
}

export function OutputComponent(props: OutputComponentProps) {
    const { lineHeight, fontSize } = props;

    const { queryResult, handleExpandRow } = useQueryHandlingUtils();

    const maxColLength = Math.max(...queryResult.lines.map((line, _) => line.resultColumns.length));

    if (!lineHeight || !fontSize) {
        return <></>;
    }

    return (
        <div style={{ height: "90vh", width: "40vw", overflow: "scroll" }}>
            { 
                (queryResult.lines ?? []).map((line, lineIndex) => (
                    <Fragment>
                        <div style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(100px, 1fr) ".repeat(maxColLength), columnGap: 8 }} className={`myInlineDecorationHeader-${(lineIndex + 1) % 6}`}>
                            {
                                line.resultColumns.map((col, i) => (
                                    <div style={{height: lineHeight, fontSize, color: "#000", gridColumnStart: i, gridColumnEnd: i + 1, userSelect: "none", cursor: "pointer" , textAlign:'left', marginLeft: 4}} key={col} onClick={() => handleExpandRow(lineIndex, !line.expanded)}>
                                        {col}
                                    </div>
                                ))
                            }
                        </div>
                        <div style={{ width: "min-content", display: "grid", gridTemplateColumns: "minmax(100px, 1fr) ".repeat(maxColLength), columnGap: 8 }} className={`myInlineDecoration-${(lineIndex + 1) % 6}`}>
                            {
                                line.expanded && line.resultRows.map((row) => {
                                    return row.map((val, i) => (
                                        <div style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i, gridColumnEnd: i + 1, userSelect: "none", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left', paddingLeft: 4 }}>
                                            {val}
                                        </div>
                                    ))
                                })
                            }
                        </div>
                    </Fragment>
                ))
            }

        </div>
    );
}
