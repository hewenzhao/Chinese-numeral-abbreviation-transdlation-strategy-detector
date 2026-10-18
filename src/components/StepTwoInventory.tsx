import React, { useState, useMemo } from 'react';
import {
  BilingualPair,
  AnnotationStats,
  TranslationTechnique,
  TECHNIQUE_METAS,
  AIConfig,
  TargetLanguage,
  TARGET_LANGUAGES
} from '../types';
import {
  generateTsvExportFileName,
  downloadTextFile
} from '../utils/fileUtils';
import { BilingualPairCard } from './BilingualPairCard';
import { StatsPanel } from './StatsPanel';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ListOrdered,
  FileCheck2,
  RotateCcw,
  ArrowLeft,
  Download,
  Copy,
  Check,
  Tag,
  BookOpen,
  LayoutGrid,
  List,
  AlertCircle,
  Cpu,
  Settings2,
  FileSpreadsheet,
  Languages
} from 'lucide-react';

interface StepTwoInventoryProps {
  pairs: BilingualPair[];
  stats: AnnotationStats;
  onStartAnnotation: () => void;
  onUpdatePair: (pair: BilingualPair) => void;
  onAnnotateSingle: (pair: BilingualPair) => void;
  annotatingPairIds: Set<string>;
  isAnnotating: boolean;
  onReturnToStepOne: () => void;
  onOpenExportModal: () => void;
  selectedTechnique: TranslationTechnique | null;
  onSelectTechnique: (tech: TranslationTechnique | null) => void;
  aiConfig?: AIConfig;
  onOpenAIConfig?: () => void;
  sourceFileName?: string;
  targetLanguage?: TargetLanguage;
}

