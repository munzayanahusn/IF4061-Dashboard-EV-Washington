import { useData } from "../hooks/useData";

export default function BivariateMap() {
  const data = useData();

  if (!data) return <p>Loading...</p>;

  return <svg>{/* render your D3 visualization here */}</svg>;
}
