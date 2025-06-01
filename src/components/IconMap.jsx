import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import bbox from "@turf/bbox";
import mapJson from "../data/map/WA_map.json";
import { useEVChargingCount } from "../hooks/useEVChargingCount";
import { ThumbsUp, AlertTriangle } from "lucide-react";
import IconMapLegend from "./IconMapLegend";

const IconMap = ({ onCountyClick }) => {
  const { data, loading, breaks, error } = useEVChargingCount();
  const ratioBreaks = breaks?.ratioBreaks || [];
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 400,
  });
  const [hoveredCountyData, setHoveredCountyData] = useState(null);
  const [selectedCountyName, setSelectedCountyName] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const [highlightedRatioClass, setHighlightedRatioClass] = useState(null);

  const indicatorConfig = {
    commonStroke: "#282828",
    0: {
      IconComponent: (props) => (
        <AlertTriangle
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-0)",
      circleFill: "#282828",
      label: "No Station",
    },
    1: {
      IconComponent: (props) => (
        <ThumbsUp
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-4)",
      circleFill: "#282828",
      label: "Good",
    },
    2: {
      IconComponent: (props) => (
        <AlertTriangle
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-3)",
      circleFill: "#282828",
      label: "Low Severity",
    },
    3: {
      IconComponent: (props) => (
        <AlertTriangle
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-2)",
      circleFill: "#282828",
      label: "Mid Severity",
    },
    4: {
      IconComponent: (props) => (
        <AlertTriangle
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-1)",
      circleFill: "#282828",
      label: "High Severity",
    },
    default: {
      IconComponent: (props) => (
        <AlertTriangle
          {...props}
          fill={props.color}
          stroke={indicatorConfig.commonStroke}
        />
      ),
      iconColor: "var(--color-map-range-0)",
      circleFill: "#282828",
      label: "Unknown",
    },
  };

  const ICON_CIRCLE_RADIUS = 12;
  const LUCIDE_ICON_SIZE = 14;
  const TOOLTIP_ICON_SIZE = 16;
  const ICON_GROUP_Y_OFFSET = 20;
  const LINE_TO_COUNTY_MARGIN = 2;
  const COUNTY_NAME_Y_OFFSET = 0;
  const legendItemsSetup = [
    { ratioClassKey: "1", displayType: "range", rangeIndex: 1 },
    { ratioClassKey: "2", displayType: "range", rangeIndex: 2 },
    { ratioClassKey: "3", displayType: "range", rangeIndex: 3 },
    { ratioClassKey: "4", displayType: "range", rangeIndex: 4 },
    { ratioClassKey: "0", displayType: "label" },
  ];

  const countyDataMap = useMemo(() => {
    if (!data) return new Map();
    const map = new Map();
    data.forEach((datum) => {
      map.set(datum.countyName.toLowerCase(), datum);
    });
    return map;
  }, [data]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && mapJson?.features?.length > 0) {
        const containerWidth = containerRef.current.clientWidth;
        const [minGeoX, minGeoY, maxGeoX, maxGeoY] = bbox(mapJson);
        let aspectRatio = (maxGeoY - minGeoY) / (maxGeoX - minGeoX);
        if (isNaN(aspectRatio) || aspectRatio <= 0 || !isFinite(aspectRatio))
          aspectRatio = 0.5;

        let newWidth = containerWidth;
        let newHeight = newWidth * aspectRatio;
        const minHeight = 240;

        if (newHeight < minHeight) {
          newHeight = minHeight;
          newWidth =
            aspectRatio > 0 ? newHeight / aspectRatio : newHeight / 0.5;
        }
        if (newWidth > containerWidth) {
          newWidth = containerWidth;
          newHeight = aspectRatio > 0 ? newWidth * aspectRatio : newWidth * 0.5;
        }
        setContainerSize({
          width: Math.max(newWidth, 0),
          height: Math.max(newHeight, 0),
        });
      }
    };

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      updateSize();
    }
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      observer.disconnect();
    };
  }, []);

  const featureRenderData = useMemo(() => {
    if (
      !mapJson?.features?.length ||
      containerSize.width === 0 ||
      containerSize.height === 0 ||
      countyDataMap.size === 0
    ) {
      return [];
    }
    const { width, height } = containerSize;
    const [minCoordX, minCoordY, maxCoordX, maxCoordY] = bbox(mapJson);
    const xScale = d3
      .scaleLinear()
      .range([0, width])
      .domain([minCoordX, maxCoordX]);
    const yScale = d3
      .scaleLinear()
      .range([0, height])
      .domain([maxCoordY, minCoordY]);
    const scaleFactor = 0.9;
    const offsetX = 60;
    const offsetY = 20;
    const projection = d3.geoTransform({
      point(px, py) {
        const projectedX = xScale(px) * scaleFactor + offsetX;
        const projectedY = yScale(py) * scaleFactor + offsetY;
        this.stream.point(projectedX, projectedY);
      },
    });
    const pathGenerator = d3.geoPath().projection(projection);
    return mapJson.features.map((feature, index) => {
      const pathD = pathGenerator(feature);
      const centroid = pathD ? pathGenerator.centroid(feature) : [NaN, NaN];
      const countyName = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
      const datum = countyDataMap.get(countyName);
      return {
        feature,
        pathD,
        centroid,
        datum,
        countyName,
        featureKeySuffix: index,
      };
    });
  }, [mapJson, containerSize, countyDataMap]);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseEnter = (datum, e) => {
    if (datum) {
      setHoveredCountyData(datum);
      setShowTooltip(true);
      if (typeof datum.ratioClass !== "undefined") {
        setHighlightedRatioClass(String(datum.ratioClass));
      }
    }
    handleMouseMove(e);
  };

  const handleMouseLeave = () => {
    setHoveredCountyData(null);
    setShowTooltip(false);
    setHighlightedRatioClass(null);
  };

  const handleCountyClick = (feature, datum) => {
    if (!datum) return;
    const countyName = datum.countyName;
    const formattedCountyName = countyName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    setSelectedCountyName(countyName);
    if (onCountyClick) {
      onCountyClick({
        countyName: formattedCountyName,
        rawCountyName: countyName,
        data: datum,
      });
    }
  };

  // ... (loading, error, and other early returns)
  if (loading)
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Map Data...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error loading map data.
      </div>
    );
  if (
    containerSize.width === 0 ||
    containerSize.height === 0 ||
    !mapJson?.features?.length
  )
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Initializing map...
      </div>
    );
  if (featureRenderData.length === 0 && !loading && data && data.length > 0)
    return (
      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Processing map features...
      </div>
    );

  const getStatusDetails = (ratioClass) => {
    return indicatorConfig[String(ratioClass)] || indicatorConfig.default;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "auto",
        aspectRatio: `${containerSize.width / containerSize.height || 2}`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "100%",
        minHeight: "240px",
      }}
    >
      <svg
        width={containerSize.width}
        height={containerSize.height}
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* ... (defs, county-paths, county-indicators SVG groups) ... */}
        <defs>
          <filter id="inset-shadow">
            <feOffset dx="1" dy="1" />
            <feGaussianBlur stdDeviation="1.5" result="offset-blur" />
            <feComposite
              operator="out"
              in="SourceGraphic"
              in2="offset-blur"
              result="inverse"
            />
            <feFlood floodColor="#000" floodOpacity="0.15" result="color" />
            <feComposite
              operator="in"
              in="color"
              in2="inverse"
              result="shadow"
            />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
        <g className="county-paths">
          {featureRenderData.map(
            ({ feature, pathD, datum, countyName, featureKeySuffix }) => {
              if (!pathD) return null;
              const isHovered = hoveredCountyData?.countyName === countyName;
              const isSelected = selectedCountyName === countyName;
              return (
                <path
                  key={`path-${featureKeySuffix}`}
                  d={pathD}
                  fill={
                    isHovered ? "#555555" : isSelected ? "#4a4a4a" : "#3d3d3d"
                  }
                  stroke="#111"
                  strokeWidth={isHovered || isSelected ? 1.5 : 0.8}
                  filter="url(#inset-shadow)"
                  onClick={() => handleCountyClick(feature, datum)}
                  onMouseEnter={(e) => handleMouseEnter(datum, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: "pointer",
                    transition: "fill 0.2s ease, stroke-width 0.2s ease",
                  }}
                />
              );
            }
          )}
        </g>
        <g className="county-indicators">
          {featureRenderData.map(
            ({ feature, centroid, datum, countyName, featureKeySuffix }) => {
              if (
                !datum ||
                !centroid ||
                isNaN(centroid[0]) ||
                isNaN(centroid[1])
              )
                return null;

              const ratioClassKey = String(datum.ratioClass); // Ensure string key
              const indicatorDetails =
                indicatorConfig[ratioClassKey] || indicatorConfig.default;
              const {
                IconComponent,
                iconColor,
                circleFill,
                label: indicatorLabel,
              } = indicatorDetails;

              const formattedName = countyName
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              const iconGroupX = centroid[0];
              const iconGroupY = centroid[1] - ICON_GROUP_Y_OFFSET;

              return (
                <g
                  key={`indicator-${featureKeySuffix}`}
                  transform={`translate(${iconGroupX}, ${iconGroupY})`}
                  onClick={() => handleCountyClick(feature, datum)}
                  onMouseEnter={(e) => handleMouseEnter(datum, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: "pointer" }}
                >
                  <line
                    x1={0}
                    y1={ICON_CIRCLE_RADIUS - 5}
                    x2={0}
                    y2={ICON_GROUP_Y_OFFSET - LINE_TO_COUNTY_MARGIN}
                    stroke="rgba(28, 28, 28, 0.95)"
                    strokeWidth={1.5}
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={0}
                    cy={0}
                    r={ICON_CIRCLE_RADIUS}
                    fill={circleFill}
                  />
                  <IconComponent
                    color={iconColor}
                    size={LUCIDE_ICON_SIZE}
                    x={-LUCIDE_ICON_SIZE / 2}
                    y={-LUCIDE_ICON_SIZE / 2}
                    aria-label={indicatorLabel}
                  />
                  <text
                    x={0}
                    y={COUNTY_NAME_Y_OFFSET + ICON_GROUP_Y_OFFSET}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize="9px"
                    fontWeight="500"
                    fill="#FFFFFF"
                    paintOrder="stroke"
                    stroke="#333333"
                    strokeWidth="0.2em"
                    strokeLinejoin="round"
                  >
                    {formattedName}
                  </text>
                </g>
              );
            }
          )}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredCountyData &&
        showTooltip &&
        (() => {
          const statusDetails = getStatusDetails(hoveredCountyData.ratioClass);
          const {
            IconComponent,
            iconColor,
            label: statusLabel,
          } = statusDetails;
          return (
            <div
              style={{
                position: "absolute",
                left: mousePos.x + 15,
                top: mousePos.y - 15,
                zIndex: 1000,
                backgroundColor: "rgba(28, 28, 28, 0.98)",
                color: "white",
                padding: "12px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                lineHeight: "1.6",
                boxShadow: "0 5px 15px rgba(0,0,0,0.6)",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                maxWidth: "280px",
                transform: "translateY(-100%)",
                transition: "opacity 0.1s ease-in-out",
                opacity: showTooltip ? 1 : 0,
              }}
            >
              <strong style={{ marginRight: "8px" }}>
                {hoveredCountyData.countyName
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </strong>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <IconComponent
                  color={iconColor}
                  size={TOOLTIP_ICON_SIZE}
                  style={{ marginRight: "4px" }}
                />
                <strong style={{ color: iconColor }}>{statusLabel}</strong>
              </div>
              Ratio: {Number(hoveredCountyData.ratio).toFixed(2)}
              <br />
              Charging Stations: {hoveredCountyData.stationCount}
              <br />
              EV Count: {hoveredCountyData.evCount}
            </div>
          );
        })()}

      {/* Legend */}
      <div
        className="hidden md:block"
        style={{ position: "absolute", bottom: -48, left: 10, zIndex: 10 }}
      >
        <IconMapLegend
          indicatorConfig={indicatorConfig}
          legendItemsSetup={legendItemsSetup}
          breaks={ratioBreaks}
          selectedRatioClass={highlightedRatioClass}
        />
      </div>
    </div>
  );
};

export default IconMap;
