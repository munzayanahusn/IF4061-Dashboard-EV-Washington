import { useState, useEffect } from 'react';
import * as d3 from 'd3';

export const useEVData = (countyName) => {
  const [data, setData] = useState(null);
  const [maxCount, setMaxCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!countyName) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const evData = await d3.csv('/data/clean_Electric_Vehicle_Population_v2.csv');
        
        const normalizedEvData = evData.map(v => ({
          ...v,
          is_facilitated: String(v.is_facilitated).toLowerCase() === "true"
        }));
        
        const allLocationGroups = d3.group(normalizedEvData, d => d['Vehicle Location']);
        const globalMax = d3.max(Array.from(allLocationGroups.values(), group => group.length)) || 0;

        // Filter data for the selected county
        const countyData = normalizedEvData.filter(d => 
          d.County && d.County.toLowerCase() === countyName.toLowerCase()
        );

        // Parse numeric values and coordinates
        const parsedData = countyData.map(d => ({
          vin: d['VIN (1-10)'],
          county: d.County,
          city: d.City,
          state: d.State,
          modelYear: +d['Model Year'],
          make: d.Make,
          model: d.Model,
          evType: d['Electric Vehicle Type'],
          electricRange: +d['Electric Range'],
          dolVehicleId: d['DOL Vehicle ID'],
          vehicleLocation: d['Vehicle Location'],
          electricUtility: d['Electric Utility'],
          longitude: +d.Longitude,
          latitude: +d.Latitude,
          electricRangeCategory: d['Electric Range Category'],
          stationDistance: +d.station_distance,
          isFacilitated: d.is_facilitated
        }));

        setData(parsedData);
        setMaxCount(globalMax);
      } catch (err) {
        console.error('Error loading EV data:', err);
        setError(err.message);
        setData(null);
        setMaxCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [countyName]);

  return { data, maxCount, loading, error };
};