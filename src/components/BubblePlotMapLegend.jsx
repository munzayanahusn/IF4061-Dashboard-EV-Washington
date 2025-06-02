import React from "react";

export default function BubblePlotMapLegend({
  evBubbleScale,
  stationMarkerScale,
}) {
  const legendValues = [10, 100, 1000];
  const calculateRadius = (count) => Math.sqrt(count / Math.PI) * evBubbleScale;

  return (
    <div className="flex items-center gap-6">
      {legendValues.map((count) => {
        const radius = calculateRadius(count);
        return (
          <div key={count} className="flex flex-col items-center">
            <svg width={radius * 2} height={radius * 2}>
              <circle
                cx={radius}
                cy={radius}
                r={radius}
                fill="rgba(52, 152, 219, 0.6)"
                stroke="#2980b9"
                strokeWidth="1"
              />
            </svg>
            <span className="text-sm mt-1">{count.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
