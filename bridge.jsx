/**
 * Bridge — 中日AI生态翻译器
 * 6模型 × 4场景 × 双语交互式模型选型工具
 * React + Tailwind, 纯前端, 无后端依赖
 */
import { useState } from "react";

// ── 模型数据 ────────────────────────────────────────────────
const MODELS = [
  {
    id: "gemini-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    scores: { customer_service: 4, news_summary: 5, data_processing: 4, business_translation: 4 },
    price_input: "$3.50",
    price_output: "$10.50",
    price_tier: "medium",
    japanese_rating: "A",
    local_deploy: false,
    strengths: {
      zh: ["超长上下文（200万token）", "摘要质量最优", "多模态理解"],
      ja: ["超長コンテキスト（200万トークン）", "要約品質が最優秀", "マルチモーダル理解"],
    },
    weaknesses: {
      zh: ["日语敬语一致性不稳定", "高并发延迟偏高"],
      ja: ["日本語敬語の一貫性が不安定", "高並列時のレイテンシが高め"],
    },
    summary: {
      zh: "Google最强通用模型，新闻摘要场景首选，日语综合能力稳定",
      ja: "Googleの最強汎用モデル。ニュース要約に最適、日本語総合能力は安定",
    },
  },
  {
    id: "claude-opus",
    name: "Claude Opus",
    provider: "Anthropic",
    scores: { customer_service: 5, news_summary: 4, data_processing: 4, business_translation: 5 },
    price_input: "$15.00",
    price_output: "$75.00",
    price_tier: "premium",
    japanese_rating: "S",
    local_deploy: false,
    strengths: {
      zh: ["日语商务文体控制最优", "客服邮件语气最精准", "指令遵循能力顶尖"],
      ja: ["日本語ビジネス文体制御が最優秀", "カスタマーメールのトーンが最も正確", "命令遵守能力がトップクラス"],
    },
    weaknesses: {
      zh: ["价格最贵，成本最高", "无本地部署选项"],
      ja: ["最もコストが高い", "ローカルデプロイ不可"],
    },
    summary: {
      zh: "综合质量天花板，日语S级评定，高价值商务场景预算充足时首选",
      ja: "総合品質のトップ。日本語S評価。高価値ビジネスシーンで予算に余裕があれば最有力",
    },
  },
  {
    id: "qwen-25",
    name: "Qwen 2.5",
    provider: "Alibaba",
    scores: { customer_service: 4, news_summary: 4, data_processing: 5, business_translation: 4 },
    price_input: "$0.50",
    price_output: "$1.50",
    price_tier: "budget",
    japanese_rating: "A",
    local_deploy: true,
    strengths: {
      zh: ["数据处理场景评分最高", "日语IT术语精准度超越Gemini和Grok", "支持本地部署"],
      ja: ["データ処理シーンのスコア最高", "IT専門用語の日本語精度がGemini・Grokを超える", "ローカルデプロイ対応"],
    },
    weaknesses: {
      zh: ["复杂推理偶发幻觉", "创意写作能力较弱"],
      ja: ["複雑な推論でハルシネーションが発生することがある", "クリエイティブライティングが弱め"],
    },
    summary: {
      zh: "数据处理场景最强，可本地部署保障数据主权，性价比极高",
      ja: "データ処理シーン最強。ローカルデプロイでデータ主権確保。コスパは群を抜く",
    },
  },
  {
    id: "grok-heavy",
    name: "Grok Heavy",
    provider: "xAI",
    scores: { customer_service: 3, news_summary: 4, data_processing: 3, business_translation: 3 },
    price_input: "$5.00",
    price_output: "$15.00",
    price_tier: "medium",
    japanese_rating: "B",
    local_deploy: false,
    strengths: {
      zh: ["实时数据获取能力", "英文内容处理强", "幽默感与创意表达"],
      ja: ["リアルタイムデータアクセス", "英語コンテンツ処理が得意", "ユーモアと創造的表現"],
    },
    weaknesses: {
      zh: ["日语敬语质量最弱", "商务正式场景不稳定"],
      ja: ["日本語敬語の品質が最も低い", "ビジネスフォーマルシーンが不安定"],
    },
    summary: {
      zh: "实时信息是差异化优势，日语表现是短板，不建议日语核心场景",
      ja: "リアルタイム情報が差別化ポイント。日本語は弱点で、日本語コアシーンには非推奨",
    },
  },
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    scores: { customer_service: 4, news_summary: 3, data_processing: 4, business_translation: 3 },
    price_input: "$0.075",
    price_output: "$0.30",
    price_tier: "budget",
    japanese_rating: "B",
    local_deploy: false,
    strengths: {
      zh: ["价格最低，高吞吐场景首选", "响应速度极快", "适合轻量级高频任务"],
      ja: ["最低価格で高スループットに最適", "レスポンス速度が非常に速い", "軽量高頻度タスクに適している"],
    },
    weaknesses: {
      zh: ["复杂任务质量不稳定", "日语质量一般"],
      ja: ["複雑タスクで品質が不安定", "日本語品質は平均的"],
    },
    summary: {
      zh: "成本最低的可用选项，高频低价值任务最佳，复杂场景不建议",
      ja: "最低コストの実用的選択肢。高頻度・低価値タスクに最適。複雑なシーンには非推奨",
    },
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    scores: { customer_service: 4, news_summary: 4, data_processing: 4, business_translation: 3 },
    price_input: "$0.27",
    price_output: "$1.10",
    price_tier: "budget",
    japanese_rating: "B",
    local_deploy: true,
    strengths: {
      zh: ["80%的Claude质量，仅需1/10成本", "支持本地部署", "代码生成能力强"],
      ja: ["Claudeの80%品質でコスト1/10", "ローカルデプロイ対応", "コード生成能力が高い"],
    },
    weaknesses: {
      zh: ["数据存储在中国境内，有合规风险", "日语翻译质量偏弱"],
      ja: ["データが中国国内に保存されコンプライアンスリスクあり", "日本語翻訳品質がやや弱い"],
    },
    summary: {
      zh: "极致性价比，但需评估数据出境合规风险，高日语要求场景慎用",
      ja: "究極のコスパ。ただしデータ越境のコンプライアンスリスク要評価。高日本語要件には注意",
    },
  },
];

