import { Alert as MuiAlert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  borderRadius: '8px',
}));

export function Alert({ open, message, severity = 'error', onClose, ...props }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <StyledAlert
        onClose={onClose}
        severity={severity}
        elevation={6}
        variant="filled"
        {...props}
      >
        {message}
      </StyledAlert>
    </Snackbar>
  );
} 