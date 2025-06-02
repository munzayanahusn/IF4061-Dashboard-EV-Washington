import { useEffect, useState } from "react";
import { csv, autoType } from "d3";

let _ratioOverviewData = null;
let _ratioOverviewLoadPromise = null;

export function useRatioOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);

      try {
        if (_ratioOverviewData) {
          if (isMounted) setData(_ratioOverviewData);
        } else {
          if (!_ratioOverviewLoadPromise) {
            _ratioOverviewLoadPromise = csv(
              "/data/ratio_overview.csv",
              autoType
            )
              .then((rawData) => {
                _ratioOverviewData = rawData;
                return rawData;
              })
              .catch((err) => {
                _ratioOverviewLoadPromise = null;
                throw err;
              });
          }
          const fetchedData = await _ratioOverviewLoadPromise;
          if (isMounted) setData(fetchedData);
        }
      } catch (err) {
        console.error("Failed to load ratio overview data:", err);
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
