import * as React from "react";
import { useEVChargingCount } from "@/hooks/useEVChargingCount";
import IconCs from "@/assets/icon-cs.svg";
import IconEv from "@/assets/icon-ev.svg";
import { Info } from "lucide-react";
import { TriangleAlert, ThumbsUp, CircleX } from "lucide-react";
import IconOctagonAlert from "@/assets/icon-octagon-alert.svg?react";
import IconDiamondAlert from "@/assets/icon-diamond-alert.svg?react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default function RatioCard({ county = "WA" }) {
  const { data, loading, error } = useEVChargingCount();

  if (loading) return <Skeleton className="h-[160px] w-full" />;

  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No ratio data available.
      </div>
    );
  }

  // Find data for the specific county (case-insensitive match)
  const countyData = data.find((d) => d.countyName === county.toLowerCase());

  if (!countyData) {
    return (
      <div className="text-center text-gray-400 py-12">
        Data for "{county}" not found.
      </div>
    );
  }

  const { evCount, stationCount, ratio, ratioClass } = countyData;

  const stats = {
    0: {
      icon: CircleX,
      fill: "fill-[var(--color-map-range-0)]",
      text: "No Station",
      textColor: "text-[var(--color-map-range-0)]",
    },
    1: {
      icon: IconOctagonAlert,
      fill: "fill-[var(--color-map-range-1)]",
      text: "High Shortage",
      textColor: "text-[var(--color-map-range-1)]",
    },
    2: {
      icon: IconDiamondAlert,
      fill: "fill-[var(--color-map-range-2)]",
      text: "Mid Shortage",
      textColor: "text-[var(--color-map-range-2)]",
    },
    3: {
      icon: TriangleAlert,
      fill: "fill-[var(--color-map-range-3)]",
      text: "Low Shortage",
      textColor: "text-[var(--color-map-range-3)]",
    },
    4: {
      icon: ThumbsUp,
      fill: "fill-[var(--color-map-range-4)]",
      text: "Good",
      textColor: "text-[var(--color-map-range-4)]",
    },
  };

  const ratioClassStr = String(ratioClass);
  const RatioIcon = stats[ratioClassStr].icon;
  const RatioText = stats[ratioClassStr].text;
  const iconFillClass = stats[ratioClassStr].fill;
  const textColorClass = stats[ratioClassStr].textColor;

  const StationText =
    stationCount === 1 || stationCount === 0 ? "Station" : "Stations";
  const EVText = evCount === 1 || evCount === 0 ? "EV" : "EVs";

  return (
    <Card className="w-full gap-2">
      <CardHeader className="flex flex-row justify-start items-center gap-2">
        <CardTitle className="card-title text-left text-lg">
          Charger-to-EV Ratio
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-xs p-4 bg-popover text-popover-foreground">
              <small>
                The Charger-to-EV ratio shows how many electric vehicles share
                one charging station. The ideal range is{" "}
                <span className="font-weight-bold">8–12</span> EVs per charger,
                as recommended by SBD Automotive.
              </small>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex flex-col justify-start items-start gap-3">
        <div className="flex flex-row justify-start items-center gap-3 group">
          <p className="text-3xl">{ratio.toLocaleString("en-US")}</p>
          <div className="flex flex-row justify-start items-center gap-1">
            <RatioIcon
              className={`w-6 h-6 ${iconFillClass} stroke-[#282828]`}
            />
            <strong className={`text-sm ${textColorClass}`}>{RatioText}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-row justify-start items-center gap-2">
            <img
              src={IconCs}
              alt="Charging Station Icon"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="text-sm xl:text-base">
              {stationCount.toLocaleString("en-US")} {StationText}
            </p>
          </div>
          <div className="flex flex-row justify-start items-center gap-2">
            <img
              src={IconEv}
              alt="Electric Vehicle Icon"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="text-sm xl:text-base">
              {evCount.toLocaleString("en-US")} {EVText}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
