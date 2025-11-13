import React, { useState, useEffect } from "react";
import { Container, Table, Spinner, Badge, Card, Row, Col, Form, Modal, Button } from "react-bootstrap";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [filters, setFilters] = useState({
    teamName: "",
    taskName: "",
    taskType: "",
    status: ""
  });

  // Get unique values for filter dropdowns
  const uniqueTeamNames = [...new Set(submissions.map(s => s.teamName))].sort();
  const uniqueTaskNames = [...new Set(submissions.map(s => s.taskName))].sort();
  const uniqueTaskTypes = [...new Set(submissions.map(s => s.taskType))].sort();
  const uniqueStatuses = [...new Set(submissions.map(s => s.status))].sort();

  // Filter submissions based on current filters
  const filteredSubmissions = submissions.filter(submission => {
    return (
      (filters.teamName === "" || submission.teamName.toLowerCase().includes(filters.teamName.toLowerCase())) &&
      (filters.taskName === "" || submission.taskName.toLowerCase().includes(filters.taskName.toLowerCase())) &&
      (filters.taskType === "" || submission.taskType === filters.taskType) &&
      (filters.status === "" || submission.status === filters.status)
    );
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      teamName: "",
      taskName: "",
      taskType: "",
      status: ""
    });
  };

  const handleRowClick = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
    setShowCorrectAnswer(false); // Reset correct answer visibility when opening modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
    setShowCorrectAnswer(false); // Reset correct answer visibility when closing modal
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "submissions"), async (querySnapshot) => {
      try {
        const submissionPromises = querySnapshot.docs.map(async (submissionDoc) => {
          const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
          
          // Fetch team details
          let teamName = "Unknown Team";
          if (submissionData.teamId) {
            try {
              const teamDoc = await getDoc(doc(db, "teams", submissionData.teamId));
              if (teamDoc.exists()) {
                teamName = teamDoc.data().name || "Unknown Team";
              }
            } catch (error) {
              console.error("Error fetching team:", error);
            }
          }

          // Fetch task details
          let taskName = "Unknown Task";
          let taskDescription = "No description";
          let taskType = "Unknown";
          let correctAnswer = null;
          if (submissionData.taskId) {
            try {
              const taskDoc = await getDoc(doc(db, "tasks", submissionData.taskId));
              if (taskDoc.exists()) {
                const taskData = taskDoc.data();
                taskName = taskData.name || "Unknown Task";
                taskDescription = taskData.description || "No description";
                taskType = taskData.answerType || submissionData.answerType || "Unknown";
                correctAnswer = taskData.answer || null;
              }
            } catch (error) {
              console.error("Error fetching task:", error);
            }
          }

          return {
            ...submissionData,
            teamName,
            taskName,
            taskDescription,
            taskType,
            correctAnswer
          };
        });

        const enrichedSubmissions = await Promise.all(submissionPromises);
        // Sort by submission date (newest first)
        enrichedSubmissions.sort((a, b) => {
          if (a.submittedAt && b.submittedAt) {
            return b.submittedAt.toDate() - a.submittedAt.toDate();
          }
          return 0;
        });
        
        setSubmissions(enrichedSubmissions);
        setLoading(false);
      } catch (error) {
        console.error("Error processing submissions:", error);
        toast.error("Error loading submissions");
        setLoading(false);
      }
    }, (error) => {
      console.error("Error listening to submissions:", error);
      toast.error("Error listening to submissions: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "correct":
        return <Badge bg="success">Correct</Badge>;
      case "wrong":
        return <Badge bg="danger">Wrong</Badge>;
      default:
        return <Badge bg="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const getTaskTypeBadge = (type) => {
    switch (type) {
      case "photo":
        return <Badge bg="info">Photo</Badge>;
      case "text":
        return <Badge bg="primary">Text</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Submissions</h2>
        <Badge bg="primary" className="fs-6">
          {filteredSubmissions.length} of {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Filters</h6>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={clearFilters}
            >
              Clear All
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Team Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search team name..."
                  value={filters.teamName}
                  onChange={(e) => handleFilterChange("teamName", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search task name..."
                  value={filters.taskName}
                  onChange={(e) => handleFilterChange("taskName", e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Task Type</Form.Label>
                <Form.Select
                  value={filters.taskType}
                  onChange={(e) => handleFilterChange("taskType", e.target.value)}
                >
                  <option value="">All Types</option>
                  {uniqueTaskTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredSubmissions.length === 0 ? (
        <Card className="text-center">
          <Card.Body>
            {submissions.length === 0 ? (
              <>
                <h5>No submissions found</h5>
                <p className="text-muted">No submissions have been made yet.</p>
              </>
            ) : (
              <>
                <h5>No submissions match your filters</h5>
                <p className="text-muted">Try adjusting your filter criteria.</p>
              </>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table responsive striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Team Name</th>
                  <th>Task Name</th>
                  <th>Task Description</th>
                  <th>Task Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr 
                    key={submission.id} 
                    onClick={() => handleRowClick(submission)}
                    style={{ cursor: 'pointer' }}
                    className="table-row-hover"
                  >
                    <td className="fw-semibold">{submission.teamName}</td>
                    <td>{submission.taskName}</td>
                    <td>
                      <div style={{ maxWidth: "300px" }}>
                        {submission.taskDescription.length > 100
                          ? `${submission.taskDescription.substring(0, 100)}...`
                          : submission.taskDescription
                        }
                      </div>
                    </td>
                    <td>{getTaskTypeBadge(submission.taskType)}</td>
                    <td>{getStatusBadge(submission.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Submission Detail Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submission Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <div>
              <div className="mb-3">
                <small className="text-muted">
                  <strong>Submission ID:</strong> <code>{selectedSubmission.id}</code>
                </small>
              </div>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Team Name:</strong>
                  <p>{selectedSubmission.teamName}</p>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Task Name:</strong>
                  <p>{selectedSubmission.taskName}</p>
                </Col>
                <Col md={6}>
                  <strong>Task Type:</strong>
                  <div>{getTaskTypeBadge(selectedSubmission.taskType)}</div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Task Description:</strong>
                <p>{selectedSubmission.taskDescription}</p>
              </div>
              
              {selectedSubmission.answer && (
                <div className="mb-4">
                  <strong>Submitted Answer:</strong>
                  {selectedSubmission.taskType === 'photo' ? (
                    <div className="mt-2">
                      <img
                        src={selectedSubmission.answer}
                        alt="Submission"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="p-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded">
                        <h6 className="text-primary mb-2">Text Answer:</h6>
                        <p className="mb-0 fs-5 text-dark">{selectedSubmission.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {selectedSubmission.correctAnswer && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Correct Answer:</strong>
                    <Button
                      variant={showCorrectAnswer ? "outline-success" : "success"}
                      size="sm"
                      onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                    >
                      {showCorrectAnswer ? "Hide Answer" : "Reveal Answer"}
                    </Button>
                  </div>
                  {showCorrectAnswer && (
                    <>
                      {selectedSubmission.taskType === 'photo' ? (
                        <div className="mt-2">
                          <img
                            src={selectedSubmission.correctAnswer}
                            alt="Correct Answer"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              objectFit: 'contain',
                              border: '1px solid #198754',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-3">
                          <div className="p-4 bg-success bg-opacity-10 border border-success border-opacity-25 rounded">
                            <h6 className="text-success mb-2">Expected Answer:</h6>
                            <p className="mb-0 fs-5 text-dark">{selectedSubmission.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {selectedSubmission.submittedAt && (
                <div className="mb-3">
                  <strong>Submitted At:</strong>
                  <p>{new Date(selectedSubmission.submittedAt.toDate()).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Submissions;