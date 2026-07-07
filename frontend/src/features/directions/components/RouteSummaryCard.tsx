import React from "react";
import { Navigation, Clock } from "lucide-react";
import type { RouteResult } from "@/services/map4d/routing.service";

interface RouteSummaryCardProps {
  routeData: RouteResult;
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({ routeData }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xl flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 leading-none mb-1">
              {routeData.duration}
            </div>
            <div className="text-sm font-medium text-gray-500 leading-none">
              Duration
            </div>
          </div>
        </div>
        
        <div className="w-px h-10 bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <div className="bg-green-50 text-green-600 p-2 rounded-full">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900 leading-none mb-1">
              {routeData.distance}
            </div>
            <div className="text-sm font-medium text-gray-500 leading-none">
              Distance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSummaryCard;