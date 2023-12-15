import { useEffect } from 'react';
import { useQueryHandlingUtils } from '../query-handler/QueryHandlingProvider';
import './Toolbar.css'; // You can create a CSS file for styling
import RunIcon from "@mui/icons-material/PlayArrow";

const options = [0, 1]; // Dropdown options

export const Toolbar = () => {
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
        selectDefaultQuery(event.target.value);
    };

    return (
        <div style={{
            display: "flex",
            height: "5vh",
            width: "100vw",
        }}>
            <div className="toolbar">
                <div className="toolbar-left">
                    <b>SaneQL</b>
                </div>
                <div className="toolbar-right">
                    <select onChange={handleSelectChange}>
                        <option value="" disabled selected>Load query</option>
                        {[...Array(22)].map((_, index) => (
                            <option key={index} value={index}>{index + 1}</option>
                        ))}
                    </select>
                    <RunIcon className="run-btn" onClick={handleQueryInput}/>
                </div>
            </div>
        </div>

    );
};