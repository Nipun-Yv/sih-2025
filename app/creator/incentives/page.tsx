"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Gift, MapPin, Calendar, DollarSign, CheckCircle } from "lucide-react";
import TierBadge from "../components/TierBadge";

export default function IncentivesPage() {
  const [creator, setCreator] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCreator();
  }, []);

  const fetchCreator = async () => {
    const response = await fetch("/api/creator/init");
    const data = await response.json();
    setCreator(data.creator);
  };

  const tierBenefits = {
    bronze: {
      tripDays: 3,
      accommodation: "Standard Hotels",
      compensation: 0,
      experiences: ["City Tours", "Cultural Sites", "Local Cuisine"],
    },
    silver: {
      tripDays: 5,
      accommodation: "Premium Hotels",
      compensation: 0,
      experiences: [
        "All Bronze perks",
        "Adventure Activities",
        "Exclusive Access",
      ],
    },
    gold: {
      tripDays: 7,
      accommodation: "Luxury Hotels",
      compensation: 25000,
      experiences: ["All Silver perks", "Private Tours", "VIP Treatment"],
    },
    platinum: {
      tripDays: 10,
      accommodation: "5-Star Resorts",
      compensation: 50000,
      experiences: [
        "All Gold perks",
        "Helicopter Tours",
        "Celebrity Chef Dining",
      ],
    },
  };

  const currentTier = creator?.tier;
  const benefits = currentTier
    ? tierBenefits[currentTier as keyof typeof tierBenefits]
    : null;

  if (!creator || creator.status === "unverified") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Calculate Your Score First
          </h3>
          <p className="text-gray-600 mb-6">
            Complete verification and analytics to see your incentives
          </p>
          <Button
            onClick={() => router.push("/creator/verification")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Start Verification
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Incentives</h1>
        <p className="text-gray-600 mt-2">
          Rewards and benefits based on your engagement tier
        </p>
      </div>

      {currentTier && benefits && (
        <>
          {/* Current Tier Card */}
          <div className="bg-white rounded-xl p-6 border border-orange-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Your Tier Status
                </h3>
                <p className="text-gray-600 mt-1">
                  Score: {creator.analytics?.engagementScore}/100
                </p>
              </div>
              <TierBadge tier={currentTier} />
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <BenefitCard
                icon={Calendar}
                label="Trip Duration"
                value={`${benefits.tripDays} Days`}
                description="All expenses paid"
              />
              <BenefitCard
                icon={MapPin}
                label="Accommodation"
                value={benefits.accommodation}
                description="Premium locations"
              />
              {benefits.compensation > 0 && (
                <BenefitCard
                  icon={DollarSign}
                  label="Additional Compensation"
                  value={`₹${benefits.compensation.toLocaleString()}`}
                  description="For content creation"
                />
              )}
              <BenefitCard
                icon={Gift}
                label="Experiences"
                value={`${benefits.experiences.length} Unique`}
                description="Curated activities"
              />
            </div>
          </div>

          {/* Experiences List */}
          <div className="bg-white rounded-xl p-6 border border-orange-100 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Included Experiences
            </h3>
            <div className="space-y-2">
              {benefits.experiences.map((exp: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700">{exp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Ready to Proceed?
            </h3>
            <p className="text-gray-600 mb-4">
              Review and sign the contract to lock in your incentives
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/creator/contract")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                View Contract
              </Button>
              <Button
                onClick={() => router.push("/attractions")}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                Plan Your Journey
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Benefit Card Component
function BenefitCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: any;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-orange-50 rounded-lg p-4 hover:bg-orange-100 transition-colors">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-orange-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
