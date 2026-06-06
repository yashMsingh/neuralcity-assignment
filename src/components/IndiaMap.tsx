import { useState, useMemo, useEffect } from "react";
import { AQIEntry } from "../types";
import { Info, Grid } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface IndiaMapProps {
  aqiData: AQIEntry[];
  selectedCityName: string;
  onSelectCity: (cityName: string) => void;
  getCPCBConfig: (aqi: number) => {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    advisory: string;
    municipalAction: string;
  };
}

// Component to handle map view updates when selected city changes
function MapController({ selectedCityName, aqiData }: { selectedCityName: string, aqiData: AQIEntry[] }) {
  const map = useMap();
  useEffect(() => {
    if (selectedCityName && aqiData.length > 0) {
      const city = aqiData.find(c => c.city === selectedCityName);
      if (city && city.latitude && city.longitude) {
        map.flyTo([city.latitude, city.longitude], 6, { duration: 1.5 });
      } else {
        map.flyTo([22.5, 79.0], 4.5, { duration: 1.5 });
      }
    } else {
      map.flyTo([22.5, 79.0], 4.5, { duration: 1.5 });
    }
  }, [selectedCityName, aqiData, map]);
  return null;
}

export default function IndiaMap({
  aqiData,
  selectedCityName,
  onSelectCity,
  getCPCBConfig
}: IndiaMapProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Computes the state metrics based on currently synced real-time data
  const stateStatistics = useMemo(() => {
    const stats: Record<string, { totalAqi: number; count: number; minAqi: number; maxAqi: number; cities: AQIEntry[] }> = {};

    aqiData.forEach((entry) => {
      const matchedStateName = entry.state;
      if (!stats[matchedStateName]) {
        stats[matchedStateName] = { totalAqi: 0, count: 0, minAqi: 9999, maxAqi: -1, cities: [] };
      }
      stats[matchedStateName].totalAqi += entry.aqi;
      stats[matchedStateName].count += 1;
      stats[matchedStateName].minAqi = Math.min(stats[matchedStateName].minAqi, entry.aqi);
      stats[matchedStateName].maxAqi = Math.max(stats[matchedStateName].maxAqi, entry.aqi);
      stats[matchedStateName].cities.push(entry);
    });

    return Object.keys(stats).map((stateKey) => {
      const entryStats = stats[stateKey];
      const avgAqi = Math.round(entryStats.totalAqi / entryStats.count);
      return {
        stateKey,
        name: stateKey,
        avgAqi,
        citiesCount: entryStats.count,
        citiesList: entryStats.cities,
        minAqi: entryStats.minAqi,
        maxAqi: entryStats.maxAqi,
      };
    });
  }, [aqiData]);

  const activeStateMetrics = useMemo(() => {
    if (!selectedState) return null;
    return stateStatistics.find(s => s.stateKey === selectedState) || null;
  }, [selectedState, stateStatistics]);

  // Initial sync with selectedState if selectedCityName exists
  useEffect(() => {
    if (selectedCityName) {
      const cityData = aqiData.find(c => c.city === selectedCityName);
      if (cityData) {
        setSelectedState(cityData.state);
      }
    }
  }, [selectedCityName, aqiData]);

  return (
    <div className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden shadow-xl flex flex-col xl:flex-row h-auto lg:h-[580px]">
      
      {/* Map Interactive Stage Container */}
      <div className="flex-1 relative bg-[#0d0d0f] border-r border-[#27272a]/50 select-none overflow-hidden flex flex-col h-[500px] lg:h-auto">
        <MapContainer 
          center={[22.5, 79.0]} 
          zoom={4.5} 
          scrollWheelZoom={true} 
          className="w-full h-full z-0"
          style={{ background: "#0d0d0f" }}
        >
          <TileLayer
            attribution='&amp;copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapController selectedCityName={selectedCityName} aqiData={aqiData} />
          
          {aqiData.map(city => {
            if (!city.latitude || !city.longitude) return null;
            const coords: [number, number] = [city.latitude, city.longitude];
            const cfg = getCPCBConfig(city.aqi);
            const isSelected = selectedCityName === city.city;
            
            return (
              <CircleMarker
                key={city.city}
                center={coords}
                radius={isSelected ? 12 : 8}
                pathOptions={{ 
                  fillColor: cfg.color, 
                  color: cfg.color, 
                  weight: isSelected ? 3 : 1, 
                  fillOpacity: isSelected ? 0.9 : 0.6 
                }}
                eventHandlers={{
                  click: () => {
                    onSelectCity(city.city);
                    setSelectedState(city.state);
                  }
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                  <div className="font-sans text-xs bg-zinc-900 text-zinc-100 px-1 py-0.5 rounded shadow-lg border border-zinc-700">
                    <strong className="block">{city.city}</strong>
                    <span>AQI: {city.aqi}</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
        
        {/* Bottom index legends bar inside state */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#0d0d0f]/80 backdrop-blur-sm border-t border-[#27272a]/80 p-2.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-550 gap-2 pointer-events-none">
          <div className="flex items-center gap-1">
            <Grid className="w-3.5 h-3.5 text-zinc-600" />
            <span>Interactive Node Mesh Lat/Lng Projections</span>
          </div>

          <div className="flex items-center gap-4 text-[9px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Good (0-50)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
              Satisfactory (51-100)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Moderate (101-200)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Unhealthy (201+)
            </span>
          </div>
        </div>
      </div>

      {/* Map Analytical Side Panel (Right pane of map box, xl:col-span-4) */}
      <div className="w-full xl:w-80 bg-[#141417]/80 flex flex-col justify-between p-5 space-y-4">
        
        {/* Dynamic metrics calculations top half */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-[#71717a] font-bold uppercase tracking-wider">
              Calculated State Metrics
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5 uppercase tracking-tight">
              State-wise pollution rankings
            </h4>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            {stateStatistics
              .filter(s => s.avgAqi !== null)
              .sort((a, b) => (b.avgAqi || 0) - (a.avgAqi || 0)) // Heaviest pollution first
              .map((state, sIdx) => {
                const cfg = getCPCBConfig(state.avgAqi || 0);
                const isSelected = selectedState === state.stateKey;

                return (
                  <button
                    key={state.stateKey}
                    type="button"
                    onClick={() => {
                       setSelectedState(state.stateKey);
                       if (state.citiesList.length > 0) {
                         onSelectCity(state.citiesList[0].city);
                       }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[#1c1c20] border-blue-500/40 text-white"
                        : "bg-[#18181b]/50 border-zinc-800 hover:border-zinc-700 text-zinc-350"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-zinc-600 block w-4 font-bold">
                        0{sIdx + 1}.
                      </span>
                      <div>
                        <span className="font-bold text-xs block leading-tight truncate max-w-[100px]">
                          {state.name}
                        </span>
                        <span className="text-[9px] text-zinc-550 font-mono block leading-none mt-0.5 uppercase">
                          {state.citiesCount} city monitors
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[9.5px] font-mono font-extrabold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${cfg.color}15`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}25`
                        }}
                      >
                        AQI {state.avgAqi}
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Dynamic specific details on state zoomed zoom info card/panel bottom half */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
          {selectedState && activeStateMetrics ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 font-bold block truncate w-3/4">
                  {activeStateMetrics.name} Core
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  SENSING NODES
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center py-1">
                <div className="bg-[#141417] p-2 rounded-lg border border-zinc-900">
                  <span className="text-[8px] font-mono text-zinc-500 block">Avg Space Score</span>
                  <span 
                    className="text-sm font-black font-mono mt-0.5 block"
                    style={{ color: getCPCBConfig(activeStateMetrics.avgAqi || 0).color }}
                  >
                    {activeStateMetrics.avgAqi}
                  </span>
                </div>
                <div className="bg-[#141417] p-2 rounded-lg border border-zinc-900">
                  <span className="text-[8px] font-mono text-zinc-500 block">Band Category</span>
                  <span 
                    className="text-[9px] font-black uppercase mt-0.8 block"
                    style={{ color: getCPCBConfig(activeStateMetrics.avgAqi || 0).color }}
                  >
                    {getCPCBConfig(activeStateMetrics.avgAqi || 0).label}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[8.5px] font-mono text-zinc-500 block uppercase font-bold">
                  Monitored Cities Readings:
                </span>
                <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                  {activeStateMetrics.citiesList.map(city => {
                    const isCitySelected = selectedCityName === city.city;
                    const cc = getCPCBConfig(city.aqi);
                    return (
                      <div 
                        key={city.city}
                        onClick={() => onSelectCity(city.city)}
                        className={`flex justify-between items-center px-2 py-1.5 rounded-lg border cursor-pointer transition-all ${
                          isCitySelected 
                            ? "bg-blue-950/25 border-blue-500/30" 
                            : "bg-[#18181b]/40 border-zinc-800/40 hover:bg-[#18181b] hover:border-zinc-700/60"
                        }`}
                      >
                        <span className={`text-xs font-bold ${isCitySelected ? "text-white" : "text-zinc-350"}`}>
                          {city.city}
                        </span>
                        <span className="text-xs font-mono font-extrabold" style={{ color: cc.color }}>
                          {city.aqi}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2.5 text-center space-y-2">
              <Info className="w-5 h-5 text-zinc-600 mx-auto" />
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Select a state from the rankings to filter station lists, trigger local averaging audits, and explore health advisors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
