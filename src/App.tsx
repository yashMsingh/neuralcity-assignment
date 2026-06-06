import { useState, useEffect } from "react";
import { 
  Wind, 
  Search, 
  MapPin, 
  Clock, 
  Filter, 
  Send, 
  Info, 
  TrendingUp, 
  Download, 
  Building2, 
  User, 
  Sparkles, 
  Bot, 
  Layers, 
  RefreshCw,
  AlertTriangle,
  History,
  Check,
  ChevronRight,
  Thermometer,
  Droplets,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AQIChart from "./components/AQIChart";
import HistoricalTrendChart from "./components/HistoricalTrendChart";
import AQIEvaluationList from "./components/AQIEvaluationList";
import DesignNotePanel from "./components/DesignNotePanel";
import IndiaMap from "./components/IndiaMap";
import { AQIEntry, QueryOutput, QAHistoryItem, IMDCurrentWeather, IMDRainfallForecast, HistoricalAQIEntry } from "./types";

// Get standard styling and advice based on CPCB SAMEER bands
const getCPCBConfig = (aqiValue: number) => {
  if (aqiValue <= 50) {
    return {
      label: "Good",
      color: "#10B981",
      bgColor: "bg-emerald-950/20 border-emerald-500/20",
      textColor: "text-emerald-400",
      advisory: "Minimal impact. Clean fresh air—ideal for all outdoor exercises and activities.",
      municipalAction: "Maintain existing clean transit protocols. Focus municipal efforts on long-term electric mobility infrastructure."
    };
  } else if (aqiValue <= 100) {
    return {
      label: "Satisfactory",
      color: "#84CC16",
      bgColor: "bg-lime-950/20 border-lime-500/20",
      textColor: "text-lime-300",
      advisory: "May cause minor breathing discomfort to sensitive individuals (asthma or respiratory issues).",
      municipalAction: "Monitor active construction sites. Enforce sprinkler dust mitigation methods in residential zones."
    };
  } else if (aqiValue <= 200) {
    return {
      label: "Moderate",
      color: "#F59E0B",
      bgColor: "bg-amber-950/20 border-amber-500/20",
      textColor: "text-amber-400",
      advisory: "May cause breathing discomfort to children, elderly, and people with pre-existing lung/heart conditions.",
      municipalAction: "Deploy municipal smog guns. Restrict open waste combustion and fine heavy trucks violating PUC certificates."
    };
  } else if (aqiValue <= 300) {
    return {
      label: "Poor",
      color: "#EF4444",
      bgColor: "bg-red-950/20 border-red-500/20",
      textColor: "text-red-400",
      advisory: "May cause general breathing discomfort to healthy people. Highly advisable to wear protective masks outside.",
      municipalAction: "Initiate NCAP emergency response: restrict thermal plant output near city borders, elevate public transport frequencies."
    };
  } else if (aqiValue <= 400) {
    return {
      label: "Very Poor",
      color: "#8B5CF6",
      bgColor: "bg-violet-950/20 border-violet-500/20",
      textColor: "text-violet-400",
      advisory: "May cause respiratory illness on prolonged exposure. Sensitive groups should stay completely indoors.",
      municipalAction: "Halt major non-essential construction and demolition. Enforce traffic regulations and encourage remote corporate work."
    };
  } else {
    return {
      label: "Severe",
      color: "#7F1D1D",
      bgColor: "bg-rose-950/30 border-red-900/40",
      textColor: "text-red-300",
      advisory: "May cause serious cardiovascular/respiratory impacts on healthy population. Extreme danger. Keep windows closed.",
      municipalAction: "Declare municipal health emergency. Suspend physical schools, implement complete industrial shutdowns, and deploy state water mist-cannons."
    };
  }
};

export default function App() {
  const [aqiData, setAqiData] = useState<AQIEntry[]>([]);
  const [newsSource, setNewsSource] = useState<string>("Loading RSS feed...");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCityName, setSelectedCityName] = useState<string>("Delhi");
  const [userQuery, setUserQuery] = useState<string>("");
  const [queryHistory, setQueryHistory] = useState<QAHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "design">("dashboard");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const [dateFrom, setDateFrom] = useState<string>(sevenDaysAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState<string>(today.toISOString().split('T')[0]);
  const [weatherData, setWeatherData] = useState<IMDCurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<IMDRainfallForecast | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalAQIEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Load CPCB AQI data
  const fetchAQIData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aqi");
      const result = await res.json();
      if (result.success) {
        setAqiData(result.data);
        setNewsSource(result.source);
        
        // Ensure standard entry is selected
        if (result.data.length > 0) {
          const hasDelhi = result.data.some((x: AQIEntry) => x.city === "Delhi");
          if (hasDelhi) {
            setSelectedCityName("Delhi");
          } else {
            setSelectedCityName(result.data[0].city);
          }
        }
      } else {
        throw new Error(result.error || "Failed to load");
      }
    } catch (err: any) {
      console.error(err);
      setError("Unable to sync air quality records. Please tap refresh to reload.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAQIData();
  }, []);

  useEffect(() => {
    if (!selectedCityName) return;
    const city = aqiData.find(c => c.city === selectedCityName);
    if (city && city.latitude && city.longitude) {
      fetch(`/api/weather/imd?city=${encodeURIComponent(city.city)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setWeatherData(data.data);
          else setWeatherData(null);
        }).catch(() => setWeatherData(null));

      fetch(`/api/forecast/imd?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) setForecastData(data.data[0]);
          else setForecastData(null);
        }).catch(() => setForecastData(null));
    } else {
      setWeatherData(null);
      setForecastData(null);
    }
    
    setHistoryLoading(true);
    fetch(`/api/aqi/history?city=${encodeURIComponent(selectedCityName)}&dateFrom=${dateFrom}&dateTo=${dateTo}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setHistoricalData(data.data);
        else setHistoricalData([]);
      })
      .catch(() => setHistoricalData([]))
      .finally(() => setHistoryLoading(false));
      
  }, [selectedCityName, aqiData, dateFrom, dateTo]);

  // Filter comparison list based on search bar
  const displayedCities = aqiData.filter(city => 
    city.city.toLowerCase().includes(searchFilter.trim().toLowerCase()) ||
    city.state.toLowerCase().includes(searchFilter.trim().toLowerCase())
  );

  const selectedCityData = aqiData.find(city => city.city === selectedCityName);
  const selectedConfig = selectedCityData ? getCPCBConfig(selectedCityData.aqi) : null;

  // Handle Natural Language Query Submit
  const handleQuerySubmit = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;
    
    const queryId = Date.now().toString();
    const newHistoryItem: QAHistoryItem = {
      id: queryId,
      question: textToSubmit.trim(),
      loading: true
    };
    
    setQueryHistory(prev => [newHistoryItem, ...prev]);
    if (userQuery === textToSubmit) {
      setUserQuery("");
    }

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSubmit.trim(), aqiData })
      });
      const data = await response.json();
      
      if (data.success && data.output) {
        setQueryHistory(prev => prev.map(item => {
          if (item.id === queryId) {
            return {
              ...item,
              ...data.output,
              loading: false
            };
          }
          return item;
        }));
      } else {
        throw new Error(data.error || "Query failed");
      }
    } catch (err: any) {
      setQueryHistory(prev => prev.map(item => {
        if (item.id === queryId) {
          return {
            ...item,
            loading: false,
            error: err.message || "Apologies, there was an issue querying Gemini. Please try again."
          };
        }
        return item;
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#e4e4e7] font-sans selection:bg-blue-600/30 selection:text-white antialiased flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-extrabold text-white tracking-tighter shrink-0 select-none">
              N
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-semibold block leading-none">
                Neural City
              </span>
              <h1 className="text-white font-bold text-base uppercase tracking-tight mt-0.5">
                Air Quality Layer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === "design"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
              }`}
            >
              Technical Design Note
            </button>
            <button
              onClick={fetchAQIData}
              title="Refresh Feed Data"
              disabled={loading}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-800/40 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Product Framing Callout Note */}
        <div className="bg-gradient-to-r from-blue-950/20 via-[#18181b]/40 to-indigo-950/20 border border-[#27272a] rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs text-zinc-350 leading-relaxed font-semibold">
              <span className="text-blue-400 uppercase font-mono text-[10px] tracking-wider font-extrabold mr-1.5 px-1.5 py-0.5 bg-blue-950/40 rounded border border-blue-900/30 shadow-sm leading-none align-middle">
                Contextual Overlay
              </span>
              This layer adds public environmental-health context to street-level urban observations, helping citizens compare city livability and helping municipal users spot pollution stress quickly.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-zinc-600" />
                Data Stream: <strong className="text-zinc-400 font-semibold">{newsSource}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-600" />
                Checked: <strong className="text-zinc-400 font-semibold">Live (Indian Standard Time)</strong>
              </span>
            </div>
          </div>
        </div>

        {activeTab === "design" ? (
          <DesignNotePanel />
        ) : (
          <>
            {/* Interactive India Map Spatial Layer */}
            <IndiaMap 
              aqiData={aqiData}
              selectedCityName={selectedCityName}
              onSelectCity={(cityName) => setSelectedCityName(cityName)}
              getCPCBConfig={getCPCBConfig}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Box: AQI Comparisons & Search (lg:col-span-5) */}
            <section className="lg:col-span-5 bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg space-y-4 flex flex-col max-h-[780px]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-widest text-[#71717a] font-bold block leading-none">
                    CPCB National AQI
                  </h3>
                  <h2 className="text-sm font-bold text-white mt-1 uppercase">
                    City-wise Compare Stack ({aqiData.length}/12)
                  </h2>
                </div>
                <span className="text-[10px] font-mono bg-zinc-800/50 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700/50 uppercase font-semibold">
                  Sorted: Best first
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter comparison cities..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-[#111113] transition-all text-zinc-200 placeholder:text-zinc-650 font-medium"
                />
              </div>

              {/* Cities scroll list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {loading ? (
                  <div className="py-20 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-500 font-medium">Fetching CPCB state bulletins...</p>
                  </div>
                ) : displayedCities.length === 0 ? (
                  <div className="py-20 text-center text-zinc-650 text-xs">
                    No matching cities found in targeting scope.
                  </div>
                ) : (
                  displayedCities.map((entry, index) => {
                    const cfg = getCPCBConfig(entry.aqi);
                    const isSelected = selectedCityName === entry.city;
                    return (
                      <button
                        key={entry.city}
                        type="button"
                        onClick={() => setSelectedCityName(entry.city)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected 
                            ? "bg-[#1c1c20] border-blue-500/50 text-white shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/20" 
                            : "bg-[#111113]/70 border-[#27272a] hover:bg-[#1c1c20] hover:border-zinc-700 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5.5 h-5.5 rounded-lg text-[10px] font-mono font-medium flex items-center justify-center border ${
                            isSelected 
                              ? "bg-blue-950/80 border-blue-800/50 text-blue-300" 
                              : "bg-zinc-850/60 border-zinc-750/50 text-zinc-550"
                          }`}>
                            #{index + 1}
                          </span>
                          <div>
                            <span className="font-bold text-xs block leading-tight">
                              {entry.city}
                            </span>
                            <span className={`text-[9px] font-mono leading-none block mt-0.5 ${
                              isSelected ? "text-zinc-400" : "text-zinc-500"
                            }`}>
                              {entry.state}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="text-right">
                            <span className="font-mono font-bold text-xs block leading-tight">
                              AQI {entry.aqi}
                            </span>
                            <span className={`text-[8px] font-mono block font-semibold uppercase ${
                              isSelected ? "text-zinc-400" : "text-zinc-500"
                            }`}>
                              {entry.prominentParameter}
                            </span>
                          </div>
                          
                          <span 
                            className="text-[9px] font-bold px-2 py-0.5 rounded font-mono"
                            style={{
                              backgroundColor: cfg.color,
                              color: "#FFFFFF"
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Baseline Comparison Visualizer Chart */}
              <div className="border-t border-[#27272a] pt-3">
                <span className="text-[10px] font-mono font-semibold text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-505" />
                  General Landscape Stack
                </span>
                <AQIChart 
                  data={aqiData.map(item => ({ name: item.city, value: item.aqi }))} 
                  type="bar" 
                />
              </div>
            </section>

            {/* Right Side Part 1: Details Panel for Selected City (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Selected City Panel */}
              <AnimatePresence mode="wait">
                {selectedCityData && selectedConfig && (
                  <motion.section
                    key={selectedCityData.city}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-lg space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#27272a] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#111113] rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-805">
                          <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-white">
                              {selectedCityData.city}
                            </h2>
                            <span className="text-[10px] bg-zinc-800 text-zinc-350 border border-zinc-700 font-semibold px-2 py-0.5 rounded font-mono">
                              {selectedCityData.state}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-650" /> CPCB Bulletin: {selectedCityData.lastupdate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-wider block">
                            CPCB Air Score
                          </span>
                          <span className="text-2xl font-black font-mono tracking-tight text-white block leading-none mt-1">
                            {selectedCityData.aqi}
                          </span>
                        </div>

                        <div 
                          className="px-4 py-2.5 rounded-lg flex flex-col items-center justify-center min-w-[100px] border"
                          style={{
                            backgroundColor: selectedConfig.color,
                            color: "#FFFFFF",
                            borderColor: selectedConfig.color
                          }}
                        >
                          <span className="text-[11px] font-mono tracking-wider font-extrabold uppercase leading-none">
                            Category
                          </span>
                          <span className="text-sm font-black mt-1 uppercase leading-none">
                            {selectedConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      {/* Public Health Section */}
                      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4.5 space-y-2.5">
                        <h4 className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                          <User className="w-4 h-4 text-emerald-400 shrink-0" />
                          Advisor for Residents
                        </h4>
                        <p className="text-zinc-350 leading-relaxed font-semibold">
                          {selectedConfig.advisory}
                        </p>
                        <div className="bg-[#18181b] border border-[#27272a]/60 rounded-lg p-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                            PROMINENT POLLUTANT: <strong className="text-white font-bold">{selectedCityData.prominentParameter}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Municipal Action Section */}
                      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4.5 space-y-2.5">
                        <h4 className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                          Municipal Response Checklist
                        </h4>
                        <p className="text-zinc-350 leading-relaxed font-semibold">
                          {selectedConfig.municipalAction}
                        </p>
                        <div className="bg-[#18181b] border border-blue-900/40 rounded-lg p-2 text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wide">
                          Authority Level: NCAP Municipal Command
                        </div>
                      </div>
                    </div>

                    {/* Weather & Environment Widget (IMD) */}
                    {weatherData && (
                      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-400" />
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">Temperature</span>
                            <span className="text-sm font-bold text-white">{weatherData.Temperature}°C</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">Humidity</span>
                            <span className="text-sm font-bold text-white">{weatherData.Humidity}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-teal-400" />
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">Wind Speed</span>
                            <span className="text-sm font-bold text-white">{weatherData["Wind Speed"]} km/h</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-zinc-400" />
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">MSLP</span>
                            <span className="text-sm font-bold text-white">{weatherData["M.S.L.P"]} hPa</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase block leading-none">IMD Station</span>
                            <span className="text-sm font-bold text-white">{weatherData["Station Id"]}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* IMD 5-Day Forecast Widget */}
                    {forecastData && (
                      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4.5 space-y-3">
                        <h4 className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs border-b border-[#27272a] pb-3">
                          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                          IMD 5-Day Rainfall Forecast ({forecastData.District}, {forecastData.State})
                        </h4>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((day) => {
                            const color = forecastData[`day${day}_color` as keyof IMDRainfallForecast] as string;
                            const dist = forecastData[`day${day}_distribution` as keyof IMDRainfallForecast] as string;
                            
                            const todayStr = new Date();
                            todayStr.setDate(todayStr.getDate() + day);
                            const dateLbl = todayStr.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                            
                            return (
                              <div key={day} className="flex flex-col items-center justify-center bg-[#18181b] border border-[#27272a] rounded p-2">
                                <span className="text-[10px] font-mono text-zinc-500 mb-1">{dateLbl}</span>
                                <div 
                                  className="w-4 h-4 rounded-full mb-1" 
                                  style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}40` }} 
                                />
                                <span className="text-[9px] text-zinc-400 font-bold uppercase text-center leading-tight">{dist}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Historical Trends Section */}
                    <div className="bg-[#111113] border border-[#27272a] rounded-xl p-4.5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272a] pb-3">
                        <h4 className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                          <History className="w-4 h-4 text-blue-400 shrink-0" />
                          Historical AQI Trend
                        </h4>
                        
                        <div className="flex items-center gap-2 text-[10px]">
                          <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded px-2 py-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <input 
                              type="date" 
                              value={dateFrom} 
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="bg-transparent border-none outline-none text-zinc-300 font-mono w-[90px] [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
                            />
                          </div>
                          <span className="text-zinc-500 font-bold">to</span>
                          <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded px-2 py-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            <input 
                              type="date" 
                              value={dateTo} 
                              onChange={(e) => setDateTo(e.target.value)}
                              className="bg-transparent border-none outline-none text-zinc-300 font-mono w-[90px] [&::-webkit-calendar-picker-indicator]:invert-[0.6]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {historyLoading ? (
                        <div className="py-10 text-center text-xs text-zinc-500 flex flex-col items-center justify-center space-y-2">
                          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                          <span>Fetching historical measurements...</span>
                        </div>
                      ) : (
                        <HistoricalTrendChart data={historicalData} />
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Right Side Part 2: Interactive QA Module "Talk to Air Quality Data" */}
              <section className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-lg space-y-5">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/40 flex items-center justify-center text-blue-400 border border-blue-900/60">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs uppercase font-mono tracking-widest text-[#71717a] font-bold block leading-none">
                        AI Query Panel
                      </h3>
                      <h2 className="text-sm font-bold text-white mt-1 uppercase">
                        Talk to Govt Air Quality Data
                      </h2>
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-mono text-zinc-505 select-none flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    Powered by Gemini 3.5
                  </span>
                </div>

                {/* Predefined Evaluation list */}
                <AQIEvaluationList 
                  onSelectQuestion={handleQuerySubmit} 
                  disabled={loading} 
                />

                {/* Chat Console input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuerySubmit(userQuery);
                  }}
                  className="relative flex items-center bg-[#111113] border border-[#27272a] focus-within:border-blue-500/50 focus-within:bg-[#0d0d0f] transition-all pl-3.5 pr-2 py-2 rounded-xl"
                >
                  <Bot className="w-4 h-4 text-zinc-505 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ask standard or custom AQI queries (e.g., compare Delhi & Bengaluru)..."
                    className="flex-1 bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none focus:outline-0 placeholder:text-zinc-650 text-zinc-200 font-medium"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !userQuery.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-lg p-1.5 transition-all shadow-sm shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Response History Console Stack */}
                <div className="space-y-4">
                  <AnimatePresence>
                    {queryHistory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#111113] border border-[#27272a] rounded-xl p-4 space-y-3 shadow-inner"
                      >
                        <div className="flex items-start justify-between gap-3 border-b border-[#27272a]/60 pb-2">
                          <div className="flex items-center gap-2">
                            <Wind className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-mono font-bold text-zinc-550">
                              PROMPT #{queryHistory.length - index}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-zinc-350 capitalize italic">
                            "{item.question}"
                          </span>
                        </div>

                        {item.loading ? (
                          <div className="py-6 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100"></span>
                            <span className="w-2 h-2 rounded-full bg-blue-300 animate-bounce delay-200"></span>
                            <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase tracking-wider ml-1">
                              Analyzing metrics in real-time...
                            </span>
                          </div>
                        ) : item.error ? (
                          <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg flex items-start gap-2 text-xs text-rose-300 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 animate-pulse"></span>
                            {item.error}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Gemini natural language reply */}
                            <div className="text-xs text-zinc-300 leading-relaxed font-medium space-y-1 font-semibold">
                              {/* Standard rendering for answer as clean paragraph lines */}
                              {item.answer?.split("\n").map((line, lIdx) => (
                                <p key={lIdx} className="mb-1 leading-relaxed">
                                  {line}
                                </p>
                              ))}
                            </div>

                            {/* Gemini output visual charting if generated */}
                            {item.chartType && item.chartType !== "none" && item.chartData && item.chartData.length > 0 && (
                              <div className="space-y-1.5 bg-[#18181b] border border-[#27272a] rounded-lg p-3">
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block leading-none">
                                  Query Visual Output Chart
                                </span>
                                <AQIChart data={item.chartData} type={item.chartType} />
                              </div>
                            )}

                            {/* Audit Provenance Log */}
                            {item.provenance && item.provenance.length > 0 && (
                              <div className="bg-[#0d0d0f] border border-[#27272a] rounded-lg p-3 space-y-1.5 font-mono text-[10px]">
                                <span className="font-extrabold text-[#71717a] tracking-wider uppercase block leading-none">
                                  PROVENANCE (Audit Integrity Steps):
                                </span>
                                <ol className="list-decimal pl-4.5 space-y-1 text-zinc-400 font-medium">
                                  {item.provenance.map((step, sIdx) => (
                                    <li key={sIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Out of scope Indicator if flag is set */}
                            {item.outOfScope && (
                              <div className="bg-amber-950/10 border border-amber-900/40 rounded-lg p-2.5 flex items-center gap-2 text-[10px] font-mono text-amber-400 uppercase font-semibold">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                Refusal Note: Request parameters exceed state columns scope boundaries.
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            </div>
          </div>
          </>
        )}
      </main>

      {/* Corporate design footer */}
      <footer className="bg-[#0a0a0b] border-t border-[#27272a] py-6 mt-12 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              Neural City Screening Submission
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
              Designed & developed for the Applied GenAI Internship screening. Data sources cited via CPCB/SAMEER India bulletins.
            </p>
          </div>
          <span className="text-[10px] font-mono text-zinc-650 font-bold">
            © 2026 Neural City India. Clean Workspace Verified.
          </span>
        </div>
      </footer>
    </div>
  );
}
