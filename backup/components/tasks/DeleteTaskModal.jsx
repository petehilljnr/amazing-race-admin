import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const DeleteTaskModal = ({ show, handleClose, task, onDelete, isDeleting }) => {
  return (
    <Modal show={show} onHide={isDeleting ? undefined : handleClose} centered>
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {task ? (
          <>
            <p>Are you sure you want to delete <strong>{task.name || "this task"}</strong>?</p>
            <p>This action cannot be undone.</p>
          </>
        ) : (
          <p>No task selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => onDelete(task)} disabled={isDeleting}>
          {isDeleting ? <Spinner animation="border" size="sm" /> : "Delete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTaskModal;
