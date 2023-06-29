import {useState}from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function FormDialog(props:any) {
  const classOptions = ["scratch", "dent", "crack"]
  
  const handleClose = (option:string) => {
    props.setOpen(false);
    props.setLabels([...props.labels, option])
  };

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose}>
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