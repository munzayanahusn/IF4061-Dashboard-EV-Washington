import React, { Fragment, useState, useRef, useEffect } from 'react';
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

const BivariateMap = () => {
  const { data, breaks, loading, error } = useEVChargingCount();
  const [hoveredCounty, setHoveredCounty] = useState(null);
  const containerRef = useRef(null);
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
        
        if (containerHeight < 100) {
          const estimatedHeight = Math.max(400, containerWidth);
          
          const widthBasedHeight = containerWidth * naturalAspectRatio;
          
          if (widthBasedHeight <= estimatedHeight) {
            width = containerWidth;
            height = widthBasedHeight;
          } else {
            width = estimatedHeight / naturalAspectRatio;
            height = estimatedHeight;
          }
        } else {
          const widthBasedHeight = containerWidth * naturalAspectRatio;
          const heightBasedWidth = containerHeight / naturalAspectRatio;
          
          if (widthBasedHeight <= containerHeight) {
            width = containerWidth;
            height = widthBasedHeight;
          } else {
            width = heightBasedWidth;
            height = containerHeight;
          }
        }
        
        setContainerSize({ width, height });
      }
    };
    
    updateSize();
    
    const timer1 = setTimeout(updateSize, 100);
    const timer2 = setTimeout(updateSize, 300);
    
    window.addEventListener('resize', updateSize);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateSize);
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, []);

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
    <div ref={containerRef} style={{ width: '100%',  height: '100%', minHeight: `400px`, position: `relative`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}>
        {geoJson.features.map(feature => {
          const county = feature.properties.JURISDICT_LABEL_NM.toLowerCase();
          const datum = data.find(d => d.countyName === county);
          const fill = datum ? bivariateColorScale(datum.bivariateClass) : '#f0f0f0';

          return (
            <path
              key={feature.properties.JURISDICT_SYST_ID}
              d={path(feature)}
              stroke="#333"
              strokeWidth={1}
              fill={fill}
              onMouseEnter={(e) => {
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
                }, 1000);
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({ 
                  x: e.clientX - rect.left, 
                  y: e.clientY - rect.top 
                });
                
                // Reset timer every mouse move
                setShowTooltip(false);
                if (tooltipTimer.current) {
                  clearTimeout(tooltipTimer.current);
                }
                
                tooltipTimer.current = setTimeout(() => {
                  setShowTooltip(true);
                }, 500);
              }}
              onMouseLeave={() => {
                setHoveredCounty(null);
                setShowTooltip(false);
                if (tooltipTimer.current) {
                  clearTimeout(tooltipTimer.current);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>
      
      {/* Custom Tooltip */}
      {hoveredCounty && showTooltip && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x - 60,
            top: mousePos.y - 100,
            zIndex: 50,
            backgroundColor: 'rgba(28, 28, 28, 1)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap'
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
              borderTop: '6px solid rgba(0, 0, 0, 0.9)'
            }}
          />
        </div>
      )}
      
      <div style={{ 
        position: 'absolute', 
        bottom: '-40px',
        left: '10px',
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