import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { taskTemplate, categoryTypes, answerTypes } from "../../constants";
import MapPicker from "./MapPicker";
import PhotoImport from "./PhotoImport";

const TaskForm = ({ onSubmit, initialValues = taskTemplate }) => {
  const [task, setTask] = useState(initialValues);
  const [compressing, setCompressing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (name === "category") {
      // Multi-select: collect selected options as array
      const selected = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setTask({
        ...task,
        category: selected
      });
    } else {
      setTask({
        ...task,
        [name]: type === "checkbox" ? checked : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task);
  };

  return (
    <div className="container-fluid px-3 py-3">
      <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formTaskName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={task.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={task.description}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskHint">
        <Form.Label>Hint</Form.Label>
        <Form.Control
          type="text"
          name="hint"
          value={task.hint}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskPoints">
        <Form.Label>Points</Form.Label>
        <Form.Control
          type="number"
          name="points"
          value={task.points || 0}
          onChange={handleChange}
          min={0}
          max={10}
          step={1}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskCategory">
        <Form.Label>Category</Form.Label>
        <Form.Control
          as="select"
          name="category"
          value={task.category}
          onChange={handleChange}
          multiple
          required
        >
          {categoryTypes.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Form.Control>
        <Form.Text className="text-muted">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</Form.Text>
      </Form.Group>
      <PhotoImport
        label="Photo"
        onChange={Object.assign(
          (file) => {
            setTask({ ...task, photoFile: file });
          },
          {
            compressionStatus: (status) => setCompressing(status)
          }
        )}
      />
      <Form.Group className="mb-3" controlId="formTaskIsActive">
        <Form.Switch
          name="isActive"
          label="Active?"
          checked={task.isActive}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskHasGPS">
        <Form.Switch
          name="hasGPS"
          label="Has GPS?"
          checked={task.hasGPS}
          onChange={handleChange}
        />
      </Form.Group>
      {task.hasGPS && (
        <MapPicker
          lat={task.lat}
          lng={task.lng}
          onChange={({ lat, lng }) => setTask({ ...task, lat, lng })}
        />
      )}
      <Form.Group className="mb-3" controlId="formTaskAnswerType">
        <Form.Label>Answer Type</Form.Label>
        <Form.Select
          name="answerType"
          value={task.answerType}
          onChange={handleChange}
        >
          {answerTypes.map((type) => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formTaskAnswer">
        <Form.Label>Answer</Form.Label>
        <Form.Control
          type="text"
          name="answer"
          value={task.answer}
          onChange={handleChange}
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="w-100 mt-3" disabled={compressing}>
        {compressing ? 'Compressing Image...' : 'Save Task'}
      </Button>
    </Form>
  </div>
  );
};

export default TaskForm;
