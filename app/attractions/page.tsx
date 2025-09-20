'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { FaClock } from 'react-icons/fa6';
import { FaStar } from 'react-icons/fa';
import { Attraction } from '@/types/Attraction';



export default function AttractionsPage() {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      console.log("Printing the key where getting the error",process.env.NEXT_PUBLIC_NANO_NODE_API_URL)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_NANO_NODE_API_URL}/explore/attractions`);
      const data=response.data
      setAttractions(data);
    } catch (error) {
      console.error('Failed to fetch attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttraction = (attraction:Attraction) => {
    setSelectedAttractions(prev => {
      const isSelected = prev.find(a => a.id === attraction.id);
      if (isSelected) {
        return prev.filter(a => a.id !== attraction.id);
      } else {
        return [...prev, attraction];
      }
    });
  };

  const proceedToActivities = () => {
    if (selectedAttractions.length === 0) {
      alert('Please select at least one attraction');
      return;
    }
    
    const attractionIds = selectedAttractions.map(a => a.id).join(',');
    router.push(`/attractions/activities?attractions=${attractionIds}`);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading attractions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choose Attractions</h1>
              <p className="text-orange-600 mt-1">Select attractions you'd like to visit</p>
            </div>
            {/* <Link 
              href={`/locations`}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              ← Back to Location
            </Link> */}
          </div>
        </div>
      </div>
      {selectedAttractions.length > 0 && (
        <div className="bg-orange-500 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedAttractions.length} attraction{selectedAttractions.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={proceedToActivities}
                className="bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                View Activities →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {attractions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏛️</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No attractions found</h2>
            <p className="text-gray-500">Check back later for new attractions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((attraction) => {
              const isSelected = selectedAttractions.find(a => a.id === attraction.id);
              
              return (
                <div
                  key={attraction.id}
                  onClick={() => toggleAttraction(attraction)}
                  className={`cursor-pointer rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50 shadow-orange-100' 
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 rounded-t-xl overflow-hidden">
                    {attraction.imageUrl ? (
                      <img 
                        src={attraction.imageUrl} 
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-200 flex items-center justify-center">
                        <span className="text-6xl">
    
                        </span>
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isSelected && <span className="text-white text-sm">✓</span>}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {attraction.name}
                      </h3>
                      {attraction.rating && (
                        <div className="flex items-center ml-2 flex-shrink-0">
                          <span className="text-yellow-400"><FaStar/></span>
                          <span className="text-sm text-gray-600 ml-1">
                            {attraction.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {attraction.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {attraction.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {attraction.category}
                      </span>
                      
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        {attraction.duration && (
                          <span className="flex gap-1 items-center justify-center"><FaClock/>{attraction.duration}h</span>
                        )}
                          <span>₹{attraction.price}</span>
                        {/* )} */}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAttractions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedAttractions.length} attraction{selectedAttractions.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAttractions.map(a => a.name).join(', ')}
                </p>
              </div>
              <button
                onClick={proceedToActivities}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Explore Activities
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}