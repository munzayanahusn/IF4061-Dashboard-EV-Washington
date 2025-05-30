import { useEffect, useState } from "react";
import * as d3 from "d3";

export function useRatioOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rawData = await d3.csv("/data/ratio_overview.csv", d3.autoType);
        setData(rawData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load ratio overview data:", err);
        setError(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
