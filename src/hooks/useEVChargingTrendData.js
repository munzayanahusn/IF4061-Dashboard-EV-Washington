import { useState, useEffect } from "react";
import * as d3 from "d3";

export function useEVChargingTrendData(countyFilter = "WA") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [evRaw, chargingRaw] = await Promise.all([
          d3.csv("/data/clean_EV_tren_v2.csv", d3.autoType),
          d3.csv("/data/trend_charging_station_v2.csv", d3.autoType),
        ]);

        const validEV = evRaw.filter(d => d.Year != null && !isNaN(d.Year));
        const validCharging = chargingRaw.filter(d => d.Year != null && !isNaN(d.Year));

        const years = Array.from(new Set(validEV.map(d => d.Year))).sort((a, b) => a - b);

        const filteredEV = validEV.filter(d => d.County?.toLowerCase() === countyFilter.toLowerCase());
        const filteredCharging = validCharging.filter(d => d.County?.toLowerCase() === countyFilter.toLowerCase());

        const merged = years.map(year => {
          const evForYear = filteredEV.find(d => d.Year === year);
          const chargingForYear = filteredCharging.find(d => d.Year === year);

          return {
            year,
            ev: +evForYear?.["Electric Vehicle (EV) Total"] || 0,
            charging: +chargingForYear?.charging_station_count || 0,
          };
        });

        console.log("Final merged trend data:", merged);
        setData(merged);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load trend data:", err);
        setError("Failed to load trend data");
        setLoading(false);
      }
    };

    loadData();
  }, [countyFilter]);

  return { data, loading, error };
}
