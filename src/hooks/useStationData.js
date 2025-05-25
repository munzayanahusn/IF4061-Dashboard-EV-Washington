import { useState, useEffect } from 'react';
import * as d3 from 'd3';

export const useStationData = (countyName) => {
  const [data, setData] = useState(null);
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

        const stationData = await d3.csv('/data/clean_ELEC_Charging_Station_WA_v2.csv');
        
        // Filter data for the selected county
        const countyStations = stationData.filter(d => 
          d.County && d.County.toLowerCase() === countyName.toLowerCase()
        );

        // Parse and structure the data
        const parsedData = countyStations.map(d => ({
          id: d.ID,
          fuelTypeCode: d['Fuel Type Code'],
          stationName: d['Station Name'],
          streetAddress: d['Street Address'],
          intersectionDirections: d['Intersection Directions'],
          city: d.City,
          state: d.State,
          zip: d.ZIP,
          accessDaysTime: d['**Access Days Time'],
          facilityType: d['**Facility Type'],
          latitude: +d.Latitude,
          longitude: +d.Longitude,
          geocodeStatus: d['Geocode Status'],
          evNetwork: d['EV Network'],
          evNetworkWeb: d['EV Network Web'],
          ownerTypeCode: d['Owner Type Code'],
          county: d.County
        }));

        setData(parsedData);
      } catch (err) {
        console.error('Error loading station data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [countyName]);

  return { data, loading, error };
};