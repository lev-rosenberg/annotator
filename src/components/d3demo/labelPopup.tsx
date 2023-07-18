import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog(props:any) {
  const classOptions = ["scratch", "dent", "crack"]
  
  const handleClose = (option:string) => {
    props.setDialogueOpen(false);
    props.setPolygonLabels([...props.polygonLabels, {label: option, coords: null, visible: null}])
  };

  return (
    <div>
      <Dialog open={props.dialogueOpen} onClose={handleClose}>
        <DialogTitle>Choose class</DialogTitle>
        
        <DialogActions>
          {classOptions.map((option) => {
            
            return (
              <Button onClick={() => handleClose(option)} key={option}>
              {option}
            </Button>
          )})}
        </DialogActions>
      </Dialog>
    </div>
  );
}