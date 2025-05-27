import * as React from "react";
import { useEVChargingCount } from "@/hooks/useEVChargingCount";
import IconCs from "@/assets/icon-cs.svg";
import IconEv from "@/assets/icon-ev.svg";
import { Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RatioCard({ county = "WA" }) {
  const { data, loading, error } = useEVChargingCount();

  if (loading)
    return <div className="text-center py-12">Loading ratio data…</div>;
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

  const { evCount, stationCount, ratio } = countyData;
  return (
    <Card className="w-full max-w-5xl gap-2">
      <CardHeader className="flex flex-row justify-start items-center gap-2">
        <CardTitle className="card-title text-left text-lg">
          EV-to-Charger Ratio
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-xs p-4 bg-popover text-popover-foreground">
              <small>
                The EV-to-charger ratio shows how many electric vehicles share
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
          <p className="text-3xl sm:text-4xl">
            {ratio.toLocaleString("en-US")} : 1
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="w-3 h-3 rounded-full transition-opacity duration-200 group-hover:opacity-70"
                  style={{
                    backgroundColor:
                      ratio <= 12
                        ? "var(--color-primary)"
                        : "var(--color-destructive)",
                  }}
                />
              </TooltipTrigger>
              <TooltipContent className="p-3 bg-popover text-popover-foreground">
                {ratio <= 12 ? (
                  <small>
                    <span className="text-primary">Good</span> — charger
                    availability is within/better than ideal range.
                  </small>
                ) : (
                  <small>
                    <span className="text-destructive">Too High</span> — not
                    enough chargers for the number of EVs.
                  </small>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-row justify-start items-center gap-2">
            <img
              src={IconCs}
              alt="Charging Station Icon"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="text-sm xl:text-base">
              {stationCount.toLocaleString("en-US")} Stations
            </p>
          </div>
          <div className="flex flex-row justify-start items-center gap-2">
            <img
              src={IconEv}
              alt="Electric Vehicle Icon"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />
            <p className="text-sm xl:text-base">
              {evCount.toLocaleString("en-US")} EVs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
