import { useState } from "react";
import "./App.css";
import RatioCard from "./components/RatioCard";
import BivariateMap from "./components/BivariateMap";
import ChoroplethMap from "./components/ChoroplethMap";
import BubblePlotMap from "./components/BubblePlotMap";
import TrendCard from "./components/TrendCard";
import EVTypCard from "./components/EVTypeCard";
import StationNetCard from "./components/StationNetCard";
import CountySelect from "./components/CountySelect";
import BackButton from "./components/BackButton";

function App() {
  const [selectedCounty, setSelectedCounty] = useState("WA");

  const handleCountyClick = (countyInfo) => {
    if (typeof countyInfo === "string") {
      setSelectedCounty(countyInfo);
    } else {
      setSelectedCounty(countyInfo.countyName);
    }
    console.log("County selected in App:", countyInfo);
  };

  const handleCountyClose = () => {
    setSelectedCounty("WA");
  };

  return (
    <div className="p-4 lg:p-6 m-6">
      {/* Main Container */}
      <div className="">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center-safe gap-4">
            <h1 className="text-2xl lg:text-3xl font-weight-regular">
              Electric Vehicle (EV) vs Charging Station Availability in
            </h1>
            <CountySelect
              selectedCounty={selectedCounty}
              onSelectCounty={handleCountyClick}
            />
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="lg:flex xl:gap-8">
          {/* Left Column */}
          <div className="lg:flex-1 space-y-6 lg:space-y-8 flex flex-col justify-between">
            {/* Map Section */}
            <div className="relative">
              {selectedCounty !== "WA" && (
                <div className="absolute top-2 left-2 z-10">
                  <BackButton onClick={handleCountyClose} />
                </div>
              )}
              {selectedCounty === "WA" ? (
                <ChoroplethMap onCountyClick={handleCountyClick} />
              ) : (
                <BubblePlotMap
                  countyName={selectedCounty}
                  onClose={handleCountyClose}
                />
              )}
            </div>

            {/* Trend Section aligned to sidebar bottom */}
            <div className="mb-6 lg:mb-0">
              <TrendCard county={selectedCounty} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 space-y-6 flex flex-col">
            <RatioCard county={selectedCounty} />
            <EVTypCard county={selectedCounty} />
            <StationNetCard county={selectedCounty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
