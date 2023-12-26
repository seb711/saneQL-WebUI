import { useState } from 'react'
import './App.css'
import { QueryHandlingProvider } from "./components/query-handler/QueryHandlingProvider.tsx";
import { InputEditor } from "./components/editor/InputEditor.tsx";
import { OutputComponent } from "./components/result-view/OutputComponent.tsx";
import { Toolbar } from './components/toolbar/Toolbar.tsx';
import { Box, Typography, useTheme } from '@mui/material';
import { DARK_MODE } from './main.tsx';

function App() {
    const { palette } = useTheme();
    const [lineHeight, setLineHeight] = useState<number | null>(null);
    const [fontSize, setFontSize] = useState<number | null>(null);

    return (
        <QueryHandlingProvider>
            <div style={{
                display: "flex",
                height: "8vh",
                width: "100vw",
            }}>
                <Toolbar />
            </div>

            <div style={{
                display: "flex",
                width: "100vw",
                height: "87vh",
                background: palette.background.default
            }}>

                <InputEditor setLineHeight={setLineHeight} setFontSize={setFontSize} handleQueryInput={() => null} />
                <Box flex={1}></Box>
                <OutputComponent lineHeight={lineHeight} fontSize={fontSize} />
            </div>
            <div style={{
                display: "flex",
                height: "5vh",
                width: "100vw",
                boxSizing: "border-box",
                alignItems: "center",
                padding: 8,
                paddingLeft: 16,
                paddingRight: 16,
                backgroundColor: palette.background.default
            }}>
                <Typography fontSize={".8em"}>Link to <a href={'https://www.cidrdb.org/cidr2024/papers/p48-neumann.pdf'} target="_blank">Paper</a> | <a href={'https://github.com/seb711/saneQL-WebUI'} style={{ color: palette.text.primary }} target="_blank">Interface</a> by <a href={'https://www.tumuchdata.club/'} style={{ color: palette.text.primary }} target="_blank">TUMuchData</a> (<a href={'https://github.com/seb711'} style={{ color: palette.text.primary }} target="_blank">Sebastian Kosak</a>, <a href={'https://github.com/paullampe'} style={{ color: palette.text.primary }} target="_blank">Paul Lampe</a>)</Typography>
                <Box flex={1} />
                <Box display={"flex"} height="100%" alignItems={"center"} justifyContent={"flex-end"} gap={1}>
                    <Typography fontSize={".8em"}>Powered by</Typography>
                    <a href="https://umbra-db.com/" target="_blank" rel="noopener noreferrer">
                        <img src={DARK_MODE ? "./umbra-white.png" : "./umbra-black.png"} style={{ height: ".8em" }}></img>
                    </a>
                </Box>
            </div>
        </QueryHandlingProvider>
    )
}

export default App
