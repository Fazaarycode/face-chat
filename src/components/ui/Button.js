import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 16px',
  textTransform: 'none',
  '&.MuiButton-containedPrimary': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
}));

export function Button({ variant = 'contained', color = 'primary', children, ...props }) {
  return (
    <StyledButton
      variant={variant}
      color={color}
      {...props}
    >
      {children}
    </StyledButton>
  );
} 