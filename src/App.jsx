import { useState } from "react";
import "./App.css";
import RatioCard from "./components/RatioCard";
import BivariateMap from "./components/BivariateMap";
import ChoroplethMap from "./components/ChoroplethMap";
import BubblePlotMap from "./components/BubblePlotMap";
import TrendCard from "./components/TrendCard";
import EVTypCard from "./components/EVTypeCard";
import StationNetCard from "./components/StationNetCard";

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
          <h1 className="text-2xl lg:text-3xl font-weight-regular">
            Electric Vehicle (EV) vs Charging Station Availability in Washington
          </h1>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content Area */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Map Section */}
            <div>
              {/* <span className="text-lg">Map Component</span> */}
              {selectedCounty === "WA" ? (
                // <BivariateMap width={1200} onCountyClick={handleCountyClick} />
                <ChoroplethMap onCountyClick={handleCountyClick} />
              ) : (
                <BubblePlotMap
                  countyName={selectedCounty}
                  onClose={handleCountyClose}
                />
              )}
            </div>

            {/* Trend Section */}
            <div>
              {/* <span className="text-lg">EV & Charging Station Trend</span> */}
              <TrendCard county={selectedCounty} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* EV-to-Charger Ratio Card */}
            <RatioCard />

            {/* EV Mix Card */}
            <EVTypCard county={selectedCounty} />

            {/* Electric Utility Proportion Card */}
            <StationNetCard county={selectedCounty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