const SCENARIOS = [
  {
    id: "customer_service",
    icon: "✉",
    label: { zh: "客服邮件", ja: "カスタマーメール" },
    desc: { zh: "日语商务邮件回复，敬语准确性，语气控制", ja: "日本語ビジネスメール返信・敬語精度・トーン制御" },
  },
  {
    id: "news_summary",
    icon: "📰",
    label: { zh: "新闻摘要", ja: "ニュース要約" },
    desc: { zh: "长文压缩，关键信息提取，中日双语摘要", ja: "長文圧縮・キー情報抽出・中日バイリンガル要約" },
  },
  {
    id: "data_processing",
    icon: "⚙",
    label: { zh: "数据处理", ja: "データ処理" },
    desc: { zh: "结构化数据提取，JSON解析，批量文档处理", ja: "構造化データ抽出・JSON解析・バッチドキュメント処理" },
  },
  {
    id: "business_translation",
    icon: "🌐",
    label: { zh: "商务翻译", ja: "ビジネス翻訳" },
    desc: { zh: "中日商务文件互译，专业术语准确性，格式保留", ja: "中日ビジネス文書相互翻訳・専門用語精度・フォーマット保持" },
  },
];

const INSIGHTS = [
  {
    icon: "⚡",
    title: { zh: "没有全场景最强模型", ja: "全シーン最強モデルは存在しない" },
    body: {
      zh: "6个模型×4场景测试中，无一模型全场景领先。企业应按场景需求混合部署，而非押注单一模型。",
      ja: "6モデル×4シーンのテストで、全シーンをリードするモデルは皆無。企業はシーン別にハイブリッド展開すべき。",
    },
  },
  {
    icon: "💰",
    title: { zh: "DeepSeek: 80%质量 × 1/10成本", ja: "DeepSeek: 80%品質 × 1/10コスト" },
    body: {
      zh: "DeepSeek V3在多数场景达到Claude 80%的输出质量，但API成本仅为Claude的1/10。数据不出境时，性价比无可匹敌。",
      ja: "DeepSeek V3は多くのシーンでClaudeの80%品質を達成し、コストは1/10。データが越境しなければコスパは無敵。",
    },
  },
  {
    icon: "🇯🇵",
    title: { zh: "Qwen日语IT术语精准度领先", ja: "QwenのIT用語日本語精度がトップ" },
    body: {
      zh: "在IT专业术语的日语翻译场景中，Qwen 2.5的准确度超过Gemini和Grok。中文语料训练使其在技术文档场景有独特优势。",
      ja: "IT専門用語の日本語翻訳シーンで、Qwen 2.5の精度がGeminiとGrokを上回った。中国語学習データが技術文書シーンで独自優位性を持つ。",
    },
  },
];

