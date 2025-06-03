import * as React from "react";
import { useStationNetBreakdown } from "@/hooks/useStationNetBreakdown";
import { Info } from "lucide-react";
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
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "var(--color-chart-2, #FFC107)",
  "var(--color-chart-3, #4CAF50)",
  "var(--color-chart-4, #2196F3)",
  "var(--color-chart-5, #9E9E9E)",
  "var(--color-chart-1, #F44336)",
  "var(--color-chart-6, #FF9800)",
];

const LegendItem = ({ label, color }) => {
  return (
    <div className="flex items-center gap-1.5 text-sm p-0 rounded-md">
      <span
        className="inline-block w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="flex-1 min-w-0">
        <span
          className="font-medium text-foreground block truncate"
          title={label}
        >
          {label}
        </span>
      </span>
    </div>
  );
};

const CustomLegend = ({ config }) => {
  if (!config || Object.keys(config).length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap justify-start items-start gap-y-0 gap-x-2.5 max-h-[72px] overflow-y-auto px-1 w-full">
      {Object.entries(config).map(([key, { label, color }]) => (
        <LegendItem key={key} label={label} color={color} />
      ))}
    </div>
  );
};

export default function StationNetCard({ county = "WA" }) {
  const { data, loading, error } = useStationNetBreakdown(county);
  const placeholderHeight = "h-56";

  if (loading)
    return <Skeleton className={`${placeholderHeight} w-full max-w-5xl`} />;
  if (error)
    return (
      <div
        className={`text-center py-10 ${placeholderHeight} flex items-center justify-center w-full mx-auto rounded-xl bg-card shadow-lg`}
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div
        className={`text-center py-10 ${placeholderHeight} flex items-center justify-center w-full mx-auto rounded-xl bg-card shadow-lg`}
      >
        <p>No data found for {county}.</p>
      </div>
    );

  const barChartData = [
    data.reduce(
      (obj, item) => {
        obj[item["EV Network"]] = Number(item.Percentage) || 0;
        return obj;
      },
      { name: "networks" }
    ),
  ];

  const chartConfig = data.reduce((acc, d, i) => {
    const networkName = d["EV Network"];
    acc[networkName] = {
      label: networkName,
      color: COLORS[i % COLORS.length],
      percent: Number(d.Percentage) || 0,
    };
    return acc;
  }, {});

  const dataKeys = Object.keys(chartConfig);

  return (
    <Card className="w-full max-w-5xl shadow-lg gap-2">
      <CardHeader className="flex flex-row justify-start items-center gap-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Charging Station Network Provider
        </CardTitle>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="w-xs p-4 bg-popover text-popover-foreground">
              {county === "WA" ? (
                <small>
                  This stacked bar chart shows the <strong>overall</strong>{" "}
                  distribution of <strong>3 major</strong> charging station
                  network provider.
                </small>
              ) : (
                <small>
                  This stacked bar chart shows the distribution of{" "}
                  <strong>3 major</strong> charging station network provider
                  <strong>{county}</strong>
                </small>
              )}
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex flex-col justify-start items-start gap-0">
        <div className="w-full">
          <ResponsiveContainer width="100%" height={40}>
            <BarChart layout="vertical" data={barChartData}>
              <XAxis
                type="number"
                hide
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                hide
                axisLine={false}
                tickLine={false}
                width={0}
              />
              {dataKeys.map((key, index) => {
                const R = 7;
                let radiusConfig = [0, 0, 0, 0];

                if (dataKeys.length === 1) {
                  radiusConfig = [R, R, R, R];
                } else if (index === 0) {
                  radiusConfig = [R, 0, 0, R];
                } else if (index === dataKeys.length - 1) {
                  radiusConfig = [0, R, R, 0];
                }
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={
                      chartConfig[key]?.color || COLORS[index % COLORS.length]
                    }
                    radius={radiusConfig}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey={key}
                      position="insideRight"
                      formatter={(value) => `${Number(value).toFixed(0)}%`}
                      fill="var(--chart-foreground)"
                      style={{ fontSize: 14 }}
                    />
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <CustomLegend config={chartConfig} />
      </CardContent>
    </Card>
  );
}
