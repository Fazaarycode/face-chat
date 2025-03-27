import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

export function Input({ label, error, helperText, ...props }) {
  return (
    <StyledTextField
      fullWidth
      variant="outlined"
      label={label}
      error={error}
      helperText={helperText}
      {...props}
    />
  );
} 