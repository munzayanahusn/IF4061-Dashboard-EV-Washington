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
import IconMap from "./components/IconMap";
import RatioOverview from "./components/RatioOverview";

function App() {
  const [selectedCounty, setSelectedCounty] = useState("WA");

  const handleCountyClick = (countyInfo) => {
    if (typeof countyInfo === "string") {
      setSelectedCounty(countyInfo);
    } else {
      setSelectedCounty(countyInfo.countyName);
    }
  };

  const handleCountyClose = () => {
    setSelectedCounty("WA");
  };

  return (
    <div className="p-4 lg:p-6 m-6">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 h-screen">
        {/* Left Column */}
        <div className="lg:flex-1 flex flex-col gap-6">
          <div className="flex lg:flex-row flex-col gap-6 max-w-4xl">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl xl:text-3xl font-normal w-64 xl:w-lg">
                Electric Vehicle (EV) vs <br /> Charging Station Availability in
              </h1>
              <CountySelect
                selectedCounty={selectedCounty}
                onSelectCounty={handleCountyClick}
              />
            </div>
            <RatioCard county={selectedCounty} />
          </div>
          <div className="w-full h-full">
            {selectedCounty === "WA" ? (
              <div className="flex flex-col gap-6 ">
                <RatioOverview />
                <IconMap onCountyClick={handleCountyClick} />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <BackButton onClick={handleCountyClose} />
                <BubblePlotMap
                  countyName={selectedCounty}
                  onClose={handleCountyClose}
                />
              </div>
            )}
          </div>
        </div>
        {/* Right Column */}
        <div className="lg:w-1/3 flex flex-col gap-6 h-full">
          <TrendCard county={selectedCounty} />
          <EVTypCard county={selectedCounty} />
          <StationNetCard county={selectedCounty} />
        </div>
      </div>
    </div>
  );
}

export default App;
