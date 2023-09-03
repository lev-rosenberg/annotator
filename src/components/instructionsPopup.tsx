import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

interface DialogProps {
  dialogueOpen: boolean;
  close: () => void;
}

export default function InstructionsDialog(props: DialogProps) {
  function handleClose() {
    props.close();
  }
  return (
    <div>
      <Dialog open={props.dialogueOpen} onClose={handleClose}>
        <DialogTitle>Instructions</DialogTitle>
        <DialogContent>
          <p>1. Click on &quot;Start Drawing&quot; to begin annotating</p>
          <p>2. Edit polygons and vertices by dragging</p>
          <p>3. Delete polygons on right click</p>
          <p>4. Zoom with scroll wheel</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
