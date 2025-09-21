import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import VendorProfile from "@/models/VendorProfile";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const attractions = searchParams.get("attractions")?.split(",") || [];
    const locationId = searchParams.get("locationId") || "";
    const vendorType = searchParams.get("vendorType");
    const budgetType = searchParams.get("budgetType");
    const latitude = parseFloat(searchParams.get("latitude") || "0");
    const longitude = parseFloat(searchParams.get("longitude") || "0");
    const radius = parseInt(searchParams.get("radius") || "50"); // km
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    console.log("Attraction are ",attractions);
    const query: any = {
      isActive: true,
      verificationStatus: "verified",
      $or: [
        { "serviceArea.locations": locationId },
        { "serviceArea.attractions": { $in: attractions } },
      ],
    };

    if (vendorType) query.vendorType = vendorType;
    if (budgetType) query["businessDetails.priceRange"] = budgetType;

    if (latitude && longitude) {
      query["address.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radius * 1000,
        },
      };
    }

    const vendors = await VendorProfile.find(query)
      .populate({
        path: "userId",
        select: "firstName lastName email isVerified",
        model: User,
      })
      .sort({ "ratings.average": -1, "ratings.count": -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await VendorProfile.countDocuments(query);
    console.log("Vendors count are ",vendors)
    const groupedVendors = vendors.reduce((acc: any, vendor: any) => {
      if (!acc[vendor.vendorType]) acc[vendor.vendorType] = [];
      acc[vendor.vendorType].push(vendor);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        vendors: groupedVendors,
        allVendors: vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          attractions,
          locationId,
          vendorType,
          budgetType,
          coordinates:
            latitude && longitude ? { latitude, longitude, radius } : null,
        },
      },
    });
  } catch (error) {
    console.error("Vendor discovery error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
