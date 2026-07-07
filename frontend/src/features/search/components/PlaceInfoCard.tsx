import React from "react";

import { type LocationState } from "@/features/directions/hooks/useDirection";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import { Button } from "@/components/ui/button";

import {
  MapPin,
  Navigation,
} from "lucide-react";

interface PlaceInfoCardProps {
  place: LocationState;
  onGetDirections: () => void;
}

export const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  place,
  onGetDirections,
}) => {
  return (
    <Card
      className="
        mt-3
        w-[420px]
        max-w-[90vw]
        rounded-xl
        border
        shadow-md
      "
    >
      {/* Header */}
      <CardHeader className="gap-2 pb-4">
        <Badge
          variant="secondary"
          className="w-fit text-sm"
        >
          <MapPin className="mr-1 h-3 w-3" />
          {place.category || "Location"}
        </Badge>

        <div>
          <CardTitle className="text-l">
            {place.name || "Selected Location"}
          </CardTitle>

          {place.address && (
            <CardDescription className="mt-2 text-base">
              {place.address}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <Separator />

      {/* Footer */}
      <CardFooter className="py-3">
        <Button
          className="h-11 w-full"
          onClick={onGetDirections}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Directions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlaceInfoCard;