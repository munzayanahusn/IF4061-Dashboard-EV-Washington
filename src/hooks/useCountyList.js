import { useEffect, useState } from "react";
import * as d3 from "d3";

export function useCountyList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await d3.csv("/data/county_list.csv", d3.autoType);
        const countyList = raw.map((d) => d.County);
        setData(countyList);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}
