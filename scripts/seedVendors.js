// scripts/seedVendors.js
// Run this script to populate your database with sample vendor data

import dbConnect from "../lib/mongoose";
import User from '@/models/User';
import VendorProfile from '@/models/VendorProfile';

const sampleVendors = [
  // Tour Guides
  {
    userData: {
      clerkId: 'guide_001',
      email: 'rajesh.guide@example.com',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      fullName: 'Rajesh Kumar',
      role: 'vendor',
      vendorType: 'guide',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Jharkhand Heritage Tours',
      description: 'Experienced local guide specializing in historical and cultural tours of Jharkhand. Fluent in Hindi, English, and Santhali.',
      contactPhone: '+91-9876543210',
      contactEmail: 'rajesh.guide@example.com',
      address: {
        street: 'Near Tagore Hill',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        coordinates: {
          latitude: 23.3441,
          longitude: 85.3096
        }
      },
      serviceArea: {
        radius: 50,
        locations: ['jharkhand_india'],
        attractions: ['tagore-hill', 'surya-temple-ranchi', 'hundru-falls', 'jonha-falls']
      },
      businessDetails: {
        priceRange: 'mid-range',
        capacity: 15,
        amenities: ['Local Transportation', 'Photography Assistance', 'Cultural Insights'],
        specializations: ['Historical Tours', 'Cultural Heritage', 'Tribal Culture'],
        languages: ['Hindi', 'English', 'Santhali', 'Bengali'],
        experience: 8
      },
      ratings: {
        average: 4.7,
        count: 134,
        reviews: [
          {
            userId: 'tourist_001',
            rating: 5,
            comment: 'Excellent knowledge of local history and very friendly!',
            date: new Date('2024-08-15')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
      ],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        hours: '8:00 AM - 6:00 PM',
        seasonalAvailability: {
          availableMonths: ['january', 'february', 'march', 'april', 'october', 'november', 'december'],
          unavailableDates: []
        }
      },
      pricing: {
        basePrice: 2500,
        priceUnit: 'per_day',
        packages: [
          {
            name: 'Half Day City Tour',
            description: 'Covers Tagore Hill, Surya Temple, and local markets',
            price: 1500,
            duration: '4 hours',
            inclusions: ['Guide Service', 'Local Transport', 'Water Bottle']
          },
          {
            name: 'Full Day Heritage Tour',
            description: 'Complete cultural and historical tour of Ranchi',
            price: 2500,
            duration: '8 hours',
            inclusions: ['Guide Service', 'Local Transport', 'Lunch', 'Entry Tickets']
          }
        ]
      },
      vendorType: 'guide',
      isActive: true,
      verificationStatus: 'verified'
    }
  },

  // Restaurant
  {
    userData: {
      clerkId: 'restaurant_001',
      email: 'manager@spicygarden.com',
      firstName: 'Priya',
      lastName: 'Singh',
      fullName: 'Priya Singh',
      role: 'vendor',
      vendorType: 'food_restaurant',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Spicy Garden Restaurant',
      description: 'Authentic Jharkhand cuisine with modern dining experience. Famous for tribal delicacies and traditional thali.',
      contactPhone: '+91-9876543211',
      contactEmail: 'manager@spicygarden.com',
      address: {
        street: 'Main Road, Doranda',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834002',
        coordinates: {
          latitude: 23.3569,
          longitude: 85.3346
        }
      },
      serviceArea: {
        radius: 25,
        locations: ['jharkhand_india'],
        attractions: ['tagore-hill', 'surya-temple-ranchi']
      },
      businessDetails: {
        priceRange: 'mid-range',
        capacity: 80,
        amenities: ['Air Conditioning', 'Wi-Fi', 'Parking', 'Home Delivery'],
        specializations: ['Tribal Cuisine', 'Vegetarian Thali', 'Litti Chokha', 'Traditional Sweets'],
        languages: ['Hindi', 'English'],
        experience: 12
      },
      ratings: {
        average: 4.3,
        count: 267,
        reviews: [
          {
            userId: 'tourist_002',
            rating: 4,
            comment: 'Great authentic food, loved the tribal thali!',
            date: new Date('2024-08-20')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'
      ],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        hours: '11:00 AM - 11:00 PM'
      },
      pricing: {
        basePrice: 350,
        priceUnit: 'per_person',
        packages: [
          {
            name: 'Tribal Special Thali',
            description: 'Complete traditional meal with 8 items',
            price: 280,
            duration: '1 hour',
            inclusions: ['Rice', 'Dal', '2 Vegetables', 'Pickle', 'Sweet', 'Buttermilk']
          },
          {
            name: 'Family Feast',
            description: 'Complete meal for 4 people with multiple cuisines',
            price: 1200,
            duration: '1.5 hours',
            inclusions: ['Starter', 'Main Course', 'Dessert', 'Beverages']
          }
        ]
      },
      vendorType: 'food_restaurant',
      isActive: true,
      verificationStatus: 'verified'
    }
  },

  // Transportation Service
  {
    userData: {
      clerkId: 'transport_001',
      email: 'booking@ranchicabs.com',
      firstName: 'Amit',
      lastName: 'Sharma',
      fullName: 'Amit Sharma',
      role: 'vendor',
      vendorType: 'transportation',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Ranchi Premium Cabs',
      description: 'Reliable taxi and tour service covering all major attractions in Jharkhand. Clean vehicles with experienced drivers.',
      contactPhone: '+91-9876543212',
      contactEmail: 'booking@ranchicabs.com',
      address: {
        street: 'Station Road',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        coordinates: {
          latitude: 23.3441,
          longitude: 85.3096
        }
      },
      serviceArea: {
        radius: 100,
        locations: ['jharkhand_india'],
        attractions: ['tagore-hill', 'surya-temple-ranchi', 'hundru-falls', 'jonha-falls', 'parasnath-hills', 'betla-national-park']
      },
      businessDetails: {
        priceRange: 'mid-range',
        capacity: 7,
        amenities: ['AC Vehicles', 'GPS Tracking', '24/7 Service', 'English Speaking Drivers'],
        specializations: ['Airport Pickup', 'City Tours', 'Outstation Trips', 'Waterfall Tours'],
        languages: ['Hindi', 'English'],
        experience: 6
      },
      ratings: {
        average: 4.5,
        count: 189,
        reviews: [
          {
            userId: 'tourist_003',
            rating: 5,
            comment: 'Punctual service and clean cars. Driver was very helpful.',
            date: new Date('2024-08-25')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400'
      ],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        hours: '24/7 Service'
      },
      pricing: {
        basePrice: 12,
        priceUnit: 'per_hour',
        packages: [
          {
            name: 'City Tour Package',
            description: '8-hour city sightseeing with major attractions',
            price: 2500,
            duration: '8 hours',
            inclusions: ['AC Vehicle', 'Driver', 'Fuel', 'Parking Charges']
          },
          {
            name: 'Waterfall Tour',
            description: 'Visit Hundru and Jonha Falls',
            price: 3500,
            duration: '10 hours',
            inclusions: ['AC Vehicle', 'Driver', 'Fuel', 'Waiting Charges']
          },
          {
            name: 'Airport Transfer',
            description: 'One way airport pickup/drop',
            price: 800,
            duration: '1 hour',
            inclusions: ['AC Vehicle', 'Driver', 'Fuel']
          }
        ]
      },
      vendorType: 'transportation',
      isActive: true,
      verificationStatus: 'verified'
    }
  },

  // Hotel/Accommodation
  {
    userData: {
      clerkId: 'hotel_001',
      email: 'reservations@ranchihills.com',
      firstName: 'Sunita',
      lastName: 'Gupta',
      fullName: 'Sunita Gupta',
      role: 'vendor',
      vendorType: 'accomodation',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Ranchi Hills Resort',
      description: 'Comfortable stay with modern amenities and beautiful hill views. Perfect for tourists exploring Ranchi.',
      contactPhone: '+91-9876543213',
      contactEmail: 'reservations@ranchihills.com',
      address: {
        street: 'Hill Top Road, Kanke',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834008',
        coordinates: {
          latitude: 23.4241,
          longitude: 85.4096
        }
      },
      serviceArea: {
        radius: 30,
        locations: ['jharkhand_india'],
        attractions: ['tagore-hill', 'surya-temple-ranchi', 'hundru-falls']
      },
      businessDetails: {
        priceRange: 'mid-range',
        capacity: 24,
        amenities: ['Wi-Fi', 'Restaurant', 'Room Service', 'Parking', 'Travel Desk', 'Laundry'],
        specializations: ['Hill View Rooms', 'Family Rooms', 'Honeymoon Suites', 'Group Bookings'],
        languages: ['Hindi', 'English'],
        experience: 10
      },
      ratings: {
        average: 4.2,
        count: 156,
        reviews: [
          {
            userId: 'tourist_004',
            rating: 4,
            comment: 'Nice location with great views. Good service and clean rooms.',
            date: new Date('2024-08-30')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'
      ],
      availability: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        hours: '24/7 Check-in Available'
      },
      pricing: {
        basePrice: 2500,
        priceUnit: 'per_day',
        packages: [
          {
            name: 'Deluxe Room',
            description: 'Comfortable room with hill view and modern amenities',
            price: 2500,
            duration: '1 night',
            inclusions: ['AC Room', 'Wi-Fi', 'Breakfast', 'Parking']
          },
          {
            name: 'Family Suite',
            description: 'Spacious suite for families with extra bed',
            price: 4000,
            duration: '1 night',
            inclusions: ['AC Suite', 'Wi-Fi', 'Breakfast', 'Room Service', 'Parking']
          }
        ]
      },
      vendorType: 'accomodation',
      isActive: true,
      verificationStatus: 'verified'
    }
  },

  // Activity Provider
  {
    userData: {
      clerkId: 'activity_001',
      email: 'adventures@jharkhandandventures.com',
      firstName: 'Vikash',
      lastName: 'Mahato',
      fullName: 'Vikash Mahato',
      role: 'vendor',
      vendorType: 'activity',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Jharkhand Adventure Sports',
      description: 'Adventure sports and outdoor activities specialist. Offering trekking, rock climbing, rappelling, and nature photography tours.',
      contactPhone: '+91-9876543214',
      contactEmail: 'adventures@jharkhandandventures.com',
      address: {
        street: 'Adventure Park Road',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834005',
        coordinates: {
          latitude: 23.3648,
          longitude: 85.3312
        }
      },
      serviceArea: {
        radius: 80,
        locations: ['jharkhand_india'],
        attractions: ['parasnath-hills', 'betla-national-park', 'hundru-falls', 'jonha-falls', 'tagore-hill']
      },
      businessDetails: {
        priceRange: 'mid-range',
        capacity: 20,
        amenities: ['Safety Equipment', 'Professional Guides', 'Photography Service', 'First Aid'],
        specializations: ['Trekking', 'Rock Climbing', 'Rappelling', 'Nature Photography', 'Team Building'],
        languages: ['Hindi', 'English', 'Bengali'],
        experience: 5
      },
      ratings: {
        average: 4.6,
        count: 89,
        reviews: [
          {
            userId: 'tourist_005',
            rating: 5,
            comment: 'Amazing trekking experience at Parasnath Hills. Well organized and safe.',
            date: new Date('2024-09-01')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
      ],
      availability: {
        days: ['friday', 'saturday', 'sunday', 'monday'],
        hours: '6:00 AM - 6:00 PM',
        seasonalAvailability: {
          availableMonths: ['october', 'november', 'december', 'january', 'february', 'march', 'april'],
          unavailableDates: []
        }
      },
      pricing: {
        basePrice: 1500,
        priceUnit: 'per_person',
        packages: [
          {
            name: 'Parasnath Trek',
            description: 'Full day trekking to highest peak in Jharkhand',
            price: 2500,
            duration: '8 hours',
            inclusions: ['Guide', 'Safety Equipment', 'Lunch', 'Photography']
          },
          {
            name: 'Waterfall Rappelling',
            description: 'Rappelling experience at Hundru Falls',
            price: 1800,
            duration: '4 hours',
            inclusions: ['Equipment', 'Professional Instructor', 'Safety Briefing']
          },
          {
            name: 'Nature Photography Tour',
            description: 'Guided photography tour in Betla National Park',
            price: 3000,
            duration: '6 hours',
            inclusions: ['Professional Guide', 'Transport', 'Equipment Tips']
          }
        ]
      },
      vendorType: 'activity',
      isActive: true,
      verificationStatus: 'verified'
    }
  },

  // Another Guide (Local Expert)
  {
    userData: {
      clerkId: 'guide_002',
      email: 'tribal.tours@example.com',
      firstName: 'Santoshi',
      lastName: 'Soren',
      fullName: 'Santoshi Soren',
      role: 'vendor',
      vendorType: 'guide',
      registrationStatus: 'approved',
      isVerified: true
    },
    vendorData: {
      businessName: 'Tribal Heritage Walks',
      description: 'Authentic tribal culture experiences with indigenous community member. Specializing in traditional crafts, folk stories, and village life.',
      contactPhone: '+91-9876543215',
      contactEmail: 'tribal.tours@example.com',
      address: {
        street: 'Tribal Village, Khunti',
        city: 'Khunti',
        state: 'Jharkhand',
        pincode: '835210',
        coordinates: {
          latitude: 23.0715,
          longitude: 85.2784
        }
      },
      serviceArea: {
        radius: 40,
        locations: ['jharkhand_india'],
        attractions: ['betla-national-park', 'parasnath-hills']
      },
      businessDetails: {
        priceRange: 'budget',
        capacity: 10,
        amenities: ['Cultural Artifacts', 'Traditional Food', 'Handicraft Demonstration', 'Folk Music'],
        specializations: ['Tribal Culture', 'Traditional Crafts', 'Folk Stories', 'Village Tourism'],
        languages: ['Santhali', 'Hindi', 'English', 'Ho'],
        experience: 12
      },
      ratings: {
        average: 4.9,
        count: 67,
        reviews: [
          {
            userId: 'tourist_006',
            rating: 5,
            comment: 'Incredible authentic experience. Learned so much about tribal traditions.',
            date: new Date('2024-09-05')
          }
        ]
      },
      images: [
        'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
        'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400'
      ],
      availability: {
        days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        hours: '9:00 AM - 5:00 PM'
      },
      pricing: {
        basePrice: 800,
        priceUnit: 'per_person',
        packages: [
          {
            name: 'Village Cultural Tour',
            description: 'Half-day authentic tribal village experience',
            price: 800,
            duration: '4 hours',
            inclusions: ['Village Tour', 'Traditional Lunch', 'Craft Demonstration']
          },
          {
            name: 'Tribal Heritage Full Day',
            description: 'Complete immersion in tribal culture and traditions',
            price: 1400,
            duration: '7 hours',
            inclusions: ['Village Tour', 'Traditional Meals', 'Music & Dance', 'Handicraft Workshop']
          }
        ]
      },
      vendorType: 'guide',
      isActive: true,
      verificationStatus: 'verified'
    }
  }
];

async function seedVendors() {
  try {
    await dbConnect();
    
    console.log('Starting vendor seeding...');
    
    // Clear existing data
    await User.deleteMany({ role: 'vendor' });
    await VendorProfile.deleteMany({});
    
    console.log('Cleared existing vendor data');
    
    for (const vendorData of sampleVendors) {
      // Create user first
      const user = new User(vendorData.userData);
      await user.save();
      
      // Create vendor profile with reference to user
      const vendorProfile = new VendorProfile({
        ...vendorData.vendorData,
        userId: user.clerkId
      });
      await vendorProfile.save();
      
      console.log(`Created vendor: ${vendorData.vendorData.businessName}`);
    }
    
    console.log('Vendor seeding completed successfully!');
    console.log(`Created ${sampleVendors.length} vendors`);
    
    // Display summary
    const summary = await VendorProfile.aggregate([
      {
        $group: {
          _id: '$vendorType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('Vendor breakdown by type:');
    summary.forEach(item => {
      console.log(`${item._id}: ${item.count}`);
    });
    
  } catch (error) {
    console.error('Error seeding vendors:', error);
  } finally {
    process.exit();
  }
}

// Run the seeding function
seedVendors();