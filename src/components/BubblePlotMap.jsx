import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { geoPath } from "d3-geo";
import { useEVData } from "../hooks/useEVData";
import { useStationData } from "../hooks/useStationData";
import { useLocationCount } from "../hooks/useLocationCount";
import mapJson from "../data/map/WA_map.json";
import { PropagateLoader } from "react-spinners";
import IconCS from "@/assets/icon-cs.svg?react";
import IconEV from "@/assets/icon-ev.svg?react";
import { BubblePlotMapLegend, BubblePlotMapInfo } from "./BubblePlotMapLegend";
import { SquareArrowOutUpRight } from "lucide-react";

// CONFIG
const EV_BUBBLE_SCALE = 1.4; // Base radius for EV bubbles
const STATION_MARKER_SIZE = 3.5; // Size for station markers

const BubblePlotMap = ({ countyName, onClose }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const {
    data: normalizedEvData,
    // maxCount is no longer directly used for EV bubble sizing in this approach
    loading: evLoading,
    error: evError,
  } = useEVData(countyName);
  const {
    data: stationData,
    loading: stationLoading,
    error: stationError,
  } = useStationData(countyName);
  const {
    data: locationCountMap,
    loading: countLoading,
    error: countError,
  } = useLocationCount();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight || 500;
      setDimensions({ width: containerWidth, height: containerHeight });
    };

    updateSize();
    const timer1 = setTimeout(updateSize, 100);
    const timer2 = setTimeout(updateSize, 300);
    window.addEventListener("resize", updateSize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const countyFeature = mapJson.features.find(
      (f) =>
        f.properties.JURISDICT_LABEL_NM.toLowerCase() ===
        countyName.toLowerCase()
    );

    if (
      !countyFeature ||
      !normalizedEvData ||
      !stationData ||
      !locationCountMap
    ) {
      g.selectAll("*").remove();
      return;
    }

    const { width, height } = dimensions;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const scaler = 0.8;
    const innerWidth = width * scaler - margin.left - margin.right;
    const innerHeight = height * scaler - margin.top - margin.bottom;

    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([innerWidth, innerHeight], countyFeature);

    const path = geoPath().projection(projection);
    const offsetX = (width - innerWidth) / 2;
    const offsetY = (height - innerHeight) / 2;

    g.selectAll("*").remove();

    g.append("path")
      .datum(countyFeature)
      .attr("d", path)
      .attr("fill", "#2D2C2C")
      .attr("stroke", "#666")
      .attr("opacity", 0.8);

    const grouped = d3.group(normalizedEvData, (d) => d.vehicleLocation);
    const locationData = Array.from(grouped, ([location, vehicles]) => {
      const point = vehicles.find((v) => v.longitude && v.latitude);
      return {
        location,
        longitude: point?.longitude,
        latitude: point?.latitude,
        evCount: locationCountMap.get(location) || vehicles.length,
        vehicles,
      };
    }).filter((d) => d.longitude && d.latitude);

    const openGoogleMaps = (lat, lon) => {
      if (lat && lon) {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        window.open(url, "_blank");
      }
    };

    locationData.forEach((d) => {
      const [x, y] = projection([d.longitude, d.latitude]);
      if (x && y && d.evCount > 0) {
        const radius = Math.sqrt(d.evCount / Math.PI) * EV_BUBBLE_SCALE;
        g.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", radius)
          .attr("fill", "var(--color-primary)")
          .attr("stroke", "var(--color-primary)")
          .attr("stroke-width", 0)
          .attr("opacity", 0.7)
          .style("cursor", "pointer")
          .attr("data-original-radius", radius)
          .on("mouseenter", () => {
            setHoveredLocation(d);
            setHoveredType("ev");
            setShowTooltip(true);
          })
          .on("mousemove", (event) => {
            const bounds = containerRef.current.getBoundingClientRect();
            setMousePos({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            });
          })
          .on("mouseleave", () => {
            setHoveredLocation(null);
            setHoveredType(null);
            setShowTooltip(false);
          })
          .on("click", () => {
            openGoogleMaps(d.latitude, d.longitude);
          });
      }
    });

    const stationMarkerSize = STATION_MARKER_SIZE;

    stationData
      .filter((d) => d.longitude && d.latitude)
      .forEach((d) => {
        const [x, y] = projection([d.longitude, d.latitude]);
        if (x && y) {
          g.append("path")
            .attr(
              "d",
              `M 0 ${-stationMarkerSize} L ${stationMarkerSize} 0 L 0 ${stationMarkerSize} L ${-stationMarkerSize} 0 Z`
            )
            .attr("transform", `translate(${x},${y})`)
            .attr("fill", "var(--color-secondary)")
            .attr("opacity", 0.8)
            .style("cursor", "pointer")
            .attr("data-original-x", x)
            .attr("data-original-y", y)
            .on("mouseenter", () => {
              setHoveredLocation(d);
              setHoveredType("station");
              setShowTooltip(true);
            })
            .on("mousemove", (event) => {
              const bounds = containerRef.current.getBoundingClientRect();
              setMousePos({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
              });
            })
            .on("mouseleave", () => {
              setHoveredLocation(null);
              setHoveredType(null);
              setShowTooltip(false);
            })
            .on("click", () => {
              openGoogleMaps(d.latitude, d.longitude);
            });
        }
      });

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        g.selectAll("circle[fill='var(--color-primary)']").attr(
          "r",
          function () {
            const originalRadius = d3.select(this).attr("data-original-radius");
            return originalRadius
              ? parseFloat(originalRadius) / event.transform.k
              : 0;
          }
        );
        g.selectAll("path[fill='var(--color-secondary)']").attr(
          "transform",
          function () {
            const originalX = parseFloat(
              d3.select(this).attr("data-original-x")
            );
            const originalY = parseFloat(
              d3.select(this).attr("data-original-y")
            );
            return `translate(${originalX},${originalY}) scale(${
              1 / event.transform.k
            })`;
          }
        );
      });

    svg.call(zoom);
    const initialTransform = d3.zoomIdentity
      .translate(offsetX, offsetY)
      .scale(1);
    svg.call(zoom.transform, initialTransform);
  }, [countyName, normalizedEvData, stationData, locationCountMap, dimensions]);

  const loading = evLoading || stationLoading || countLoading;
  const error = evError || stationError || countError;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <div>
          <PropagateLoader color="var(--color-primary)" />
        </div>
      ) : error ? (
        <div className="text-red-500">
          Error: {error.message || String(error)}
        </div>
      ) : (
        <div className="relative flex flex-col cursor-grab active:cursor-grabbing">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: "block", maxWidth: "100%", maxHeight: "100%" }}
          >
            <g ref={gRef}></g>
          </svg>
          <div
            className="hidden md:block"
            style={{ position: "absolute", bottom: 0, left: 10, zIndex: 10 }}
          >
            <BubblePlotMapLegend
              evBubbleScale={EV_BUBBLE_SCALE}
              stationMarkerSize={STATION_MARKER_SIZE}
            />
          </div>
          <div
            className="hidden md:block"
            style={{ position: "absolute", bottom: 0, right: 10, zIndex: 10 }}
          >
            <BubblePlotMapInfo />
          </div>
        </div>
      )}

      {showTooltip && hoveredLocation && (
        <div
          style={{
            position: "absolute",
            top: mousePos.y - 70,
            left: mousePos.x + 10,
            background: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 1000,
            fontSize: "12px",
            maxWidth: "250px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          {hoveredType === "ev" ? (
            <>
              <div className="my-2 flex items-start gap-3">
                <div className="flex justify-center items-center bg-popover rounded-full p-2 w-8 h-8">
                  <IconEV className="w-4 h-4" />
                </div>
                <div>
                  <div>
                    <strong>EV Location:</strong> {hoveredLocation.location}
                  </div>
                  <div>
                    <strong>EV Count:</strong> {hoveredLocation.evCount}
                  </div>
                  <small className="italic text-muted-foreground flex items-center mt-1">
                    Click to open in Google Maps{" "}
                    <SquareArrowOutUpRight className="inline w-3 h-3 ml-1" />
                  </small>
                </div>
              </div>
            </>
          ) : hoveredType === "station" ? (
            <>
              <div className="my-2 flex items-start gap-4">
                <div className="flex justify-center items-center bg-popover rounded-full p-2 w-8 h-8 shrink-0">
                  <IconCS className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <div>
                    <strong>Station:</strong>{" "}
                    {hoveredLocation.stationName || "Unknown"}
                  </div>
                  <div>
                    <strong>Network:</strong>{" "}
                    {hoveredLocation.evNetwork || "N/A"}
                  </div>
                  <div>
                    <strong>Location:</strong> {hoveredLocation.longitude},{" "}
                    {hoveredLocation.latitude}
                  </div>
                  <small className="italic text-muted-foreground flex items-center mt-1">
                    Click to open in Google Maps
                    <SquareArrowOutUpRight className="w-3 h-3 ml-1" />
                  </small>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BubblePlotMap;
