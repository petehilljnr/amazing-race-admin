import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Header = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Successfully logged out!");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">DPG Amazing Race Admin</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Scores</Nav.Link>
            <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
            <Nav.Link as={Link} to="/bulk-upload">Bulk Upload</Nav.Link>
            <Nav.Link as={Link} to="/pending">Pending</Nav.Link>
            <Nav.Link as={Link} to="/submissions">Submissions</Nav.Link>
          </Nav>
          <Nav className="ms-2">
            <span className="navbar-text me-3">
              {currentUser?.email}
            </span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
