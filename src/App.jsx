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
import BGDecor1 from "@/assets/bg-decor1.svg";
import BGDecor2 from "@/assets/bg-decor2.svg";
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
        src={BGDecor1}
        alt="Background SVG Top Right"
        className="absolute top-0 right-0 w-80 h-80 z-0"
      />
      <img
        src={BGDecor2}
        alt="Background SVG Bottom Left"
        className="absolute bottom-0 left-0 w-80 h-80 z-0"
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
            <div className="z-10 text-center text-sm text-muted-foreground mt-12">
              <p>
                Data Sources:{" "}
                <a
                  href="https://data.wa.gov/Transportation/Electric-Vehicle-Population-Data/f6w7-q2d2/about_data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  EV Population
                </a>{" "}
                |{" "}
                <a
                  href="https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/all/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Charging Stations
                </a>
              </p>
              <p>Last updated at May 16, 2025</p>
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
