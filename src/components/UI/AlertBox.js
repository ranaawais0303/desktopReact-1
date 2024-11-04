import React from "react";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const AlertBox = ({ text, severity, onClose }) => (
  <Alert
    action={
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={onClose} // Calls onClose instead of setting showAlert globally
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    }
    severity={severity}
  >
    {text}
  </Alert>
);

export default AlertBox;