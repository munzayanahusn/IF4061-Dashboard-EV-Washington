import "./App.css";

function App() {
  return (
    <div className="p-4 lg:p-6 m-6">
      {/* Main Container */}
      <div className="">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl xl:text-4xl font-weight-regular">
            Electric Vehicle (EV) vs Charging Station Availability in Washington
          </h1>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content Area */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Map Section */}
            <div className="bg-card p-4 lg:p-6 min-h-[400px] lg:min-h-[500px]">
              <span className="text-lg">Map Component</span>
            </div>

            {/* Trend Section */}
            <div className="bg-card p-4 lg:p-6 min-h-[300px] lg:min-h-[350px]">
              <span className="text-lg">EV & Charging Station Trend</span>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* EV-to-Charger Ratio Card */}
            <div className="bg-card p-4 lg:p-6">
              <span className="text-lg">Ratio Card</span>
            </div>

            {/* EV Mix Card */}
            <div className="bg-card p-4 lg:p-6">
              <span className="text-lg">EV & Charging Station Trend</span>
            </div>

            {/* Electric Utility Proportion Card */}
            <div className="bg-card p-4 lg:p-6">
              <span className="text-lg">Electric Utility Proportion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
