import React, { useState, useMemo } from 'react';
import { BilingualPair, AnnotationStats, TranslationTechnique, WorkflowStep, AIConfig, DEFAULT_AI_CONFIG } from './types';
import { SAMPLE_CORPORA } from './data/sampleCorpus';
import { TaxonomyGuide } from './components/TaxonomyGuide';
import { FileUploadPanel } from './components/FileUploadPanel';
import { StepOneInventory } from './components/StepOneInventory';
import { StepTwoInventory } from './components/StepTwoInventory';
import { ExportModal } from './components/ExportModal';
import { ClearDataModal } from './components/ClearDataModal';
import { GuidelineModal } from './components/GuidelineModal';
import { AIConfigModal } from './components/AIConfigModal';
import {
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Layers,
  ArrowRight,
  FileCheck2,
  Tag,
  RefreshCw,
  BookOpen,
  Cpu,
  Settings2
} from 'lucide-react';

export default function App() {
  // Workflow Step: 1 = Abbreviation Identification & Sentence Localization; 2 = Translation Technique Annotation
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);

  // Initial state loaded with standard benchmark sample corpus
  const [pairs, setPairs] = useState<BilingualPair[]>(SAMPLE_CORPORA[0].pairs);
  const [corpusName, setCorpusName] = useState<string>(SAMPLE_CORPORA[0].name);
  const [selectedTechnique, setSelectedTechnique] = useState<TranslationTechnique | null>(null);
  const [isAnnotatingAll, setIsAnnotatingAll] = useState(false);
  const [annotatingPairIds, setAnnotatingPairIds] = useState<Set<string>>(new Set());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isGuidelineModalOpen, setIsGuidelineModalOpen] = useState(false);
  const [isAIConfigModalOpen, setIsAIConfigModalOpen] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  // AI Configuration State with LocalStorage Persistence
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem('nutrans_ai_config');
      if (saved) {
        return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load saved AI config:', e);
    }
    return DEFAULT_AI_CONFIG;
  });

  const handleSaveAIConfig = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    try {
      localStorage.setItem('nutrans_ai_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save AI config to localStorage:', e);
    }
    const displayName =
      newConfig.model === 'custom'
        ? newConfig.customModelName || '自定义模型'
        : newConfig.model;
    setGlobalMessage({
      type: 'success',
      text: `AI 配置已更新！当前选用模型：${displayName}（温度系数: ${newConfig.temperature}，批次大小: ${newConfig.batchSize} 句/批）。`
    });
  };

  // Source <Na> Metrics Calculation (Extracting ground truth from Chinese text)
  const { naPairsCount, naTotalTermsCount, multiNaSentencesCount } = useMemo(() => {
    let pairCount = 0;
    let termCount = 0;
    let multiCount = 0;

    pairs.forEach((p) => {
      const matches = (p.chinese || '').match(/<Na>[\s\S]*?<\/Na>/g);
      if (matches && matches.length > 0) {
        pairCount++;
        termCount += matches.length;
        if (matches.length > 1) {
          multiCount++;
        }
      }
    });

    return {
      naPairsCount: pairCount,
      naTotalTermsCount: termCount,
      multiNaSentencesCount: multiCount
    };
  }, [pairs]);

  // Compute live research statistics for Step 2
  const stats: AnnotationStats = useMemo(() => {
    const counts: Record<TranslationTechnique, number> = { I: 0, II: 0, III: 0, IV: 0 };
    let totalTerms = 0;
    let annotatedPairs = 0;
    const termMap = new Map<string, { chineseTerm: string; englishTranslation: string; technique: TranslationTechnique; occurrences: number; explanation?: string }>();

    pairs.forEach((p) => {
      if (p.status === 'completed' || p.annotatedEnglish) {
        annotatedPairs++;
      }
      if (Array.isArray(p.detectedTerms)) {
        p.detectedTerms.forEach((t) => {
          totalTerms++;
          if (counts[t.technique] !== undefined) {
            counts[t.technique]++;
          }
          const key = `${t.chineseTerm}___${t.englishTranslation}___${t.technique}`;
          const cur = termMap.get(key) || {
            chineseTerm: t.chineseTerm,
            englishTranslation: t.englishTranslation,
            technique: t.technique,
            occurrences: 0,
            explanation: t.explanation
          };
          cur.occurrences++;
          termMap.set(key, cur);
        });
      }
    });

    const percentages: Record<TranslationTechnique, number> = {
      I: totalTerms > 0 ? (counts.I / totalTerms) * 100 : 0,
      II: totalTerms > 0 ? (counts.II / totalTerms) * 100 : 0,
      III: totalTerms > 0 ? (counts.III / totalTerms) * 100 : 0,
      IV: totalTerms > 0 ? (counts.IV / totalTerms) * 100 : 0
    };

    const termList = Array.from(termMap.values()).sort((a, b) => b.occurrences - a.occurrences);

    return {
      totalPairs: pairs.length,
      annotatedPairs,
      sourceNaSentencesCount: naPairsCount,
      sourceNaTotalTermsCount: naTotalTermsCount,
      multiNaSentencesCount,
      totalTerms,
      counts,
      percentages,
      termList
    };
  }, [pairs, naPairsCount, naTotalTermsCount, multiNaSentencesCount]);

  // Load new pairs from upload or preset
  const handleLoadPairs = (newPairs: BilingualPair[], sourceName?: string) => {
    setPairs(newPairs);
    if (sourceName) setCorpusName(sourceName);
    setSelectedTechnique(null);
    setCurrentStep(1); // Return to step 1 for review
    setGlobalMessage({
      type: 'success',
      text: `已成功载入「${sourceName || '数据集'}」，共 ${newPairs.length} 个汉英句对。已自动生成第一步缩略语识别与定位清单。`
    });
  };

  // Update a single pair
  const handleUpdatePair = (updatedPair: BilingualPair) => {
    setPairs((prev) => prev.map((p) => (p.id === updatedPair.id ? updatedPair : p)));
  };

  // Annotate a single pair via Gemini API
  const handleAnnotateSingle = async (pairToAnnotate: BilingualPair) => {
    setAnnotatingPairIds((prev) => new Set(prev).add(pairToAnnotate.id));
    setPairs((prev) =>
      prev.map((p) => (p.id === pairToAnnotate.id ? { ...p, status: 'annotating' } : p))
    );

    try {
      const res = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs: [pairToAnnotate], aiConfig })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (Array.isArray(data.results) && data.results.length > 0) {
        const result = data.results[0];
        setPairs((prev) =>
          prev.map((p) =>
            p.id === pairToAnnotate.id
              ? {
                  ...p,
                  annotatedEnglish: result.annotatedEnglish || p.english,
                  detectedTerms: result.detectedTerms || [],
                  status: 'completed'
                }
              : p
          )
        );
      }
    } catch (err: any) {
      console.error('Single pair annotate error:', err);
      setPairs((prev) =>
        prev.map((p) =>
          p.id === pairToAnnotate.id ? { ...p, status: 'error', errorMsg: err.message } : p
        )
      );
      setGlobalMessage({ type: 'error', text: `单句标注失败: ${err.message}` });
    } finally {
      setAnnotatingPairIds((prev) => {
        const next = new Set(prev);
        next.delete(pairToAnnotate.id);
        return next;
      });
    }
  };

  // Batch annotate: Step 2 execution
  const handleStartBatchAnnotation = async () => {
    if (pairs.length === 0) return;

    setIsAnnotatingAll(true);

    const naRegex = /<Na>[\s\S]*?<\/Na>/i;
    const targetPairs = pairs.filter((p) => naRegex.test(p.chinese || ''));
    const hasAnyNa = targetPairs.length > 0;

    const activeModelName =
      aiConfig.model === 'custom'
        ? aiConfig.customModelName || 'Custom Model'
        : aiConfig.model;

    if (hasAnyNa) {
      const skippedCount = pairs.length - targetPairs.length;
      setGlobalMessage({
        type: 'info',
        text: `已配置底座 [${activeModelName}]：第一步已核验锁定 ${targetPairs.length} 个重点句对（共 ${naTotalTermsCount} 项缩略语），正在启动第二步 100% 穷尽式技巧识别与标注...`
      });

      // Mark target pairs as annotating, and immediately resolve non-target pairs
      setPairs((prev) =>
        prev.map((p) => {
          if (naRegex.test(p.chinese || '')) {
            return { ...p, status: 'annotating' };
          } else {
            return {
              ...p,
              annotatedEnglish: p.english,
              detectedTerms: [],
              status: 'completed'
            };
          }
        })
      );

      try {
        const chunkSize = aiConfig.batchSize && aiConfig.batchSize > 0 ? aiConfig.batchSize : 4;
        const allResults: Record<string, any> = {};

        for (let i = 0; i < targetPairs.length; i += chunkSize) {
          const chunk = targetPairs.slice(i, i + chunkSize);
          const currentBatchNumber = Math.floor(i / chunkSize) + 1;
          const totalBatches = Math.ceil(targetPairs.length / chunkSize);

          setGlobalMessage({
            type: 'info',
            text: `第二步穷尽标注中（[${activeModelName}] 批次 ${currentBatchNumber}/${totalBatches}）：正在识别第 ${i + 1}~${Math.min(
              i + chunkSize,
              targetPairs.length
            )} 个句对中所有缩略语的英译技巧...`
          });

          const res = await fetch('/api/annotate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pairs: chunk, aiConfig })
          });

          const data = await res.json();
          if (data.error) throw new Error(data.error);

          if (Array.isArray(data.results)) {
            data.results.forEach((item: any, itemIdx: number) => {
              const matchedPair = chunk.find((c) => String(c.id) === String(item.id)) || chunk[itemIdx];
              if (matchedPair) {
                allResults[matchedPair.id] = {
                  ...item,
                  id: matchedPair.id
                };
              }
            });
          }

          // Incrementally update UI as batches complete
          setPairs((prev) =>
            prev.map((p) => {
              const resItem = allResults[p.id];
              if (resItem) {
                return {
                  ...p,
                  annotatedEnglish: resItem.annotatedEnglish || p.english,
                  detectedTerms: Array.isArray(resItem.detectedTerms) ? resItem.detectedTerms : [],
                  status: 'completed'
                };
              }
              return p;
            })
          );
        }

        setGlobalMessage({
          type: 'success',
          text: `第二步穷尽标注完毕！模型 [${activeModelName}] 已完成全部 ${targetPairs.length} 个重点句对的英译技巧识别，已生成完整技巧清单与学术计量分析。`
        });
      } catch (err: any) {
        console.error('Batch annotation error:', err);
        setGlobalMessage({ type: 'error', text: `第二步技巧标注中断: ${err.message}` });
      } finally {
        setIsAnnotatingAll(false);
      }
    } else {
      // Fallback if user uploaded raw text without <Na> tags
      setGlobalMessage({
        type: 'info',
        text: `当前语料未包含 <Na> 标签，正在使用 [${activeModelName}] 对全量句对进行数字式缩略语通用技巧识别...`
      });
      setPairs((prev) => prev.map((p) => ({ ...p, status: 'annotating' })));

      try {
        const chunkSize = aiConfig.batchSize && aiConfig.batchSize > 0 ? aiConfig.batchSize : 4;
        const allResults: Record<string, any> = {};

        for (let i = 0; i < pairs.length; i += chunkSize) {
          const chunk = pairs.slice(i, i + chunkSize);
          const res = await fetch('/api/annotate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pairs: chunk, aiConfig })
          });

          const data = await res.json();
          if (data.error) throw new Error(data.error);

          if (Array.isArray(data.results)) {
            data.results.forEach((item: any, itemIdx: number) => {
              const matchedPair = chunk.find((c) => String(c.id) === String(item.id)) || chunk[itemIdx];
              if (matchedPair) {
                allResults[matchedPair.id] = {
                  ...item,
                  id: matchedPair.id
                };
              }
            });
          }

          setPairs((prev) =>
            prev.map((p) => {
              const resItem = allResults[p.id];
              if (resItem) {
                return {
                  ...p,
                  annotatedEnglish: resItem.annotatedEnglish || p.english,
                  detectedTerms: Array.isArray(resItem.detectedTerms) ? resItem.detectedTerms : [],
                  status: 'completed'
                };
              }
              return p;
            })
          );
        }

        setGlobalMessage({
          type: 'success',
          text: `第二步全量技巧识别完成！共分析 ${pairs.length} 个句对。`
        });
      } catch (err: any) {
        console.error('Batch annotation error:', err);
        setGlobalMessage({ type: 'error', text: `第二步批量技巧识别中断: ${err.message}` });
      } finally {
        setIsAnnotatingAll(false);
      }
    }
  };

  // User confirms Step 1 and proceeds to Step 2
  const handleConfirmStepOneAndProceed = () => {
    setCurrentStep(2);
    // Check if any target pair is not completed or has unannotated terms
    const naRegex = /<Na>[\s\S]*?<\/Na>/i;
    const targetPairs = pairs.filter((p) => naRegex.test(p.chinese || ''));
    const needsAnnotation = targetPairs.some(
      (p) => !p.annotatedEnglish || !p.detectedTerms || p.detectedTerms.length === 0 || p.status !== 'completed'
    );

    if (needsAnnotation || stats.totalTerms === 0) {
      handleStartBatchAnnotation();
    } else {
      setGlobalMessage({
        type: 'info',
        text: `已进入第二步：已展示全部 ${stats.totalTerms} 项缩略语英译技巧综合清单，您可随时点击重新执行标注。`
      });
    }
  };

  // Clear all data completely
  const handleClearAll = () => {
    setPairs([]);
    setCorpusName('空白数据集');
    setSelectedTechnique(null);
    setCurrentStep(1);
    setGlobalMessage({
      type: 'info',
      text: '已清空当前全部句对数据与统计结果，您可以上传新文档或录入文本。'
    });
  };

  // Clear / Reset previous annotation results only (keep source texts)
  const handleResetAnnotations = () => {
    if (pairs.length === 0) return;
    setPairs((prev) =>
      prev.map((p) => ({
        ...p,
        annotatedEnglish: '',
        detectedTerms: [],
        status: 'pending',
        errorMsg: undefined
      }))
    );
    setSelectedTechnique(null);
    setCurrentStep(1);
    setGlobalMessage({
      type: 'success',
      text: `已成功清空上次处理的 ${pairs.length} 条标注数据，已回到第一步缩略语核验阶段。`
    });
  };

  // Reload benchmark preset sample corpus
  const handleReloadDefaultSample = () => {
    setPairs(SAMPLE_CORPORA[0].pairs);
    setCorpusName(SAMPLE_CORPORA[0].name);
    setSelectedTechnique(null);
    setCurrentStep(1);
    setGlobalMessage({
      type: 'success',
      text: `已成功重新载入官方基准测试语料库（${SAMPLE_CORPORA[0].pairs.length} 个句对）。`
    });
  };

  return (
    <div id="nutrans-app-root" className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Header */}
      <header id="main-header" className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 lg:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-bold font-mono text-base shadow-xs">
              Na
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  汉英数字式缩略语翻译技巧智能标注系统
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-medium border border-blue-200 dark:border-blue-800">
                  Natrans v2.0
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                两阶段规范工作流：第一步定位缩略语清单 → 用户确认 → 第二步译文技巧标注与综合清单
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Model & API Configuration Button */}
            <button
              id="btn-open-ai-config-header"
              type="button"
              onClick={() => setIsAIConfigModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/70 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-colors"
              title="选择与配置 AI 模型/API (AI Model & API Configuration)"
            >
              <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">AI 接口:</span>
              <span className="font-mono font-bold">
                {aiConfig.model === 'custom'
                  ? aiConfig.customModelName || 'Custom'
                  : aiConfig.model.replace('gemini-', '')}
              </span>
              <Settings2 className="w-3 h-3 text-purple-500 opacity-80" />
            </button>

            <button
              id="btn-open-guideline-header"
              type="button"
              onClick={() => setIsGuidelineModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/60 hover:bg-blue-100/80 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors"
              title="查看标注规范准则 (Annotation Guidelines)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>标注规范 (Guideline)</span>
            </button>

            {pairs.length > 0 && (
              <button
                id="btn-open-clear-modal-header"
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
                title="清空或重置数据"
              >
                <Trash2 className="w-3.5 h-3.5 text-stone-500 hover:text-red-600" />
                <span>清空/重置数据</span>
              </button>
            )}

            <button
              id="btn-export-word"
              type="button"
              disabled={pairs.length === 0}
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出交付 Word 文档 (.docx)
            </button>
          </div>
        </div>
      </header>

      {/* Global alert / status banner */}
      {globalMessage && (
        <div
          className={`px-4 py-2.5 text-xs text-center border-b flex items-center justify-center gap-2 transition-all ${
            globalMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : globalMessage.type === 'error'
              ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          {globalMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {globalMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
          {globalMessage.type === 'info' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
          <span>{globalMessage.text}</span>
          <button
            type="button"
            onClick={() => setGlobalMessage(null)}
            className="ml-3 font-bold opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 flex-1">
        {/* 1. Taxonomy Reference Card Header */}
        <TaxonomyGuide
          activeTechnique={selectedTechnique}
          onSelectTechnique={(tech) => setSelectedTechnique(tech)}
          onOpenGuidelineModal={() => setIsGuidelineModalOpen(true)}
        />

        {/* 2. File Upload / Ingestion Panel */}
        <FileUploadPanel
          onLoadPairs={handleLoadPairs}
          onStartAnnotation={() => {
            setCurrentStep(2);
            handleStartBatchAnnotation();
          }}
          onClearAll={handleClearAll}
          onResetAnnotations={handleResetAnnotations}
          onOpenClearModal={() => setIsClearModalOpen(true)}
          isAnnotating={isAnnotatingAll}
          totalPairs={pairs.length}
          annotatedPairsCount={stats.annotatedPairs}
          naPairsCount={naPairsCount}
          naTermsCount={naTotalTermsCount}
        />

        {/* 3. Prominent Two-Step Workflow Stage Selector */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Step 1 Tab Button */}
            <button
              type="button"
              id="step-tab-1"
              onClick={() => setCurrentStep(1)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                currentStep === 1
                  ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    currentStep === 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>第一步：缩略语识别与定位清单</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono">
                      {naPairsCount} 重点句 · {naTotalTermsCount} 实体
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    提取 &lt;Na&gt; 缩略语词条，定位关联汉英句对并由用户审核确认
                  </div>
                </div>
              </div>

              <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                {currentStep === 1 ? (
                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[11px] font-bold">
                    正在核验
                  </span>
                ) : (
                  <span className="text-stone-400 text-xs">点击查看</span>
                )}
              </div>
            </button>

            {/* Step 2 Tab Button */}
            <button
              type="button"
              id="step-tab-2"
              onClick={() => setCurrentStep(2)}
              className={`p-3.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                currentStep === 2
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-stone-50/50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    currentStep === 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span>第二步：译文翻译技巧识别与标注清单</span>
                    {stats.totalTerms > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-mono">
                        {stats.totalTerms} 项已标注
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    大模型四大策略分类（&lt;Natrans-I~IV&gt;）、学术计量分析与综合清单
                  </div>
                </div>
              </div>

              <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {currentStep === 2 ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-[11px] font-bold">
                    标注工作区
                  </span>
                ) : stats.totalTerms > 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    ✓ 标注完毕
                  </span>
                ) : (
                  <span className="text-stone-400 text-xs">待启动</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 4. Active Workflow Step Body */}
        {currentStep === 1 ? (
          <StepOneInventory
            pairs={pairs}
            onConfirmAndProceedToStepTwo={handleConfirmStepOneAndProceed}
            onUpdatePair={handleUpdatePair}
            isAnnotatingStepTwo={isAnnotatingAll}
            aiConfig={aiConfig}
            onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
            sourceFileName={corpusName}
          />
        ) : (
          <StepTwoInventory
            pairs={pairs}
            stats={stats}
            onStartAnnotation={handleStartBatchAnnotation}
            onUpdatePair={handleUpdatePair}
            onAnnotateSingle={handleAnnotateSingle}
            annotatingPairIds={annotatingPairIds}
            isAnnotating={isAnnotatingAll}
            onReturnToStepOne={() => setCurrentStep(1)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            selectedTechnique={selectedTechnique}
            onSelectTechnique={(tech) => setSelectedTechnique(tech)}
            aiConfig={aiConfig}
            onOpenAIConfig={() => setIsAIConfigModalOpen(true)}
            sourceFileName={corpusName}
          />
        )}
      </main>

      {/* AI Model & API Configuration Modal */}
      <AIConfigModal
        isOpen={isAIConfigModalOpen}
        config={aiConfig}
        onClose={() => setIsAIConfigModalOpen(false)}
        onSave={handleSaveAIConfig}
      />

      {/* Word Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pairs={pairs}
        sourceFileName={corpusName}
      />

      {/* Clear / Reset Data Modal */}
      <ClearDataModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        totalPairs={pairs.length}
        annotatedPairs={stats.annotatedPairs}
        onClearAll={handleClearAll}
        onResetAnnotations={handleResetAnnotations}
        onReloadDefaultCorpus={handleReloadDefaultSample}
      />

      {/* Annotation Guidelines Modal */}
      <GuidelineModal
        isOpen={isGuidelineModalOpen}
        onClose={() => setIsGuidelineModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-5 text-center text-xs text-stone-500 dark:text-stone-400 mt-auto bg-white/60 dark:bg-stone-900/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            汉英数字式缩略语翻译技巧标注研究平台 · Natrans Two-Step Workflow
          </div>
          <div className="font-mono text-[11px] text-stone-400">
            Powered by Google Gemini 3.7 &amp; DOCX Aligned Export Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

