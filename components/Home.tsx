"use client"
import React, { useState } from 'react';
import { Menu, X, Search, MapPin, Calendar, Camera, Mountain, Trees, Compass, Star, Phone, Mail, Facebook, Twitter, Instagram, Youtube, ArrowRight, Play, Users, Award, Globe } from 'lucide-react';
import {Navbar} from './Navbar';
const JharkhandTourismHomepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const destinations = [
    {
      name: "Ranchi",
      image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop",
      description: "Capital city with beautiful waterfalls and hills",
      highlights: ["Rock Garden", "Tagore Hill", "Ranchi Lake"],
      rating: 4.5
    },
    {
      name: "Jamshedpur", 
      image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop",
      description: "The Steel City with modern attractions",
      highlights: ["Jubilee Park", "Tata Steel Zoological Park", "Dalma Wildlife Sanctuary"],
      rating: 4.3
    },
    {
      name: "Deoghar",
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&h=300&fit=crop",
      description: "Sacred city with ancient temples",
      highlights: ["Baba Baidyanath Temple", "Nandan Pahar", "Mayurakshi River"],
      rating: 4.7
    },
    {
      name: "Netarhat",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      description: "Queen of Chotanagpur with scenic beauty",
      highlights: ["Sunrise Point", "Sunset Point", "Netarhat Dam"],
      rating: 4.6
    }
  ];

  const experiences = [
    {
      icon: <Mountain className="w-6 h-6" />,
      title: "Adventure Tourism",
      description: "Trekking, rock climbing, and wildlife safaris",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=200&fit=crop",
      activities: ["Rock Climbing", "Wildlife Photography", "Jungle Trekking"]
    },
    {
      icon: <Trees className="w-6 h-6" />,
      title: "Eco Tourism", 
      description: "Explore dense forests and pristine waterfalls",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      activities: ["Waterfall Tours", "Bird Watching", "Nature Walks"]
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Cultural Heritage",
      description: "Rich tribal culture and ancient traditions",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
      activities: ["Village Visits", "Folk Performances", "Handicrafts"]
    },
    {
      icon: <Compass className="w-6 h-6" />,
      title: "Spiritual Journey",
      description: "Sacred temples and pilgrimage sites",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=300&h=200&fit=crop",
      activities: ["Temple Tours", "Meditation", "Spiritual Healing"]
    }
  ];

  const stats = [
    { number: "50+", label: "Destinations", icon: <MapPin className="w-6 h-6" /> },
    { number: "100K+", label: "Happy Visitors", icon: <Users className="w-6 h-6" /> },
    { number: "15+", label: "Awards Won", icon: <Award className="w-6 h-6" /> },
    { number: "24/7", label: "Support", icon: <Globe className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-25 to-orange-50">

      <section className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm">
                <Star className="w-4 h-4 mr-2 fill-current" />
                India's Hidden Gem
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gray-900">Discover</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Jharkhand
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience pristine forests, magnificent waterfalls, vibrant tribal culture, and ancient temples in the heart of India's mineral-rich paradise.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                  Start Exploring
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Video
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop" 
                  alt="Jharkhand Landscape"
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Trees className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">50+ Waterfalls</div>
                    <div className="text-gray-600 text-sm">Natural Wonders</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Rich Culture</div>
                    <div className="text-gray-600 text-sm">32 Tribal Groups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gradient-to-r from-orange-400/10 to-orange-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Plan Your Perfect Trip</h2>
            <p className="text-gray-600">Find the best destinations and experiences in Jharkhand</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Where to go?"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Travel Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="date"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="md:flex md:items-end">
                <button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search Trips
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-600 font-medium text-sm mb-6">
              <MapPin className="w-4 h-4 mr-2" />
              Popular Destinations
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Must-Visit Places in <span className="text-orange-500">Jharkhand</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From bustling cities to serene natural landscapes, discover the most captivating destinations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <Star className="h-4 w-4 text-orange-400 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-700">{destination.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">{destination.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Top Attractions</div>
                      <div className="space-y-1">
                        {destination.highlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full bg-orange-50 hover:bg-orange-400 hover:text-white text-orange-600 py-3 px-4 rounded-2xl font-medium transition-all duration-300 group-hover:shadow-lg">
                      Explore {destination.name}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full text-orange-600 font-medium text-sm mb-6 shadow-sm">
              <Compass className="w-4 h-4 mr-2" />
              Unique Experiences
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Adventures That <span className="text-orange-500">Inspire</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Immerse yourself in diverse experiences that showcase Jharkhand's natural beauty and rich heritage
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {experiences.map((experience, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="relative h-64">
                    <img 
                      src={experience.image} 
                      alt={experience.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-6 left-6">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <div className="text-orange-500">{experience.icon}</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{experience.title}</h3>
                      <p className="text-orange-100">{experience.description}</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Popular Activities</div>
                      <div className="flex flex-wrap gap-2">
                        {experience.activities.map((activity, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105">
                        Book Now
                      </button>
                      <button className="px-6 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-2xl font-medium transition-all duration-300">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-400 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready for Your Jharkhand Adventure?
          </h2>
          <p className="text-xl text-orange-100 mb-10 leading-relaxed">
            Join thousands of travelers who have discovered the magic of Jharkhand. Start planning your unforgettable journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <button className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center">
              <ArrowRight className="mr-2 w-5 h-5" />
              Start Planning
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center">
              <Phone className="mr-2 w-5 h-5" />
              Call Expert
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Mountain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Jharkhand Tourism</div>
                  <div className="text-orange-400">Discover. Explore. Experience.</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Your gateway to the incredible beauty, rich culture, and unforgettable experiences that Jharkhand has to offer. Discover India's best-kept secret.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <Facebook className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <Twitter className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <Instagram className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <Youtube className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-orange-400">Quick Links</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors">About Jharkhand</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Top Destinations</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Travel Packages</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Accommodation</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Travel Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6 text-orange-400">Contact</h4>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-orange-400 mt-1" />
                  <div>
                    <div className="font-medium">+91-651-2446951</div>
                    <div className="text-sm text-gray-400">Mon-Sat 9AM-6PM</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-orange-400 mt-1" />
                  <div>
                    <div className="font-medium">hello@jharkhantourism.in</div>
                    <div className="text-sm text-gray-400">24/7 Support</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-orange-400 mt-1" />
                  <div>
                    <div className="font-medium">Tourism Bhawan</div>
                    <div className="text-sm text-gray-400">Ranchi, Jharkhand 834001</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400">
                © 2024 Jharkhand Tourism Development Corporation. All rights reserved.
              </p>
              <div className="flex space-x-6 text-gray-400">
                <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Terms & Conditions</a>
                <a href="#" className="hover:text-orange-400 transition-colors">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JharkhandTourismHomepage;