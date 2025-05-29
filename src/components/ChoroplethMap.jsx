import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import bbox from '@turf/bbox';
import mapJson from '../data/map/WA_map.json';
import { useEVChargingCount } from '../hooks/useEVChargingCount';
import ChoroplethLegendVert from './ChoroplethLegendVert';

const ChoroplethMap = ({ onCountyClick }) => {
  const { data, breaks, loading, error } = useEVChargingCount();
  const ratioBreaks = breaks?.ratioBreaks || [];

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });

  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const colorScale = d3.scaleOrdinal()
    .domain(d3.range(5))
    .range(['#ffffff', '#FFF9D3', '#FFE291', '#FFD563', '#FFBC03']);

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
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
      observer.disconnect();
    };
  }, []);

  if (loading || !data) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#ccc',
          textAlign: 'center',
        }}
      >
        Loading Washington data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#ff6b6b',
          textAlign: 'center',
        }}
      >
        Error loading map: {error}
      </div>
    );
  }

  const { width, height } = containerSize;
  const [minX, minY, maxX, maxY] = bbox(mapJson);
  const x = d3.scaleLinear().range([0, width]).domain([minX, maxX]);
  const y = d3.scaleLinear().range([0, height]).domain([maxY, minY]);

  const scaleFactor = 0.85;
  const offsetX = 100;
  const offsetY = 30;

  const projection = d3.geoTransform({
    point(px, py) {
      const scaledX = x(px) * scaleFactor + offsetX;
      const scaledY = y(py) * scaleFactor + offsetY;
      this.stream.point(scaledX, scaledY);
    }
  });

  const path = d3.geoPath().projection(projection);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = (datum, e) => {
    setHoveredCounty(datum);
    handleMouseMove(e);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setHoveredCounty(null);
    setShowTooltip(false);
  };

  const handleCountyClick = (county, countyData) => {
    const formattedCountyName = county.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setSelectedCounty(county);
    if (onCountyClick) {
      onCountyClick({
        countyName: formattedCountyName,
        rawCountyName: county,
        data: countyData
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        maxWidth: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="0" result="offsetblur" />
            <feFlood floodColor="#1E90FF" floodOpacity="0.5" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>
          {`
            .county-path {
              transition: all 0.2s ease-out;
              cursor: pointer;
            }
            .county-path:hover {
              filter: url(#drop-shadow);
            }
            .county-hover {
              stroke: #1E90FF;
              stroke-width: 3;
              filter: url(#drop-shadow);
            }
            .county-selected {
              stroke: #1E90FF;
              stroke-width: 3;
            }
          `}
        </style>

        <g>
          {mapJson.features.map((feature, index) => {
            const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
            const datum = data.find(d => d.countyName === county);
            const ratioClass = datum ? parseInt(datum.ratioClass) : -1;
            const fill = ratioClass >= 0 ? colorScale(ratioClass) : '#f0f0f0';

            const isHovered = hoveredCounty && hoveredCounty.countyName === county;
            const isSelected = selectedCounty === county;
            const className = `county-path ${isHovered ? 'county-hover' : ''} ${isSelected ? 'county-selected' : ''}`;

            return (
              <path
                key={index}
                className={className}
                d={path(feature)}
                fill={fill}
                stroke={isHovered || isSelected ? "#1E90FF" : "#333"}
                strokeWidth={isHovered || isSelected ? 3 : 1}
                onClick={() => handleCountyClick(county, datum)}
                onMouseEnter={(e) => handleMouseEnter(datum, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
            );
          })}
        </g>

        <g>
          {mapJson.features.map((feature, index) => {
            const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
            const centroid = path.centroid(feature);
            const formattedName = county
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return null;

            return (
              <text
                key={`label-${index}`}
                x={centroid[0]}
                y={centroid[1]}
                textAnchor="middle"
                alignmentBaseline="central"
                style={{
                  fontSize: 8,
                  fontWeight: 'bold',
                  fill: '#333',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {formattedName}
              </text>
            );
          })}
        </g>
      </svg>

      {hoveredCounty && showTooltip && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x + 10,
            top: mousePos.y - 30,
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
            wordWrap: 'break-word'
          }}
        >
          <strong>{hoveredCounty.countyName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</strong><br />
          Ratio: {isNaN(parseFloat(hoveredCounty.ratio)) ? '0' : parseFloat(hoveredCounty.ratio).toLocaleString('en-US')}<br />
          Charging Station: {hoveredCounty.stationCount.toLocaleString('en-US')}<br />
          EV: {hoveredCounty.evCount.toLocaleString('en-US')}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 25,
          left: 10,
          maxWidth: 'calc(100% - 20px)'
        }}
      >
        <ChoroplethLegendVert
          colorScale={colorScale}
          breaks={ratioBreaks}
          selectedClass={hoveredCounty ? hoveredCounty.ratioClass : null}
        />
      </div>
    </div>
  );
};

export default ChoroplethMap;
