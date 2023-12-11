import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import RunIcon from "@mui/icons-material/PlayArrow";
import { useEffect } from 'react';

export function ActionBarComponent() {
  const { handleQueryInput } = useQueryHandlingUtils();

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
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "90vh",
        width: "4vw",
        overflow: "none",
        backgroundColor: "grey",
      }}
    >
      <button
        style={{
          padding: "5px",
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        onClick={handleQueryInput}
      >
        <RunIcon />
      </button>
    </div>
  );
}
