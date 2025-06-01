import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TriangleAlert, ThumbsUp } from "lucide-react";
import { useRatioOverview } from "@/hooks/useRatioOverview";
import IconMidlow from "@/assets/icon-midlow.svg?react";

const InfoCard = ({
  icon: Icon,
  iconFillClass,
  value,
  textLine1,
  textLine1ColorClass,
  textLine2,
  textLine2ColorClass = "text-neutral-400",
}) => {
  return (
    <Card className="w-full lg:w-fit p-4">
      <CardContent className="flex items-center space-x-3 px-1">
        <Icon
          className={`w-6 h-6 ${iconFillClass} stroke-[#282828] text-transparent shrink-0`}
        />
        <div className="flex items-center space-x-2 sm:space-x-3">
          <p className="text-3xl text-white shrink-0">{value}</p>
          <div className="text-left leading-tight lg:hidden xl:block">
            <p
              className={`text-sm sm:text-base font-semibold ${textLine1ColorClass} whitespace-nowrap`}
            >
              {textLine1}
            </p>
            {textLine2 && (
              <p className={`text-xs sm:text-sm ${textLine2ColorClass}`}>
                {textLine2}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function RatioOverview() {
  const { data, loading, error } = useRatioOverview();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 text-white">
        Loading Overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32 text-red-500">
        Error loading data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-32 text-white">
        No overview data available.
      </div>
    );
  }

  // Process data from the hook
  const highSeverity = data.find((d) => d.Status === "High")?.Number || 0;
  const mediumSeverity = data.find((d) => d.Status === "Medium")?.Number || 0;
  const lowSeverity = data.find((d) => d.Status === "Low")?.Number || 0;
  const midAndLowSeverity = mediumSeverity + lowSeverity;
  const goodCounties = data.find((d) => d.Status === "Good")?.Number || 0;
  const unknownCounties = data.find((d) => d.Status === "Unknown")?.Number || 0;

  const cardStats = [
    {
      id: "high",
      icon: TriangleAlert,
      iconFillClass: "fill-[var(--color-map-range-1)]",
      value: highSeverity,
      textLine1: "High Shortage",
      textLine1ColorClass: "text-[--color-map-range-1]",
      textLine2: "Counties",
    },
    {
      id: "midlow",
      icon: IconMidlow,
      iconFillClass: "",
      value: midAndLowSeverity,
      textLine1: "Mid & Low Shortage",
      textLine1ColorClass: "text-[var(--color-map-range-3)]",
      textLine2: "Counties",
    },
    {
      id: "good",
      icon: ThumbsUp,
      iconFillClass: "fill-[var(--color-map-range-4)]",
      value: goodCounties,
      textLine1: "Good",
      textLine1ColorClass: "text-[var(--color-map-range-4)]",
      textLine2: "Counties",
    },
    {
      id: "unknown",
      icon: TriangleAlert,
      iconFillClass: "fill-[var(--color-map-range-0)]",
      value: unknownCounties,
      textLine1: "No Station",
      textLine1ColorClass: "text-[var(--color-map-range-0)]",
      textLine2: "Counties",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:flex xl:flex-nowrap lg:justify-start lg:items-start xl:justify-between">
      {cardStats.map((stat) => (
        <InfoCard
          key={stat.id}
          icon={stat.icon}
          iconFillClass={stat.iconFillClass}
          value={stat.value}
          textLine1={stat.textLine1}
          textLine1ColorClass={stat.textLine1ColorClass}
          textLine2={stat.textLine2}
          textLine2ColorClass={stat.textLine2ColorClass}
        />
      ))}
    </div>
  );
}
