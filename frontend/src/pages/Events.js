import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Container,
  Box,
  TextField,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Popper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  Paper,
  Grow,
} from "@mui/material";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    sort: "startDate",
  });
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const categoryAnchorRef = React.useRef(null);
  const sortAnchorRef = React.useRef(null);
  const navigate = useNavigate();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching events with params:", {
        page,
        limit: 9,
        ...filters,
      });

      const response = await api.get("/events", {
        params: {
          page,
          limit: 9,
          ...filters,
        },
      });

      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        console.log("Setting events:", response.data.events);
        setEvents(response.data.events);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error(response.data?.message || "Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load events",
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleCategoryMenuClose = (event, value) => {
    if (value) {
      handleFilterChange({ target: { name: "category", value } });
    }
    setCategoryMenuOpen(false);
  };

  const handleSortMenuClose = (event, value) => {
    if (value) {
      handleFilterChange({ target: { name: "sort", value } });
    }
    setSortMenuOpen(false);
  };

  const handleEventClick = (eventId) => {
    console.log("Clicking event with ID:", eventId);
    navigate(`/events/${eventId}`);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Button
              ref={categoryAnchorRef}
              fullWidth
              variant="outlined"
              onClick={() => setCategoryMenuOpen(true)}
              aria-controls={categoryMenuOpen ? "category-menu" : undefined}
              aria-expanded={categoryMenuOpen ? "true" : undefined}
              aria-haspopup="true"
            >
              {filters.category === "all" ? "All Categories" : filters.category}
            </Button>
            <Popper
              open={categoryMenuOpen}
              anchorEl={categoryAnchorRef.current}
              role={undefined}
              placement="bottom-start"
              transition
              disablePortal
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCategoryMenuClose}>
                      <MenuList id="category-menu" autoFocusItem>
                        <MenuItem
                          onClick={(e) => handleCategoryMenuClose(e, "all")}
                        >
                          All Categories
                        </MenuItem>
                        <MenuItem
                          onClick={(e) =>
                            handleCategoryMenuClose(e, "conference")
                          }
                        >
                          Conference
                        </MenuItem>
                        <MenuItem
                          onClick={(e) =>
                            handleCategoryMenuClose(e, "exhibition")
                          }
                        >
                          Exhibition
                        </MenuItem>
                        <MenuItem
                          onClick={(e) =>
                            handleCategoryMenuClose(e, "workshop")
                          }
                        >
                          Workshop
                        </MenuItem>
                        <MenuItem
                          onClick={(e) =>
                            handleCategoryMenuClose(e, "trade_show")
                          }
                        >
                          Trade Show
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => handleCategoryMenuClose(e, "other")}
                        >
                          Other
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Events"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              ref={sortAnchorRef}
              fullWidth
              variant="outlined"
              onClick={() => setSortMenuOpen(true)}
              aria-controls={sortMenuOpen ? "sort-menu" : undefined}
              aria-expanded={sortMenuOpen ? "true" : undefined}
              aria-haspopup="true"
            >
              {filters.sort === "startDate"
                ? "Sort by Date"
                : filters.sort === "price"
                  ? "Price: Low to High"
                  : "Price: High to Low"}
            </Button>
            <Popper
              open={sortMenuOpen}
              anchorEl={sortAnchorRef.current}
              role={undefined}
              placement="bottom-start"
              transition
              disablePortal
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps}>
                  <Paper>
                    <ClickAwayListener onClickAway={handleSortMenuClose}>
                      <MenuList id="sort-menu" autoFocusItem>
                        <MenuItem
                          onClick={(e) => handleSortMenuClose(e, "startDate")}
                        >
                          Sort by Date
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => handleSortMenuClose(e, "price")}
                        >
                          Price: Low to High
                        </MenuItem>
                        <MenuItem
                          onClick={(e) => handleSortMenuClose(e, "price-desc")}
                        >
                          Price: High to Low
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Grid>
        </Grid>
      </Box>

      {events.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event._id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                      transition: "all 0.3s ease-in-out",
                    },
                  }}
                  onClick={() => handleEventClick(event._id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.image || "/placeholder-event.jpg"}
                    alt={event.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{event.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default Events;
