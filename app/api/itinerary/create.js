// pages/api/itinerary/create.js
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      userId, 
      attractions, 
      activities, 
      startDate, 
      endDate, 
      locationId,
      preferences 
    } = body;

    // Validate required fields
    if (!userId || !attractions || !startDate || !locationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Check if itinerary already exists for this user and location
    const existingItinerary = await Itinerary.findOne({
      userId,
      locationId,
      status: { $in: ['draft', 'planning', 'finalized'] }
    });

    if (existingItinerary) {
      // Update existing itinerary
      existingItinerary.attractions = attractions;
      existingItinerary.activities = activities || [];
      existingItinerary.startDate = new Date(startDate);
      if (endDate) existingItinerary.endDate = new Date(endDate);
      if (preferences) existingItinerary.preferences = { ...existingItinerary.preferences, ...preferences };
      existingItinerary.status = 'planning';

      await existingItinerary.save();

      return NextResponse.json({
        success: true,
        data: existingItinerary,
        message: 'Itinerary updated successfully'
      });
    }

    // Create new itinerary
    const itinerary = new Itinerary({
      userId,
      attractions,
      activities: activities || [],
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      locationId,
      preferences: preferences || {},
      status: 'planning'
    });

    await itinerary.save();

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: 'Itinerary created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Itinerary creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create itinerary'
    }, { status: 500 });
  }
}

// pages/api/itinerary/[id].js
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const itinerary = await Itinerary.findById(params.id)
      .populate([
        { path: 'vendors.hotels.vendorId', model: 'VendorProfile' },
        { path: 'vendors.restaurants.vendorId', model: 'VendorProfile' },
        { path: 'vendors.guides.vendorId', model: 'VendorProfile' },
        { path: 'vendors.transport.vendorId', model: 'VendorProfile' }
      ])
      .lean();

    if (!itinerary) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: 'Itinerary updated successfully'
    });

  } catch (error) {
    console.error('Itinerary update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update itinerary'
    }, { status: 500 });
  }
}

// pages/api/itinerary/user/[userId].js
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query = { userId: params.userId };
    if (status) query.status = status;

    const itineraries = await Itinerary.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate([
        { path: 'vendors.hotels.vendorId', model: 'VendorProfile', select: 'businessName address.city ratings' },
        { path: 'vendors.restaurants.vendorId', model: 'VendorProfile', select: 'businessName address.city ratings' },
        { path: 'vendors.guides.vendorId', model: 'VendorProfile', select: 'businessName address.city ratings' },
        { path: 'vendors.transport.vendorId', model: 'VendorProfile', select: 'businessName address.city ratings' }
      ])
      .lean();

    const total = await Itinerary.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        itineraries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('User itineraries fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user itineraries'
    }, { status: 500 });
  }
}

// pages/api/itinerary/add-vendor.js
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { itineraryId, vendorId, vendorType, bookingDetails } = body;

    if (!itineraryId || !vendorId || !vendorType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary not found'
      }, { status: 404 });
    }

    // Check if vendor already exists in itinerary
    const existingVendor = itinerary.vendors[vendorType + 's']?.find(
      v => v.vendorId.toString() === vendorId
    );

    if (existingVendor) {
      return NextResponse.json({
        success: false,
        error: 'Vendor already added to itinerary'
      }, { status: 400 });
    }

    // Add vendor to appropriate category
    const vendorEntry = {
      vendorId,
      bookingStatus: 'interested',
      ...bookingDetails
    };

    if (!itinerary.vendors[vendorType + 's']) {
      itinerary.vendors[vendorType + 's'] = [];
    }

    itinerary.vendors[vendorType + 's'].push(vendorEntry);
    await itinerary.save();

    // Populate the updated itinerary
    await itinerary.populate(`vendors.${vendorType}s.vendorId`, 'businessName address ratings pricing');

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: 'Vendor added to itinerary successfully'
    });

  } catch (error) {
    console.error('Add vendor to itinerary error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add vendor to itinerary'
    }, { status: 500 });
  }
}

// pages/api/itinerary/remove-vendor.js
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { itineraryId, vendorId, vendorType } = body;

    if (!itineraryId || !vendorId || !vendorType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary not found'
      }, { status: 404 });
    }

    // Remove vendor from appropriate category
    const vendorCategory = vendorType + 's';
    if (itinerary.vendors[vendorCategory]) {
      itinerary.vendors[vendorCategory] = itinerary.vendors[vendorCategory].filter(
        v => v.vendorId.toString() !== vendorId
      );
      await itinerary.save();
    }

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: 'Vendor removed from itinerary successfully'
    });

  } catch (error) {
    console.error('Remove vendor from itinerary error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove vendor from itinerary'
    }, { status: 500 });
  }
}

// pages/api/itinerary/finalize.js
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { itineraryId, finalActivities } = body;

    if (!itineraryId) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary ID is required'
      }, { status: 400 });
    }

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return NextResponse.json({
        success: false,
        error: 'Itinerary not found'
      }, { status: 404 });
    }

    // Update activities with final schedule
    if (finalActivities) {
      itinerary.activities = finalActivities;
    }

    // Calculate total budget spent
    let totalSpent = 0;
    const categoryWise = {
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      guides: 0,
      miscellaneous: 0
    };

    // Calculate activity costs
    itinerary.activities.forEach(activity => {
      if (activity.price) {
        totalSpent += activity.price;
        categoryWise.activities += activity.price;
      }
    });

    // Calculate vendor costs
    Object.keys(itinerary.vendors).forEach(type => {
      itinerary.vendors[type].forEach(vendor => {
        if (vendor.price) {
          totalSpent += vendor.price;
          
          if (type === 'hotels') categoryWise.accommodation += vendor.price;
          else if (type === 'restaurants') categoryWise.food += vendor.price;
          else if (type === 'transport') categoryWise.transport += vendor.price;
          else if (type === 'guides') categoryWise.guides += vendor.price;
          else categoryWise.miscellaneous += vendor.price;
        }
      });
    });

    // Update budget
    itinerary.budget.spentAmount = totalSpent;
    itinerary.budget.categoryWise = categoryWise;
    itinerary.status = 'finalized';

    await itinerary.save();

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: 'Itinerary finalized successfully'
    });

  } catch (error) {
    console.error('Finalize itinerary error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to finalize itinerary'
    }, { status: 500 });
  }
}
