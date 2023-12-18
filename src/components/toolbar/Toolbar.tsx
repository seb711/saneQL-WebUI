import { useEffect, useState } from 'react';
import { useQueryHandlingUtils } from '../query-handler/QueryHandlingProvider';
import './Toolbar.css'; // You can create a CSS file for styling
import RunIcon from "@mui/icons-material/PlayArrow";
import { Box, IconButton, MenuItem, Select, Typography, useTheme } from '@mui/material';
import { DARK_MODE } from '../../main';

export const Toolbar = () => {
    const { palette } = useTheme();

    const [selectedQuery, setSelectedQuery] = useState<number>(-1);

    const { handleQueryInput, selectDefaultQuery } = useQueryHandlingUtils();

    const handleKeyDown = (event: any) => {
        if (event.ctrlKey && event.key === 'Enter') {
            handleQueryInput();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    });

    const handleSelectChange = (event: any) => {
        if (event.target.value >= 0) {
            setSelectedQuery(event.target.value);
            selectDefaultQuery(event.target.value);
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "8vh",
            width: "100vw",
        }}>
            <Box className="toolbar" style={{
            paddingLeft: 16,
            backgroundColor: palette.background.default
            }}>
                <div className="toolbar-left">
                    <img style={{height: "2.5em"}} src={DARK_MODE ? "./saneql-white.png" : "./saneql-black.png" }/>
                </div>
                <div className="toolbar-right">
                    <Select value={selectedQuery} onChange={handleSelectChange} variant='outlined' size="small" style={{ width: 200, alignItems: "flex-end" }}>
                        <MenuItem key={-1} value={-1} disabled>
                            <Typography textAlign={'center'} width={'100%'}>
                                Load query
                            </Typography>
                        </MenuItem>
                        {[...Array(22)].map((_, index) => (
                            <MenuItem key={index} value={index}>
                                <Typography textAlign={'center'} width={'100%'}>
                                    {`TPC-H ${index + 1}`}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Select>
                    <IconButton onClick={handleQueryInput} style={{ marginLeft: 16, marginRight: 8 }}>
                        <RunIcon sx={{fontSize: "1.3em"}}/>
                    </IconButton>
                </div>
            </Box>
        </div>

    );
};