const T = {
  zh: {
    title: "BRIDGE", subtitle: "中日AI生态翻译器",
    tagline: "哪个AI最适合你的业务？",
    selectScenario: "选择你的核心业务场景",
    constraintTitle: "设定约束条件",
    budget: "预算偏好", budgetOptions: ["成本优先", "均衡", "质量优先"],
    dataResidency: "数据能否出境？",
    yes: "可以出境", no: "不能出境（需本地部署）",
    japaneseReq: "日语能力要求",
    japaneseOptions: ["必须（S/A级）", "优先", "无要求"],
    getRecommendation: "获取推荐方案",
    back: "← 返回",
    recommended: "推荐方案",
    score: "场景评分", matchScore: "综合匹配",
    priceLabel: "API价格 / 百万token",
    input: "输入", output: "输出",
    japaneseRating: "日语评级", localDeploy: "本地部署",
    strengths: "优势", weaknesses: "弱项",
    insights: "核心洞察",
    available: "支持", unavailable: "不支持",
    restart: "重新选择",
    noResults: "当前约束条件下无匹配模型，请放宽筛选条件",
  },
  ja: {
    title: "BRIDGE", subtitle: "中日AIエコシステム翻訳器",
    tagline: "あなたのビジネスに最適なAIは？",
    selectScenario: "コアビジネスシーンを選択",
    constraintTitle: "制約条件を設定",
    budget: "予算の優先度", budgetOptions: ["コスト優先", "バランス", "品質優先"],
    dataResidency: "データの越境は可能ですか？",
    yes: "可能（クラウドOK）", no: "不可（ローカル必須）",
    japaneseReq: "日本語能力の要件",
    japaneseOptions: ["必須（S/Aクラス）", "優先", "不要"],
    getRecommendation: "推薦を取得",
    back: "← 戻る",
    recommended: "推薦モデル",
    score: "シーンスコア", matchScore: "総合マッチ",
    priceLabel: "API価格 / 百万トークン",
    input: "入力", output: "出力",
    japaneseRating: "日本語評価", localDeploy: "ローカルデプロイ",
    strengths: "強み", weaknesses: "弱点",
    insights: "主要インサイト",
    available: "対応", unavailable: "非対応",
    restart: "最初から選ぶ",
    noResults: "現在の制約条件に合うモデルがありません。条件を緩和してください",
  },
};

// ── ヘルパー関数 ─────────────────────────────────────────────
function computeMatchScore(model, scenario, constraints) {
  const scenarioScore = model.scores[scenario] / 5;

  let budgetScore;
  if (constraints.budget === 0) {
    budgetScore = model.price_tier === "budget" ? 1 : model.price_tier === "medium" ? 0.5 : 0.15;
  } else if (constraints.budget === 2) {
    budgetScore = model.price_tier === "premium" ? 1 : model.price_tier === "medium" ? 0.75 : 0.5;
  } else {
    budgetScore = model.price_tier === "medium" ? 1 : model.price_tier === "budget" ? 0.8 : 0.6;
  }

  let jpScore;
  if (constraints.japaneseReq === 0) {
    jpScore = model.japanese_rating === "S" ? 1 : model.japanese_rating === "A" ? 0.6 : 0;
  } else if (constraints.japaneseReq === 1) {
    jpScore = model.japanese_rating === "S" ? 1 : model.japanese_rating === "A" ? 0.85 : 0.5;
  } else {
    jpScore = 1;
  }

  return Math.round((scenarioScore * 0.45 + budgetScore * 0.3 + jpScore * 0.25) * 100);
}

function ScoreDots({ score }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-sm ${i <= score ? "bg-amber-400" : "bg-zinc-700"}`}
        />
      ))}
    </div>
  );
}

function RatingBadge({ rating }) {
  const colors = {
    S: "bg-amber-400 text-zinc-900",
    A: "bg-amber-600/40 text-amber-300 border border-amber-600/50",
    B: "bg-zinc-700 text-zinc-300 border border-zinc-600",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-bold font-mono ${colors[rating]}`}>
      {rating}
    </span>
  );
}

// ── サブコンポーネント ──────────────────────────────────────
function ScenarioCard({ scenario, lang, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 hover:bg-zinc-800 transition-all duration-200 p-6 text-left w-full"
    >
      <div className="text-3xl mb-3">{scenario.icon}</div>
      <div className="text-lg font-bold text-zinc-100 font-mono mb-2 group-hover:text-amber-400 transition-colors">
        {scenario.label[lang]}
      </div>
      <div className="text-xs text-zinc-500 leading-relaxed">{scenario.desc[lang]}</div>
    </button>
  );
}

