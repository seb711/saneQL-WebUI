import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import './InputEditor.css';
interface InputEditorProps {
    handleQueryInput: (val: string) => void,
    setLineHeight: (lh: number) => void,
    setFontSize: (fs: number) => void
}

// Define a type for the color map
type ColorMap = { [key: number]: string };

// Create a function to generate pastel colors
function generatePastelColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function InputEditor(props: InputEditorProps) {
    const monaco = useMonaco();

    const pastelColorMap: ColorMap = {};

    const viewZonesRef = useRef<string[]>([]);

    const { setLineHeight, setFontSize } = props;

    const { updateQuery, queryResult } = useQueryHandlingUtils();

    const editorRef = useRef<any>();

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        // Options are offset by 1 apparently https://microsoft.github.io/monaco-editor/docs.html#enums/editor.EditorOption.html
        setFontSize(editor.getOption(52 - 1));
        setLineHeight(editor.getOption(66 - 1));
    };

    useEffect(() => {
        if (editorRef.current) {
            const viewZones: any[] = [];
            const zonesToRemove: string[] = [];
            const decorations: any[] = [];

            queryResult.lines.forEach((line, i) => {
                decorations.push({
                    range: new monaco.Range(i + 1, 1, i + 1, 1),
                options: { className: `myInlineDecoration-${(i + 1) % 6}`, isWholeLine: true }
                })

                if (line.expanded && line.viewZoneId == "") {
                    let domNode = document.createElement('div');
                    domNode.style.backgroundColor = '#eee';
                    const viewZone = {
                        afterLineNumber: i + 1,
                        heightInLines: line.resultRows.length,
                        domNode
                    };

                    viewZones.push(viewZone);
                } else {
                    if (line.viewZoneId != "") {
                        zonesToRemove.push(line.viewZoneId);
                        line.viewZoneId = "";
                    }
                }
            })

            console.log(decorations);

            console.log(editorRef.current.createDecorationsCollection(decorations));


            editorRef.current.changeViewZones((changeAccessor: any) => {
                viewZonesRef.current.forEach((zoneId) => {
                    changeAccessor.removeZone(zoneId);
                })
                viewZonesRef.current = [];
                viewZones.forEach((viewZone) => {
                    viewZonesRef.current.push(changeAccessor.addZone(viewZone));
                })
            });

        }
    }, [queryResult])

    for (let i = 0; i <= 20; i++) {
        pastelColorMap[i] = generatePastelColor();
    }

    return <Editor width="45vw" defaultLanguage="saneql" value={queryResult.lines.map((line) => line.displayString).join("\n")}
        onChange={updateQuery} onMount={handleEditorDidMount} />;
}