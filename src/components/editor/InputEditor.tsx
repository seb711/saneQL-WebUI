import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import './InputEditor.scss';
import { DARK_MODE } from "../../main";
import { SaneqlLanguage } from "../../saneql/SaneqlLanguage";

interface InputEditorProps {
    handleQueryInput: (val: string) => void,
    setLineHeight: (lh: number) => void,
    setFontSize: (fs: number) => void
}

export function InputEditor(props: InputEditorProps) {
    const monaco = useMonaco();

    const viewZonesRef = useRef<string[]>([]);

    const { setLineHeight, setFontSize } = props;

    const { updateQuery, queryResult, handleQueryInput, query } = useQueryHandlingUtils();

    const editorRef = useRef<any>();

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        // Options are offset by 1 apparently https://microsoft.github.io/monaco-editor/docs.html#enums/editor.EditorOption.html
        setFontSize(editor.getOption(52 - 1));
        setLineHeight(editor.getOption(66 - 1));

        SaneqlLanguage.register(monaco);

        editorRef.current.addAction({
            id: "executeQueryAction",
            label: "Execute Query",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => {
                handleQueryInput()
            },
        });
    };

    useEffect(() => {
        if (editorRef.current) {
            // remove the decoration things
            const model = editorRef.current.getModel()
            if (model) {
                const currentDecorations = model.getAllDecorations();
                if (currentDecorations && currentDecorations.length > 0) {
                    model.deltaDecorations(currentDecorations.map((d: any) => d.id), []);
                }
            }

            const viewZones: any[] = [];
            const decorations: any[] = [];

            queryResult.forEach((line, i) => {
                const resultClass = DARK_MODE ? "result-dark" : "result";

                decorations.push({
                    range: new monaco.Range(line.lineRange.start, 1, line.lineRange.end, 1),
                    options: { className: i == queryResult.length - 1 ? resultClass : `gradient-1`, isWholeLine: true }
                })

                const isNotLastLine = i != queryResult.length - 1;

                if (line.expanded && line.lineRange.end - line.lineRange.start < line.resultRows.length + 1 && isNotLastLine) {
                    const domNode = document.createElement('div');
                    const background = DARK_MODE ? 'repeating-linear-gradient(-45deg, #272727, #272727 3px, #222 3px, #222 6px)' : 'repeating-linear-gradient(-45deg, #eee, #eee 3px, #e6e6e6 3px, #e6e6e6 6px)';

                    domNode.style.background = background;
                    const viewZone = {
                        afterLineNumber: line.lineRange.end,
                        heightInLines: line.resultRows.length - (line.lineRange.end - line.lineRange.start),
                        domNode
                    };

                    viewZones.push(viewZone);
                }
            })

            editorRef.current.addAction({
                id: "executeQueryAction",
                label: "Execute Query",
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
                run: () => {
                    handleQueryInput()
                },
            });

            editorRef.current.changeViewZones((changeAccessor: any) => {
                viewZonesRef.current.forEach((zoneId) => {
                    changeAccessor.removeZone(zoneId);
                })
                viewZonesRef.current = [];
                viewZones.forEach((viewZone) => {
                    viewZonesRef.current.push(changeAccessor.addZone(viewZone));
                })
            });

            editorRef.current.getModel().deltaDecorations([], decorations);
        }
    }, [queryResult, handleQueryInput, monaco])

    return <Editor
        height={"87vh"}
        width="49.5vw"
        defaultLanguage="saneql"
        value={query}
        onChange={(s: string | undefined) => { updateQuery(s); }}
        onMount={handleEditorDidMount}
        theme= {DARK_MODE ? "vs-dark" : "vs"}
        options={{
            minimap: { enabled: false },
        }}
    />;
}
