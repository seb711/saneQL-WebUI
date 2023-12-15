import { Editor, useMonaco } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import './InputEditor.scss';
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

        editor.addAction({
            id: "executeQueryAction",
            label: "Execute Query",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => {
                handleQueryInput()
            },
        });
    };

    const removeDecorations = () => {
        if (editorRef.current) {
            const model = editorRef.current.getModel()
            if (model) {
                const currentDecorations = model.getAllDecorations();
                if (currentDecorations && currentDecorations.length > 0) {
                    model.deltaDecorations(currentDecorations.map((d : any) => d.id), []);
                }
            }
        }
    }

    useEffect(() => {
        if (editorRef.current) {
            // remove the decoration things
            removeDecorations()

            const viewZones: any[] = [];
            const decorations: any[] = [];

            queryResult.forEach((line, i) => {
                decorations.push({
                    range: new monaco.Range(line.lineRange.start, 1, line.lineRange.end, 1),
                    options: { className: i == queryResult.length - 1 ? `result` : `gradient-${i % 15}`, isWholeLine: true }
                })

                if (line.expanded && line.lineRange.end - line.lineRange.start < line.resultRows.length + 1) {
                    const domNode = document.createElement('div');
                    domNode.style.backgroundColor = '#eee';
                    const viewZone = {
                        afterLineNumber: line.lineRange.end,
                        heightInLines: line.resultRows.length,
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

            if (decorations) {
                editorRef.current.createDecorationsCollection(decorations);
            }
        }
    }, [queryResult, handleQueryInput])

    return <Editor height={"90vh"} width="50vw" defaultLanguage="saneql" value={query}
        onChange={(s: string | undefined) => {updateQuery(s);}} onMount={handleEditorDidMount} />;
}