function ModelCard({ model, scenario, lang, matchScore, rank }) {
  const t = T[lang];
  const isTop = rank === 1;

  return (
    <div
      className={`bg-zinc-900 border transition-all duration-200 p-6 ${
        isTop
          ? "border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
          : "border-zinc-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          {isTop && (
            <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase mb-1">
              # {rank} RECOMMENDED
            </div>
          )}
          {!isTop && (
            <div className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mb-1">
              # {rank}
            </div>
          )}
          <div className="text-xl font-bold text-zinc-100 font-mono">{model.name}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{model.provider}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{t.matchScore}</div>
          <div
            className={`text-2xl font-black font-mono ${
              matchScore >= 75 ? "text-amber-400" : matchScore >= 55 ? "text-amber-600" : "text-zinc-500"
            }`}
          >
            {matchScore}
          </div>
        </div>
      </div>

      {/* Score + Ratings Row */}
      <div className="grid grid-cols-3 gap-4 mb-5 pb-5 border-b border-zinc-800">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.score}</div>
          <ScoreDots score={model.scores[scenario]} />
          <div className="text-xs text-zinc-400 mt-1 font-mono">{model.scores[scenario]} / 5</div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.japaneseRating}</div>
          <RatingBadge rating={model.japanese_rating} />
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.localDeploy}</div>
          <span
            className={`text-xs font-mono ${
              model.local_deploy ? "text-amber-400" : "text-zinc-600"
            }`}
          >
            {model.local_deploy ? t.available : t.unavailable}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-5 pb-5 border-b border-zinc-800">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.priceLabel}</div>
        <div className="flex gap-4 font-mono text-sm">
          <span className="text-zinc-400">
            <span className="text-zinc-600 text-xs mr-1">{t.input}</span>
            <span className="text-amber-400">{model.price_input}</span>
          </span>
          <span className="text-zinc-400">
            <span className="text-zinc-600 text-xs mr-1">{t.output}</span>
            <span className="text-amber-400">{model.price_output}</span>
          </span>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.strengths}</div>
          <ul className="space-y-1">
            {model.strengths[lang].map((s, i) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-1.5">
                <span className="text-amber-400 mt-0.5 shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{t.weaknesses}</div>
          <ul className="space-y-1">
            {model.weaknesses[lang].map((w, i) => (
              <li key={i} className="text-xs text-zinc-400 flex gap-1.5">
                <span className="text-zinc-600 mt-0.5 shrink-0">−</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className={`mt-4 p-3 border-l-2 text-xs leading-relaxed ${
        isTop
          ? "border-amber-500 bg-amber-500/5 text-amber-200/80"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
      }`}>
        {model.summary[lang]}
      </div>
    </div>
  );
}

function InsightCard({ insight, lang }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6">
      <div className="text-2xl mb-3">{insight.icon}</div>
      <div className="text-sm font-bold text-amber-400 font-mono mb-2">{insight.title[lang]}</div>
      <div className="text-xs text-zinc-400 leading-relaxed">{insight.body[lang]}</div>
    </div>
  );
}

// ── メインコンポーネント ────────────────────────────────────
export default function Bridge() {
  const [lang, setLang] = useState("zh");
  const [step, setStep] = useState("home");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [constraints, setConstraints] = useState({
    budget: 1,          // 0=cost, 1=balanced, 2=quality
    dataResidency: false, // true = must stay local
    japaneseReq: 2,     // 0=required S/A, 1=preferred, 2=none
  });

  const t = T[lang];

  // 推荐逻辑
  const getRecommendations = () => {
    let filtered = MODELS;

    // 数据不能出境 → 只保留支持本地部署的
    if (constraints.dataResidency) {
      filtered = filtered.filter((m) => m.local_deploy);
    }

    // 日语必须S/A → 过滤B级
    if (constraints.japaneseReq === 0) {
      filtered = filtered.filter((m) => m.japanese_rating !== "B");
    }

    // 按匹配分排序
    return filtered
      .map((m) => ({
        ...m,
        matchScore: computeMatchScore(m, selectedScenario, constraints),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleScenarioSelect = (scenarioId) => {
    setSelectedScenario(scenarioId);
    setStep("constraints");
  };

  const handleGetRecommendation = () => {
    setStep("results");
  };

  const handleRestart = () => {
    setSelectedScenario(null);
    setConstraints({ budget: 1, dataResidency: false, japaneseReq: 2 });
    setStep("home");
  };

  const scenarioLabel = selectedScenario
    ? SCENARIOS.find((s) => s.id === selectedScenario)?.label[lang]
    : "";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <span className="font-mono font-black text-xl text-amber-400 tracking-widest">{t.title}</span>
            <span className="ml-3 text-xs text-zinc-500 hidden sm:inline">{t.subtitle}</span>
          </div>
          <button
            onClick={() => setLang(lang === "zh" ? "ja" : "zh")}
            className="font-mono text-xs border border-zinc-700 hover:border-amber-500/60 text-zinc-400 hover:text-amber-400 px-3 py-1.5 transition-all duration-200"
          >
            {lang === "zh" ? "日本語" : "中文"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20">

        {/* ══════════════════════════════════════════════ HOME */}
        {step === "home" && (
          <>
            {/* Hero */}
            <div className="py-16 text-center border-b border-zinc-800 mb-12">
              <div className="text-[10px] font-mono text-amber-400 tracking-[0.4em] uppercase mb-4">
                6 MODELS × 4 SCENARIOS × REAL BENCHMARK DATA
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-100 mb-4 tracking-tight">
                {t.tagline}
              </h1>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">{t.subtitle}</p>
            </div>

            {/* Scenario Selection */}
            <section className="mb-16">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-6">
                STEP 01 — {t.selectScenario}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SCENARIOS.map((s) => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    lang={lang}
                    onClick={() => handleScenarioSelect(s.id)}
                  />
                ))}
              </div>
            </section>

            {/* Insights */}
            <section>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-6">
                {t.insights}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {INSIGHTS.map((ins, i) => (
                  <InsightCard key={i} insight={ins} lang={lang} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ══════════════════════════════════════════════ CONSTRAINTS */}
        {step === "constraints" && (
          <div className="py-10 max-w-xl mx-auto">
            <button
              onClick={() => setStep("home")}
              className="text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors mb-8 block"
            >
              {t.back}
            </button>

            <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase mb-2">
              STEP 02 — {t.constraintTitle}
            </div>
            <div className="text-xs text-zinc-500 mb-8 font-mono">
              {scenarioLabel}
            </div>

            <div className="space-y-8">
              {/* Budget */}
              <div>
                <div className="text-sm font-semibold text-zinc-300 mb-3">{t.budget}</div>
                <div className="flex gap-2">
                  {t.budgetOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setConstraints((c) => ({ ...c, budget: i }))}
                      className={`flex-1 py-2.5 text-xs font-mono border transition-all duration-150 ${
                        constraints.budget === i
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Residency */}
              <div>
                <div className="text-sm font-semibold text-zinc-300 mb-3">{t.dataResidency}</div>
                <div className="flex gap-2">
                  {[t.yes, t.no].map((opt, i) => {
                    const val = i === 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setConstraints((c) => ({ ...c, dataResidency: val }))}
                        className={`flex-1 py-2.5 text-xs font-mono border transition-all duration-150 ${
                          constraints.dataResidency === val
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Japanese Requirement */}
              <div>
                <div className="text-sm font-semibold text-zinc-300 mb-3">{t.japaneseReq}</div>
                <div className="flex gap-2">
                  {t.japaneseOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setConstraints((c) => ({ ...c, japaneseReq: i }))}
                      className={`flex-1 py-2.5 text-xs font-mono border transition-all duration-150 ${
                        constraints.japaneseReq === i
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleGetRecommendation}
                className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-900 font-bold font-mono text-sm py-3.5 transition-all duration-200 mt-2"
              >
                {t.getRecommendation} →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════ RESULTS */}
        {step === "results" && (() => {
          const recommendations = getRecommendations();
          return (
            <div className="py-10">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 tracking-widest uppercase mb-1">
                    STEP 03 — {t.recommended}
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">{scenarioLabel}</div>
                </div>
                <button
                  onClick={handleRestart}
                  className="text-xs font-mono text-zinc-500 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/60 px-3 py-1.5 transition-all"
                >
                  {t.restart}
                </button>
              </div>

              <div className="mt-8">
                {recommendations.length === 0 ? (
                  <div className="text-center text-zinc-500 text-sm py-12 border border-zinc-800">
                    {t.noResults}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recommendations.map((model, i) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        scenario={selectedScenario}
                        lang={lang}
                        matchScore={model.matchScore}
                        rank={i + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-6 text-center">
        <div className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          BRIDGE · Yang Hao · April 2026 · Based on real benchmark data
        </div>
      </footer>
    </div>
  );
}
