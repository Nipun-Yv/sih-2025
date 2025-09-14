
import { Activity } from "@/types/Activity";
import { Attraction } from "@/types/Attraction";
import React from "react";

  const formatCurrency = (amount:number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes:number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

const ActivityCard = ({activity,toggleActivity,isSelected,attraction}:{activity:Activity,isSelected:boolean ,attraction:Attraction,
  toggleActivity:(activity:Activity)=>void
}) => {
  return (
    <div
      key={activity.id}
      onClick={() => toggleActivity(activity)}
      className={`cursor-pointer rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-orange-100"
          : "border-gray-200 bg-white hover:border-orange-300"
      }`}
    >
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-1">
              {activity.name}
            </h3>
            <p className="text-sm text-orange-600 font-medium">
               {attraction?.name}
            </p>
          </div>
          {/* Selection Indicator */}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-3 flex-shrink-0 ${
              isSelected
                ? "bg-orange-500 border-orange-500"
                : "bg-white border-gray-300"
            }`}
          >
            {isSelected && <span className="text-white text-sm">✓</span>}
          </div>
        </div>
        {activity.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {activity.description}
          </p>
        )}
      </div>
      {/* Footer */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {activity.category}
          </span>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>⏱️ {formatDuration(activity.duration)}</span>
            {activity.price && (
              <span className="font-medium text-green-600">
                {formatCurrency(activity.price)}
              </span>
            )}
            {!activity.price && <span className="text-gray-400"> Fee</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
