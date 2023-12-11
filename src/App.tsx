import { useState } from 'react'
import './App.css'
import { QueryHandlingProvider } from "./components/query-handler/QueryHandlingProvider.tsx";
import { InputEditor } from "./components/editor/InputEditor.tsx";
import { OutputComponent } from "./components/result-view/OutputComponent.tsx";
import { ActionBarComponent } from './components/actionbar/ActionBarComponent.tsx';

function App() {

    const [lineHeight, setLineHeight] = useState<number | null>(null);
    const [fontSize, setFontSize] = useState<number | null>(null);

    return (
        <QueryHandlingProvider>
            <div style={{
                display: "flex",
                width: "100vw",
                height: "100vh",
                alignItems: 'center',
                justifyContent: "center"
            }}>
                <div style={{
                    display: "flex",
                    height: "90vh",
                    alignItems: "flex-start",
                    justifyContent: "center"
                }}>
                    <ActionBarComponent/>
                    <InputEditor setLineHeight={setLineHeight} setFontSize={setFontSize} handleQueryInput={() => null} />
                    <div>
                        <OutputComponent lineHeight={lineHeight} fontSize={fontSize} />
                    </div>
                </div>
            </div>
        </QueryHandlingProvider>
    )
}

export default App
