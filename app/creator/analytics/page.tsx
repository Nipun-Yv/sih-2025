"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EngagementChart from "../components/EngagementChart";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
  const [creator, setCreator] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCreator();
  }, []);

  const fetchCreator = async () => {
    const response = await fetch("/api/creator/init");
    const data = await response.json();
    setCreator(data.creator);

    // If already calculated, fetch metrics
    if (data.creator?.analytics?.engagementScore) {
      setMetrics({
        score: data.creator.analytics.engagementScore,
        breakdown: generateMockBreakdown(
          data.creator.analytics.engagementScore
        ),
      });
    }
  };

  const generateMockBreakdown = (score: number) => ({
    viewsScore: Math.min(score + Math.random() * 10, 100),
    engagementRate: Math.min(score - 5 + Math.random() * 10, 100),
    consistency: Math.min(score - 3 + Math.random() * 10, 100),
    audienceRetention: Math.min(score + 2 + Math.random() * 10, 100),
  });

  const calculateScore = async () => {
    setIsCalculating(true);

    try {
      const response = await fetch("/api/creator/calculate-score", {
        method: "POST",
      });

      const data = await response.json();
      setCreator(data.creator);
      setMetrics({
        score: data.score,
        breakdown: data.breakdown,
      });

      // Auto-redirect to incentives if score is calculated
      setTimeout(() => {
        router.push("/creator/incentives");
      }, 3000);
    } catch (error) {
      console.error("Failed to calculate score:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const hasScore = creator?.analytics?.engagementScore !== undefined;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Track your channel performance and engagement metrics
        </p>
      </div>

      {creator?.status === "unverified" ? (
        <div className="bg-white rounded-xl p-8 border border-orange-100 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Verification Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please verify your YouTube channel first to view analytics
          </p>
          <Button
            onClick={() => router.push("/creator/verification")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Go to Verification
          </Button>
        </div>
      ) : (
        <>
          {/* Main Score Display */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Engagement Score
              </h3>
              {metrics ? (
                <EngagementChart score={metrics.score} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Button
                    onClick={calculateScore}
                    disabled={isCalculating}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Score"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Score Breakdown
              </h3>
              {metrics ? (
                <div className="space-y-4">
                  <ScoreMetric
                    label="Average Views"
                    value={metrics.breakdown.viewsScore}
                  />
                  <ScoreMetric
                    label="Engagement Rate"
                    value={metrics.breakdown.engagementRate}
                  />
                  <ScoreMetric
                    label="Upload Consistency"
                    value={metrics.breakdown.consistency}
                  />
                  <ScoreMetric
                    label="Audience Retention"
                    value={metrics.breakdown.audienceRetention}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Calculate your score to see breakdown
                </div>
              )}
            </div>
          </div>

          {/* Recent Performance */}
          {hasScore && (
            <div className="bg-white rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tier Qualification
              </h3>
              <TierQualification score={creator.analytics.engagementScore} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Score Metric Component
function ScoreMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(value)}/100
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Tier Qualification Component
function TierQualification({ score }: { score: number }) {
  const tiers = [
    { name: "Bronze", min: 50, max: 69, color: "bg-orange-600" },
    { name: "Silver", min: 70, max: 84, color: "bg-gray-400" },
    { name: "Gold", min: 85, max: 94, color: "bg-yellow-500" },
    { name: "Platinum", min: 95, max: 100, color: "bg-purple-500" },
  ];

  const qualifiedTier = tiers.find((t) => score >= t.min && score <= t.max);

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        Based on your score of <span className="font-semibold">{score}</span>,
        you qualify for:
      </p>
      {qualifiedTier ? (
        <div
          className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold
          ${qualifiedTier.color}
        `}
        >
          <TrendingUp className="h-5 w-5" />
          {qualifiedTier.name} Tier
        </div>
      ) : (
        <p className="text-gray-500">
          Score needs to be at least 50 to qualify for a tier
        </p>
      )}
    </div>
  );
}
