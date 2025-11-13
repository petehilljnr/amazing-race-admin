

import Header from "../components/Header";
import { Container } from "react-bootstrap";

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100 w-100">
      <header>
        <Header />
      </header>
      <Container as="main" className="flex-grow-1 py-3 w-100">
        {children}
      </Container>
    </div>
  );
};

export default Layout;
