import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCountyList } from "@/hooks/useCountyList";

export default function CountySelect({ selectedCounty, onSelectCounty }) {
  const { data, loading, error } = useCountyList();
  const [search, setSearch] = React.useState("");

  if (loading) return <p>Loading counties...</p>;
  if (error) return <p>Error loading counties: {error.message}</p>;

  const filtered = data.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-fit rounded-md">
      <Select value={selectedCounty} onValueChange={onSelectCounty}>
        <SelectTrigger className="px-4 py-6 rounded-md border-none">
          <SelectValue placeholder="Select a county">
            {selectedCounty === "WA" ? (
              <span className="text-3xl">Washington</span>
            ) : (
              <span className="text-3xl">{selectedCounty}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground rounded-xl p-2 space-y-2 shadow-lg w-64">
          <Input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm rounded-md px-3 my-2 border-none"
          />

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.map((county) => (
              <SelectItem
                key={county}
                value={county}
                className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer"
              >
                {county === "WA" ? (
                  <span className="font-semibold">Washington (All County)</span>
                ) : (
                  <span>{county}</span>
                )}
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
