import React from 'react';
import { Container, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{ mt: 2 }}
                    >
                        Reload Page
                    </Button>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 