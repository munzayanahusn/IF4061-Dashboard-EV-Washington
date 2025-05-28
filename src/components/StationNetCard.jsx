import * as React from "react";
import { useStationNetBreakdown } from "@/hooks/useStationNetBreakdown";
import { Info } from "lucide-react";
import IconCS from "@/assets/icon-cs.svg";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

const COLORS = [
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const CustomLegend = ({ config, onHover, hoveredKey }) => {
  return (
    <div className="mt-0 flex flex-wrap gap-1">
      {Object.entries(config).map(([key, { label, color, percent }]) => (
        <div
          key={key}
          onMouseEnter={() => onHover(key)}
          onMouseLeave={() => onHover(null)}
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md cursor-pointer transition-colors ${
            hoveredKey === key
              ? "bg-popover text-foreground"
              : "text-foreground"
          }`}
        >
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-medium">{label}</span>
          <span className="text-sm text-foreground">
            ({percent.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export default function StationNetCard({ county = "WA" }) {
  const { data, loading, error } = useStationNetBreakdown(county);
  const [hovered, setHovered] = React.useState(null);

  if (loading || !county) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data.length) return <p className="text-center">No data found.</p>;

  const total = data.reduce((sum, d) => sum + d.Percentage, 0);

  const chartData = data.map((d) => ({
    name: d["EV Network"],
    value: d.Percentage,
  }));

  const chartConfig = chartData.reduce((acc, d, i) => {
    acc[d.name] = {
      label: d.name,
      color: COLORS[i % COLORS.length],
      percent: (d.value / total) * 100,
    };
    return acc;
  }, {});

  return (
    <Card className="w-full max-w-5xl gap-2">
      <CardHeader className="flex flex-row justify-start items-center gap-2">
        <CardTitle className="card-title text-left text-lg">
          Charging Station Network Provider
        </CardTitle>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-xs p-4 bg-popover text-popover-foreground">
              <small>
                PHEV: Plug-in Hybrid Electric Vehicle. BEV: Battery Electric
                Vehicle.
              </small>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex flex-col justify-start items-start gap-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              stroke="none"
              innerRadius={60}
              outerRadius={85}
              activeIndex={chartData.findIndex((d) => d.name === hovered)}
              activeShape={(props) => (
                <Sector
                  {...props}
                  outerRadius={90}
                  innerRadius={60}
                  stroke="none"
                />
              )}
              dataKey="value"
              nameKey="name"
              onMouseLeave={() => setHovered(null)}
            >
              {chartData.map((entry, index) => {
                const key = entry.name;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    onMouseEnter={() => setHovered(key)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                    }}
                  />
                );
              })}
            </Pie>
            <foreignObject x="46%" y="42%" width={40} height={40}>
              <img
                src={IconCS}
                alt="Charging Station Icon"
                className="w-10 h-10"
              />
            </foreignObject>
          </PieChart>
        </ResponsiveContainer>
        <CustomLegend
          config={chartConfig}
          onHover={setHovered}
          hoveredKey={hovered}
        />
      </CardContent>
    </Card>
  );
}
