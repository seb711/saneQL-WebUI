import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material'

// TODO: Improve
export const DARK_MODE = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const theme = createTheme({palette: {
    mode: DARK_MODE ? 'dark': 'light',
    background: {
      paper: DARK_MODE ? '#1e1e1e' : '#f4f4f4' // 1e1e1e is the default background color of vscode dark
    }
  }},
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
