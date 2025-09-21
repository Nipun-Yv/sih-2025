// import React, { useState, useEffect } from 'react';
// import { Star, Phone, Mail, MapPin, Clock, Users, IndianRupee, Heart, Plus, Check } from 'lucide-react';

// // Vendor Card Component
// const VendorCard = ({ vendor, onAddToItinerary, isAdded = false }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);

//   const handleAddVendor = async () => {
//     setIsLoading(true);
//     try {
//       await onAddToItinerary(vendor);
//     } catch (error) {
//       console.error('Error adding vendor:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatPrice = (price, unit = 'per_person') => {
//     const unitText = {
//       'per_hour': '/hour',
//       'per_day': '/day',
//       'per_person': '/person',
//       'per_group': '/group',
//       'fixed': ''
//     };
//     return `₹${price}${unitText[unit] || ''}`;
//   };

//   const getVendorTypeIcon = (type) => {
//     const icons = {
//       guide: '🗺️',
//       accomodation: '🏨',
//       food_restaurant: '🍽️',
//       transportation: '🚗',
//       activity: '🎯'
//     };
//     return icons[type] || '🏢';
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
//       {/* Header Image */}
//       <div className="relative h-48 bg-gradient-to-r from-orange-400 to-amber-400">
//         {vendor.images && vendor.images[0] ? (
//           <img 
//             src={vendor.images[0]} 
//             alt={vendor.businessName}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-6xl text-white">
//             {getVendorTypeIcon(vendor.vendorType)}
//           </div>
//         )}
        
//         {/* Overlay with rating */}
//         <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
//           <div className="flex items-center space-x-1">
//             <Star className="w-4 h-4 text-yellow-400 fill-current" />
//             <span className="text-sm font-semibold">
//               {vendor.ratings.average.toFixed(1)} ({vendor.ratings.count})
//             </span>
//           </div>
//         </div>

//         {/* Vendor type badge */}
//         <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium capitalize">
//           {vendor.vendorType.replace('_', ' ')}
//         </div>
//       </div>

//       {/* Content */}
//       <div className="p-6">
//         <div className="flex justify-between items-start mb-3">
//           <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
//             {vendor.businessName}
//           </h3>
//           <button
//             onClick={handleAddVendor}
//             disabled={isLoading || isAdded}
//             className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
//               isAdded 
//                 ? 'bg-green-100 text-green-700' 
//                 : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
//             }`}
//           >
//             {isLoading ? (
//               <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
//             ) : isAdded ? (
//               <><Check className="w-4 h-4" /> Added</>
//             ) : (
//               <><Plus className="w-4 h-4" /> Add</>
//             )}
//           </button>
//         </div>

//         {/* Location */}
//         <div className="flex items-center space-x-2 text-gray-600 mb-3">
//           <MapPin className="w-4 h-4" />
//           <span className="text-sm">{vendor.address.city}, {vendor.address.state}</span>
//         </div>

//         {/* Description */}
//         <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//           {vendor.description || 'Professional service provider in the area.'}
//         </p>

//         {/* Pricing */}
//         {vendor.pricing?.basePrice && (
//           <div className="flex items-center space-x-2 mb-4">
//             <IndianRupee className="w-4 h-4 text-green-600" />
//             <span className="font-semibold text-green-600">
//               {formatPrice(vendor.pricing.basePrice, vendor.pricing.priceUnit)}
//             </span>
//             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//               {vendor.businessDetails.priceRange}
//             </span>
//           </div>
//         )}

//         {/* Amenities/Specializations */}
//         {vendor.businessDetails?.specializations?.length > 0 && (
//           <div className="flex flex-wrap gap-1 mb-4">
//             {vendor.businessDetails.specializations.slice(0, 3).map((spec, index) => (
//               <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
//                 {spec}
//               </span>
//             ))}
//             {vendor.businessDetails.specializations.length > 3 && (
//               <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
//                 +{vendor.businessDetails.specializations.length - 3} more
//               </span>
//             )}
//           </div>
//         )}

//         {/* Contact Info (only show on expanded) */}
//         {showDetails && (
//           <div className="border-t pt-4 mt-4 space-y-2">
//             {vendor.contactPhone && (
//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//                 <Phone className="w-4 h-4" />
//                 <span>{vendor.contactPhone}</span>
//               </div>
//             )}
//             {vendor.contactEmail && (
//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//                 <Mail className="w-4 h-4" />
//                 <span>{vendor.contactEmail}</span>
//               </div>
//             )}
//             {vendor.businessDetails?.experience && (
//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//                 <Clock className="w-4 h-4" />
//                 <span>{vendor.businessDetails.experience} years experience</span>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Toggle details button */}
//         <button
//           onClick={() => setShowDetails(!showDetails)}
//           className="text-orange-600 text-sm font-medium hover:text-orange-700 mt-3"
//         >
//           {showDetails ? 'Show less' : 'Show more details'}
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main Vendor Discovery Component
// const VendorDiscovery = ({ attractions = [], locationId, itineraryId, onVendorsUpdate }) => {
//   const [vendors, setVendors] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [selectedType, setSelectedType] = useState('all');
//   const [addedVendors, setAddedVendors] = useState(new Set());
//   const [searchQuery, setSearchQuery] = useState('');

