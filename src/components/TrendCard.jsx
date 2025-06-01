import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Info } from "lucide-react";
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
import { useEVChargingTrendData } from "../hooks/useEVChargingTrendData";

const formatYearAbbreviated = (yearValue) => {
  if (window.matchMedia("(max-width: 1400px)").matches) {
    const yearStr = String(yearValue);
    return `'${yearStr.slice(-2)}`; // e.g., 2007 becomes '07
  } else {
    return yearValue; // Full year for larger screens
  }
};

export default function TrendCard({ county = "WA" }) {
  const { data: chartData, loading, error } = useEVChargingTrendData(county);

  const root = getComputedStyle(document.documentElement);
  const evColor = root.getPropertyValue("--color-chart-1").trim();
  const chargingColor = root.getPropertyValue("--color-chart-2").trim();

  if (loading)
    return <div className="text-center py-12">Loading trend data…</div>;
  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No trend data available.
      </div>
    );
  }

  return (
    <Card className="w-full h-[450px] max-w-5xl gap-2">
      {/* Header section with title and info tooltip */}
      <CardHeader className="flex flex-col items-start justify-center">
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

        {/* Legend for EV and Charging Station lines */}
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
      </CardHeader>

      {/* Line chart section */}
      <CardContent className="flex-1">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, bottom: 10, left: 20, right: 30 }}
            >
              {/* Background grid lines */}
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--color-chart-accent)"
              />

              {/* X axis: Year */}
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tickFormatter={formatYearAbbreviated}
                fontSize={12}
              />

              {/* Y axis: Value counts */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => val.toLocaleString()}
                fontSize={14}
              />

              {/* Tooltip to show EV and charging station values */}
              <Tooltip
                cursor={{
                  stroke: "var(--color-chart-accent)",
                  strokeDasharray: "5 5",
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const ev =
                      payload.find((p) => p.dataKey === "ev")?.value ?? 0;
                    const charging =
                      payload.find((p) => p.dataKey === "charging")?.value ?? 0;
                    return (
                      <div className="z-50 w-fit max-w-xs rounded-md px-3 py-2 text-xs bg-popover text-popover-foreground shadow-lg border border-border">
                        <div>
                          <strong>EV:</strong> {ev.toLocaleString()}
                        </div>
                        <div>
                          <strong>Charging Station:</strong>{" "}
                          {charging.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* EV line */}
              <Line
                type="linear"
                dataKey="ev"
                stroke={evColor}
                strokeWidth={2}
                dot={{ stroke: evColor, fill: evColor }}
                activeDot={{ r: 5 }}
              />

              {/* Charging station line */}
              <Line
                type="linear"
                dataKey="charging"
                stroke={chargingColor}
                strokeWidth={2}
                dot={{ stroke: chargingColor, fill: chargingColor }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
