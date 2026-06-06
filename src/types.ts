export interface AQIEntry {
  state: string;
  city: string;
  aqi: number;
  lastupdate: string;
  prominentParameter: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  time: string;
}

export interface IMDCurrentWeather {
  "Station Id": string;
  Station: string;
  "Date of Observation": string;
  "Time of Observation": string;
  "M.S.L.P": string;
  "Wind Direction": string;
  "Wind Speed": string;
  Temperature: string;
  "Weather Code": string;
  Nebulosity: string;
  Humidity: string;
  "Last 24 hrs Rainfall": string;
}

export interface IMDRainfallForecast {
  date_obs: string;
  Obj_id: string;
  District: string;
  State: string;
  day1_color: string;
  day1_distribution: string;
  day1_distribution_percentage: string;
  day2_color: string;
  day2_distribution: string;
  day2_distribution_percentage: string;
  day3_color: string;
  day3_distribution: string;
  day3_distribution_percentage: string;
  day4_color: string;
  day4_distribution: string;
  day4_distribution_percentage: string;
  day5_color: string;
  day5_distribution: string;
  day5_distribution_percentage: string;
}

export interface HistoricalAQIEntry {
  date: string;
  aqi: number;
}

export interface QueryOutput {
  answer: string;
  chartType: "bar" | "pie" | "none";
  chartData: Array<{ name: string; value: number }>;
  provenance: string[];
  outOfScope: boolean;
}

export interface QAHistoryItem {
  id: string;
  question: string;
  answer?: string;
  chartType?: "bar" | "pie" | "none";
  chartData?: Array<{ name: string; value: number }>;
  provenance?: string[];
  outOfScope?: boolean;
  loading?: boolean;
  error?: string;
}

export interface CPCBConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  advisory: string;
  municipalAction: string;
}