export const StepTwoInventory: React.FC<StepTwoInventoryProps> = ({
  pairs,
  stats,
  onStartAnnotation,
  onUpdatePair,
  onAnnotateSingle,
  annotatingPairIds,
  isAnnotating,
  onReturnToStepOne,
  onOpenExportModal,
  selectedTechnique,
  onSelectTechnique,
  aiConfig,
  onOpenAIConfig,
  sourceFileName,
  targetLanguage = 'en'
}) => {
  const langInfo = TARGET_LANGUAGES[targetLanguage] || TARGET_LANGUAGES.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'bilingual_cards'>('inventory');
  const [copied, setCopied] = useState(false);

  // Collect all detected terms with sentence context
  const fullTechniqueInventory = useMemo(() => {
    const list: {
      id: string;
      pairIndex: number;
      chineseTerm: string;
      englishTranslation: string;
      technique: TranslationTechnique;
      explanation: string;
      pair: BilingualPair;
    }[] = [];

    pairs.forEach((p) => {
      if (Array.isArray(p.detectedTerms)) {
        p.detectedTerms.forEach((t) => {
          list.push({
            id: `${p.id}-${t.id || t.chineseTerm}`,
            pairIndex: p.pairIndex,
            chineseTerm: t.chineseTerm,
            englishTranslation: t.englishTranslation,
            technique: t.technique,
            explanation: t.explanation,
            pair: p
          });
        });
      }
    });

    return list;
  }, [pairs]);

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return fullTechniqueInventory.filter((item) => {
      if (selectedTechnique && item.technique !== selectedTechnique) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchZh = item.chineseTerm.toLowerCase().includes(q);
        const matchEn = item.englishTranslation.toLowerCase().includes(q);
        const matchExp = (item.explanation || '').toLowerCase().includes(q);
        if (!matchZh && !matchEn && !matchExp) return false;
      }
      return true;
    });
  }, [fullTechniqueInventory, selectedTechnique, searchQuery]);

  // Filtered pairs for cards view
  const filteredPairs = useMemo(() => {
    return pairs.filter((p) => {
      if (selectedTechnique) {
        const hasTech = p.detectedTerms?.some((t) => t.technique === selectedTechnique);
        const hasTag =
          p.annotatedEnglish?.includes(`<Natrans-${selectedTechnique}>`) ||
          p.annotatedEnglish?.includes(`<NuTrans-${selectedTechnique}>`);
        if (!hasTech && !hasTag) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchZh = p.chinese.toLowerCase().includes(q);
        const matchEn = p.english.toLowerCase().includes(q);
        const matchAnnotated = (p.annotatedEnglish || '').toLowerCase().includes(q);
        if (!matchZh && !matchEn && !matchAnnotated) return false;
      }
      return true;
    });
  }, [pairs, selectedTechnique, searchQuery]);

  // Copy technique inventory table as TSV/Text for spreadsheets/papers
  const handleCopyInventoryTable = () => {
    if (fullTechniqueInventory.length === 0) return;
    const headers = ['序号', '句对编号', '汉语数字缩略语', `${langInfo.name}对应译法`, '翻译技巧类别', '学术判定依据'];
    const rows = fullTechniqueInventory.map((item, idx) => [
      idx + 1,
      `#${item.pairIndex}`,
      item.chineseTerm,
      item.englishTranslation,
      `${item.technique} (${TECHNIQUE_METAS[item.technique]?.name || ''})`,
      item.explanation || ''
    ]);
    const textContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download technique inventory table as .tsv file with source file name prefix
  const handleDownloadInventoryTsv = () => {
    if (fullTechniqueInventory.length === 0) return;
    const headers = ['序号', '句对编号', '汉语数字缩略语', `${langInfo.name}对应译法`, '翻译技巧类别', '学术判定依据'];
    const rows = fullTechniqueInventory.map((item, idx) => [
      idx + 1,
      `#${item.pairIndex}`,
      item.chineseTerm,
      item.englishTranslation,
      `${item.technique} (${TECHNIQUE_METAS[item.technique]?.name || ''})`,
      item.explanation || ''
    ]);
    const textContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    const fileName = generateTsvExportFileName(sourceFileName, `Natrans_${langInfo.code.toUpperCase()}_翻译技巧清单`);
    downloadTextFile(textContent, fileName);
  };

  const isCompleted = stats.totalTerms > 0 && !isAnnotating;

  return (
    <div id="step-two-inventory-container" className="space-y-5">
      {/* Step 2 Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-indigo-950 text-white rounded-xl p-5 md:p-6 shadow-md border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase">
                第二步：{langInfo.name}翻译技巧识别与标注清单
              </span>
              <span className="text-xs text-stone-300 font-mono">
                Step 2: {langInfo.englishName} Translation Technique Annotation
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isAnnotating
                ? `大模型正在执行全量缩略语${langInfo.name}译文技巧识别与独立闭合包裹...`
                : isCompleted
                ? `第二步标注完毕：已生成 ${stats.totalTerms} 项缩略语${langInfo.name}翻译技巧综合清单`
                : `第二步待启动：点击右侧按钮启动大模型${langInfo.name}技巧识别`}
            </h2>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              严格根据四类翻译技巧分类体系（I 直译 / II 意译 / III 直译+意译 / IV 仿拟借用），自动在{langInfo.name}译文中精准定位并用 &lt;Natrans-X&gt; 闭合包裹，同时生成学术计量统计与清单。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* AI API Config Pill */}
            {onOpenAIConfig && aiConfig && (
              <button
                type="button"
                onClick={onOpenAIConfig}
                className="inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-600/60 text-stone-200 text-xs transition-colors cursor-pointer"
                title="点击调整 AI 模型与推理参数"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI 底座:</span>
                  <span className="font-mono font-bold text-purple-300">
                    {aiConfig.model === 'custom'
                      ? aiConfig.customModelName || 'Custom'
                      : aiConfig.model}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-400 border-l border-stone-700 pl-2">
                  <Settings2 className="w-3 h-3" />
                  <span>配置</span>
                </div>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-return-step-one"
                type="button"
                onClick={onReturnToStepOne}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors"
                title="返回第一步查看或调整缩略语清单"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回第一步核对</span>
              </button>

              <button
                id="btn-trigger-step-two-annotation"
                type="button"
                disabled={isAnnotating}
                onClick={onStartAnnotation}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnnotating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>正在标注中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span>{isCompleted ? '重新执行第二步标注' : '一键启动第二步标注'}</span>
                  </>
                )}
              </button>
            </div>

            {isCompleted && (
              <button
                id="btn-export-from-step-two"
                type="button"
                onClick={onOpenExportModal}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出完整交付 Word 文档 (.docx)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Exhaustive Inventory Alignment Status Card */}
      <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                stats.totalTerms >= stats.sourceNaTotalTermsCount && stats.sourceNaTotalTermsCount > 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40'
              }`}
            >
              {stats.totalTerms >= stats.sourceNaTotalTermsCount && stats.sourceNaTotalTermsCount > 0 ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {stats.totalTerms >= stats.sourceNaTotalTermsCount && stats.sourceNaTotalTermsCount > 0
                    ? '100% 穷尽标注已达成'
                    : '技巧标注进度核验'}
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    stats.totalTerms >= stats.sourceNaTotalTermsCount && stats.sourceNaTotalTermsCount > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
                  }`}
                >
                  已标注 {stats.totalTerms} 项 / 第一步清单共 {stats.sourceNaTotalTermsCount} 项
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {stats.totalTerms >= stats.sourceNaTotalTermsCount && stats.sourceNaTotalTermsCount > 0
                  ? `第一步识别核验的 ${stats.sourceNaTotalTermsCount} 项数字缩略语已全部在第二步完成英译技巧分类与独立闭合标注。`
                  : `尚有 ${Math.max(0, stats.sourceNaTotalTermsCount - stats.totalTerms)} 项缩略语待完成译法技巧识别，请点击右侧按钮执行穷尽标注。`}
              </p>
            </div>
          </div>

          {stats.totalTerms < stats.sourceNaTotalTermsCount && (
            <button
              type="button"
              disabled={isAnnotating}
              onClick={onStartAnnotation}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>一键穷尽补全标注</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistical Summary Panel */}
      <StatsPanel
        stats={stats}
        selectedTechnique={selectedTechnique}
        onSelectTechnique={onSelectTechnique}
      />

      {/* View Switcher and Search/Filter Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>翻译技巧清单明细表 ({fullTechniqueInventory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bilingual_cards')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bilingual_cards'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>双语对齐标注句对视图 ({filteredPairs.length})</span>
          </button>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索术语、译法或判定理由..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 w-48 lg:w-60 focus:outline-none focus:ring-1 focus:ring-stone-900"
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

          {activeTab === 'inventory' && fullTechniqueInventory.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyInventoryTable}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
                title="复制表格数据为制表符格式（可直接粘贴至 Excel/Word/论文）"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制清单'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadInventoryTsv}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
                title="以提交文件名为前缀导出制表符分隔表格文件 (.tsv)，可在 Excel 中直接打开"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>下载清单 (.tsv)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab 1: Comprehensive Technique Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>第二步产出：翻译技巧识别与标注综合清单（共计 {filteredInventory.length} 项）</span>
            </h3>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              包含缩略语、英译对应词句、技巧代码及大模型学术判据
            </span>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs space-y-2">
              <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
              <div className="font-semibold text-stone-700 dark:text-stone-300">
                {isAnnotating ? '正在生成标注清单，请稍候...' : '暂无标注技巧数据'}
              </div>
              <div className="text-stone-400">
                请点击上方「一键启动第二步标注」按钮启动大模型执行技巧识别。
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 font-bold w-12 text-center">序号</th>
                    <th className="py-2.5 px-3 font-bold w-16 text-center">句对</th>
                    <th className="py-2.5 px-3 font-bold w-36">汉语数字缩略语</th>
                    <th className="py-2.5 px-3 font-bold w-52">英译对应片段</th>
                    <th className="py-2.5 px-3 font-bold w-32">翻译技巧类别</th>
                    <th className="py-2.5 px-3 font-bold">学术判定依据与策略说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {filteredInventory.map((item, idx) => {
                    const meta = TECHNIQUE_METAS[item.technique] || TECHNIQUE_METAS.I;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-stone-400">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[11px]">
                            #{item.pairIndex}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100">
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">&lt;Na&gt;</span>
                          {item.chineseTerm}
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">&lt;/Na&gt;</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-800 dark:text-stone-200">
                          <span className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder}`}>
                            {item.englishTranslation}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono ${meta.badgeBg} ${meta.badgeText} border ${meta.badgeBorder}`}>
                            {item.technique} - {meta.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                          {item.explanation || '符合该类翻译策略特征'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Tab 2: Bilingual Pair Cards View */}
      {activeTab === 'bilingual_cards' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
            <span>
              共展示 <strong className="text-stone-800 dark:text-stone-200">{filteredPairs.length}</strong> 个汉英对齐句对
            </span>
            <span>
              双语卡片支持单句重新分析与分类标签手工微调
            </span>
          </div>

          {filteredPairs.map((pair) => (
            <BilingualPairCard
              key={pair.id}
              pair={pair}
              onUpdatePair={onUpdatePair}
              onAnnotateSingle={onAnnotateSingle}
              isAnnotatingSingle={annotatingPairIds.has(pair.id)}
              activeFilterTech={selectedTechnique}
            />
          ))}
        </div>
      )}
    </div>
  );
};
