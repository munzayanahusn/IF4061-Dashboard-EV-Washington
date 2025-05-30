import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import throttle from 'lodash.throttle';
import bbox from '@turf/bbox';
import mapJson from '../data/map/WA_map.json';
import { useEVChargingCount } from '../hooks/useEVChargingCount';
import ChoroplethLegendVert from './ChoroplethLegendVert';

const CountyPath = React.memo(({ feature, datum, isSelected, path, fill, onClick, onMouseEnter, onMouseLeave, countyName }) => {
  const className = `county-path ${isSelected ? 'county-selected' : ''}`;
  return (
    <path
      className={className}
      d={path(feature)}
      fill={fill}
      stroke={isSelected ? "#1E90FF" : "#333"}
      strokeWidth={isSelected ? 3 : 1}
      onClick={() => onClick(countyName, datum)}
      onMouseEnter={(e) => onMouseEnter(datum, e, countyName)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    />
  );
}, (prevProps, nextProps) => (
  prevProps.isSelected === nextProps.isSelected &&
  prevProps.fill === nextProps.fill &&
  prevProps.datum?.countyName === nextProps.datum?.countyName
));

const HoverOverlay = React.memo(({ hoveredCounty, path, mapFeatures }) => {
  if (!hoveredCounty) return null;
  const feature = mapFeatures.find(f => f.properties.JURISDICT_LABEL_NM.toLowerCase() === hoveredCounty.countyName);
  if (!feature) return null;
  return (
    <path
      d={path(feature)}
      fill="none"
      stroke="#1E90FF"
      strokeWidth={2.5}
      style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 4px rgba(30, 144, 255, 0.6))' }}
    />
  );
});

