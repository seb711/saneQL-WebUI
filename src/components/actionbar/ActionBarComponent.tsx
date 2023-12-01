import { useQueryHandlingUtils } from "../query-handler/QueryHandlingProvider";
import RunIcon from "@mui/icons-material/PlayArrow";

export function ActionBarComponent() {
  const { handleQueryInput } = useQueryHandlingUtils();

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
