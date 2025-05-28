import * as React from "react";
import { useEVTypeBreakdown } from "@/hooks/useEVTypeBreakdown";
import { Info } from "lucide-react";
import IconBEV from "@/assets/icon-bev.svg";
import IconPHEV from "@/assets/icon-phev.svg";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
} from "recharts";

export default function EVTypCard({ county = "WA" }) {
  const { data, loading, error } = useEVTypeBreakdown();

  if (loading)
    return <div className="text-center py-12">Loading EV type data…</div>;

  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        No EV type data available.
      </div>
    );
  }

  // Case-insensitive match: compare lowercased county names
  const countyData = data.find(
    (d) => d.countyName.toLowerCase() === county.toLowerCase()
  );

  if (!countyData) {
    return (
      <div className="text-center text-gray-400 py-12">
        Data for "{county}" not found.
      </div>
    );
  }

  // Assuming data has these keys: countyName, countPHEV, countBEV, propPHEV, propBEV
  const { countyName, countPHEV, countBEV, propPHEV, propBEV } = countyData;

  // Prepare data for the chart
  const chartData = [
    {
      name: countyName,
      PHEV: propPHEV,
      BEV: propBEV,
    },
  ];

  return (
    <Card className="w-full max-w-5xl gap-2">
      <CardHeader className="flex flex-row justify-start items-center gap-2">
        <CardTitle className="card-title text-left text-lg">
          EV Type Breakdown
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
        <ResponsiveContainer width="100%" height={40}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            <Bar
              dataKey="PHEV"
              stackId="a"
              fill="var(--chart-5)"
              radius={[6, 0, 0, 6]}
            >
              <LabelList
                dataKey="PHEV"
                position="insideRight"
                formatter={(value) => `${value.toFixed(0)}%`}
                fill="var(--chart-foreground)"
                style={{ fontSize: 14 }}
              />
            </Bar>
            <Bar
              dataKey="BEV"
              stackId="a"
              fill="var(--chart-1)"
              radius={[0, 6, 6, 0]}
            >
              <LabelList
                dataKey="BEV"
                position="insideRight"
                formatter={(value) => `${value.toFixed(0)}%`}
                fill="var(--chart-foreground)"
                style={{ fontSize: 14 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-row justify-between w-full px-2 text-sm text-foreground">
          <div className="flex gap-1 text-left text-sm">
            PHEV <img src={IconPHEV} alt="PHEV Icon" className="w-4 h-4" />
          </div>
          <div className="flex gap-1 text-right text-sm">
            BEV <img src={IconBEV} alt="BEV Icon" className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
