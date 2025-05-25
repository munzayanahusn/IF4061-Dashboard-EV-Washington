import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { geoPath, geoTransform } from 'd3-geo';
import bbox from '@turf/bbox';
import { useEVChargingCount } from '../hooks/useEVChargingCount';
import mapJson from '../data/map/WA_map.json';
import BivariateLegend from './BivariateLegend';

const geoJson = mapJson;

const bivariateColorScale = d3.scaleOrdinal()
  .domain([
    '0-0', '0-1', '0-2',
    '1-0', '1-1', '1-2', 
    '2-0', '2-1', '2-2'
  ])
  .range([
    '#FFFFFF', '#E7D76F', '#FFD400',  
    '#97CEB7', '#C4DC82', '#D6D02A',  
    '#58C3A7', '#82C87E', '#ACCC54'   
  ]);

const BivariateMap = ({ onCountyClick }) => {
  const { data, breaks, loading, error } = useEVChargingCount();
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });

  useEffect(() => {
  const updateSize = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const [minX, minY, maxX, maxY] = bbox(geoJson);
      const naturalAspectRatio = (maxY - minY) / (maxX - minX);
      
      let width, height;

      const widthBasedHeight = containerWidth * naturalAspectRatio;
      const heightBasedWidth = containerHeight / naturalAspectRatio;

      if (widthBasedHeight <= containerHeight) {
        width = containerWidth;
        height = widthBasedHeight;
      } else {
        width = heightBasedWidth;
        height = containerHeight;
      }

      setContainerSize({ width, height });
    }
  };

  // Observe container resize
  const observer = new ResizeObserver(() => {
    updateSize();
  });

  if (containerRef.current) {
    observer.observe(containerRef.current);
  }

  // Initial size set
  updateSize();

  return () => {
    if (containerRef.current) {
      observer.unobserve(containerRef.current);
    }
    observer.disconnect();
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
  };
}, []);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const defs = svg.append('defs');
      
      const filter = defs.append('filter')
        .attr('id', 'drop-shadow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%');
      
      filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3);
      
      filter.append('feOffset')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetblur');
      
      filter.append('feFlood')
        .attr('flood-color', '#1E90FF')
        .attr('flood-opacity', 0.5);
      
      filter.append('feComposite')
        .attr('in2', 'offsetblur')
        .attr('operator', 'in');
      
      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
  }, []);

  const handleCountyClick = (county, countyData) => {
    const formattedCountyName = county.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    setSelectedCounty(county);
    
    if (onCountyClick) {
      onCountyClick({
        countyName: formattedCountyName,
        rawCountyName: county,
        data: countyData
      });
    }
  };

  const handleMouseEnter = (e, datum) => {
    setHoveredCounty(datum);
    
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
    
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(true);
    }, 300);
  };

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const handleMouseLeave = () => {
    setHoveredCounty(null);
    setShowTooltip(false);
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
  };

  if (loading || !data) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map data…</div>;
  if (error) return <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error: {error}</div>;

  const { width, height } = containerSize;
  const [minX, minY, maxX, maxY] = bbox(geoJson);
  const x = d3.scaleLinear().range([0, width]).domain([minX, maxX]);
  const y = d3.scaleLinear().range([0, height]).domain([maxY, minY]);

  const projection = geoTransform({
    point(px, py) {
      this.stream.point(x(px), y(py));
    },
  });

  const path = geoPath().projection(projection);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '300px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`} 
        style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
      >
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
          {geoJson.features.map((feature, index) => {
            const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
            const datum = data.find(d => d.countyName === county);
            const fill = datum ? bivariateColorScale(datum.bivariateClass) : '#f0f0f0';

            const isHovered = hoveredCounty && hoveredCounty.countyName === county;
            const isSelected = selectedCounty === county;
            
            const className = `county-path ${isHovered ? 'county-hover' : ''} ${isSelected ? 'county-selected' : ''}`;

            return (
              <path
                key={`county-${index}-${county}`}
                className={className}
                d={path(feature)}
                stroke={isHovered || isSelected ? "#1E90FF" : "#333"}
                strokeWidth={isHovered || isSelected ? 3 : 1}
                fill={fill}
                onClick={() => handleCountyClick(county, datum)}
                onMouseEnter={(e) => handleMouseEnter(e, datum)}
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
            const formattedName = county.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
            left: mousePos.x - 60,
            top: mousePos.y - 100,
            zIndex: 50,
            backgroundColor: 'rgba(28, 28, 28, 0.95)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.2s ease-out',
            opacity: showTooltip ? 1 : 0
          }}
        >
          <div style={{ fontWeight: 'bold' }}>
            {hoveredCounty.countyName.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </div>
          <div>Ratio: {isNaN(parseFloat(hoveredCounty.ratio)) ? '0' : parseFloat(hoveredCounty.ratio).toLocaleString('en-US')}</div>
          <div>Charging Station: {hoveredCounty.stationCount.toLocaleString('en-US')}</div>
          <div>EV: {hoveredCounty.evCount.toLocaleString('en-US')}</div>
          
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(28, 28, 28, 0.95)'
            }}
          />
        </div>
      )}
      
      <div style={{ 
        position: 'absolute', 
        bottom: '-20px',
        left: '30px',
        zIndex: 10
      }}>
        <svg width="100" height="100">
          <g transform="translate(20, 40)">
            <BivariateLegend bivariateColorScale={bivariateColorScale} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default BivariateMap;