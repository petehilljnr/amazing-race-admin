import React, { useState, useEffect } from "react";
import { Container, Spinner, Badge, Card, Row, Col } from "react-bootstrap";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const Scores = () => {
  const [teamScores, setTeamScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Watch both submissions and teams collections
    const unsubscribeSubmissions = onSnapshot(collection(db, "submissions"), async (submissionsSnapshot) => {
      const unsubscribeTeams = onSnapshot(collection(db, "teams"), async (teamsSnapshot) => {
        try {
          // First, get all teams
          const allTeams = {};
          teamsSnapshot.docs.forEach(teamDoc => {
            const teamData = teamDoc.data();
            allTeams[teamDoc.id] = {
              teamId: teamDoc.id,
              teamName: teamData.name || "Unknown Team",
              totalPoints: 0,
              totalCorrect: 0,
              totalPending: 0,
              totalSubmissions: 0
            };
          });

          // Process all submissions
          const submissionPromises = submissionsSnapshot.docs.map(async (submissionDoc) => {
            const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
            
            // Fetch task details (for points)
            let taskPoints = 0;
            if (submissionData.taskId) {
              try {
                const taskDoc = await getDoc(doc(db, "tasks", submissionData.taskId));
                if (taskDoc.exists()) {
                  const pointsValue = taskDoc.data().points;
                  taskPoints = parseInt(pointsValue) || 0; // Parse as integer, default to 0 if invalid
                }
              } catch (error) {
                console.error("Error fetching task:", error);
              }
            }

            return {
              ...submissionData,
              taskPoints
            };
          });

          const enrichedSubmissions = await Promise.all(submissionPromises);
          
          // Apply submissions to teams
          enrichedSubmissions.forEach(submission => {
            const teamId = submission.teamId;
            if (allTeams[teamId]) {
              allTeams[teamId].totalSubmissions++;
              
              if (submission.status === "correct") {
                allTeams[teamId].totalCorrect++;
                allTeams[teamId].totalPoints += submission.taskPoints;
              } else if (submission.status === "pending") {
                allTeams[teamId].totalPending++;
              }
            }
          });

          // Convert to array and sort by total points
          const sortedTeams = Object.values(allTeams).sort((a, b) => b.totalPoints - a.totalPoints);
          
          setTeamScores(sortedTeams);
          setLoading(false);
        } catch (error) {
          console.error("Error processing data:", error);
          toast.error("Error loading team scores");
          setLoading(false);
        }
      });

      // Cleanup function for teams listener
      return () => unsubscribeTeams();
    }, (error) => {
      console.error("Error listening to submissions:", error);
      toast.error("Error listening to submissions: " + error.message);
      setLoading(false);
    });

    return () => unsubscribeSubmissions();
  }, []);

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return <Badge bg="warning" className="fs-6">🥇 1st</Badge>;
      case 1:
        return <Badge bg="secondary" className="fs-6">🥈 2nd</Badge>;
      case 2:
        return <Badge bg="dark" className="fs-6">🥉 3rd</Badge>;
      default:
        return <Badge bg="light" text="dark" className="fs-6">{index + 1}</Badge>;
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
        <h2>Team Scores & Rankings</h2>
        <Badge bg="primary" className="fs-6">
          {teamScores.length} team{teamScores.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {teamScores.length === 0 ? (
        <Card className="text-center">
          <Card.Body>
            <h5>No team scores found</h5>
            <p className="text-muted">No submissions have been made yet.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {teamScores.map((team, index) => (
            <Col key={team.teamId} lg={4} md={6}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{team.teamName}</h5>
                  {getRankBadge(index)}
                </Card.Header>
                <Card.Body>
                  <div className="text-center mb-3">
                    <h2 className="text-primary mb-1">{team.totalPoints}</h2>
                    <p className="text-muted mb-0">Total Points</p>
                  </div>
                  
                  <hr />
                  
                  <Row className="text-center">
                    <Col>
                      <h4 className="text-success">{team.totalCorrect}</h4>
                      <small className="text-muted">Correct</small>
                    </Col>
                    <Col>
                      <h4 className="text-warning">{team.totalPending}</h4>
                      <small className="text-muted">Pending</small>
                    </Col>
                    <Col>
                      <h4 className="text-info">{team.totalSubmissions}</h4>
                      <small className="text-muted">Total</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Scores;