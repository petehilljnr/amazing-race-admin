import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Table, Badge, Spinner } from "react-bootstrap";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setTasks([]);
    setPreview(false);
    
    if (selectedFile && selectedFile.type === "application/json") {
      parseJSON(selectedFile);
    }
  };

  const parseJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Check if it's an array of tasks
        if (!Array.isArray(jsonData)) {
          toast.error("JSON file must contain an array of tasks");
          return;
        }

        const expectedProperties = ['answer', 'answerType', 'category', 'description', 'hasGPS', 'hint', 'isActive', 'lat', 'lng', 'name', 'points', 'photoUrl', 'rowID'];
        const parsedTasks = [];

        for (let i = 0; i < jsonData.length; i++) {
          const task = jsonData[i];
          
          // Basic validation
          if (!task.name) {
            toast.warning(`Task ${i + 1}: Missing name, skipping task`);
            continue;
          }

          // Validate and format the task
          const formattedTask = {
            answer: task.answer || '',
            answerType: task.answerType?.toLowerCase() === 'photo' ? 'photo' : 'text',
            category: task.category || '',
            description: task.description || '',
            hasGPS: Boolean(task.hasGPS),
            hint: task.hint || '',
            isActive: Boolean(task.isActive),
            lat: task.lat ? parseFloat(task.lat) : null,
            lng: task.lng ? parseFloat(task.lng) : null,
            name: task.name,
            points: parseInt(task.points) || 0,
            photoUrl: task.photoUrl || '',
            rowID: task.rowID || ''
          };

          parsedTasks.push(formattedTask);
        }

        setTasks(parsedTasks);
        setPreview(true);
        
        if (parsedTasks.length > 0) {
          toast.success(`Parsed ${parsedTasks.length} valid tasks from JSON`);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast.error("Invalid JSON format. Please check your file.");
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (tasks.length === 0) {
      toast.error("No valid tasks to upload");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const task of tasks) {
        try {
          await addDoc(collection(db, "tasks"), {
            ...task,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          successCount++;
        } catch (error) {
          console.error("Error adding task:", error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} tasks`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} tasks`);
      }

      // Reset form
      setFile(null);
      setTasks([]);
      setPreview(false);
      document.getElementById('jsonFile').value = '';

    } catch (error) {
      console.error("Error during bulk upload:", error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const sampleTasks = [
      {
        answer: "Red Building Photo",
        answerType: "photo",
        category: "buildings",
        description: "Locate the red building on campus and take a photo",
        hasGPS: true,
        hint: "Look near the main entrance",
        isActive: true,
        lat: -37.8136,
        lng: 144.9631,
        name: "Find the Red Building",
        points: 10,
        photoUrl: "https://example.com/red-building.jpg",
        rowID: "BLDG_001"
      },
      {
        answer: "4",
        answerType: "text",
        category: "math",
        description: "What is 2 + 2?",
        hasGPS: false,
        hint: "Basic arithmetic",
        isActive: true,
        lat: null,
        lng: null,
        name: "Simple Math Question",
        points: 5,
        photoUrl: "",
        rowID: "MATH_001"
      },
      {
        answer: "",
        answerType: "photo",
        category: "team",
        description: "Take a team selfie at the fountain",
        hasGPS: true,
        hint: "Center of campus",
        isActive: false,
        lat: -37.8140,
        lng: 144.9633,
        name: "Team Selfie Challenge",
        points: 15,
        photoUrl: "",
        rowID: "TEAM_001"
      }
    ];
    
    const jsonContent = JSON.stringify(sampleTasks, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks_template.json';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bulk Upload Tasks</h2>
        <Button variant="outline-info" onClick={downloadTemplate}>
          Download JSON Template
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Upload JSON File</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>JSON Format Requirements:</strong>
            <ul className="mb-0 mt-2">
              <li><strong>Required properties:</strong> answer, answerType, category, description, hasGPS, hint, isActive, lat, lng, name, points, photoUrl, rowID</li>
              <li><strong>answerType:</strong> Either "photo" or "text"</li>
              <li><strong>points:</strong> Integer value (e.g., 10, 15, 20)</li>
              <li><strong>isActive:</strong> Boolean true or false</li>
              <li><strong>hasGPS:</strong> Boolean true or false</li>
              <li><strong>lat/lng:</strong> Decimal coordinates (null if no GPS)</li>
              <li><strong>rowID:</strong> Unique identifier string (e.g., "BLDG_001")</li>
              <li><strong>File must be an array of task objects</strong></li>
            </ul>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Select JSON File</Form.Label>
            <Form.Control
              type="file"
              id="jsonFile"
              accept=".json,application/json"
              onChange={handleFileChange}
            />
            <Form.Text className="text-muted">
              Only JSON files are accepted. Use the template above for proper formatting.
            </Form.Text>
          </Form.Group>

          {file && (
            <Alert variant="success">
              Selected file: <strong>{file.name}</strong> ({file.size} bytes)
            </Alert>
          )}
        </Card.Body>
      </Card>

      {preview && tasks.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Preview ({tasks.length} tasks)</h5>
            <Button 
              variant="primary" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Upload All Tasks'
              )}
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Row ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Answer Type</th>
                  <th>Points</th>
                  <th>GPS</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td>
                      <Badge bg="dark">{task.rowID || 'No ID'}</Badge>
                    </td>
                    <td><strong>{task.name}</strong></td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {task.description.length > 50
                          ? `${task.description.substring(0, 50)}...`
                          : task.description
                        }
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{task.category || 'None'}</Badge>
                    </td>
                    <td>
                      <Badge bg={task.answerType === 'photo' ? 'info' : 'primary'}>
                        {task.answerType}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="success">{task.points}</Badge>
                    </td>
                    <td>
                      <Badge bg={task.hasGPS ? 'warning' : 'light'} text={task.hasGPS ? 'dark' : 'muted'}>
                        {task.hasGPS ? `${task.lat}, ${task.lng}` : 'No GPS'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={task.isActive ? 'success' : 'secondary'}>
                        {task.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {preview && tasks.length === 0 && (
        <Alert variant="warning">
          No valid tasks found in the JSON file. Please check the format and try again.
        </Alert>
      )}
    </Container>
  );
};

export default BulkUpload;