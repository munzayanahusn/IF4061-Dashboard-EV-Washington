import { useState, useEffect } from 'react';
import * as d3 from 'd3';

export const useLocationCount = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const countData = await d3.csv('/data/count_ev_per_location.csv');
        const locationMap = new Map();
        
        countData.forEach(d => {
          const location = d['Vehicle Location'];
          const count = +d.ev_count;
          
          if (location && !isNaN(count)) {
            locationMap.set(location, count);
          }
        });

        setData(locationMap);
      } catch (err) {
        console.error('Error loading location count data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};