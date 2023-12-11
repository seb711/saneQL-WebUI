import { useState } from 'react'
import './App.css'
import { QueryHandlingProvider } from "./components/query-handler/QueryHandlingProvider.tsx";
import { InputEditor } from "./components/editor/InputEditor.tsx";
import { OutputComponent } from "./components/result-view/OutputComponent.tsx";
import { Toolbar } from './components/toolbar/Toolbar.tsx';

function App() {

    const [lineHeight, setLineHeight] = useState<number | null>(null);
    const [fontSize, setFontSize] = useState<number | null>(null);

    return (
        <QueryHandlingProvider>
            <div style={{
                display: "flex",
                height: "5vh",
                width: "100vw",
                background: 'blue'
            }}>
                <Toolbar/>
            </div>

            <div style={{
                display: "flex",
                width: "100vw",
                height: "95vh",
            }}>

                <InputEditor setLineHeight={setLineHeight} setFontSize={setFontSize} handleQueryInput={() => null} />
                <OutputComponent lineHeight={lineHeight} fontSize={fontSize} />
            </div>
        </QueryHandlingProvider>
    )
}

export default App
