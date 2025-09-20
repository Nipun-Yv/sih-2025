export type Location = {
  name: string
  image: string
  lat: number
  lng: number
}

export const locations: Location[] = [
  { name: 'Ranchi', image: '/images/ranchi.png', lat: 23.3441, lng: 85.3096 },
  { name: 'Jamshedpur', image: '/images/ranchi.png', lat: 22.8046, lng: 86.2029 },
  { name: 'Dhanbad', image: '/images/ranchi.webp', lat: 23.7957, lng: 86.4304 },
  { name: 'Bokaro', image: '/images/ranchi.webp', lat: 23.6693, lng: 86.1511 },
  { name: 'Deoghar', image: '/images/ranchi.webp', lat: 24.4820, lng: 86.7000 },
  { name: 'Hazaribagh', image: '/images/ranchi.webp', lat: 23.9778, lng: 85.3616 },
]