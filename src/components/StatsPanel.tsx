import React from 'react';
import { AnnotationStats, TECHNIQUE_METAS, TranslationTechnique } from '../types';
import { BarChart3, Tag, CheckCircle2, Layers, Compass, HelpCircle, FileCheck } from 'lucide-react';

interface StatsPanelProps {
  stats: AnnotationStats;
  selectedTechnique: TranslationTechnique | null;
  onSelectTechnique: (tech: TranslationTechnique | null) => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  stats,
  selectedTechnique,
  onSelectTechnique
}) => {
  const techniques: TranslationTechnique[] = ['I', 'II', 'III', 'IV'];

  // Coverage percentage
  const coveragePct = stats.sourceNaTotalTermsCount > 0
    ? Math.min(100, Math.round((stats.totalTerms / stats.sourceNaTotalTermsCount) * 100))
    : stats.totalPairs > 0
    ? Math.round((stats.annotatedPairs / stats.totalPairs) * 100)
    : 0;

  return (
    <div id="stats-summary-panel" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header with Title and Corpus Key Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>翻译技巧分布统计与学术计量分析</span>
              {stats.sourceNaTotalTermsCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-normal bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                  🎯 动态定位 {stats.sourceNaSentencesCount} 重点句 · {stats.sourceNaTotalTermsCount} 项 &lt;Na&gt; 实体
                </span>
              )}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              严格以中文“&lt;Na&gt;...&lt;/Na&gt;”标注为准绳，100% 穷尽识别英译技巧并独立闭合包裹
            </p>
          </div>
        </div>

        {/* Global Key Metrology Indicators */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5">
            <span className="text-stone-500 dark:text-stone-400">含缩略语句:</span>
            <strong className="text-indigo-600 dark:text-indigo-400 font-bold font-mono text-xs">
              {stats.sourceNaSentencesCount} 句
            </strong>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center gap-1.5">
            <span className="text-stone-500 dark:text-stone-400">缩略语总数:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-bold font-mono text-xs">
              {stats.sourceNaTotalTermsCount} 个实体
            </strong>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>已标注技巧: <strong className="font-mono">{stats.totalTerms}</strong> 项 ({coveragePct}%)</span>
          </div>
        </div>
      </div>

      {/* Analytical Detail Banner: Clarifying Sentence vs Term counts */}
      {stats.sourceNaSentencesCount > 0 && stats.sourceNaTotalTermsCount > stats.sourceNaSentencesCount && (
        <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>语料计量说明：</strong>
            当前载入语料中包含数字式缩略语的句子共 <span className="font-bold underline">{stats.sourceNaSentencesCount} 句</span>。
            其中包含 <span className="font-bold underline">{stats.multiNaSentencesCount} 个复合句</span>（即同一句中含有多个 &lt;Na&gt; 缩略语），
            故当前语料实际包含的数字式缩略语实体总数为 <span className="font-bold underline font-mono text-amber-700 dark:text-amber-300">{stats.sourceNaTotalTermsCount} 个</span>。
            系统以“&lt;Na&gt;...&lt;/Na&gt;”为唯一基准，已对全部 {stats.sourceNaTotalTermsCount} 个缩略语实体完成穷尽对齐与技巧标注。
          </div>
        </div>
      )}

      {/* 4 Techniques Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
          <span className="font-semibold text-stone-700 dark:text-stone-300">四大翻译技巧分布构成比（点击卡片可直接筛选对应句对）：</span>
          <span>基准总量: {stats.totalTerms || stats.sourceNaTotalTermsCount} 项</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {techniques.map((tech) => {
            const meta = TECHNIQUE_METAS[tech];
            const count = stats.counts[tech] || 0;
            const pct = stats.percentages[tech] || 0;
            const isSelected = selectedTechnique === tech;

            return (
              <div
                key={tech}
                id={`stat-card-${tech}`}
                onClick={() => onSelectTechnique(isSelected ? null : tech)}
                className={`cursor-pointer rounded-lg p-3 border transition-all text-left flex flex-col justify-between ${
                  meta.badgeBg
                } ${
                  isSelected
                    ? 'ring-2 ring-stone-900 dark:ring-stone-100 border-transparent shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold">{meta.tag}</span>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {tech} ({meta.name})
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                    {count}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">项 ({(pct).toFixed(0)}%)</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: `#${meta.docxHexColor}`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Term Inventory Table if terms exist */}
      {stats.termList && stats.termList.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-500" />
              数字缩略语术语翻译清单（共提取 {stats.termList.length} 种典型术语译对）
            </span>
            <span className="text-[11px] font-normal text-stone-500">按出现频次降序排列</span>
          </h4>
          <div className="max-h-52 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-lg text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 sticky top-0">
                <tr>
                  <th className="p-2 border-b border-stone-200 dark:border-stone-800 font-semibold">汉语数字缩略语</th>
                  <th className="p-2 border-b border-stone-200 dark:border-stone-800 font-semibold">对应英文译法</th>
                  <th className="p-2 border-b border-stone-200 dark:border-stone-800 font-semibold">翻译技巧类别</th>
                  <th className="p-2 border-b border-stone-200 dark:border-stone-800 font-semibold text-right">频次</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {stats.termList.map((item, idx) => {
                  const meta = TECHNIQUE_METAS[item.technique] || TECHNIQUE_METAS.I;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      <td className="p-2 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">&lt;Na&gt;</span>
                        {item.chineseTerm}
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">&lt;/Na&gt;</span>
                      </td>
                      <td className="p-2 text-stone-700 dark:text-stone-300 font-mono text-[11px]">{item.englishTranslation}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder}`}>
                          {item.technique} - {meta.name}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-stone-800 dark:text-stone-200">{item.occurrences}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
