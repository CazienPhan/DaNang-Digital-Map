import React from "react";
import { Car, Bike, Footprints, Navigation } from "lucide-react";

interface TransportModeSelectorProps {
  selectedMode: string;
  onChange: (mode: string) => void;
}

const transportModes = [
  { id: "car", label: "Car", icon: <Car className="h-4 w-4" /> },
  { id: "motorcycle", label: "Motorbike", icon: <Navigation className="h-4 w-4" /> },
  { id: "bike", label: "Bicycle", icon: <Bike className="h-4 w-4" /> },
  { id: "foot", label: "Walking", icon: <Footprints className="h-4 w-4" /> }
];

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({ selectedMode, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      {transportModes.map((mode) => {
        const active = selectedMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              active
                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onChange(mode.id)}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TransportModeSelector;