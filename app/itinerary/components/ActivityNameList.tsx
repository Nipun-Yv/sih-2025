import { Activity } from "@/types/Activity";
import { MapPin } from "lucide-react";
import React from "react";

const ActivityNameList = ({
  locationName,
  selectedActivities,
}: {
  locationName: string|null;
  selectedActivities: Activity[];
}) => {
  return (
    <div className="w-[50%] bg-white rounded-xl p-6 border border-orange-100 shadow-lg hover:shadow-xl transition-shadow max-w-lg h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-orange-600 font-medium">Trip to</p>
          <p className="text-2xl font-bold text-gray-900">
            {locationName || "Loading..."}
          </p>
        </div>
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-orange-600" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-200">
        {selectedActivities.length > 0 ? (
          <ul className="space-y-2 pr-2">
            {selectedActivities.map((activity) => (
              <li
                key={activity.id}
                className="bg-orange-50 text-orange-700 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-orange-100 hover:text-orange-800"
              >
                {activity.name}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No activities selected yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityNameList;
