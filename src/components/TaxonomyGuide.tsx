import React, { useState } from 'react';
import { TECHNIQUE_METAS, TranslationTechnique, TargetLanguage, TARGET_LANGUAGES } from '../types';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Languages } from 'lucide-react';

interface TaxonomyGuideProps {
  activeTechnique?: TranslationTechnique | null;
  onSelectTechnique?: (tech: TranslationTechnique | null) => void;
  onOpenGuidelineModal?: () => void;
  targetLanguage?: TargetLanguage;
}

export const TaxonomyGuide: React.FC<TaxonomyGuideProps> = ({
  activeTechnique,
  onSelectTechnique,
  onOpenGuidelineModal,
  targetLanguage = 'en'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const techniques: TranslationTechnique[] = ['I', 'II', 'III', 'IV'];
  const langInfo = TARGET_LANGUAGES[targetLanguage] || TARGET_LANGUAGES.en;

  return (
    <div id="taxonomy-guide-section" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              {langInfo.pairName}数字式缩略语四类翻译技巧规范体系
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-normal flex items-center gap-1">
                <span>{langInfo.flag}</span>
                <span>{langInfo.name}标注标准</span>
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              面向目标语【{langInfo.name} ({langInfo.nativeName})】分类体系，点击下方卡片可筛选句对或查看学术定义与示例
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenGuidelineModal && (
            <button
              id="btn-view-full-guideline"
              type="button"
              onClick={onOpenGuidelineModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>查看标注规范准则全文 (Guideline)</span>
            </button>
          )}

          <button
            id="btn-toggle-taxonomy"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            aria-label="Toggle taxonomy guide"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {techniques.map((code) => {
            const meta = TECHNIQUE_METAS[code];
            const isSelected = activeTechnique === code;
            const langExample = langInfo.techniqueExamples?.[code];

            const borderClass = isSelected
              ? 'ring-2 ring-stone-900 dark:ring-stone-100 border-transparent shadow-sm'
              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700';

            return (
              <div
                key={code}
                id={`taxonomy-card-${code}`}
                onClick={() => onSelectTechnique && onSelectTechnique(isSelected ? null : code)}
                className={`cursor-pointer rounded-lg p-3.5 border transition-all text-left flex flex-col justify-between ${meta.badgeBg} ${borderClass}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 dark:bg-black/40 border border-stone-200/60 dark:border-stone-700/60 text-stone-900 dark:text-stone-100">
                      {meta.tag}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-900/5 dark:bg-white/10 text-stone-800 dark:text-stone-200">
                      类别 {code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 mt-2">
                    {code}（{meta.name}）
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-2">
                    {meta.nameEn}
                  </p>

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {meta.definition}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/60 text-xs">
                  <div className="text-stone-500 dark:text-stone-400 font-medium text-[11px] flex items-center justify-between">
                    <span>{langInfo.name}标注示例：</span>
                    <span className="text-[10px] font-mono text-stone-400">{langInfo.code.toUpperCase()}</span>
                  </div>
                  <div className="font-mono text-[11px] text-stone-800 dark:text-stone-200 mt-1 break-words bg-white/60 dark:bg-black/30 p-1.5 rounded" dir={langInfo.direction === 'rtl' ? 'rtl' : 'ltr'}>
                    <span className="text-stone-500">&lt;Na&gt;{langExample ? langExample.term : meta.exampleZh.replace(/<\/?Na>/g, '')}&lt;/Na&gt;</span> →{' '}
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">
                      {langExample ? langExample.annotated : meta.exampleAnnotated}
                    </span>
                  </div>
                  {langExample?.explanation && (
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                      {langExample.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
