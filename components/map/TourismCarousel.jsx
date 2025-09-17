import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share, Star, Users, MapPin } from 'lucide-react';
import { tourismSpots } from './constants';

export default function TourismCarousel({ isFullscreen }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [likedSpots, setLikedSpots] = useState(new Set())

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tourismSpots.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tourismSpots.length) % tourismSpots.length)
  }

  const toggleLike = (spotId) => {
    setLikedSpots(prev => {
      const newSet = new Set(prev)
      if (newSet.has(spotId)) {
        newSet.delete(spotId)
      } else {
        newSet.add(spotId)
      }
      return newSet
    })
  }

  if (isFullscreen) return null

  return (
    <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Discover Jharkhand
        </h2>
        <p className="text-gray-600 text-lg">Experience the natural beauty and rich heritage of the Land of Forests</p>
      </div>
      <div className="relative max-w-6xl mx-auto">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {tourismSpots.map((spot) => (
              <div key={spot.id} className="min-w-full">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mx-4">
                  <div className="md:flex">
                    <div className="md:w-1/2 relative group">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => toggleLike(spot.id)}
                          className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                            likedSpots.has(spot.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/80 text-gray-600 hover:bg-white'
                          }`}
                        >
                          <Heart size={20} fill={likedSpots.has(spot.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-3 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white transition-all">
                          <Share size={20} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block px-3 py-1 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm">
                          {spot.category}
                        </span>
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{spot.name}</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{spot.description}</p>
                        <div className="flex gap-6 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="text-yellow-500" size={16} fill="currentColor" />
                            <span className="font-semibold text-gray-700">{spot.rating}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users size={16} />
                            <span>{spot.visitors}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin size={16} />
                            <span>{spot.location}</span>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-700 mb-2">Highlights:</h4>
                          <div className="flex flex-wrap gap-2">
                            {spot.highlights.map((highlight, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-sm rounded-full border border-green-200"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 font-semibold">
                          Plan Visit
                        </button>
                        <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
        >
          <ChevronRight size={24} />
        </button>
        <div className="flex justify-center mt-6 gap-2">
          {tourismSpots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="text-center mt-8">
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg">
          Explore All Destinations
        </button>
      </div>
    </div>
  )
}

