import { useState, useEffect } from "react";
import * as d3 from "d3";

export const useStationNetBreakdown = (countyName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!countyName) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allData = await d3.csv(
          "/data/ev_network_by_county.csv",
          d3.autoType
        );

        // Filter data for selected county
        const filteredData = allData.filter(
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

        setData(top3);
      } catch (err) {
        console.error("Failed to load EV network breakdown:", err);
        setError("Failed to load EV network data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [countyName]);

  return { data, loading, error };
};
