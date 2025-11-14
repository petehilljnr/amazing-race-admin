import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { defaultGPS  } from "../../constants";
import { Card } from "react-bootstrap";

// Fix for default markers in production builds
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#4285f4;width:15px;height:15px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);'></div>",
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

L.Marker.prototype.options.icon = DefaultIcon;

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
