import imageCompression from "browser-image-compression";
import React, { useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";

const PhotoImport = ({ onChange, label = "Choose a photo", photoUrl }) => {
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(photoUrl || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      let finalFile = file;
      if (typeof onChange === 'function' && onChange.compressionStatus) {
        onChange.compressionStatus(true);
      }
      if (file.size > 250 * 1024) {
        // Only compress if > 250kb
        try {
          const options = {
            maxSizeMB: 0.25,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            initialQuality: 0.7, // Lower quality for more compression
          };
          const compressedFile = await imageCompression(file, options);
          if (compressedFile.size < file.size) {
            finalFile = compressedFile;
          }
        } catch (error) {
          console.error("Image compression error:", error);
        }
      }
      setPreviewUrl(URL.createObjectURL(finalFile));
      if (onChange) {
        onChange(finalFile);
      }
      if (typeof onChange === 'function' && onChange.compressionStatus) {
        onChange.compressionStatus(false);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <div className="d-flex align-items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button variant="secondary" onClick={handleButtonClick}>
          Browse
        </Button>
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: 128,
              height: 128,
              objectFit: "contain",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f8f9fa",
            }}
            className="ms-2"
          />
        )}
      </div>
    </Form.Group>
  );
};

export default PhotoImport;
