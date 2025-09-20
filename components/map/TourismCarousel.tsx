import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share, Star, Users, MapPin } from 'lucide-react';
import { tourismSpots } from './constants';

interface TourismCarouselProps {
  isFullscreen: boolean;
}

export default function TourismCarousel({ isFullscreen }: TourismCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedSpots, setLikedSpots] = useState(new Set<number>());

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tourismSpots.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tourismSpots.length) % tourismSpots.length);
  };

  const toggleLike = (spotId: number) => {
    setLikedSpots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spotId)) {
        newSet.delete(spotId);
      } else {
        newSet.add(spotId);
      }
      return newSet;
    });
  };

  const handleLearnMore = (spot: any) => {
    if (spot.website) {
      window.open(spot.website, '_blank');
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(spot.name + ' ' + spot.location)}`, '_blank');
    }
  };

  const handlePlanVisit = () => {
    window.location.href = '/attractions';
  };

  const handleExploreAll = () => {
    window.location.href = '/attractions';
  };

  if (isFullscreen) return null;

  return (
    <div className="mt-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-950/20 dark:via-background dark:to-orange-950/20 p-4 sm:p-8 rounded-2xl shadow-lg border border-orange-100 dark:border-orange-900/20 backdrop-blur-sm">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent mb-2">
          Discover Jharkhand
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">Experience the natural beauty and rich heritage of the Land of Forests</p>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {tourismSpots.map((spot) => (
              <div key={spot.id} className="min-w-full">
                <div className="bg-card rounded-xl shadow-lg border border-orange-100 dark:border-orange-900/20 overflow-hidden mx-2 sm:mx-4 backdrop-blur-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 relative group">
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => toggleLike(spot.id)}
                          className={`p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                            likedSpots.has(spot.id)
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-white/80 dark:bg-background/80 text-muted-foreground hover:bg-white dark:hover:bg-background hover:shadow-md'
                          }`}
                        >
                          <Heart size={18} fill={likedSpots.has(spot.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-2 sm:p-3 rounded-full bg-white/80 dark:bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-white dark:hover:bg-background hover:shadow-md transition-all duration-200">
                          <Share size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-block px-3 py-1 bg-orange-500/90 text-white text-sm rounded-full backdrop-blur-sm font-medium">
                          {spot.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="md:w-1/2 p-4 sm:p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{spot.name}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed text-sm sm:text-base">{spot.description}</p>
                        
                        <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 sm:mb-6">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Star className="text-yellow-500 dark:text-yellow-400" size={14} fill="currentColor" />
                            <span className="font-semibold text-foreground">{spot.rating}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Users size={14} />
                            <span>{spot.visitors}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin size={14} />
                            <span>{spot.location}</span>
                          </div>
                        </div>
                        
                        <div className="mb-4 sm:mb-6">
                          <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Highlights:</h4>
                          <div className="flex flex-wrap gap-2">
                            {spot.highlights.map((highlight: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 sm:px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs sm:text-sm rounded-full border border-orange-200 dark:border-orange-800"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={handlePlanVisit}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl"
                        >
                          Plan Visit
                        </button>
                        <button 
                          onClick={() => handleLearnMore(spot)}
                          className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-all duration-200 font-semibold text-sm sm:text-base"
                        >
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
          className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-background/90 hover:bg-white dark:hover:bg-background p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-orange-100 dark:border-orange-900/20"
        >
          <ChevronLeft size={20} className="text-orange-500" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-background/90 hover:bg-white dark:hover:bg-background p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-orange-100 dark:border-orange-900/20"
        >
          <ChevronRight size={20} className="text-orange-500" />
        </button>
        
        <div className="flex justify-center mt-4 sm:mt-6 gap-2">
          {tourismSpots.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 w-6 sm:w-8'
                  : 'bg-muted hover:bg-muted-foreground/20 w-2'
              }`}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center mt-6 sm:mt-8">
        <button 
          onClick={handleExploreAll}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Explore All Destinations
        </button>
      </div>
    </div>
  );
}