import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import TaskForm from "./TaskForm";
import { useUpdateTask } from "../../fetch/taskFetch";

const EditTaskModal = ({ show, handleClose, task }) => {
  const [showModal, setShowModal] = useState(show);
  const updateTaskMutation = useUpdateTask();

  const handleSubmit = (updatedTask) => {
    updateTaskMutation.mutate({ task: { ...updatedTask, id: task.id } });
    handleClose();
    setShowModal(false);
  };

  const handleCancel = () => {
    handleClose();
    setShowModal(false);
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <TaskForm onSubmit={handleSubmit} initialValues={task} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditTaskModal;
