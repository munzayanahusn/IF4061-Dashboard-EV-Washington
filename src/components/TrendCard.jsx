import React, { useState, useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info, Funnel } from "lucide-react"; // Added Funnel icon
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEVChargingTrendData } from "../hooks/useEVChargingTrendData";

const formatYearAbbreviated = (yearValue) => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1400px)").matches
  ) {
    const yearStr = String(yearValue);
    return `'${yearStr.slice(-2)}`;
  } else {
    return yearValue;
  }
};

export default function TrendCard({ county = "WA" }) {
  const { data: chartData, loading, error } = useEVChargingTrendData(county);
  const [filter, setFilter] = useState("all"); // 'all', 'ev', 'charging'

  const root =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement)
      : null;
  const evColor = root
    ? root.getPropertyValue("--color-chart-1").trim()
    : "#8884d8";
  const chargingColor = root
    ? root.getPropertyValue("--color-chart-2").trim()
    : "#82ca9d";

  const filteredChartData = useMemo(() => {
    if (!chartData) return [];
    if (filter === "ev") {
      return chartData.map((item) => ({
        ...item,
        year: item.year,
        ev: item.ev,
        charging: undefined,
      }));
    }
    if (filter === "charging") {
      return chartData.map((item) => ({
        ...item,
        year: item.year,
        ev: undefined,
        charging: item.charging,
      }));
    }
    return chartData;
  }, [chartData, filter]);

  const yAxisDomain = useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0)
      return [0, "auto"];
    let maxVal = 0;
    filteredChartData.forEach((item) => {
      if (filter === "all" || filter === "ev") {
        if (item.ev !== undefined && item.ev > maxVal) maxVal = item.ev;
      }
      if (filter === "all" || filter === "charging") {
        if (item.charging !== undefined && item.charging > maxVal)
          maxVal = item.charging;
      }
    });
    return [0, maxVal === 0 ? "auto" : Math.ceil(maxVal * 1.1)];
  }, [filteredChartData, filter]);

  if (loading) return <Skeleton className="h-[450px] w-full max-w-5xl" />;
  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No trend data available.
      </div>
    );
  }

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "ev", label: "EV" },
    { value: "charging", label: "Charging Station" },
  ];

  return (
    <Card className="w-full h-[450px] max-w-5xl gap-2">
      <CardHeader className="flex flex-col items-start justify-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg">
              EV & Charging Station Trend
            </CardTitle>
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="p-4 bg-popover text-popover-foreground max-w-sm">
                  <small>
                    This line chart shows the year-over-year growth of electric
                    vehicles (EVs) and public charging stations in{" "}
                    <strong>{county}</strong>.
                  </small>
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:justify-between w-full mt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-4 rounded-full"
                style={{ backgroundColor: evColor }}
              ></span>
              <span className="text-sm">EV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-4 rounded-full"
                style={{ backgroundColor: chargingColor }}
              ></span>
              <span className="text-sm">Charging Station</span>
            </div>
          </div>

          {/* Shadcn Select for filtering */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-fit text-xs h-auto py-1 px-2 border-none">
              <div className="flex items-center gap-1.5">
                <Funnel className="w-3 h-3 text-muted-foreground" />
                <SelectValue placeholder="Filter data" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%">
            <LineChart
              data={filteredChartData}
              margin={{ top: 20, bottom: 10, left: 20, right: 30 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--color-chart-accent)"
              />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tickFormatter={formatYearAbbreviated}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => val.toLocaleString()}
                fontSize={14}
                domain={yAxisDomain}
                allowDataOverflow={true}
              />
              <Tooltip
                cursor={{
                  stroke: "var(--color-chart-accent)",
                  strokeDasharray: "5 5",
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const evData = payload.find((p) => p.dataKey === "ev");
                    const chargingData = payload.find(
                      (p) => p.dataKey === "charging"
                    );
                    return (
                      <div className="z-50 w-fit max-w-xs rounded-md px-3 py-2 text-xs bg-popover text-popover-foreground shadow-lg border border-border">
                        {evData &&
                          evData.value !== undefined &&
                          (filter === "all" || filter === "ev") && (
                            <div>
                              <strong>EV:</strong>{" "}
                              {evData.value.toLocaleString()}
                            </div>
                          )}
                        {chargingData &&
                          chargingData.value !== undefined &&
                          (filter === "all" || filter === "charging") && (
                            <div>
                              <strong>Charging Station:</strong>{" "}
                              {chargingData.value.toLocaleString()}
                            </div>
                          )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {(filter === "all" || filter === "ev") && (
                <Line
                  type="linear"
                  dataKey="ev"
                  stroke={evColor}
                  strokeWidth={2}
                  dot={{ stroke: evColor, fill: evColor }}
                  activeDot={{ r: 5 }}
                  connectNulls={false} // Important: set to false to handle undefined data points
                />
              )}

              {(filter === "all" || filter === "charging") && (
                <Line
                  type="linear"
                  dataKey="charging"
                  stroke={chargingColor}
                  strokeWidth={2}
                  dot={{ stroke: chargingColor, fill: chargingColor }}
                  activeDot={{ r: 5 }}
                  connectNulls={false} // Important: set to false to handle undefined data points
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
