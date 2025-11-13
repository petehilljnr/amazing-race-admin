import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import TaskForm from "./TaskForm";
import { useAddTask } from "../../fetch/taskFetch";

const AddTaskModal = ({ show, handleClose }) => {
  const [showModal, setShowModal] = useState(show);
  const addTaskMutation = useAddTask();

  const handleSubmit = (task) => {
    addTaskMutation.mutate({ task });
    handleClose()
    setShowModal(false);
  };

  const handleCancel = () => {
    handleClose();
    setShowModal(false);
  };

  return (
  <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TaskForm onSubmit={handleSubmit} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTaskModal;
