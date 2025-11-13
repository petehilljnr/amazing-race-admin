// Icon mapping for categories using react-icons
import { FaPuzzlePiece, FaCamera, FaUtensils, FaTasks, FaSearch, FaBolt, FaMap } from 'react-icons/fa';


export const categoryTypes = ["General", "Location", "Puzzle", "Photo", "Food", "Challenge", "Find"];
export const categoryIcons = {
    General: FaTasks,
    Puzzle: FaPuzzlePiece,
    Photo: FaCamera,
    Food: FaUtensils,
    Challenge: FaBolt,
    Find: FaSearch,
    Location: FaMap
};

export const taskTemplate = {
    name: "",
    description: "",
    hint: "",
    category: ["General"],
    points: 0,
    photoUrl: "",
    photoFile: null,
    isActive: true,
    hasGPS: false,
    lat: 0,
    lng: 0,
    answerType: "text",
    answer: ""
}



export const answerTypes = ["text", "photo"];

export const defaultGPS = { lat: -45.87576, lng: 170.50303 }; // Default to Otago House, Dunedin