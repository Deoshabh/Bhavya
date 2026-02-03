import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardMedia,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import api from "../services/api";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      setError("Invalid event ID format");
      setLoading(false);
      return;
    }

    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/events/${id}`);

        if (response.data.success) {
          setEvent(response.data.data);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/events/${id}`);

      if (response.data && response.data.success) {
        setEvent(response.data.event);
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch event details",
        );
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      if (error.response?.status === 400) {
        navigate("/events");
      } else if (error.response?.status === 404) {
        setError("Event not found");
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load event details",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Event not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={event.image || "/placeholder-event.jpg"}
              alt={event.title}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            {event.title}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Chip
              label={event.category}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip label={event.status} color="secondary" size="small" />
          </Box>
          <Typography variant="h5" color="primary" gutterBottom>
            ₹{event.price}
          </Typography>
          <Box sx={{ my: 2 }}>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <CalendarIcon sx={{ mr: 1 }} />
              {new Date(event.startDate).toLocaleDateString()}
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <LocationIcon sx={{ mr: 1 }} />
              {event.location}
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <PersonIcon sx={{ mr: 1 }} />
              {event.organizer?.name || "Unknown Organizer"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Book Tickets
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            About This Event
          </Typography>
          <Typography variant="body1" paragraph>
            {event.description}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;
