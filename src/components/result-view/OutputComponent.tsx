import {Editor} from "@monaco-editor/react";
import {useQueryHandlingUtils} from "../query-handler/QueryHandlingProvider.tsx";

export function OutputComponent() {
    const {queryResult} = useQueryHandlingUtils();
    return <Editor height="90vh" width="45vw" defaultLanguage="text" value={queryResult}/>;

}