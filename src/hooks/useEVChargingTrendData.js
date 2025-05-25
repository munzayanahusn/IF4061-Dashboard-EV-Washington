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

        console.log("EV Raw sample:", evRaw.slice(0, 3));
        console.log("Charging Raw sample:", chargingRaw.slice(0, 3));

        const validEV = evRaw.filter(d => d.Year != null && !isNaN(d.Year));
        const validCharging = chargingRaw.filter(d => d.Year != null && !isNaN(d.Year));

        const years = Array.from(new Set(validEV.map(d => d.Year))).sort((a, b) => a - b);

        const merged = years.map(year => {
          const evThisYear = validEV.filter(d => d.Year === year);
          const chargingThisYear = validCharging.filter(d => d.Year === year);

          const totalEV = d3.sum(evThisYear, d => +d["Electric Vehicle (EV) Total"] || 0);
          const totalCharging = d3.sum(chargingThisYear, d => +d.charging_station_count || 0);

          return {
            year,
            ev: totalEV,
            charging: totalCharging,
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