const ChoroplethMap = ({ onCountyClick }) => {
  const { data, breaks, loading, error } = useEVChargingCount();
  const ratioBreaks = breaks?.ratioBreaks || [];

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const lastTooltipPos = useRef({ x: null, y: null });

  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const datumMap = useMemo(() => {
    const map = new Map();
    data?.forEach(d => map.set(d.countyName, d));
    return map;
  }, [data]);

  const colorScale = useMemo(() => (
    d3.scaleOrdinal()
      .domain(d3.range(5))
      .range(['#ffffff', '#FFF9D3', '#FFE291', '#FFD563', '#FFBC03'])
  ), []);

  const projectionAndPath = useMemo(() => {
    const { width, height } = containerSize;
    const [minX, minY, maxX, maxY] = bbox(mapJson);
    const x = d3.scaleLinear().range([0, width]).domain([minX, maxX]);
    const y = d3.scaleLinear().range([0, height]).domain([maxY, minY]);
    const proj = d3.geoTransform({
      point(px, py) {
        const scaleFactor = 0.85;
        const offsetX = 100;
        const offsetY = 30;
        const scaledX = x(px) * scaleFactor + offsetX;
        const scaledY = y(py) * scaleFactor + offsetY;
        this.stream.point(scaledX, scaledY);
      }
    });
    return { projection: proj, path: d3.geoPath().projection(proj) };
  }, [containerSize]);

  const { projection, path } = projectionAndPath;

  const handleMouseMove = useCallback((e) => {
    if (!tooltipRef.current || !containerRef.current || !showTooltip) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const tooltip = tooltipRef.current;
    const tooltipWidth = 200;
    const margin = 30;
    
    let tooltipX;
    if (x + margin + tooltipWidth > containerSize.width) {
      tooltipX = Math.max(x - tooltipWidth - margin + 70, margin + 70);
    } else {
      tooltipX = x + margin;
    }
    
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${Math.max(y - 30, 10)}px`;
  }, [containerSize.width, showTooltip]);

  const throttledMouseMove = useRef(null);

  useEffect(() => {
    throttledMouseMove.current = throttle(handleMouseMove, 16);
    return () => {
      if (throttledMouseMove.current) {
        throttledMouseMove.current.cancel();
      }
    };
  }, [handleMouseMove]);

  const handleSVGMouseMove = useCallback((e) => {
    if (throttledMouseMove.current) {
      throttledMouseMove.current(e);
    }
  }, []);

  const handleMouseEnter = useCallback((datum, e, countyName) => {
    setHoveredCounty(datum);
    setShowTooltip(true);
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCounty(null);
    setShowTooltip(false);
  }, []);

  const handleCountyClick = useCallback((county, countyData) => {
    const formattedCountyName = county.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setSelectedCounty(county);
    if (onCountyClick) {
      onCountyClick({ countyName: formattedCountyName, rawCountyName: county, data: countyData });
    }
  }, [onCountyClick]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const [minX, minY, maxX, maxY] = bbox(mapJson);
        const aspectRatio = (maxY - minY) / (maxX - minX);
        let width = containerWidth;
        let height = containerWidth * aspectRatio;
        const minHeight = 240;
        if (height < minHeight) {
          height = minHeight;
          width = height / aspectRatio;
        }
        setContainerSize({ width, height });
      }
    };
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    updateSize();
    return () => observer.disconnect();
  }, []);

  if (loading || !data) return <div style={{ height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Washington data...</div>;
  if (error) return <div style={{ height: '100%', minHeight: 400, color: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error loading map: {error}</div>;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }
    }>
      <svg 
        ref={svgRef} 
        width={containerSize.width} 
        height={containerSize.height} 
        viewBox={`0 0 ${containerSize.width} ${containerSize.height}`} 
        preserveAspectRatio="xMidYMid meet" 
        onMouseMove={handleSVGMouseMove}
      >
        <g>
          {mapJson.features.map((feature, i) => {
            const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
            const datum = datumMap.get(county);
            const ratioClass = datum ? parseInt(datum.ratioClass) : -1;
            const fill = ratioClass >= 0 ? colorScale(ratioClass) : '#f0f0f0';
            return (
              <CountyPath 
                key={i} 
                feature={feature} 
                datum={datum} 
                isSelected={selectedCounty === county} 
                path={path} 
                fill={fill} 
                onClick={handleCountyClick} 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave} 
                countyName={county} 
              />
            );
          })}
        </g>
        <HoverOverlay hoveredCounty={hoveredCounty} path={path} mapFeatures={mapJson.features} />
        <g>
          {mapJson.features.map((feature, i) => {
            const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
            const centroid = path.centroid(feature);
            if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null;
            return (
              <text 
                key={i} 
                x={centroid[0]} 
                y={centroid[1]} 
                textAnchor="middle" 
                alignmentBaseline="central" 
                style={{ fontSize: 8, fontWeight: 'bold', fill: '#333', pointerEvents: 'none' }}
              >
                {county.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </text>
            );
          })}
        </g>
      </svg>

      <div 
        ref={tooltipRef} 
        style={{ 
          position: 'absolute', 
          left: -9999, 
          top: -9999, 
          zIndex: 100, 
          backgroundColor: '#1c1c1c', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '6px', 
          fontSize: '12px', 
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)', 
          pointerEvents: 'none', 
          whiteSpace: 'nowrap', 
          maxWidth: '200px', 
          wordWrap: 'break-word', 
          opacity: showTooltip ? 1 : 0, 
          transition: 'opacity 0.15s ease-out', 
          transform: 'translateZ(0)' 
        }}
      >
        {hoveredCounty && (
          <>
            <strong>{hoveredCounty.countyName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong><br />
            Ratio: {parseFloat(hoveredCounty.ratio).toLocaleString('en-US')}<br />
            Charging Station: {hoveredCounty.stationCount.toLocaleString('en-US')}<br />
            EV: {hoveredCounty.evCount.toLocaleString('en-US')}
          </>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 25, left: 10 }}>
        <ChoroplethLegendVert colorScale={colorScale} breaks={ratioBreaks} selectedClass={hoveredCounty?.ratioClass ?? null} />
      </div>
    </div>
  );
};

export default ChoroplethMap;
