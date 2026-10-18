import React, { useState } from 'react';
import { BilingualPair, DetectedTerm, TECHNIQUE_METAS, TranslationTechnique, TargetLanguage, TARGET_LANGUAGES } from '../types';
import {
  Sparkles,
  Edit2,
  Check,
  X,
  RefreshCw,
  Info,
  ChevronRight,
  Tag,
  AlertCircle
} from 'lucide-react';

interface BilingualPairCardProps {
  pair: BilingualPair;
  onUpdatePair: (updatedPair: BilingualPair) => void;
  onAnnotateSingle: (pair: BilingualPair) => Promise<void>;
  isAnnotatingSingle?: boolean;
  activeFilterTech?: TranslationTechnique | null;
  targetLanguage?: TargetLanguage;
}

export const BilingualPairCard: React.FC<BilingualPairCardProps> = ({
  pair,
  onUpdatePair,
  onAnnotateSingle,
  isAnnotatingSingle = false,
  activeFilterTech,
  targetLanguage = 'en'
}) => {
  const langInfo = TARGET_LANGUAGES[targetLanguage || pair.targetLanguage || 'en'] || TARGET_LANGUAGES.en;
  const [isEditing, setIsEditing] = useState(false);
  const [editChinese, setEditChinese] = useState(pair.chinese);
  const [editEnglish, setEditEnglish] = useState(pair.english);
  const [editAnnotated, setEditAnnotated] = useState(pair.annotatedEnglish || pair.english);
  const [showRawTags, setShowRawTags] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<DetectedTerm | null>(null);

  const handleSaveEdit = () => {
    onUpdatePair({
      ...pair,
      chinese: editChinese,
      english: editEnglish,
      annotatedEnglish: editAnnotated
    });
    setIsEditing(false);
  };

  const handleTechniqueChange = (termIndex: number, newTech: TranslationTechnique) => {
    const updatedTerms = [...pair.detectedTerms];
    const targetTerm = updatedTerms[termIndex];
    if (!targetTerm) return;

    const oldTech = targetTerm.technique;
    targetTerm.technique = newTech;

    // Update the tag in annotatedEnglish string
    let newAnnotated = pair.annotatedEnglish || pair.english;
    const oldOpenNatrans = `<Natrans-${oldTech}>`;
    const oldCloseNatrans = `</Natrans-${oldTech}>`;
    const oldOpenNutrans = `<NuTrans-${oldTech}>`;
    const oldCloseNutrans = `</NuTrans-${oldTech}>`;
    const newOpen = `<Natrans-${newTech}>`;
    const newClose = `</Natrans-${newTech}>`;

    // Replace surrounding tag for this term translation
    if (newAnnotated.includes(oldOpenNatrans) && newAnnotated.includes(targetTerm.englishTranslation)) {
      newAnnotated = newAnnotated.replace(
        `${oldOpenNatrans}${targetTerm.englishTranslation}${oldCloseNatrans}`,
        `${newOpen}${targetTerm.englishTranslation}${newClose}`
      );
    } else if (newAnnotated.includes(oldOpenNutrans) && newAnnotated.includes(targetTerm.englishTranslation)) {
      newAnnotated = newAnnotated.replace(
        `${oldOpenNutrans}${targetTerm.englishTranslation}${oldCloseNutrans}`,
        `${newOpen}${targetTerm.englishTranslation}${newClose}`
      );
    }

    onUpdatePair({
      ...pair,
      annotatedEnglish: newAnnotated,
      detectedTerms: updatedTerms
    });
  };

  // Helper to render annotated text with interactive clickable badges
  const renderAnnotatedContent = (text: string) => {
    if (!text) {
      return <span className="text-stone-400 italic">尚未标注</span>;
    }

    const tagRegex = /(<(?:NuTrans|Natrans)-(I{1,3}|IV)>)([\s\S]*?)(<\/(?:NuTrans|Natrans)-(I{1,3}|IV)>)/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let matchCounter = 0;

    while ((match = tagRegex.exec(text)) !== null) {
      const matchStart = match.index;
      const fullMatch = match[0];
      const techCode = match[2] as TranslationTechnique;
      const innerContent = match[3];

      if (matchStart > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`} className="text-stone-800 dark:text-stone-200">
            {text.substring(lastIndex, matchStart)}
          </span>
        );
      }

      const meta = TECHNIQUE_METAS[techCode] || TECHNIQUE_METAS.I;

      elements.push(
        <span
          key={`tag-${matchCounter++}`}
          className={`inline-flex items-baseline px-1.5 py-0.5 mx-1 rounded border font-medium transition-all ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
          title={`${meta.name} (${meta.nameEn}): ${meta.shortDesc}`}
        >
          <span className="font-mono text-[10px] font-bold opacity-75 mr-1 select-none">
            [{techCode}]
          </span>
          <span className="underline decoration-dotted underline-offset-2">{innerContent}</span>
        </span>
      );

      lastIndex = matchStart + fullMatch.length;
    }

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end`} className="text-stone-800 dark:text-stone-200">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  // Highlight Chinese source with <Na>...</Na> numerical abbreviation tags or detected terms
  const renderHighlightedChinese = (zh: string, terms: DetectedTerm[]) => {
    if (!zh) return <span className="text-stone-400 italic">无中文内容</span>;

    // 1. If explicit <Na>...</Na> tags exist in Chinese text
    if (/<Na>[\s\S]*?<\/Na>/.test(zh)) {
      const naRegex = /(<Na>)([\s\S]*?)(<\/Na>)/g;
      const elements: React.ReactNode[] = [];
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      let keyCounter = 0;

      while ((match = naRegex.exec(zh)) !== null) {
        const matchStart = match.index;
        const fullMatch = match[0];
        const innerTerm = match[2];

        if (matchStart > lastIdx) {
          elements.push(
            <span key={`zh-txt-${lastIdx}`}>
              {zh.substring(lastIdx, matchStart)}
            </span>
          );
        }

        elements.push(
          <span
            key={`na-tag-${keyCounter++}`}
            className="inline-flex items-baseline mx-0.5 group"
            title={`数字式缩略语标记: ${innerTerm}`}
          >
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100/90 dark:bg-indigo-950 px-1 py-0.5 rounded-l border-y border-l border-indigo-300 dark:border-indigo-700 select-none">
              &lt;Na&gt;
            </span>
            <span className="font-bold text-indigo-950 dark:text-indigo-100 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 border-y border-indigo-300 dark:border-indigo-700 underline decoration-indigo-300 dark:decoration-indigo-600 underline-offset-2">
              {innerTerm}
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100/90 dark:bg-indigo-950 px-1 py-0.5 rounded-r border-y border-r border-indigo-300 dark:border-indigo-700 select-none">
              &lt;/Na&gt;
            </span>
          </span>
        );

        lastIdx = matchStart + fullMatch.length;
      }

      if (lastIdx < zh.length) {
        elements.push(
          <span key={`zh-txt-end`}>
            {zh.substring(lastIdx)}
          </span>
        );
      }

      return <span>{elements}</span>;
    }

    // 2. Fallback: highlight using detected terms if no <Na> tag is present
    if (terms && terms.length > 0) {
      const sortedTerms = [...terms].sort((a, b) => b.chineseTerm.length - a.chineseTerm.length);
      for (const term of sortedTerms) {
        if (!term.chineseTerm || !zh.includes(term.chineseTerm)) continue;
        const parts = zh.split(term.chineseTerm);
        if (parts.length >= 2) {
          const meta = TECHNIQUE_METAS[term.technique] || TECHNIQUE_METAS.I;
          return (
            <span>
              {parts[0]}
              <span
                className={`px-1.5 py-0.5 rounded font-bold border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
                title={`自动识别缩略语: ${term.chineseTerm}`}
              >
                {term.chineseTerm}
              </span>
              {parts.slice(1).join(term.chineseTerm)}
            </span>
          );
        }
      }
    }

    return <span>{zh}</span>;
  };

  return (
    <div
      id={`bilingual-pair-card-${pair.pairIndex}`}
      className={`bg-white dark:bg-stone-900 border rounded-xl p-4 shadow-xs transition-all ${
        pair.status === 'completed'
          ? 'border-stone-200 dark:border-stone-800'
          : pair.status === 'annotating'
          ? 'border-blue-400 dark:border-blue-700 ring-1 ring-blue-400'
          : 'border-stone-200 dark:border-stone-800 opacity-95'
      }`}
    >
      {/* Header index & status */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100 dark:border-stone-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
            #{pair.pairIndex}
          </span>
          {(() => {
            const naMatches = (pair.chinese || '').match(/<Na>[\s\S]*?<\/Na>/g);
            const naCount = naMatches ? naMatches.length : 0;
            if (naCount > 1) {
              return (
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono font-semibold flex items-center gap-1" title={`包含 ${naCount} 项 <Na> 数字式缩略语的复合句，各缩略语分别建立${langInfo.name}译文技巧对齐`}>
                  <span>🎯 &lt;Na&gt; 复合句 (含 {naCount} 项缩略语)</span>
                </span>
              );
            } else if (naCount === 1) {
              return (
                <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-mono font-semibold" title="包含 1 项 <Na> 实体缩略语标记的目标句对">
                  🎯 &lt;Na&gt; 目标句
                </span>
              );
            }
            return null;
          })()}
          {pair.status === 'completed' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1">
              <Check className="w-3 h-3" />
              已完成标注 ({pair.detectedTerms?.length || 0} 项技巧)
            </span>
          )}
          {pair.status === 'pending' && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-medium">
              待标注
            </span>
          )}
          {pair.status === 'annotating' && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              正在分析技巧...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {pair.annotatedEnglish && (
            <button
              type="button"
              onClick={() => setShowRawTags(!showRawTags)}
              className="text-[11px] px-2 py-1 rounded text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {showRawTags ? '显示高亮视图' : '查看原始XML标签'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] p-1.5 rounded text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="编辑原文或标注"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            disabled={isAnnotatingSingle}
            onClick={() => onAnnotateSingle(pair)}
            className="text-[11px] px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            title="重新智能分析该句对"
          >
            <RefreshCw className={`w-3 h-3 ${isAnnotatingSingle ? 'animate-spin' : ''}`} />
            单句分析
          </button>
        </div>
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400">
                汉语原文 (Chinese Source):
              </label>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                支持使用 &lt;Na&gt;...&lt;/Na&gt; 标注数字式缩略语
              </span>
            </div>
            <textarea
              id={`textarea-edit-zh-${pair.pairIndex}`}
              value={editChinese}
              onChange={(e) => setEditChinese(e.target.value)}
              rows={2}
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              {langInfo.name}译文 ({langInfo.nativeName} Translation):
            </label>
            <textarea
              value={editEnglish}
              onChange={(e) => setEditEnglish(e.target.value)}
              rows={2}
              dir={langInfo.direction === 'rtl' ? 'rtl' : 'ltr'}
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              标注后{langInfo.name}译文 (带 &lt;Natrans-X&gt; 标签):
            </label>
            <textarea
              value={editAnnotated}
              onChange={(e) => setEditAnnotated(e.target.value)}
              rows={2}
              dir={langInfo.direction === 'rtl' ? 'rtl' : 'ltr'}
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-blue-300 dark:border-blue-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded hover:opacity-90"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        /* Standard View Mode */
        <div className="space-y-2.5">
          {/* Chinese Source */}
          <div className="flex items-start gap-2.5">
            <span className="text-xs font-mono font-bold text-stone-400 dark:text-stone-500 mt-0.5 select-none shrink-0 w-8">
              [ZH]
            </span>
            <div className="text-sm font-medium text-stone-900 dark:text-stone-100 leading-relaxed flex-1">
              {renderHighlightedChinese(pair.chinese, pair.detectedTerms)}
            </div>
          </div>

          {/* Target Language Translation & Annotation */}
          <div className="flex items-start gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 select-none shrink-0 w-8">
              [{langInfo.code.toUpperCase()}]
            </span>
            <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed flex-1" dir={langInfo.direction === 'rtl' ? 'rtl' : 'ltr'}>
              {showRawTags ? (
                <div className="font-mono text-xs p-2 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 break-words whitespace-pre-wrap">
                  {pair.annotatedEnglish || pair.english || '(无内容)'}
                </div>
              ) : (
                renderAnnotatedContent(pair.annotatedEnglish || pair.english)
              )}
            </div>
          </div>

          {/* Detected Terms & Technique Pills */}
          {pair.detectedTerms && pair.detectedTerms.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80">
              <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                <Tag className="w-3 h-3" />
                识别到的数字缩略语及翻译技巧：
              </div>
              <div className="space-y-2">
                {pair.detectedTerms.map((term, termIdx) => {
                  const meta = TECHNIQUE_METAS[term.technique] || TECHNIQUE_METAS.I;
                  return (
                    <div
                      key={term.id || `term-${termIdx}`}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 ${meta.badgeBg} ${meta.badgeBorder}`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            原文: “{term.chineseTerm}”
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                          <span className="font-medium text-stone-800 dark:text-stone-200">
                            译文: “{term.englishTranslation}”
                          </span>
                          <span
                            className={`font-mono font-bold text-[11px] px-1.5 py-0.2 rounded ${meta.badgeText} bg-white/70 dark:bg-black/30`}
                          >
                            {meta.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
                          <span className="font-medium">判别依据：</span>
                          {term.explanation}
                        </p>
                      </div>

                      {/* Technique Selector Override */}
                      <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 mr-1">
                          校准技巧:
                        </span>
                        {(['I', 'II', 'III', 'IV'] as TranslationTechnique[]).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleTechniqueChange(termIdx, cat)}
                            className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                              term.technique === cat
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                                : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                            }`}
                            title={`切换为类别 ${cat} (${TECHNIQUE_METAS[cat].name})`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
