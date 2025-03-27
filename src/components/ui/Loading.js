import { CircularProgress, Box, Typography } from '@mui/material';

export function Loading({ text = 'Loading...' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={4}
    >
      <CircularProgress color="primary" />
      <Typography color="textSecondary">{text}</Typography>
    </Box>
  );
} 