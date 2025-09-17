
import { Map, EyeOff, Satellite, Mountain } from 'lucide-react';

export const locations = [
  {
    id: "1",
    name: "Betla National Park",
    lat: 23.8863,
    lng: 84.1905,
    image: "https://images.unsplash.com/photo-1549366021-9f761d040fff?w=100&h=100&fit=crop",
    description: "Home to tigers, elephants, and diverse wildlife.",
  },
  {
    id: "2",
    name: "Hundru Falls",
    lat: 23.4513,
    lng: 85.6596,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
    description: "A spectacular 98-meter waterfall.",
  },
  {
    id: "3",
    name: "Baidyanath Temple",
    lat: 24.4925,
    lng: 86.6963,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=100&h=100&fit=crop",
    description: "A sacred Jyotirlinga temple.",
  },
  {
    id: "4",
    name: "Netarhat Hill Station",
    lat: 23.4839,
    lng: 84.2691,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop",
    description: "Famous for sunrise and sunset views.",
  },
  {
    id: "5",
    name: "Jagannath Temple Ranchi",
    lat: 23.3142,
    lng: 85.2781,
    image: "https://images.unsplash.com/photo-1580451733963-734374ef502d?w=100&h=100&fit=crop",
    description: "Replica of the famous Puri temple.",
  },
  {
    id: "6",
    name: "Parasnath Hills",
    lat: 23.9702,
    lng: 86.1158,
    image: "https://images.unsplash.com/photo-1464822759844-d150b9014e2e?w=100&h=100&fit=crop",
    description: "The highest peak in Jharkhand.",
  },
  {
    id: "7",
    name: "Hazaribagh",
    lat: 23.9778,
    lng: 85.3616,
    image: "https://images.unsplash.com/photo-1624440045862-2592a8cc3965?w=100&h=100&fit=crop",
    description: "Known for its national park and serene lakes."
  }
];

export const tourismSpots = [
  {
    id: 1,
    name: "Betla National Park",
    image: "https://images.unsplash.com/photo-1549366021-9f761d040fff?w=500&h=300&fit=crop",
    description: "Home to tigers, elephants, and diverse wildlife in the heart of Jharkhand",
    location: "Latehar District",
    rating: 4.5,
    visitors: "50K+ annually",
    category: "Wildlife",
    highlights: ["Tiger Safari", "Elephant Spotting", "Bird Watching"]
  },
  {
    id: 2,
    name: "Hundru Falls",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    description: "Spectacular 98-meter waterfall, perfect for nature photography",
    location: "Ranchi District",
    rating: 4.7,
    visitors: "75K+ annually",
    category: "Waterfall",
    highlights: ["Photography", "Trekking", "Natural Beauty"]
  },
  {
    id: 3,
    name: "Baidyanath Temple",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&h=300&fit=crop",
    description: "Sacred Jyotirlinga temple, one of the most revered pilgrimage sites",
    location: "Deoghar",
    rating: 4.8,
    visitors: "1M+ annually",
    category: "Religious",
    highlights: ["Pilgrimage", "Architecture", "Spirituality"]
  },
  {
    id: 4,
    name: "Netarhat Hill Station",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
    description: "Queen of Chotanagpur, famous for sunrise and sunset views",
    location: "Latehar District",
    rating: 4.6,
    visitors: "40K+ annually",
    category: "Hill Station",
    highlights: ["Sunrise Views", "Cool Climate", "Trekking"]
  },
  {
    id: 5,
    name: "Jagannath Temple Ranchi",
    image: "https://images.unsplash.com/photo-1580451733963-734374ef502d?w=500&h=300&fit=crop",
    description: "Replica of famous Puri temple with intricate architecture",
    location: "Ranchi",
    rating: 4.4,
    visitors: "60K+ annually",
    category: "Religious",
    highlights: ["Architecture", "Festivals", "Cultural Heritage"]
  },
  {
    id: 6,
    name: "Parasnath Hills",
    image: "https://images.unsplash.com/photo-1464822759844-d150b9014e2e?w=500&h=300&fit=crop",
    description: "Highest peak in Jharkhand, sacred to Jains with 24 temples",
    location: "Giridih District",
    rating: 4.5,
    visitors: "30K+ annually",
    category: "Religious/Trekking",
    highlights: ["Highest Peak", "Jain Temples", "Trekking"]
  }
]



export const tileLayers = {
  light: { key: 'light', name: "Light", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: '© OpenStreetMap', icon: Map, description: "Clean, minimal street map" },
  dark: { key: 'dark', name: "Dark", url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", attribution: '© CARTO', icon: EyeOff, description: "Perfect for night viewing" },
  satellite: { key: 'satellite', name: "Satellite", url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© Esri', icon: Satellite, description: "High-resolution satellite imagery" },
  terrain: { key: 'terrain', name: "Terrain", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", attribution: '© OpenTopoMap', icon: Mountain, description: "Topographic with elevation details" },
};

export const tileCycleOrder = ['light', 'satellite', 'terrain', 'dark'];