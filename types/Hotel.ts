export interface Hotel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  star_rating: number;
  user_rating: number;
  description?: string; 
  room_description?: string;
  amenities_list: string;
  hotel_image_urls: string;
  room_image_url?: string;
  price: number;
}
