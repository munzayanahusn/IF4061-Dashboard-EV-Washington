import { useState } from "react";
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

// Import your SVG files (example: assuming they are in an assets folder)
import BGDecor from "@/assets/bg-decor.svg";
function App() {
  const [selectedCounty, setSelectedCounty] = useState("WA");
  const [hoveredRatioCategory, setHoveredRatioCategory] = useState(null);

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
    <div className="relative m=0 p-0 w-fit">
      <img
        src={BGDecor}
        alt="Background SVG Top Right"
        className="absolute -top-24 -right-24 w-80 h-80 z-0"
      />
      <img
        src={BGDecor}
        alt="Background SVG Bottom Left"
        className="absolute -bottom-24 -left-24 w-80 h-80 z-0"
      />
      <div className="p-10 w-fit relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch gap-6 h-screen">
          {/* Left Column */}
          <div className="lg:flex-1 flex flex-col gap-6">
            <div className="flex flex-col lg:w-4xl gap-6">
              <div className="flex lg:flex-row flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl lg:text-3xl font-normal w-64 lg:w-lg">
                    Electric Vehicle (EV) vs <br /> Charging Station
                    Availability in
                  </h1>
                  <CountySelect
                    selectedCounty={selectedCounty}
                    onSelectCounty={handleCountyClick}
                  />
                </div>
                <RatioCard county={selectedCounty} />
              </div>
              {selectedCounty === "WA" && (
                <RatioOverview onHoverCategory={setHoveredRatioCategory} />
              )}
            </div>
            <div className="w-full h-full lg:w-4xl">
              {selectedCounty === "WA" ? (
                <IconMap
                  onCountyClick={handleCountyClick}
                  highlightCategory={hoveredRatioCategory}
                />
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
          <div className="flex flex-col gap-6 h-full min-w-sm pb-10 md:pb-0">
            <TrendCard county={selectedCounty} />
            <EVTypCard county={selectedCounty} />
            <StationNetCard county={selectedCounty} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
