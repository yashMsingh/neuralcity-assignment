import { BookOpen, Database, ShieldCheck, TrendingUp, HelpCircle, AlertTriangle } from "lucide-react";

export default function DesignNotePanel() {
  return (
    <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 space-y-6 text-zinc-300">
      <div className="border-b border-[#27272a] pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Technical design note & Screening Submission Analysis
        </h3>
        <p className="text-[11px] text-zinc-400 mt-1">
          A clear-eyed analysis of the architecture, correctness pipeline, compliance, and production scaling as required by Neural City’s Applied GenAI Internship briefing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
        {/* Box 1 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#111113] border border-[#27272a]">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Database className="w-4 h-4 text-blue-400" />
            1. Stack & Decisions
          </h4>
          <p className="text-zinc-300">
            <strong>Selected Tech:</strong> React + Vite client-side UI, Express (`tsx`/`esbuild`) full-stack API, and `gemini-3.5-flash` model.
          </p>
          <p className="text-zinc-300">
            <strong>Why:</strong> The Express portal serves as a secure HTTP parser for CPCB’s RSS feed (`/api/aqi`), completely eliminating browser CORS blocks. The Gemini API is initialized strictly server-side to hide the credentials from browser inspector leaks.
          </p>
          <p className="text-zinc-300">
            <strong>Structured Constraint:</strong> Instead of having the LLM generate and execute raw Python scripts (which risks unsafe execution), the pipeline constrains Gemini to return a strict JSON schema. This ensures 100% deterministic chart rendering and zero script-injection risk.
          </p>
        </div>

        {/* Box 2 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#111113] border border-[#27272a] font-sans">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            2. Correctness & Trust
          </h4>
          <p className="text-zinc-300">
            <strong>Prevention:</strong> Gemini is fed the current parsed CPCB state records as a hard-coded context boundary. It has no access to hallucinate external statistics.
          </p>
          <p className="text-zinc-300">
            <strong>Audit & Provenance:</strong> The schema enforces an explicit <span className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-blue-400 border border-zinc-700">provenance</span> list. Every step of calculation is surfaced as plain English logic (e.g. <i>"Filtered Maharashtra (Pune: 65, Mumbai: 72), calculated average (68.5)"</i>), allowing quick, transparent audits.
          </p>
          <p className="text-zinc-300">
            <strong>Graceful Out-of-Scope Fallback:</strong> Triggers immediate categorical rejection when questions violate spatial limits (e.g. asking for 5-year paddy crop yield), returning a structured error indicator.
          </p>
        </div>

        {/* Box 3 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#111113] border border-[#27272a]">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            3. Government & Security
          </h4>
          <p className="text-zinc-300">
            <strong>Data Residency:</strong> For public agency portals, the backend should route via restricted in-country virtual private networks (such as India MeitY-empanelled cloud clusters) and leverage localized model instances (such as GCP Vertex AI India regions).
          </p>
          <p className="text-zinc-300">
            <strong>Audit & Logs:</strong> A write-once audit log (e.g., Cloud Logging) tracks every user input prompt alongside its associated exact dataset version, executing parameters and visual outputs.
          </p>
          <p className="text-zinc-300">
            <strong>Access Controls:</strong> Secure JWT role-based tokens would divide generic citizen searches from privileged municipal commands, keeping write-access restricted.
          </p>
        </div>

        {/* Box 4 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#111113] border border-[#27272a]">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            4. Scaling Limits & Fixes
          </h4>
          <p className="text-zinc-300">
            <strong>What breaks:</strong> Sending millions of records directly inside an LLM's prompt window would cause severe context token saturation, extreme latency lag, and expensive API billing.
          </p>
          <p className="text-zinc-300">
            <strong>How to adapt:</strong>
          </p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-400">
            <li><strong>SQL/Semantic Routing:</strong> Migrate the in-memory array to a relational Postgres database and convert Gemini into a secure SQL generation agent (using static schemas with parameterized filters).</li>
            <li><strong>Pre-Aggregated Pipelines:</strong> Perform automated hourly micro-aggregations for standard queries (by state, city, and sensor station).</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
        {/* Box 5 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#18181b]/50 border border-blue-500/20">
          <h4 className="font-bold text-blue-400 flex items-center gap-1 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            5. Stakeholder Validation
          </h4>
          <p className="text-zinc-300">
            <strong>Testing Plan:</strong> Run side-by-side verification tests with active municipal officers and local citizens. Citizens validate standard ease of use, while officers check the actionability of warnings (e.g. triggers actions when PM2.5 hits Moderate thresholds).
          </p>
          <p className="text-zinc-300">
            <strong>Critical failure to watch:</strong> Watch for semantic misalignment (e.g. asking for "unhealthy air" versus "Moderate or Poor AQI") and ensure visual thresholds match actual CPCB state safety mandates.
          </p>
        </div>

        {/* Box 6 */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#18181b]/50 border border-rose-500/20">
          <h4 className="font-bold text-rose-400 flex items-center gap-1 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            6. Honest Limitations
          </h4>
          <p className="text-zinc-300">
            <strong>Feed Dependency:</strong> The SAMEER XML feed relies entirely on official external servers. If the government endpoint goes offline or delays reporting, our feed seamlessly displays the dynamic cached baseline layer.
          </p>
          <p className="text-zinc-300">
            <strong>No Predictive Trend Analysis:</strong> Since the XML feed only contains a single current state update, Gemini cannot visualize multi-month seasonal variations. The current prototype is confined to today's active readings.
          </p>
        </div>
      </div>
    </div>
  );
}
