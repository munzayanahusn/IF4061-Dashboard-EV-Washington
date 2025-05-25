import { useEffect, useState } from "react";
import * as d3 from "d3";

import { calculateNaturalBreaks, getJenksCategory } from "../lib/classing";

export function useEVChargingCount() {
  const [data, setData] = useState(null);
  const [breaks, setBreaks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const raw = await d3.csv('/data/ratio_ev_station_v2.csv', d3.autoType);
        
        // console.log("Raw CSV data sample:", raw[0]);
        
        // Filter out null values
        const evValues = raw
          .map(d => d.ev_count)
          .filter(d => d != null && !isNaN(d));
        const stationValues = raw
          .map(d => d.station_count)
          .filter(d => d != null && !isNaN(d));
        const ratioValues = raw
          .map(d => d.ev_per_station)
          .filter(d => d != null && !isNaN(d));

        if (evValues.length < 3 || stationValues.length < 3 || ratioValues.length < 5) {
          throw new Error("Not enough data to create categories");
        }

        // Calculate natural breaks (3 classes)
        const evBreaks = calculateNaturalBreaks(evValues, 4, true);
        const stationBreaks = calculateNaturalBreaks(stationValues, 4, true);
        const ratioBreaks = calculateNaturalBreaks(ratioValues, 5, false)

        // console.log("EV breaks:", evBreaks);
        // console.log("Station breaks:", stationBreaks);

        const processed = raw.map(d => {
          const evClass = d.ev_count != null ? getJenksCategory(d.ev_count, evBreaks) : 0;
          const stationClass = d.station_count != null ? getJenksCategory(d.station_count, stationBreaks) : 0;
          const ratioClass = d.ev_per_station != null ? getJenksCategory(d.ev_per_station, ratioBreaks) : 0;
          
          return {
            ...d,
            countyName: d.County.toLowerCase(),
            evCount: d.ev_count || 0,
            evClass,
            stationCount: d.station_count || 0,
            stationClass,
            bivariateClass: `${evClass}-${stationClass}`,
            ratio: d.ev_per_station != null ? parseFloat(d.ev_per_station).toFixed(2) : "0.00",
            ratioClass
          };
        });

        // console.log("Processed data sample:", processed[0]);
        // console.log("Unique counties in data:", processed.map(d => d.countyName));
        
        setData(processed);
        setBreaks({ evBreaks, stationBreaks, ratioBreaks });
        setLoading(false);
      } catch (err) {
        console.error("Error loading EV charging data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, breaks, loading, error };
}