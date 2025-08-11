import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <Container>
            <Box sx={{ textAlign: 'center', mt: 8 }}>
                <Typography variant="h1" component="h2" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Page Not Found
                </Typography>
                <Typography variant="body1" sx={{mb: 4}}>
                    The page you are looking for does not exist.
                </Typography>
                <Button variant="contained" component={Link} to="/">
                    Go to Dashboard
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;
