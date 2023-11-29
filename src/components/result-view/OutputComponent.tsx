import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import '../editor/InputEditor.css';


interface OutputComponentProps {
    lineHeight: number | null;
    fontSize: number | null;
}

export function OutputComponent(props: OutputComponentProps) {
    const { lineHeight, fontSize } = props;

    const { queryResult, handleExpandRow } = useQueryHandlingUtils();

    if (!lineHeight || !fontSize) {
        return <></>;
    }

    return (
        <div style={{ height: "90vh", width: "40vw", overflow: "scroll" }}>
            { 
                (queryResult.lines ?? []).map((line, lineIndex) => (
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(100px, 1fr) ".repeat(line.resultColumns.length), width: "100%", columnGap: 8 }} className={`myInlineDecoration-${(lineIndex + 1) % 6}`}>
                        {
                            line.resultColumns.map((col, i) => (
                                <div style={{ height: lineHeight, fontSize, color: "#000", gridColumnStart: i, gridColumnEnd: i + 1, userSelect: "none", cursor: "pointer" , textAlign:'left', paddingLeft: 4}} key={col} onClick={() => handleExpandRow(lineIndex, !line.expanded)}>
                                    {col}
                                </div>
                            ))
                        }
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
                ))
            }

        </div>
    );
}