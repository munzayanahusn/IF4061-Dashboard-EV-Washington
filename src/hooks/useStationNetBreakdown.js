import { useState, useEffect } from "react";
import * as d3 from "d3";

// Global cache for the parsed CSV
let _allNetworkData = null;
let _loadPromise = null;

export const useStationNetBreakdown = (countyName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAndFilter = async () => {
      setLoading(true);
      setError(null);

      try {
        // If not loaded yet, load once
        if (!_allNetworkData) {
          if (!_loadPromise) {
            _loadPromise = d3
              .csv("/data/ev_network_by_county.csv", d3.autoType)
              .then((rows) => {
                _allNetworkData = rows;
                return rows;
              });
          }
          await _loadPromise;
        }

        // Filter data for selected county
        const filteredData = _allNetworkData.filter(
          (d) => d.County && d.County.toLowerCase() === countyName.toLowerCase()
        );

        // Sort by Count descending
        const sorted = [...filteredData].sort((a, b) => b.Count - a.Count);

        // Take top 3
        const top3 = sorted.slice(0, 3);

        // Sum up the rest
        const others = sorted.slice(3);
        const otherCount = d3.sum(others, (d) => d.Count);
        const otherPercentage = d3.sum(others, (d) => d.Percentage);

        if (others.length > 0) {
          top3.push({
            "EV Network": "Others",
            Count: otherCount,
            Percentage: otherPercentage,
          });
        }

        if (isMounted) setData(top3);
      } catch (err) {
        if (isMounted) {
          setError("Failed to load EV network data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndFilter();
    return () => {
      isMounted = false;
    };
  }, [countyName]);

  return { data, loading, error };
};