//   const vendorTypes = [
//     { key: 'all', label: 'All Vendors', icon: '🏢' },
//     { key: 'guide', label: 'Tour Guides', icon: '🗺️' },
//     { key: 'accomodation', label: 'Hotels', icon: '🏨' },
//     { key: 'food_restaurant', label: 'Restaurants', icon: '🍽️' },
//     { key: 'transportation', label: 'Transport', icon: '🚗' },
//     { key: 'activity', label: 'Activities', icon: '🎯' }
//   ];

//   useEffect(() => {
//     fetchVendors();
//   }, [attractions, locationId]);

//   const fetchVendors = async () => {
//     setLoading(true);
//     try {
//       const attractionsParam = attractions.join(',');
//       const response = await fetch(`/api/vendors/discover?attractions=${attractionsParam}&locationId=${locationId}&limit=50`);
//       const data = await response.json();

//       if (data.success) {
//         setVendors(data.data.vendors);
//       }
//     } catch (error) {
//       console.error('Error fetching vendors:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddVendorToItinerary = async (vendor) => {
//     if (!itineraryId) {
//       alert('Please finalize your activities first');
//       return;
//     }

//     try {
//       const response = await fetch('/api/itinerary/add-vendor', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           itineraryId,
//           vendorId: vendor._id,
//           vendorType: vendor.vendorType,
//           bookingDetails: {
//             // Add default booking details based on vendor type
//             ...(vendor.vendorType === 'guide' && {
//               attractions: attractions,
//               languages: vendor.businessDetails?.languages || ['English']
//             }),
//             ...(vendor.vendorType === 'accomodation' && {
//               rooms: 1,
//               guests: 2
//             }),
//             ...(vendor.vendorType === 'food_restaurant' && {
//               partySize: 2
//             })
//           }
//         })
//       });

//       const data = await response.json();

//       if (data.success) {
//         setAddedVendors(prev => new Set([...prev, vendor._id]));
//         if (onVendorsUpdate) {
//           onVendorsUpdate(data.data);
//         }
//       }
//     } catch (error) {
//       console.error('Error adding vendor to itinerary:', error);
//       alert('Failed to add vendor to itinerary');
//     }
//   };

//   const getFilteredVendors = () => {
//     let allVendors = [];
    
//     if (selectedType === 'all') {
//       Object.values(vendors).forEach(typeVendors => {
//         allVendors = [...allVendors, ...typeVendors];
//       });
//     } else {
//       allVendors = vendors[selectedType] || [];
//     }

//     // Apply search filter
//     if (searchQuery.trim()) {
//       allVendors = allVendors.filter(vendor =>
//         vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         vendor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         vendor.businessDetails?.specializations?.some(spec => 
//           spec.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       );
//     }

//     return allVendors;
//   };

//   const getTotalCount = () => {
//     return Object.values(vendors).reduce((total, typeVendors) => total + typeVendors.length, 0);
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//         <p className="text-orange-600">Finding the best vendors for you...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="bg-white rounded-xl shadow-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">
//           Discover Local Vendors
//         </h2>
//         <p className="text-gray-600 mb-4">
//           Find verified guides, hotels, restaurants, and transport services for your trip
//         </p>
        
//         {/* Search Bar */}
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search vendors by name, specialization, or service..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {/* Filter Tabs */}
//       <div className="bg-white rounded-xl shadow-lg p-2">
//         <div className="flex space-x-2 overflow-x-auto">
//           {vendorTypes.map(type => (
//             <button
//               key={type.key}
//               onClick={() => setSelectedType(type.key)}
//               className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
//                 selectedType === type.key
//                   ? 'bg-orange-500 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               <span>{type.icon}</span>
//               <span>{type.label}</span>
//               <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
//                 {type.key === 'all' ? getTotalCount() : (vendors[type.key]?.length || 0)}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Vendors Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {getFilteredVendors().map(vendor => (
//           <VendorCard
//             key={vendor._id}
//             vendor={vendor}
//             onAddToItinerary={handleAddVendorToItinerary}
//             isAdded={addedVendors.has(vendor._id)}
//           />
//         ))}
//       </div>

//       {/* No vendors found */}
//       {getFilteredVendors().length === 0 && (
//         <div className="bg-white rounded-xl shadow-lg p-12 text-center">
//           <div className="text-6xl mb-4">🔍</div>
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">
//             No vendors found
//           </h3>
//           <p className="text-gray-500">
//             {searchQuery 
//               ? 'Try adjusting your search terms or browse all vendors'
//               : 'We couldn\'t find any vendors for the selected criteria'
//             }
//           </p>
//           {searchQuery && (
//             <button
//               onClick={() => setSearchQuery('')}
//               className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
//             >
//               Clear Search
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default VendorDiscovery;