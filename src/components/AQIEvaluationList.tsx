import { HelpCircle, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

interface EvaluationQuestion {
  id: string;
  question: string;
  category: "comparison" | "extremes" | "filtered" | "qualitative" | "out-of-scope";
  badgeText: string;
  badgeType: "success" | "warning" | "error";
  expectedBehavior: string;
}

const EVALUATION_SET: EvaluationQuestion[] = [
  {
    id: "eval-1",
    question: "Which city has the best air quality today according to the dataset?",
    category: "extremes",
    badgeText: "In-Scope (Math)",
    badgeType: "success",
    expectedBehavior: "Finds the city with the minimum numerical AQI value, outputs clean statistics and a comparative chart."
  },
  {
    id: "eval-2",
    question: "Compare the air pollution in Delhi, Mumbai, and Bengaluru.",
    category: "comparison",
    badgeText: "In-Scope (Compare)",
    badgeType: "success",
    expectedBehavior: "Pulls readings for these three specific cities, formats a neat side-by-side comparison, and plots a 3-bar comparison chart."
  },
  {
    id: "eval-3",
    question: "Are there any cities classified as Moderate or Poor today? List their pollutants.",
    category: "filtered",
    badgeText: "In-Scope (Filter)",
    badgeType: "success",
    expectedBehavior: "Filters current logs matching AQI ranges [101-200] and [201-300], and summarizes their prominent parameters."
  },
  {
    id: "eval-4",
    question: "Show air quality trends for cities in Maharashtra.",
    category: "filtered",
    badgeText: "In-Scope (State Map)",
    badgeType: "success",
    expectedBehavior: "Identifies Mumbai and Pune as Maharashtra cities, extracts their data, and displays comparative metrics."
  },
  {
    id: "eval-5",
    question: "How did paddy crop production and agricultural yields in Karnataka change over the last 5 years?",
    category: "out-of-scope",
    badgeText: "Trap: Out-of-Scope",
    badgeType: "error",
    expectedBehavior: "Gracefully refuses to execute, explaining that the current SAMEER/CPCB layer is restricted to hourly AQI parameters."
  }
];

interface AQIEvaluationListProps {
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export default function AQIEvaluationList({ onSelectQuestion, disabled = false }: AQIEvaluationListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          Evaluation Set (5-8 Test Suite)
        </h4>
        <span className="text-[10px] text-zinc-500 font-mono">Select a pill below to run</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {EVALUATION_SET.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(item.question)}
            className="flex flex-col text-left p-3 rounded-xl border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] hover:border-blue-500/40 transition-all group disabled:opacity-50 disabled:hover:bg-[#18181b] disabled:hover:border-[#27272a]"
          >
            <div className="flex items-start justify-between gap-2 w-full mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-semibold leading-none"
                style={{
                  backgroundColor: item.badgeType === "success" ? "rgba(16, 185, 129, 0.15)" : item.badgeType === "warning" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: item.badgeType === "success" ? "#34d399" : item.badgeType === "warning" ? "#fbbf24" : "#f87171",
                  border: `1px solid ${item.badgeType === "success" ? "rgba(16, 185, 129, 0.25)" : item.badgeType === "warning" ? "rgba(245, 158, 11, 0.25)" : "rgba(239, 68, 68, 0.25)"}`
                }}
              >
                {item.badgeType === "success" && <CheckCircle className="w-2.5 h-2.5" />}
                {item.badgeType === "error" && <AlertCircle className="w-2.5 h-2.5 text-rose-400" />}
                {item.badgeText}
              </span>
              <span className="text-[10px] text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 font-medium">
                Run Now <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            
            <p className="text-xs font-semibold text-zinc-200 line-clamp-2 mb-1.5 group-hover:text-white">
              "{item.question}"
            </p>
            
            <div className="text-[10px] text-zinc-400 bg-[#111113] rounded p-1.5 leading-snug w-full border border-zinc-800/30">
              <span className="font-semibold text-zinc-300">Expected:</span> {item.expectedBehavior}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
