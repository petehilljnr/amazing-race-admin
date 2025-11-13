import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { defaultGPS  } from "../../constants";
import { Card } from "react-bootstrap";

const MapEvents = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const MapPicker = ({ lat, lng, onChange }) => {
  const position = lat && lng ? [lat, lng] : defaultGPS; // Default to Otago House, Dunedin

  return (
    <Card className="mb-3">
      <Card.Header>Select Location</Card.Header>
      <Card.Body style={{ padding: 0 }}>
        <div style={{ height: "300px", width: "100%" }}>
          <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapEvents onSelect={(latlng) => onChange(latlng)} />
            {lat && lng && <Marker position={[lat, lng]} />}
          </MapContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default MapPicker;
