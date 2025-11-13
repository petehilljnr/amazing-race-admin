import React from "react";
import { Container } from "react-bootstrap";

const Contact = () => {
  return (
    <Container className="py-5">
      <h2>Contact Us</h2>
      <p>If you have any questions or feedback, feel free to reach out!</p>
      <ul>
        <li>Email: info@example.com</li>
        <li>Phone: (123) 456-7890</li>
      </ul>
    </Container>
  );
};

export default Contact;
