import React, { useState } from "react";
import { Container, Table, Spinner, Button, Badge, Form, InputGroup } from "react-bootstrap";
import { useTasks } from "../fetch/taskFetch";
import { useDeleteTask } from "../fetch/taskFetch";
import DeleteTaskModal from "../components/tasks/DeleteTaskModal";
import { ToastContainer } from "react-toastify";
import AddTaskModal from "../components/tasks/AddTaskModal";
import { categoryIcons } from "../constants";
import EditTaskModal from "../components/tasks/EditTaskModal";

const Tasks = () => {
  const { data: tasks = [], isLoading: loading } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ↕';
  };

  // Filter and sort tasks
  let filteredTasks = tasks.filter(task => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (task.name && task.name.toLowerCase().includes(searchLower)) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      (task.rowID && task.rowID.toString().includes(searchTerm)) ||
      (task.category && task.category.toLowerCase().includes(searchLower))
    );
  });

  // Apply sorting
  if (sortConfig.key) {
    filteredTasks.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === 'rowID' || sortConfig.key === 'points') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortConfig.key === 'isActive' || sortConfig.key === 'hasGPS') {
        aValue = Boolean(aValue);
        bValue = Boolean(bValue);
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };
  const deleteMutation = useDeleteTask();

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

      {/* Search Bar */}
      <div className="mb-3">
        <Form.Group>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search tasks by name, description, row ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </Button>
            )}
          </InputGroup>
          {searchTerm && (
            <Form.Text className="text-muted">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </Form.Text>
          )}
        </Form.Group>
      </div>

      <ToastContainer />
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-5">
          {tasks.length === 0 ? (
            <>
              <h5>No tasks found</h5>
              <p className="text-muted">Click "Add Task" to create your first task.</p>
            </>
          ) : (
            <>
              <h5>No tasks match your search</h5>
              <p className="text-muted">Try adjusting your search terms or <button className="btn btn-link p-0" onClick={() => setSearchTerm("")}>clear the search</button>.</p>
            </>
          )}
        </div>
      ) : (
        <Table responsive striped hover>
          <thead className="table-dark">
            <tr>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('rowID')}
              >
                Row ID{getSortIcon('rowID')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('name')}
              >
                Name{getSortIcon('name')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('description')}
              >
                Description{getSortIcon('description')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('answerType')}
              >
                Answer Type{getSortIcon('answerType')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('points')}
              >
                Points{getSortIcon('points')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('hasGPS')}
              >
                GPS{getSortIcon('hasGPS')}
              </th>
              <th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('isActive')}
              >
                Status{getSortIcon('isActive')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className={task.isActive === false ? 'text-muted' : ''}>
                <td>
                  <Badge bg="dark">{task.rowID || '-'}</Badge>
                </td>
                <td>
                  <strong>{task.name || "Untitled Task"}</strong>
                </td>
                <td>
                  <div style={{ maxWidth: '300px' }}>
                    {task.description && task.description.length > 100
                      ? `${task.description.substring(0, 100)}...`
                      : task.description || 'No description'
                    }
                  </div>
                </td>
                <td>
                  <Badge bg={task.answerType === 'photo' ? 'info' : 'primary'}>
                    {task.answerType || 'text'}
                  </Badge>
                </td>
                <td>
                  <Badge bg="success">{task.points || 0}</Badge>
                </td>
                <td>
                  <Badge bg={task.hasGPS ? 'warning' : 'secondary'}>
                    {task.hasGPS ? 'GPS' : 'No GPS'}
                  </Badge>
                </td>
                <td>
                  <Badge bg={task.isActive !== false ? 'success' : 'secondary'}>
                    {task.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDeleteClick(task)}
                      disabled={deleteMutation.isLoading}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Edit Task Modal */}
      <EditTaskModal
        show={showEditModal}
        handleClose={() => {
          setShowEditModal(false);
          setTaskToEdit(null);
        }}
        task={taskToEdit}
      />
      
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
