import React, { useState, useMemo } from 'react';
import { BilingualPair, IdentifiedNaTerm, AIConfig } from '../types';
import {
  generateTsvExportFileName,
  downloadTextFile
} from '../utils/fileUtils';
import {
  Search,
  CheckCircle2,
  Tag,
  FileText,
  Sparkles,
  ArrowRight,
  Filter,
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  Hash,
  ExternalLink,
  Layers,
  Edit3,
  Check,
  Cpu,
  Settings2,
  Download,
  Copy,
  FileSpreadsheet
} from 'lucide-react';

interface StepOneInventoryProps {
  pairs: BilingualPair[];
  onConfirmAndProceedToStepTwo: () => void;
  onUpdatePair: (pair: BilingualPair) => void;
  isAnnotatingStepTwo: boolean;
  aiConfig?: AIConfig;
  onOpenAIConfig?: () => void;
  sourceFileName?: string;
}

export const StepOneInventory: React.FC<StepOneInventoryProps> = ({
  pairs,
  onConfirmAndProceedToStepTwo,
  onUpdatePair,
  isAnnotatingStepTwo,
  aiConfig,
  onOpenAIConfig,
  sourceFileName
}) => {
  const [selectedTermFilter, setSelectedTermFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [editChineseText, setEditChineseText] = useState('');
  const [copiedTerms, setCopiedTerms] = useState(false);

  // Extract all <Na> terms and sentence mapping
  const {
    targetPairs,
    termsList,
    totalNaCount,
    multiNaSentencesCount
  } = useMemo(() => {
    const naRegex = /<Na>([\s\S]*?)<\/Na>/gi;
    const termMap = new Map<string, IdentifiedNaTerm>();
    const locatedPairs: BilingualPair[] = [];
    let totalNa = 0;
    let multiCount = 0;

    pairs.forEach((p) => {
      const matches = [...(p.chinese || '').matchAll(/<Na>([\s\S]*?)<\/Na>/gi)];
      if (matches && matches.length > 0) {
        locatedPairs.push(p);
        totalNa += matches.length;
        if (matches.length > 1) {
          multiCount++;
        }

        matches.forEach((m) => {
          const rawTerm = m[1].trim();
          if (!rawTerm) return;
          const cur = termMap.get(rawTerm) || {
            term: rawTerm,
            occurrences: 0,
            sentenceIndices: [],
            pairIds: []
          };
          cur.occurrences++;
          if (!cur.sentenceIndices.includes(p.pairIndex)) {
            cur.sentenceIndices.push(p.pairIndex);
          }
          if (!cur.pairIds.includes(p.id)) {
            cur.pairIds.push(p.id);
          }
          termMap.set(rawTerm, cur);
        });
      }
    });

    const sortedTerms = Array.from(termMap.values()).sort((a, b) => b.occurrences - a.occurrences);

    return {
      targetPairs: locatedPairs,
      termsList: sortedTerms,
      totalNaCount: totalNa,
      multiNaSentencesCount: multiCount
    };
  }, [pairs]);

  // Filtered target pairs
  const filteredTargetPairs = useMemo(() => {
    return targetPairs.filter((p) => {
      if (selectedTermFilter) {
        const hasTerm = p.chinese.includes(`<Na>${selectedTermFilter}</Na>`) || p.chinese.includes(selectedTermFilter);
        if (!hasTerm) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchZh = p.chinese.toLowerCase().includes(q);
        const matchEn = p.english.toLowerCase().includes(q);
        if (!matchZh && !matchEn) return false;
      }
      return true;
    });
  }, [targetPairs, selectedTermFilter, searchQuery]);

  const handleStartEdit = (pair: BilingualPair) => {
    setEditingPairId(pair.id);
    setEditChineseText(pair.chinese);
  };

  const handleSaveEdit = (pair: BilingualPair) => {
    onUpdatePair({
      ...pair,
      chinese: editChineseText
    });
    setEditingPairId(null);
  };

  const handleCopyTermsTsv = () => {
    if (termsList.length === 0) return;
    const headers = ['序号', '数字式缩略语', '出现频次', '涵盖句对编号'];
    const rows = termsList.map((t, idx) => [
      idx + 1,
      t.term,
      t.occurrences,
      t.sentenceIndices.map((i) => `#${i}`).join('; ')
    ]);
    const textContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(textContent);
    setCopiedTerms(true);
    setTimeout(() => setCopiedTerms(false), 2000);
  };

  const handleDownloadTermsTsv = () => {
    if (termsList.length === 0) return;
    const headers = ['序号', '数字式缩略语', '出现频次', '涵盖句对编号'];
    const rows = termsList.map((t, idx) => [
      idx + 1,
      t.term,
      t.occurrences,
      t.sentenceIndices.map((i) => `#${i}`).join('; ')
    ]);
    const textContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const fileName = generateTsvExportFileName(sourceFileName, 'Natrans缩略语定位清单');
    downloadTextFile(textContent, fileName);
  };

  return (
    <div id="step-one-inventory-container" className="space-y-5">
      {/* Step 1 Hero / Action Confirmation Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-5 md:p-6 shadow-md border border-blue-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 border border-blue-300/40 text-blue-200 text-xs font-mono font-bold tracking-wider uppercase">
                第一步：缩略语识别与定位清单
              </span>
              <span className="text-xs text-blue-200 font-mono">
                Step 1: Term Identification &amp; Sentence Localization
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              已扫描并定位语料中的数字式缩略语及关联汉英句对
            </h2>
            <p className="text-xs md:text-sm text-blue-100/90 leading-relaxed">
              系统根据“&lt;Na&gt;...&lt;/Na&gt;”标注规则对语料执行穷尽式扫描，已为您提取并生成下方两份核验清单。请您审核确认无误后，点击右侧按钮启动第二步译文技巧标注。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* AI API Config Pill Before Triggering */}
            {onOpenAIConfig && aiConfig && (
              <button
                type="button"
                onClick={onOpenAIConfig}
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-950/90 border border-blue-400/40 text-blue-100 text-xs transition-colors cursor-pointer"
                title="点击在启动前调整 AI 模型与推理参数"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI 底座:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {aiConfig.model === 'custom'
                      ? aiConfig.customModelName || 'Custom'
                      : aiConfig.model}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-200 opacity-90 border-l border-blue-400/30 pl-2">
                  <Settings2 className="w-3 h-3" />
                  <span>配置</span>
                </div>
              </button>
            )}

            <button
              id="btn-confirm-step-one"
              type="button"
              disabled={targetPairs.length === 0 || isAnnotatingStepTwo}
              onClick={onConfirmAndProceedToStepTwo}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 group cursor-pointer"
            >
              {isAnnotatingStepTwo ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>正在执行第二步技巧标注...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
                  <span>确认清单无误，启动第二步技巧标注</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <div className="text-[11px] text-blue-200 text-center lg:text-right">
              🎯 目标：对锁定的 <strong className="text-white font-mono">{targetPairs.length}</strong> 重点句 · <strong className="text-white font-mono">{totalNaCount}</strong> 项缩略语启动英译策略识别
            </div>
          </div>
        </div>
      </div>

      {/* Step 1 Key Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>载入语料总句数</span>
            <FileText className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">
            {pairs.length} <span className="text-xs font-normal text-stone-400 font-sans">句对</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">全量双语对齐语料库规模</div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>锁定含缩略语句对</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {targetPairs.length} <span className="text-xs font-normal text-stone-400 font-sans">句</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {multiNaSentencesCount > 0 ? `含 ${multiNaSentencesCount} 个复合多缩略语句` : '单句单缩略语'}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>数字缩略语实体频次</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
            {totalNaCount} <span className="text-xs font-normal text-stone-400 font-sans">个实体</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            &lt;Na&gt;...&lt;/Na&gt; 出现总数
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>缩略语独立词条数</span>
            <Hash className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {termsList.length} <span className="text-xs font-normal text-stone-400 font-sans">种术语</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">去重后唯一缩略语类型</div>
        </div>
      </div>

      {/* Checklist 1: Identified Numerical Abbreviations Inventory Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>第一步清单（一）：识别提取的数字式缩略语清单</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  共提取 {termsList.length} 种术语 · 出现 {totalNaCount} 次
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                点击下方缩略语词条可快速在句对清单中进行定向筛选定位
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedTermFilter && (
              <button
                type="button"
                onClick={() => setSelectedTermFilter(null)}
                className="text-xs px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 flex items-center gap-1 self-start"
              >
                <span>清除筛选: <strong>{selectedTermFilter}</strong></span>
                <span className="font-bold">×</span>
              </button>
            )}

            {termsList.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyTermsTsv}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
                  title="复制缩略语清单为制表符格式"
                >
                  {copiedTerms ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTerms ? '已复制' : '复制清单'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTermsTsv}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
                  title="导出缩略语清单 (.tsv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>下载清单 (.tsv)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {termsList.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            未在当前语料中检测到含有 &lt;Na&gt; 标签的数字式缩略语，请检查上传文档或手动添加 &lt;Na&gt;...&lt;/Na&gt; 标记。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {termsList.map((item) => {
              const isSelected = selectedTermFilter === item.term;
              return (
                <div
                  key={item.term}
                  onClick={() => setSelectedTermFilter(isSelected ? null : item.term)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1">
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">&lt;Na&gt;</span>
                      {item.term}
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">&lt;/Na&gt;</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                      {item.occurrences} 次
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    <span>关联句对:</span>
                    <span className="font-mono text-stone-700 dark:text-stone-300">
                      #{item.sentenceIndices.join(', #')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checklist 2: Located Bilingual Sentence Pairs Inventory */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>第一步清单（二）：定位的汉英对齐句对核验清单</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  显示 {filteredTargetPairs.length} / {targetPairs.length} 个重点句对
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                高亮显示各句中的 &lt;Na&gt; 实体标签与对应的英文译文，您可直接核验或微调
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索定位句对内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 w-44 lg:w-56 focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pairs List / Table */}
        {filteredTargetPairs.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            未找到符合筛选条件的定位句对
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTargetPairs.map((pair) => {
              const naMatches = (pair.chinese || '').match(/<Na>[\s\S]*?<\/Na>/g);
              const naCount = naMatches ? naMatches.length : 0;
              const isEditing = editingPairId === pair.id;

              return (
                <div
                  key={pair.id}
                  id={`step-one-pair-${pair.pairIndex}`}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 hover:border-stone-300 dark:hover:border-stone-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                        #{pair.pairIndex}
                      </span>
                      {naCount > 1 ? (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono text-[11px] font-semibold">
                          🎯 复合重点句 (含 {naCount} 项缩略语)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono text-[11px] font-semibold">
                          🎯 包含 1 项缩略语
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(pair)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          保存标签修改
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pair)}
                          className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs flex items-center gap-1"
                          title="编辑修改此句中的 <Na> 标签"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>调整&lt;Na&gt;</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chinese source content */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-stone-400 flex items-center justify-between">
                      <span>中文源文（含 &lt;Na&gt; 实体定位）：</span>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editChineseText}
                        onChange={(e) => setEditChineseText(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-stone-900 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        rows={2}
                      />
                    ) : (
                      <div className="text-xs md:text-sm text-stone-900 dark:text-stone-100 leading-relaxed bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200/80 dark:border-stone-800">
                        {renderChineseWithHighlights(pair.chinese)}
                      </div>
                    )}
                  </div>

                  {/* English target translation */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-stone-400">
                      <span>对应英文译文（待第二步执行技巧识别）：</span>
                    </div>
                    <div className="text-xs md:text-sm text-stone-700 dark:text-stone-300 font-serif leading-relaxed bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200/80 dark:border-stone-800">
                      {pair.english}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom confirmation action bar */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            第一步核验无误后，点击确认即可启动大模型对全量锁定句对的英译技巧进行自动化深度分类与闭合标注。
          </div>
          <button
            type="button"
            disabled={targetPairs.length === 0 || isAnnotatingStepTwo}
            onClick={onConfirmAndProceedToStepTwo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <CheckSquare className="w-4 h-4" />
            <span>确认第一步清单，进入第二步标注</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility function to render Chinese with highlighted <Na> tags
function renderChineseWithHighlights(text: string) {
  if (!text) return text;
  const parts: React.ReactNode[] = [];
  const regex = /<Na>([\s\S]*?)<\/Na>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 font-bold text-xs"
      >
        <span className="text-[10px] text-indigo-500 font-mono mr-0.5">&lt;Na&gt;</span>
        {match[1]}
        <span className="text-[10px] text-indigo-500 font-mono ml-0.5">&lt;/Na&gt;</span>
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
