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
        const raw = await d3.csv("/data/ratio_ev_station_v5.csv", d3.autoType);

        // console.log("Raw CSV data sample:", raw[0]);

        // Filter out null values
        const evValues = raw.map((d) =>
          isNaN(d.ev_count) || d.ev_count == null ? 0 : d.ev_count
        );
        const stationValues = raw.map((d) =>
          isNaN(d.station_count) || d.station_count == null
            ? 0
            : d.station_count
        );
        const ratioValues = raw.map((d) =>
          isNaN(d.station_per_ev) || d.station_per_ev == null
            ? 0
            : d.station_per_ev
        );

        const ratioClasses = raw.map((d) => {
          if (d.ratio_class && typeof d.ratio_class === "string") {
            const match = d.ratio_class.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          }
          return 0;
        });

        if (
          evValues.length < 3 ||
          stationValues.length < 3 ||
          ratioValues.length < 5
        ) {
          throw new Error("Not enough data to create categories");
        }

        // Calculate natural breaks (3 classes)
        const evBreaks = calculateNaturalBreaks(evValues, 4, true);
        const stationBreaks = calculateNaturalBreaks(stationValues, 4, true);

        // Calculate natural breaks ratio (5 classes)
        // const upperRatios = ratioValues.filter(val => val > 12.00);
        // const upperBreaks = calculateNaturalBreaks(upperRatios, 3, false);
        // const ratioBreaks = [0, 7.99, 12.00, ...upperBreaks.slice(1)];

        const ratioBreaks = [
          0, 0.0045070610623309, 0.0213903743315508, 0.0422960725075528, 0.083,
          0.125,
        ];

        // console.log("EV breaks:", evBreaks);
        // console.log("Station breaks:", stationBreaks);
        // console.log("Ratio breaks:", ratioBreaks);

        const processed = raw.map((d, index) => {
          const ev = isNaN(d.ev_count) || d.ev_count == null ? 0 : d.ev_count;
          const station =
            isNaN(d.station_count) || d.station_count == null
              ? 0
              : d.station_count;
          const ratio =
            isNaN(d.station_per_ev) || d.station_per_ev == null
              ? 0
              : d.station_per_ev;

          return {
            ...d,
            countyName: d.County.toLowerCase(),
            evCount: ev,
            stationCount: station,
            ratio: ratio.toFixed(3),
            evClass: getJenksCategory(ev, evBreaks),
            stationClass: getJenksCategory(station, stationBreaks),
            ratioClass: ratioClasses[index],
            bivariateClass: `${getJenksCategory(
              ev,
              evBreaks
            )}-${getJenksCategory(station, stationBreaks)}`,
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
