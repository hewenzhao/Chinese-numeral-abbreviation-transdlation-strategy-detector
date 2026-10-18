import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
  CheckCircle2,
  FileX2,
  Layers
} from 'lucide-react';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPairs: number;
  annotatedPairs: number;
  onClearAll: () => void;
  onResetAnnotations: () => void;
  onReloadDefaultCorpus: () => void;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
  isOpen,
  onClose,
  totalPairs,
  annotatedPairs,
  onClearAll,
  onResetAnnotations,
  onReloadDefaultCorpus
}) => {
  const [selectedAction, setSelectedAction] = useState<'reset_annot' | 'clear_all' | 'reload_sample'>('reset_annot');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedAction === 'reset_annot') {
      onResetAnnotations();
    } else if (selectedAction === 'clear_all') {
      onClearAll();
    } else if (selectedAction === 'reload_sample') {
      onReloadDefaultCorpus();
    }
    onClose();
  };

  return (
    <div
      id="clear-data-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        id="clear-data-modal-content"
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              数据清空与重置管理
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              当前共有 <strong className="text-stone-800 dark:text-stone-200">{totalPairs}</strong> 个句对，其中 <strong className="text-emerald-600 dark:text-emerald-400">{annotatedPairs}</strong> 个已完成技巧标注
            </p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-2.5 my-4">
          {/* Option 1: Reset annotations only */}
          <label
            className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              selectedAction === 'reset_annot'
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <input
              type="radio"
              name="clearAction"
              checked={selectedAction === 'reset_annot'}
              onChange={() => setSelectedAction('reset_annot')}
              className="mt-1 text-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 dark:text-stone-100">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                仅清空上次标注结果（推荐）
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                保留现有的汉英双语文本与 <code className="font-mono text-indigo-600 dark:text-indigo-400">&lt;Na&gt;</code> 标记，仅清除所有 <code className="font-mono text-blue-600 dark:text-blue-400">&lt;Natrans-X&gt;</code> 标注标签与术语库，恢复为待标注状态。
              </p>
            </div>
          </label>

          {/* Option 2: Clear all data */}
          <label
            className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              selectedAction === 'clear_all'
                ? 'border-red-600 dark:border-red-500 bg-red-50/50 dark:bg-red-950/40 ring-1 ring-red-500'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <input
              type="radio"
              name="clearAction"
              checked={selectedAction === 'clear_all'}
              onChange={() => setSelectedAction('clear_all')}
              className="mt-1 text-red-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-red-700 dark:text-red-400">
                <FileX2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                清空全部句对数据
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                彻底清空当前所有句对数据与统计结果，重置工作区为空白状态，以便重新上传新的 Word 文件。
              </p>
            </div>
          </label>

          {/* Option 3: Reload default samples */}
          <label
            className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
              selectedAction === 'reload_sample'
                ? 'border-stone-900 dark:border-stone-100 bg-stone-50 dark:bg-stone-800 ring-1 ring-stone-900'
                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <input
              type="radio"
              name="clearAction"
              checked={selectedAction === 'reload_sample'}
              onChange={() => setSelectedAction('reload_sample')}
              className="mt-1 text-stone-900"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 dark:text-stone-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                重新载入官方基准语料样例
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                清空当前数据并重新加载包含“两重”、“三大平台”、“三农”、“两个确保”等标准标注范例。
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors"
          >
            取消
          </button>
          <button
            id="btn-confirm-clear-action"
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors ${
              selectedAction === 'clear_all'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : selectedAction === 'reset_annot'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900'
            }`}
          >
            {selectedAction === 'clear_all' && <Trash2 className="w-3.5 h-3.5" />}
            {selectedAction === 'reset_annot' && <RotateCcw className="w-3.5 h-3.5" />}
            {selectedAction === 'reload_sample' && <Sparkles className="w-3.5 h-3.5" />}
            确认执行
          </button>
        </div>
      </div>
    </div>
  );
};
