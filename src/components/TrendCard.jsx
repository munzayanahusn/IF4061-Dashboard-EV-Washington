"use client"

import React, { useEffect } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Info } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"
import { useEVChargingTrendData } from "../hooks/useEVChargingTrendData"

const evColor = "#34D399"
const chargingColor = "#FACC15"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const ev = payload.find(p => p.dataKey === "ev")?.value ?? 0
    const charging = payload.find(p => p.dataKey === "charging")?.value ?? 0

    return (
      <div
        style={{
          backgroundColor: "#1c1c1c",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
          pointerEvents: "none"
        }}
      >
        <div><strong>Year: {label}</strong></div>
        <div>EV: {ev.toLocaleString()}</div>
        <div>Charging Station: {charging.toLocaleString()}</div>
      </div>
    )
  }
  return null
}

export default function TrendCard({ county = "WA" }) {
  const { data: chartData, loading, error } = useEVChargingTrendData(county)

  useEffect(() => {
    console.log("Trend data loaded:", chartData)
  }, [chartData])

  if (loading) return <div className="text-center py-12">Loading trend data…</div>
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>
  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-gray-400 py-12">No trend data available.</div>
  }

  return (
    <Card className="w-full h-full max-w-5xl">
      <CardHeader className="flex flex-row items-center justify-between">
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
                  This line chart shows the year-over-year growth of electric vehicles (EVs)
                  and public charging stations in <strong>{county}</strong>.
                </small>
              </TooltipContent>
            </UiTooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full" style={{ backgroundColor: evColor }}></span>
            <span className="text-sm">EV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full" style={{ backgroundColor: chargingColor }}></span>
            <span className="text-sm">Charging Station</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[350px]">
        <div className="h-full w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 30, bottom: 20, left: 30, right: 30 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#ccc", strokeDasharray: "5 5" }}
              />
              <Line
                type="linear"
                dataKey="ev"
                stroke={evColor}
                strokeWidth={2}
                dot={{ stroke: evColor, fill: evColor }}
                activeDot={{ r: 5 }}
              />
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
  )
}
