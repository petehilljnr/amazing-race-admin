import React, { useState } from "react";
import { Container, Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { useTasks } from "../fetch/taskFetch";
import { useDeleteTask } from "../fetch/taskFetch";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";
import { ToastContainer } from "react-toastify";
import AddTaskModal from "../components/tasks/AddTaskModal";
import { categoryIcons } from "../constants";

const Tasks = () => {
  const { data: tasks = [], isLoading: loading } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const deleteMutation = useDeleteTask();

  const handleAddTask = (newTask) => {
    // Add your logic to save the new task to Firestore here
    // For now, just log it
    console.log("Add new task:", newTask);
    setShowModal(false);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (task) => {
    if (!task) return;
    await deleteMutation.mutateAsync(task);
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  return (
    <Container className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Tasks</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Task
        </Button>
      </div>
      <ToastContainer />
      {loading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <Card className="mb-3"><Card.Body>No tasks found.</Card.Body></Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {tasks.map(task => (
            <Col key={task.id}>
                <Card className={`h-100 task-card${task.isActive === false ? ' bg-light border-secondary' : ''}`}>
                  <Card.Header className="d-flex align-items-center gap-2" style={{ minHeight: 48 }}>
                    {/* Show all category icons for this task (supporting multiple categories) */}
                    {Array.isArray(task.category)
                      ? task.category.map(cat => {
                          const Icon = categoryIcons[cat];
                          return Icon ? <Icon key={cat} size={22} title={cat} /> : null;
                        })
                      : (() => {
                          const Icon = categoryIcons[task.category];
                          return Icon ? <Icon size={22} title={task.category} /> : null;
                        })()
                    }
                  </Card.Header>
                  {task.photoUrl && (
                    <Card.Img 
                      variant="top" 
                      src={task.photoUrl} 
                      style={task.isActive === false ? {
                        width: '100%',
                        height: '180px',
                        objectFit: 'contain',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                        opacity: 0.6,
                        filter: 'grayscale(80%)',
                      } : {
                        width: '100%',
                        height: '180px',
                        objectFit: 'contain',
                        borderTopLeftRadius: '0.5rem',
                        borderTopRightRadius: '0.5rem',
                      }} 
                    />
                  )}
                  <Card.Body className="p-2" style={task.isActive === false ? { opacity: 0.6, filter: 'grayscale(80%)', pointerEvents: 'none' } : {}}>
                    <Card.Title className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {task.name || "Untitled Task"}
                    </Card.Title>
                    <Card.Text
                      className="task-desc"
                      style={{
                        marginTop: 0,
                        height: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '0.95rem',
                        color: '#555',
                      }}
                    >
                      {task.description || ''}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <Button variant="outline-primary" size="sm">Edit</Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(task)}
                      disabled={deleteMutation.isLoading}
                    >
                      Delete
                    </Button>
                  </Card.Footer>
                </Card>
            </Col>
          ))}
        </Row>
      )}
      <AddTaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
      <DeleteTaskModal
        show={showDeleteModal}
        handleClose={() => {
          if (!deleteMutation.isLoading) {
            setShowDeleteModal(false);
            setTaskToDelete(null);
          }
        }}
        task={taskToDelete}
        onDelete={handleDeleteConfirm}
        isDeleting={deleteMutation.isLoading}
      />
    </Container>
  );
};

export default Tasks;
