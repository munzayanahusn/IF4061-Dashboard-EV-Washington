import React from "react";

// Helper to format numbers, handling potential Infinity
const formatNumber = (num, decimals = 2) => {
  if (typeof num !== "number" || isNaN(num)) return String(num); // Return as string if not a typical number
  if (num === Infinity) return "∞";
  if (num === -Infinity) return "-∞"; // Should not happen with positive ratios
  return num.toFixed(decimals);
};

const IconMapLegend = ({
  indicatorConfig,
  legendItemsSetup,
  breaks,
  selectedRatioClass = null,
  title = "Charger-to-EV Ratio",
}) => {
  if (!legendItemsSetup || legendItemsSetup.length === 0 || !indicatorConfig) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: "#1c1c1c",
        padding: "10px 12px",
        borderRadius: "8px",
        color: "white",
        fontSize: "11px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        width: "fit-content",
        minWidth: 150, // Adjusted for potentially wider range labels
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: "12px" }}>
        {title}
      </div>

      {legendItemsSetup.map((itemSetup) => {
        const { ratioClassKey, displayType, rangeIndex, customLabel } =
          itemSetup;
        const config = indicatorConfig[ratioClassKey];

        if (!config || !config.IconComponent) {
          console.warn(
            `Legend: Config or IconComponent missing for key ${ratioClassKey}`
          );
          return null;
        }

        const { IconComponent, iconColor, label: configLabel } = config;
        const isSelected = selectedRatioClass === ratioClassKey;

        let displayLabelText = configLabel; // Default to label from indicatorConfig

        if (customLabel) {
          displayLabelText = customLabel;
        } else if (
          displayType === "range" &&
          breaks &&
          typeof rangeIndex === "number" &&
          breaks[rangeIndex + 1] !== undefined
        ) {
          const fromValueRaw = breaks[rangeIndex];
          // Logic from ChoroplethLegendVert for "from" part of range label
          const fromForLabel =
            rangeIndex === 0 ? fromValueRaw : fromValueRaw + 0.01;
          const toForLabel = breaks[rangeIndex + 1];

          // Handle last range potentially being "X+"
          if (
            toForLabel === Infinity ||
            (rangeIndex === breaks.length - 2 && toForLabel > 100000)
          ) {
            // breaks.length-2 is the last valid rangeIndex
            displayLabelText = `${formatNumber(fromForLabel, 2)}+`;
          } else {
            displayLabelText = `${formatNumber(
              fromForLabel,
              2
            )} – ${formatNumber(toForLabel, 2)}`;
          }
        } else if (displayType === "label") {
          displayLabelText = configLabel; // Use the label from indicatorConfig
        }

        return (
          <div
            key={ratioClassKey}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
              padding: isSelected ? "4px 6px" : "2px 6px",
              backgroundColor: isSelected
                ? "rgba(255,255,255,0.15)"
                : "transparent",
              borderRadius: "4px",
              transition: "background-color 0.2s ease, padding 0.2s ease",
            }}
            // Consider adding onMouseEnter/onMouseLeave handlers here if you want legend hover to affect the map
          >
            <IconComponent
              color={iconColor}
              size={16}
              style={{
                marginRight: 8,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "12px" }}>{displayLabelText}</span>
          </div>
        );
      })}
    </div>
  );
};

export default IconMapLegend;
