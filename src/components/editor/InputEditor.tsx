import {Editor, useMonaco} from "@monaco-editor/react";
import {useEffect, useState} from "react";
import {useQueryHandlingUtils} from "../query-handler/QueryHandlingProvider.tsx";

export function InputEditor() {

    const [queryInput, setQueryInput] = useState("");

    const {saneqlToSql, performQuery} = useQueryHandlingUtils();

    const monaco = useMonaco();

    useEffect(() => {
        if(monaco) {
            monaco
        }
    }, [monaco]);

    const handleChange = (s: string) => {
        if (s[s.length - 1] != "\n" || queryInput[queryInput.length - 1] === "\n") {

            setQueryInput(s);
        } else {
            setQueryInput(s + "\n".repeat(5));
        }
        const query = saneqlToSql(s);
        if (query != "") {
            performQuery(query);
        }
    }

    return <Editor height="90vh" width="45vw" defaultLanguage="saneql" value={queryInput}
                   onChange={(val) => handleChange(val ?? "")}/>;
}