import { useEffect, useState } from "react";
import * as d3 from "d3";

export function useData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      d3.csv("/data/obesity.csv", d3.autoType),
      d3.csv("/data/diabetes.csv", d3.autoType),
    ]).then(([obesity, diabetes]) => {
      // merge or join data here if needed
      const merged = obesity.map((row, i) => ({
        ...row,
        diabetes: diabetes[i]?.value, // adjust field name
      }));
      setData(merged);
    });
  }, []);

  return data;
}
