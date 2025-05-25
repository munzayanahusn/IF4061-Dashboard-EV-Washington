import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { geoPath } from 'd3-geo';
import bbox from '@turf/bbox';
import { useEVData } from '../hooks/useEVData';
import { useStationData } from '../hooks/useStationData';
import { useLocationCount } from '../hooks/useLocationCount';
import mapJson from '../data/map/WA_map.json';

const BubblePlotMap = ({ countyName, onClose }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [hoveredType, setHoveredType] = useState(null); // 'ev' or 'station'
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data: normalizedEvData, loading: evLoading, error: evError } = useEVData(countyName);
  const { data: stationData, loading: stationLoading, error: stationError } = useStationData(countyName);
  const { data: locationCountMap, loading: countLoading, error: countError } = useLocationCount();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight || 500;

      const countyFeature = mapJson.features.find(
        f => f.properties.JURISDICT_LABEL_NM.toLowerCase() === countyName.toLowerCase()
      );
      if (!countyFeature) return;

      const [minX, minY, maxX, maxY] = bbox(countyFeature);
      const countyAspectRatio = (maxY - minY) / (maxX - minX);

      if (containerHeight / containerWidth > countyAspectRatio) {
        setDimensions({
          width: containerWidth,
          height: containerWidth * countyAspectRatio
        });
      } else {
        setDimensions({
          width: containerHeight / countyAspectRatio,
          height: containerHeight
        });
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
    };
  }, []);

  useEffect(() => {
    const renderMap = (countyFeature, width, height) => {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([innerWidth, innerHeight], countyFeature);

      const path = geoPath().projection(projection);
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Render county
      g.append('path')
        .datum(countyFeature)
        .attr('d', path)
        .attr('fill', '#2D2C2C')
        .attr('stroke', '#666')
        .attr('opacity', 0.8);

      // Render EV bubbles
      const grouped = d3.group(normalizedEvData, d => d.vehicleLocation);
      const locationData = Array.from(grouped, ([location, vehicles]) => {
        const point = vehicles.find(v => v.longitude && v.latitude);
        const facilitatedCount = vehicles.filter(v => v.isFacilitated).length;
        return {
          location,
          longitude: point?.longitude,
          latitude: point?.latitude,
          evCount: locationCountMap.get(location) || vehicles.length,
          isMajorityFacilitated: facilitatedCount > ( locationCountMap.get(location) || vehicles.length ) / 2,
          facilitatedCount,
          vehicles
        };
      }).filter(d => d.longitude && d.latitude);

      const maxEvCount = d3.max(locationData, d => d.evCount);
      const sizeScale = d3.scaleSqrt().domain([0, maxEvCount]).range([4, 40]);

      locationData.forEach(d => {
        const [x, y] = projection([d.longitude, d.latitude]);
        if (x && y) {
          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', sizeScale(d.evCount))
            .attr('fill', d.isMajorityFacilitated ? '#4CAF50' : '#F44336')
            .attr('stroke', d.isMajorityFacilitated ? '#2E7D32' : '#C62828')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('mouseenter', () => {
              setHoveredLocation(d);
              setHoveredType('ev');
              setShowTooltip(true);
            })
            .on('mousemove', (event) => {
              const bounds = containerRef.current.getBoundingClientRect();
              setMousePos({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
            })
            .on('mouseleave', () => {
              setHoveredLocation(null);
              setHoveredType(null);
              setShowTooltip(false);
            });
        }
      });

      // Render charging stations
      stationData.filter(d => d.longitude && d.latitude).forEach(d => {
        const [x, y] = projection([d.longitude, d.latitude]);
        if (x && y) {
          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('fill', '#FFD700')
            .attr('stroke', '#FFA500')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseenter', () => {
              setHoveredLocation(d);
              setHoveredType('station');
              setShowTooltip(true);
            })
            .on('mousemove', (event) => {
              const bounds = containerRef.current.getBoundingClientRect();
              setMousePos({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
            })
            .on('mouseleave', () => {
              setHoveredLocation(null);
              setHoveredType(null);
              setShowTooltip(false);
            });
        }
      });
    };

    if (!containerRef.current || !svgRef.current) return;

    const countyFeature = mapJson.features.find(
      f => f.properties.JURISDICT_LABEL_NM.toLowerCase() === countyName.toLowerCase()
    );

    if (countyFeature && normalizedEvData && stationData && locationCountMap) {
      renderMap(countyFeature, dimensions.width, dimensions.height);
    }
  }, [countyName, normalizedEvData, stationData, locationCountMap, dimensions]);

  const loading = evLoading || stationLoading || countLoading;
  const error = evError || stationError || countError;

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {loading ? (
        <div>Loading county data...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
        />
      )}

      {showTooltip && hoveredLocation && (
        <div
          style={{
            position: 'absolute',
            top: mousePos.y - 70,
            left: mousePos.x + 10,
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            pointerEvents: 'none',
            zIndex: 1000,
            fontSize: '12px',
            maxWidth: '250px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          {hoveredType === 'ev' ? (
            <>
              <div><strong>EV Location:</strong> {hoveredLocation.location}</div>
              <div><strong>EV Count:</strong> {hoveredLocation.evCount}</div>
              <div><strong>Facilitated:</strong> {hoveredLocation.facilitatedCount}/{hoveredLocation.evCount}</div>
              <div><strong>Majority Facilitated:</strong> {hoveredLocation.isMajorityFacilitated ? 'Yes' : 'No'}</div>
            </>
          ) : hoveredType === 'station' ? (
            <>
              <div><strong>Station:</strong> {hoveredLocation.stationName || 'Unknown'}</div>
              <div><strong>Network:</strong> {hoveredLocation.evNetwork || 'N/A'}</div>
              <div><strong>Location:</strong> {hoveredLocation.longitude}, {hoveredLocation.latitude}</div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BubblePlotMap;
