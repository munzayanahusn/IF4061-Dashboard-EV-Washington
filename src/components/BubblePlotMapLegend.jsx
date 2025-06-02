import React from "react";
import IconZoom from "@/assets/icon-zoom.png";

export function BubblePlotMapLegend({
  evBubbleScale = 1, // Default scale for legend EV bubbles (1 means true to map area calc)
  stationMarkerScale = 6, // Default size for the station diamond (half-width/height)
}) {
  // EV Legend configuration
  const legendEvValues = [50, 500, 1500]; // Example values for EV counts in legend
  const calculateEvRadius = (count) => {
    if (count <= 0) return 0;
    return Math.sqrt(count / Math.PI) * evBubbleScale;
  };

  // Station Legend configuration (derived from stationMarkerScale)
  const stationDiamondSize = stationMarkerScale;

  return (
    <div className="flex flex-col gap-y-3 bg-[#1c1c1c] px-4 py-3 rounded-lg text-card-foreground text-xs shadow-[0_2px_8px_rgba(0,0,0,0.35)] w-fit min-w-[200px]">
      {/* EV Bubbles Section */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-card-foreground">
          Electric Vehicles (Count)
        </h4>
        <div className="flex flex-row gap-x-3 items-center justify-between">
          {legendEvValues.map((count) => {
            const radius = calculateEvRadius(count);
            // Ensure a minimum diameter for visibility, even for small counts/scales
            const diameter = Math.max(radius * 2, 4);

            return (
              <div
                key={`ev-${count}`}
                className="flex flex-col items-center text-center flex-1"
              >
                <svg
                  width={diameter}
                  height={diameter}
                  style={{ marginBottom: "2px" }}
                >
                  <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={diameter / 2}
                    fill="var(--color-primary, #3498DB)"
                    opacity="0.7" // Consistent with map EV bubble opacity
                  />
                </svg>
                <span className="text-xs text-muted-foreground">
                  {count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-accent my-1"></div>

      {/* Charging Station Section */}
      <div>
        <div className="flex flex-row items-center gap-x-2">
          <svg
            width={stationDiamondSize * 2}
            height={stationDiamondSize * 2}
            aria-label="Charging Station Symbol"
          >
            <path
              // Diamond path: M s 0 L 2s s L s 2s L 0 s Z
              // where s is stationDiamondSize (half-width/height)
              d={`M ${stationDiamondSize} 0 
                  L ${stationDiamondSize * 2} ${stationDiamondSize} 
                  L ${stationDiamondSize} ${stationDiamondSize * 2} 
                  L 0 ${stationDiamondSize} Z`}
              fill="var(--color-secondary)" // Consistent with map station color
              opacity="0.8" // Consistent with map station opacity
            />
          </svg>
          <span className="text-sm text-card-foreground">Charging Station</span>
        </div>
      </div>
    </div>
  );
}

export function BubblePlotMapInfo() {
  return (
    <div
      className="
        group {/* Add 'group' class here for group-hover to work on children */}
        flex items-center gap-3 
        bg-[#1c1c1c] px-4 py-3 
        rounded-lg text-card-foreground text-xs 
        shadow-[0_2px_8px_rgba(0,0,0,0.35)] 
        w-14
        overflow-hidden 
        whitespace-nowrap
        transition-all duration-500 ease-in-out
        hover:min-w-[220px]
        cursor-default
      "
    >
      {/* Ensure IconZoom is a valid path or imported component/SVG data */}
      <img
        src={IconZoom}
        alt="Map Interaction Hint"
        className="w-6 h-6 flex-shrink-0"
      />
      <small
        className="
          text-sm text-card-foreground
          opacity-0 pointer-events-none /* Hidden by default */
          group-hover:opacity-100 group-hover:pointer-events-auto /* Shows on parent hover */
          cursor-default
          "
      >
        Zoom and pan to explore
      </small>
    </div>
  );
}
