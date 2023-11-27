import {useEffect} from 'react'
import './App.css'
import {useMonaco} from "@monaco-editor/react";
import {QueryHandlingProvider} from "./components/query-handler/QueryHandlingProvider.tsx";
import {InputEditor} from "./components/editor/InputEditor.tsx";
import {OutputComponent} from "./components/result-view/OutputComponent.tsx";

function App() {

    const monaco = useMonaco();

    useEffect(() => {
    }, [monaco]);

    return (
        <QueryHandlingProvider>
            <div style={{
                display: "flex",
                width: "100vw",
                height: "100vh",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <InputEditor/>
                <OutputComponent/>
            </div>
        </QueryHandlingProvider>
    )
}

export default App
