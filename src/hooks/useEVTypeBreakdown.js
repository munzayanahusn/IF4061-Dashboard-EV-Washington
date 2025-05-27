import { useEffect, useState } from "react";
import * as d3 from "d3";

export function useEVTypeBreakdown() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await d3.csv("/data/proportion_ev_type.csv", d3.autoType);

        const processed = raw.map((d) => ({
          countyName: d.County.toLowerCase(),
          county: d.County,
          countPHEV: d.count_phev,
          countBEV: d.count_bev,
          propPHEV: d.prop_phev,
          propBEV: d.prop_bev,
        }));

        setData(processed);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load EV type breakdown:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
