import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Spinner, Badge, Button } from "react-bootstrap";
import { collection, onSnapshot, doc, getDoc, query, where, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const Pending = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSubmissions, setUpdatingSubmissions] = useState(new Set());

  const updateSubmissionStatus = async (submissionId, newStatus) => {
    try {
      setUpdatingSubmissions(prev => new Set([...prev, submissionId]));
      
      await updateDoc(doc(db, "submissions", submissionId), {
        status: newStatus,
        reviewedAt: new Date()
      });
      
      toast.success(`Submission marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission status");
    } finally {
      setUpdatingSubmissions(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    // Query submissions where status = 'pending' (both photo and text)
    const q = query(
      collection(db, "submissions"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      try {
        const submissionPromises = querySnapshot.docs.map(async (submissionDoc) => {
          const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
          
          // Fetch task details
          let taskDescription = "Unknown Task";
          if (submissionData.taskId) {
            try {
              const taskDoc = await getDoc(doc(db, "tasks", submissionData.taskId));
              if (taskDoc.exists()) {
                taskDescription = taskDoc.data().description || taskDoc.data().name || "Unknown Task";
              }
            } catch (error) {
              console.error("Error fetching task:", error);
            }
          }

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

          return {
            ...submissionData,
            taskDescription,
            teamName
          };
        });

        const enrichedSubmissions = await Promise.all(submissionPromises);
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
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Pending Submissions</h2>
        <Badge bg="primary" className="fs-6">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card className="text-center">
          <Card.Body>
            <h5>No pending submissions</h5>
            <p className="text-muted">All submissions have been reviewed.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {submissions.map((submission) => (
            <Col key={submission.id} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                {submission.answerType === 'photo' && submission.answer && (
                  <Card.Img
                    variant="top"
                    src={submission.answer}
                    style={{
                      height: "300px",
                      objectFit: "cover"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <Badge bg="warning" className="mb-2">Pending Review</Badge>
                    <Badge bg={submission.answerType === 'photo' ? 'info' : 'primary'} className="mb-2 ms-1">
                      {submission.answerType === 'photo' ? 'Photo' : 'Text'}
                    </Badge>
                    <Card.Title className="h5">{submission.teamName}</Card.Title>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Task:</h6>
                    <p className="mb-0">{submission.taskDescription}</p>
                  </div>

                  {submission.answerType === 'text' && submission.answer && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-1">Answer:</h6>
                      <p className="p-3 bg-light rounded border">{submission.answer}</p>
                    </div>
                  )}

                  {submission.submittedAt && (
                    <div className="mb-3">
                      <small className="text-muted">
                        Submitted: {new Date(submission.submittedAt.toDate()).toLocaleString()}
                      </small>
                    </div>
                  )}

                  <div className="mt-auto pt-3">
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button
                        variant="success"
                        onClick={() => updateSubmissionStatus(submission.id, "correct")}
                        disabled={updatingSubmissions.has(submission.id)}
                        className="flex-fill"
                      >
                        {updatingSubmissions.has(submission.id) ? "Updating..." : "Correct"}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => updateSubmissionStatus(submission.id, "wrong")}
                        disabled={updatingSubmissions.has(submission.id)}
                        className="flex-fill"
                      >
                        {updatingSubmissions.has(submission.id) ? "Updating..." : "Wrong"}
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Pending;