import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
  ShadingType
} from 'docx';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser configuration for JSON and large Base64 files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy/safe initialization of Google Gen AI
let defaultGenAIClient: GoogleGenAI | null = null;
function getGenAI(customApiKey?: string): GoogleGenAI {
  const apiKey = (customApiKey && customApiKey.trim().length > 0) ? customApiKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing and no custom API Key provided.');
  }

  // If a custom API key was provided, create a fresh client instance
  if (customApiKey && customApiKey.trim().length > 0) {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  if (!defaultGenAIClient) {
    defaultGenAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return defaultGenAIClient;
}

// Check if request targets DeepSeek / Qwen / Zhipu GLM / OpenAI-compatible endpoint
function isOpenAICompatible(aiConfig: any, modelName: string): boolean {
  if (aiConfig?.provider === 'openai_compatible') return true;
  if (
    modelName.startsWith('glm') ||
    modelName.startsWith('chatglm') ||
    modelName.startsWith('qwen') ||
    modelName.startsWith('deepseek-') ||
    modelName.startsWith('gpt-') ||
    modelName.startsWith('o1') ||
    modelName.startsWith('o3')
  ) {
    return true;
  }
  if (aiConfig?.baseUrl && aiConfig.baseUrl.trim().length > 0 && !aiConfig.baseUrl.includes('googleapis.com')) return true;
  return false;
}

// Clean and extract JSON object or array from LLM responses
function cleanJsonOutput(raw: string): any {
  if (!raw) return [];
  let text = raw.trim();
  // Strip markdown code fences if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(text);
  } catch {
    // Attempt substring from first '[' or '{' to last ']' or '}'
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.slice(firstBracket, lastBracket + 1));
      } catch {}
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch {}
    }
    throw new Error(`无法解析模型返回的 JSON 内容: ${text.slice(0, 160)}...`);
  }
}

// Extract standard array of annotation results
function extractResultsArray(parsed: any): any[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    if (Array.isArray(parsed.results)) return parsed.results;
    if (Array.isArray(parsed.pairs)) return parsed.pairs;
    if (Array.isArray(parsed.items)) return parsed.items;
    if (Array.isArray(parsed.data)) return parsed.data;
    if (parsed.id && parsed.annotatedEnglish) return [parsed];
  }
  return [];
}

// Generic caller for OpenAI-compatible services (including Zhipu GLM, Qwen, and DeepSeek)
async function callOpenAICompatible(options: {
  baseUrl?: string;
  apiKey?: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<string> {
  let defaultBaseUrl = 'https://api.deepseek.com';
  if (options.model.startsWith('glm') || options.model.startsWith('chatglm')) {
    defaultBaseUrl = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4';
  } else if (options.model.startsWith('qwen')) {
    defaultBaseUrl =
      process.env.QWEN_BASE_URL ||
      'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1';
  } else if (process.env.DEEPSEEK_BASE_URL) {
    defaultBaseUrl = process.env.DEEPSEEK_BASE_URL;
  }

  const rawBaseUrl = (options.baseUrl && options.baseUrl.trim()) || defaultBaseUrl;
  let endpoint = rawBaseUrl.trim().replace(/\/+$/, '');
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = `${endpoint}/chat/completions`;
  }

  const isZhipu =
    options.model.startsWith('glm') ||
    options.model.startsWith('chatglm') ||
    endpoint.includes('bigmodel.cn') ||
    endpoint.includes('zhipu');
  const isQwen = options.model.startsWith('qwen') || endpoint.includes('aliyuncs.com') || endpoint.includes('dashscope');

  const apiKey =
    (options.apiKey && options.apiKey.trim()) ||
    (isZhipu ? process.env.ZHIPU_API_KEY || process.env.GLM_API_KEY : undefined) ||
    (isQwen ? process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY : undefined) ||
    process.env.ZHIPU_API_KEY ||
    process.env.GLM_API_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.QWEN_API_KEY ||
    process.env.DASHSCOPE_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      isZhipu
        ? '未检测到清华智谱 AI (GLM) API Key。请在 AI 配置弹窗中填写您的 API Key，或在服务器配置环境变量 ZHIPU_API_KEY / GLM_API_KEY。'
        : isQwen
        ? '未检测到 Qwen / DashScope API Key。请在 AI 配置弹窗中填写您的 API Key，或在服务器配置环境变量 QWEN_API_KEY / DASHSCOPE_API_KEY。'
        : '未检测到 API Key。请在 AI 配置弹窗中填写您的 API Key，或配置对应环境变量。'
    );
  }

  const payload: any = {
    model: options.model,
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt }
    ],
    temperature: typeof options.temperature === 'number' ? options.temperature : 0.1,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Retry without response_format if provider doesn't support json_object mode
    if (response.status === 400 || (errorText.includes('response_format') || errorText.includes('json_object'))) {
      delete payload.response_format;
      const retryRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(payload)
      });
      if (!retryRes.ok) {
        const retryErr = await retryRes.text();
        throw new Error(`OpenAI / 智谱 / Qwen 兼容端点响应错误 (${retryRes.status}): ${retryErr}`);
      }
      const retryData: any = await retryRes.json();
      return retryData?.choices?.[0]?.message?.content || '';
    }
    throw new Error(`OpenAI / 智谱 / Qwen / DeepSeek 端点响应错误 (${response.status}): ${errorText}`);
  }

  const data: any = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('模型端点未返回文本内容。');
  }
  return content;
}

// Helper: Normalize <Na>...</Na> tags across possible variants (full-width brackets, whitespace, casing)
function normalizeNaTags(text: string): string {
  if (!text) return '';
  return text
    .replace(/＜\s*Na\s*＞/gi, '<Na>')
    .replace(/＜\s*\/\s*Na\s*＞/gi, '</Na>')
    .replace(/<\s*Na\s*>/gi, '<Na>')
    .replace(/<\s*\/\s*Na\s*>/gi, '</Na>')
    .replace(/＜\s*NA\s*＞/gi, '<Na>')
    .replace(/＜\s*\/\s*NA\s*＞/gi, '</Na>')
    .replace(/<\s*NA\s*>/gi, '<Na>')
    .replace(/<\s*\/\s*NA\s*>/gi, '</Na>');
}

// Supported Target Languages Metadata for Academic Prompting & Docx Generation
interface ServerTargetLanguageMeta {
  code: string;
  name: string;
  enName: string;
  nativeName: string;
  shortName: string;
  pairName: string;
  testSentence: {
    chinese: string;
    target: string;
  };
  sampleTranslations: {
    I: { term: string; trans: string; tag: string };
    II: { term: string; trans: string; tag: string };
    III: { term: string; trans: string; tag: string };
    IV: { term: string; trans: string; tag: string };
  };
}

const SERVER_TARGET_LANGUAGES: Record<string, ServerTargetLanguageMeta> = {
  en: {
    code: 'en',
    name: '英语',
    enName: 'English',
    nativeName: 'English',
    shortName: '英',
    pairName: '汉英',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'We must grasp with both hands and be firm on both sides.'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'Three Platforms', tag: '<Natrans-I>Three Platforms</Natrans-I>' },
      II: { term: '三农', trans: 'agriculture, rural areas, and farmers', tag: '<Natrans-II>agriculture, rural areas, and farmers</Natrans-II>' },
      III: { term: '两重', trans: 'the "two majors" (major national strategies and security capacity in key areas)', tag: '<Natrans-III>the "two majors" (major national strategies and security capacity in key areas)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'trinity', tag: '<Natrans-IV>trinity</Natrans-IV>' }
    }
  },
  es: {
    code: 'es',
    name: '西班牙语',
    enName: 'Spanish',
    nativeName: 'Español',
    shortName: '西',
    pairName: '汉西',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'Debemos prestar atención a ambos aspectos y ser firmes en ambos.'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'Tres Plataformas', tag: '<Natrans-I>Tres Plataformas</Natrans-I>' },
      II: { term: '三农', trans: 'la agricultura, las zonas rurales y los campesinos', tag: '<Natrans-II>la agricultura, las zonas rurales y los campesinos</Natrans-II>' },
      III: { term: '两重', trans: 'los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)', tag: '<Natrans-III>los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'trinidad', tag: '<Natrans-IV>trinidad</Natrans-IV>' }
    }
  },
  de: {
    code: 'de',
    name: '德语',
    enName: 'German',
    nativeName: 'Deutsch',
    shortName: '德',
    pairName: '汉德',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'Wir müssen beide Seiten anpacken und auf beiden Seiten konsequent sein.'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'Drei Plattformen', tag: '<Natrans-I>Drei Plattformen</Natrans-I>' },
      II: { term: '三农', trans: 'Landwirtschaft, ländliche Gebiete und Bauern', tag: '<Natrans-II>Landwirtschaft, ländliche Gebiete und Bauern</Natrans-II>' },
      III: { term: '两重', trans: 'die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)', tag: '<Natrans-III>die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'Trinität', tag: '<Natrans-IV>Trinität</Natrans-IV>' }
    }
  },
  ru: {
    code: 'ru',
    name: '俄语',
    enName: 'Russian',
    nativeName: 'Русский',
    shortName: '俄',
    pairName: '汉俄',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'Мы должны твердо придерживаться принципа «хвататься обеими руками».'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'Три платформы', tag: '<Natrans-I>Три платформы</Natrans-I>' },
      II: { term: '三农', trans: 'сельское хозяйство, сельские районы и крестьянство', tag: '<Natrans-II>сельское хозяйство, сельские районы и крестьянство</Natrans-II>' },
      III: { term: '两重', trans: '«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)', tag: '<Natrans-III>«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'триединство', tag: '<Natrans-IV>триединство</Natrans-IV>' }
    }
  },
  fr: {
    code: 'fr',
    name: '法语',
    enName: 'French',
    nativeName: 'Français',
    shortName: '法',
    pairName: '汉法',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'Nous devons mener de front les deux tâches et nous montrer fermes sur les deux plans.'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'Trois plateformes', tag: '<Natrans-I>Trois plateformes</Natrans-I>' },
      II: { term: '三农', trans: "l'agriculture, les zones rurales et les paysans", tag: "<Natrans-II>l'agriculture, les zones rurales et les paysans</Natrans-II>" },
      III: { term: '两重', trans: 'les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)', tag: '<Natrans-III>les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'trinité', tag: '<Natrans-IV>trinité</Natrans-IV>' }
    }
  },
  ja: {
    code: 'ja',
    name: '日语',
    enName: 'Japanese',
    nativeName: '日本語',
    shortName: '日',
    pairName: '汉日',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: '我々は両方を重視し、どちらも緩めないよう堅持しなければならない。'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: '三大プラットフォーム', tag: '<Natrans-I>三大プラットフォーム</Natrans-I>' },
      II: { term: '三农', trans: '農業・農村・農民（問題）', tag: '<Natrans-II>農業・農村・農民（問題）</Natrans-II>' },
      III: { term: '两重', trans: '「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）', tag: '<Natrans-III>「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）</Natrans-III>' },
      IV: { term: '三位一体', trans: '三位一体', tag: '<Natrans-IV>三位一体</Natrans-IV>' }
    }
  },
  ar: {
    code: 'ar',
    name: '阿拉伯语',
    enName: 'Arabic',
    nativeName: 'العربية',
    shortName: '阿',
    pairName: '汉阿',
    testSentence: {
      chinese: '我们要坚持<Na>两手抓</Na>、两手都要硬。',
      target: 'يجب علينا التمسك بمبدأ الاهتمام بكلتا اليدين والحزم في كليهما.'
    },
    sampleTranslations: {
      I: { term: '三大平台', trans: 'المنصات الثلاث الكبرى', tag: '<Natrans-I>المنصات الثلاث الكبرى</Natrans-I>' },
      II: { term: '三农', trans: 'الزراعة والمناطق الريفية والمزارعين', tag: '<Natrans-II>الزراعة والمناطق الريفية والمزارعين</Natrans-II>' },
      III: { term: '两重', trans: '«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)', tag: '<Natrans-III>«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)</Natrans-III>' },
      IV: { term: '三位一体', trans: 'الثالوث', tag: '<Natrans-IV>الثالوث</Natrans-IV>' }
    }
  }
};

function getSystemPrompt(targetLangCode: string = 'en'): string {
  const lang = SERVER_TARGET_LANGUAGES[targetLangCode] || SERVER_TARGET_LANGUAGES['en'];
  return `你是一个严谨精通政治、经济与对外传播翻译研究的学术助手，专门负责${lang.pairName}双语对齐文本中“数字式缩略语”${lang.name}翻译技巧的识别、对齐与分类标注。
当前目标语言（Target Language）为：${lang.name} (${lang.enName} / ${lang.nativeName})。

【核心原则：以“<Na>......</Na>”标注符号为绝对准绳，执行 100% 穷尽操作】
1. 任何语料库的句子数量和缩略语数量均是动态的。你必须对输入语料中出现的每一个“<Na>......</Na>”标记执行【严格穷尽操作（Exhaustive Processing）】，做到无一遗漏、完全对齐。
2. 单句多缩略语完整提取要求（极其关键）：
   - 输入句子中一个中文句子可能包含 1 个、2 个或多个独立的 <Na> 实体（例如同一句中包含“<Na>六稳</Na>”与“<Na>六保</Na>”、“<Na>五位一体</Na>”与“<Na>四个全面</Na>”、“<Na>两学一做</Na>”与“<Na>四风</Na>”等）。
   - 如果一个中文句子包含 N 个 <Na> 实体，则该句子对应的 detectedTerms 数组【必须输出严格相等的 N 个独立元素】，一一对应句中的每一个 <Na> 缩略语！
   - 严禁只识别前 1 个而遗漏同一句中的其余 <Na> 实体！
3. ${lang.name}译文独立闭合包裹要求：
   - 在 annotatedEnglish 中，必须针对每一个 <Na> 缩略语找到其在${lang.name}译文中的具体译法片段，分别使用对应的 <Natrans-I/II/III/IV> XML 标签进行独立、闭合包裹。
   - 若一句话中有多个缩略语，${lang.name}译文中必须出现多个对应的 <Natrans-X> 标签片段。

【四大翻译技巧分类及标注规则（目标语：${lang.name}）】
请严格按照以下四类翻译技巧分类，在${lang.name}译文中用特定的XML标签包裹对应的${lang.name}译法片段：

1. <Natrans-I>...</Natrans-I>（直译 Literal Translation）：
   - 定义：完全按照汉语原文的词语形式逐字译出${lang.name}，保留数字和共有成分，不添加额外解释。
   - 示例：原文：“<Na>${lang.sampleTranslations.I.term}</Na>” → 译文：“${lang.sampleTranslations.I.trans}” → 标注：${lang.sampleTranslations.I.tag}
   - 典型特征：译文中包含精确的基数词或序数词，且紧随中心词的字面直译。

2. <Natrans-II>...</Natrans-II>（意译 Free / Semantic Translation）：
   - 定义：抛弃原文的字面形式，只根据原文的概念语义在${lang.name}中进行翻译阐释展开，不保留数字结构。
   - 示例：原文：“<Na>${lang.sampleTranslations.II.term}</Na>” → 译文：“${lang.sampleTranslations.II.trans}” → 标注：${lang.sampleTranslations.II.tag}
   - 典型特征：译文展开阐述具体实质内涵，完全省略了数字表达。

3. <Natrans-III>...</Natrans-III>（直译 + 意译 Literal + Explanatory Gloss）：
   - 定义：保留原文的字面形式（直译），同时附加解释性内容（意译），通常用括号或同位语补充。
   - 示例：原文：“<Na>${lang.sampleTranslations.III.term}</Na>” → 译文：“${lang.sampleTranslations.III.trans}” → 标注：${lang.sampleTranslations.III.tag}
   - 典型特征：译文中既有保留数字的直译词组，又有括号或从句补充其具体含义。

4. <Natrans-IV>...</Natrans-IV>（仿拟 / 借用 Analogy / Lexical Borrowing）：
   - 定义：仿照${lang.name}数字缩略语的结构（如代码缩写、复合词）翻译，或直接借用${lang.name}中已有的成熟固化词汇。
   - 示例：原文：“<Na>${lang.sampleTranslations.IV.term}</Na>” → 译文：“${lang.sampleTranslations.IV.trans}” → 标注：${lang.sampleTranslations.IV.tag}
   - 典型特征：采用${lang.name}字母代码缩略或直接借用${lang.name}固有成熟文化/社会既有词汇。

【输出结构规范】
- annotatedEnglish：包含完整${lang.name}句子，仅将对应 <Na> 缩略语的翻译部分用 <Natrans-X>...</Natrans-X> 严格包裹。
- detectedTerms 数组：每个元素中的 chineseTerm 填写 <Na> 标签内的缩略语文字（如“两重”），englishTranslation 为对应${lang.name}译法片段，technique 为 'I' | 'II' | 'III' | 'IV'，explanation 为学术判别依据。
- 确保 detectedTerms 中的项数与该句中出现的 <Na> 标签总数完全一致！
- 输出必须为合法严格的 JSON 数组。`;
}

const SYSTEM_PROMPT = getSystemPrompt('en');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: AI Configuration and Health Diagnostic
app.get('/api/ai/status', (req, res) => {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY;
  const hasQwenKey = !!(process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY);
  const hasZhipuKey = !!(process.env.ZHIPU_API_KEY || process.env.GLM_API_KEY);
  res.json({
    status: 'ok',
    hasEnvApiKey: hasGeminiKey || hasDeepSeekKey || hasQwenKey || hasZhipuKey,
    hasGeminiKey,
    hasDeepSeekKey,
    hasQwenKey,
    hasZhipuKey,
    defaultModel: 'glm-4-plus',
    supportedModels: [
      'glm-4-plus',
      'glm-4-air',
      'glm-4-flash',
      'glm-4-long',
      'qwen-plus',
      'qwen-max',
      'qwen-turbo',
      'qwen2.5-72b-instruct',
      'deepseek-v4-flash',
      'deepseek-v4-pro',
      'gemini-3.7-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-3.1-pro-preview',
      'gemini-3.1-flash-lite'
    ]
  });
});

// API: Test connection for user-selected AI API / Model
app.post('/api/ai/test-connection', async (req, res) => {
  const startTime = Date.now();
  try {
    const { aiConfig, targetLanguage: reqTargetLang } = req.body || {};
    const targetLangCode = reqTargetLang || aiConfig?.targetLanguage || 'en';
    const langInfo = SERVER_TARGET_LANGUAGES[targetLangCode] || SERVER_TARGET_LANGUAGES['en'];

    const modelToUse =
      aiConfig?.model === 'custom' && aiConfig?.customModelName?.trim()
        ? aiConfig.customModelName.trim()
        : aiConfig?.model || 'deepseek-v4-flash';

    const customKey = aiConfig?.customApiKey?.trim() || undefined;

    const testPrompt = `请对以下测试句对执行${langInfo.pairName}数字式缩略语翻译技巧识别与标注（目标语：${langInfo.name}），直接返回 JSON 数组：
[
  {
    "id": "test-1",
    "chinese": "${langInfo.testSentence.chinese}",
    "english": "${langInfo.testSentence.target}"
  }
]`;

    let sampleResult: any = null;
    const systemPromptForTest = getSystemPrompt(targetLangCode);

    if (isOpenAICompatible(aiConfig, modelToUse)) {
      const rawText = await callOpenAICompatible({
        baseUrl: aiConfig?.baseUrl,
        apiKey: customKey,
        model: modelToUse,
        systemPrompt: systemPromptForTest,
        userPrompt: testPrompt,
        temperature: aiConfig?.temperature ?? 0.1
      });

      const parsed = cleanJsonOutput(rawText);
      const resultsArray = extractResultsArray(parsed);
      sampleResult = resultsArray[0] || (typeof parsed === 'object' ? parsed : null);
    } else {
      const ai = getGenAI(customKey);
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
        config: {
          systemInstruction: systemPromptForTest,
          temperature: aiConfig?.temperature ?? 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                annotatedEnglish: { type: Type.STRING },
                detectedTerms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      chineseTerm: { type: Type.STRING },
                      englishTranslation: { type: Type.STRING },
                      technique: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ['chineseTerm', 'englishTranslation', 'technique', 'explanation']
                  }
                }
              },
              required: ['id', 'annotatedEnglish', 'detectedTerms']
            }
          }
        }
      });

      const jsonParsed = cleanJsonOutput(response.text || '[]');
      const resultsArray = extractResultsArray(jsonParsed);
      sampleResult = resultsArray[0] || null;
    }

    const latencyMs = Date.now() - startTime;
    return res.json({
      success: true,
      latencyMs,
      modelUsed: modelToUse,
      sampleResult,
      message: `API 连接成功！模型 ${modelToUse} 响应正常，往返耗时 ${latencyMs}ms。`
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    console.error('Test connection error:', error);
    return res.status(400).json({
      success: false,
      latencyMs,
      error: error.message || 'API connection test failed.',
      message: `API 连接失败: ${error.message || '未知错误'}`
    });
  }
});

// API: Batch annotate bilingual sentence pairs (Directly targets <Na>...</Na> Chinese sentences to save compute resources)
app.post('/api/annotate', async (req, res) => {
  try {
    const { pairs, aiConfig } = req.body;
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of bilingual pairs.' });
    }

    const modelToUse =
      aiConfig?.model === 'custom' && aiConfig?.customModelName?.trim()
        ? aiConfig.customModelName.trim()
        : aiConfig?.model || 'deepseek-v4-flash';

    const customKey = aiConfig?.customApiKey?.trim() || undefined;
    const temperatureToUse = typeof aiConfig?.temperature === 'number' ? aiConfig.temperature : 0.1;

    // Read targetLanguage from request
    const targetLangCode = req.body.targetLanguage || aiConfig?.targetLanguage || 'en';
    const targetLangInfo = SERVER_TARGET_LANGUAGES[targetLangCode] || SERVER_TARGET_LANGUAGES['en'];

    // Identify pairs with <Na>...</Na> tags
    const naRegex = /<Na>[\s\S]*?<\/Na>/i;
    const hasAnyNaTag = pairs.some((p) => naRegex.test(p.chinese || ''));

    // Separate target pairs from non-target pairs
    const targetPairs: any[] = [];
    const nonTargetPairs: any[] = [];

    pairs.forEach((p, idx) => {
      const cleanZh = normalizeNaTags(p.chinese || '');
      const pairWithCleanZh = { ...p, chinese: cleanZh, originalIndex: idx };
      if (hasAnyNaTag) {
        if (naRegex.test(cleanZh)) {
          targetPairs.push(pairWithCleanZh);
        } else {
          nonTargetPairs.push(pairWithCleanZh);
        }
      } else {
        // Fallback if no <Na> tags in entire corpus: process all pairs
        targetPairs.push(pairWithCleanZh);
      }
    });

    const finalResults: any[] = [];

    // Instant local completion for non-target pairs (zero LLM token / compute consumption)
    nonTargetPairs.forEach((p) => {
      finalResults.push({
        id: p.id || `pair-${p.originalIndex + 1}`,
        index: p.originalIndex,
        annotatedEnglish: p.english || '',
        detectedTerms: []
      });
    });

    // If target pairs exist, invoke AI only for these targeted pairs
    if (targetPairs.length > 0) {
      let batchNaCount = 0;
      const promptInput = targetPairs.map((p, pIdx) => {
        const matches = (p.chinese || '').match(/<Na>([\s\S]*?)<\/Na>/gi) || [];
        const extractedTerms = matches.map((m: string) => m.replace(/<\/?Na>/gi, '').trim()).filter(Boolean);
        batchNaCount += extractedTerms.length;

        return {
          id: p.id || `pair-${pIdx + 1}`,
          index: p.originalIndex !== undefined ? p.originalIndex : pIdx,
          chinese: p.chinese,
          english: p.english,
          identifiedTermsFromStep1: extractedTerms
        };
      });

      let systemPromptToUse = getSystemPrompt(targetLangCode);
      if (aiConfig?.systemPromptModifier && aiConfig.systemPromptModifier.trim()) {
        systemPromptToUse += `\n\n【用户自定义附加标注指导】\n${aiConfig.systemPromptModifier.trim()}`;
      }

      const userPromptText = `请对以下${targetLangInfo.pairName}双语对齐句子中的数字式缩略语执行【100% 穷尽式翻译技巧识别与标注】（目标语言：${targetLangInfo.name} / ${targetLangInfo.enName}）。
本批次待处理句子共 ${targetPairs.length} 句，中文原文中第一步已提取并核验的数字缩略语共包含 ${batchNaCount} 项实体。
每一句中第一步已锁定的缩略语清单已记录在各句的 identifiedTermsFromStep1 字段中。

【核心任务与穷尽原则】：
1. 每一句中凡是 identifiedTermsFromStep1 出现的每一个缩略语词条，必须在 detectedTerms 数组中生成一个对应对象！
   - detectedTerms 数组的长度必须严格等于该句中 identifiedTermsFromStep1 的数量（如某句有 2 项，detectedTerms 必须输出 2 项，绝不能只输出 1 项）！
   - 每个对象包含：chineseTerm (缩略语，如“两重”), englishTranslation (对应${targetLangInfo.name}译法片段), technique ('I'|'II'|'III'|'IV'), explanation (判定理由)。
2. 在 annotatedEnglish 中，必须用对应的 <Natrans-I>、<Natrans-II>、<Natrans-III> 或 <Natrans-IV> XML 标签将${targetLangInfo.name}译文中对应这几个缩略语的译法片段分别进行独立闭合包裹！
3. 请务必严格保留输入的 "id" 字段（与输入数据完全一致）。

待标注对齐句对数据：
${JSON.stringify(promptInput, null, 2)}`;

      let targetResults: any[] = [];

      if (isOpenAICompatible(aiConfig, modelToUse)) {
        const rawJsonText = await callOpenAICompatible({
          baseUrl: aiConfig?.baseUrl,
          apiKey: customKey,
          model: modelToUse,
          systemPrompt: systemPromptToUse,
          userPrompt: userPromptText,
          temperature: temperatureToUse
        });

        const parsed = cleanJsonOutput(rawJsonText);
        targetResults = extractResultsArray(parsed);
      } else {
        const ai = getGenAI(customKey);
        const generateConfig: any = {
          systemInstruction: systemPromptToUse,
          temperature: temperatureToUse,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'The exact id of the pair as passed in input' },
                index: { type: Type.INTEGER, description: 'The index of the pair' },
                annotatedEnglish: {
                  type: Type.STRING,
                  description:
                    'The English translation with <Natrans-I>, <Natrans-II>, <Natrans-III>, <Natrans-IV> tags wrapping numerical abbreviation translations'
                },
                detectedTerms: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: 'Unique ID for the term' },
                      chineseTerm: { type: Type.STRING, description: 'Chinese numerical abbreviation term' },
                      englishTranslation: {
                        type: Type.STRING,
                        description: 'The corresponding English translation segment'
                      },
                      technique: {
                        type: Type.STRING,
                        description: 'Category: I (直译), II (意译), III (直译+意译), or IV (仿拟/借用)'
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'Brief explanation of why this translation technique was assigned'
                      }
                    },
                    required: ['chineseTerm', 'englishTranslation', 'technique', 'explanation']
                  }
                }
              },
              required: ['id', 'annotatedEnglish', 'detectedTerms']
            }
          }
        };

        const response = await ai.models.generateContent({
          model: modelToUse,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: userPromptText
                }
              ]
            }
          ],
          config: generateConfig
        });

        const jsonText = response.text || '[]';
        const parsed = cleanJsonOutput(jsonText);
        targetResults = extractResultsArray(parsed);
      }

      if (Array.isArray(targetResults)) {
        targetPairs.forEach((tp, tpIdx) => {
          // Multi-strategy matching: by ID, by index, or by position
          const matched =
            targetResults.find((r: any) => r && r.id && String(r.id) === String(tp.id)) ||
            targetResults.find((r: any) => r && r.index !== undefined && Number(r.index) === Number(tp.originalIndex)) ||
            targetResults[tpIdx];

          if (matched) {
            finalResults.push({
              id: tp.id,
              index: tp.originalIndex !== undefined ? tp.originalIndex : tpIdx,
              annotatedEnglish: matched.annotatedEnglish || tp.english,
              detectedTerms: Array.isArray(matched.detectedTerms) ? matched.detectedTerms : []
            });
          } else {
            finalResults.push({
              id: tp.id,
              index: tp.originalIndex !== undefined ? tp.originalIndex : tpIdx,
              annotatedEnglish: tp.english,
              detectedTerms: []
            });
          }
        });
      }
    }

    return res.json({
      results: finalResults,
      meta: {
        totalReceived: pairs.length,
        targetedWithNa: targetPairs.length,
        skippedWithoutNa: nonTargetPairs.length,
        savedCompute: nonTargetPairs.length > 0
      }
    });
  } catch (error: any) {
    console.error('Annotation error:', error);
    return res.status(500).json({ error: error.message || 'Annotation failed.' });
  }
});

// Helper: Segment raw text into aligned Chinese and English pairs
function parseBilingualTextToPairs(rawText: string): Array<{ id: string; chinese: string; english: string }> {
  // Normalize <Na> tags across the entire text before processing
  const cleanRawText = normalizeNaTags(rawText);

  // Normalize line endings
  const lines = cleanRawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const pairs: Array<{ id: string; chinese: string; english: string }> = [];

  // Check if lines alternate between Chinese-heavy and Target-Language-heavy
  const isChineseHeavy = (str: string) => /[\u4e00-\u9fa5]/.test(str);
  const isTargetLanguageHeavy = (str: string) => {
    const cyrillic = (str.match(/[\u0400-\u04FF]/g) || []).length; // Russian
    const arabic = (str.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length; // Arabic
    const kana = (str.match(/[\u3040-\u309F\u30A0-\u30FF]/g) || []).length; // Japanese
    const latin = (str.match(/[a-zA-Z\u00C0-\u024F]/g) || []).length; // English, Spanish, German, French
    const zhCount = (str.match(/[\u4e00-\u9fa5]/g) || []).length;
    const targetCount = cyrillic + arabic + kana + latin;
    return targetCount >= 2 && targetCount > zhCount;
  };

  let currentZh = '';
  let currentEn = '';
  let pairIdx = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a delimiter like " | " or " \t " or "---"
    if (line.includes('\t') || line.includes(' | ')) {
      const parts = line.includes('\t') ? line.split('\t') : line.split(' | ');
      if (parts.length >= 2) {
        const p1 = normalizeNaTags(parts[0].trim());
        const p2 = parts.slice(1).join(' ').trim();
        if (isChineseHeavy(p1)) {
          pairs.push({ id: `p-${pairIdx++}`, chinese: p1, english: p2 });
          continue;
        } else if (isChineseHeavy(p2)) {
          pairs.push({ id: `p-${pairIdx++}`, chinese: p2, english: p1 });
          continue;
        }
      }
    }

    if (isChineseHeavy(line) && !isTargetLanguageHeavy(line)) {
      if (currentZh && currentEn) {
        pairs.push({ id: `p-${pairIdx++}`, chinese: normalizeNaTags(currentZh), english: currentEn });
        currentZh = line;
        currentEn = '';
      } else if (currentZh && !currentEn) {
        // Concatenate multi-line Chinese
        currentZh += ' ' + line;
      } else {
        currentZh = line;
      }
    } else if (isTargetLanguageHeavy(line)) {
      if (currentEn) {
        currentEn += ' ' + line;
      } else {
        currentEn = line;
      }
    } else {
      // Mixed or punctuation
      if (currentZh && !currentEn) {
        currentEn = line;
      } else if (currentEn) {
        currentEn += ' ' + line;
      } else {
        currentZh = line;
      }
    }
  }

  if (currentZh && currentEn) {
    pairs.push({ id: `p-${pairIdx++}`, chinese: normalizeNaTags(currentZh), english: currentEn });
  } else if (currentZh && !currentEn && pairs.length === 0) {
    // If only one language detected, fallback
    pairs.push({ id: `p-${pairIdx++}`, chinese: normalizeNaTags(currentZh), english: '' });
  }

  // Fallback if alternating wasn't cleanly captured: pairwise line grouping
  if (pairs.length === 0 && lines.length >= 2) {
    for (let i = 0; i < lines.length; i += 2) {
      pairs.push({
        id: `p-${pairIdx++}`,
        chinese: normalizeNaTags(lines[i] || ''),
        english: lines[i + 1] || ''
      });
    }
  }

  return pairs;
}

// API: Parse uploaded Word document (.docx)
app.post('/api/parse-docx', async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'No document base64 data provided.' });
    }

    const buffer = Buffer.from(base64, 'base64');

    // Extract raw text from Word document using mammoth
    const textResult = await mammoth.extractRawText({ buffer });
    const rawText = textResult.value || '';

    // Also extract HTML to see if there are table structures
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const rawHtml = htmlResult.value || '';

    let pairs = parseBilingualTextToPairs(rawText);

    // If text extraction yielded nothing, try simple paragraph split
    if (pairs.length === 0 && rawText.trim().length > 0) {
      pairs = [
        {
          id: 'p-1',
          chinese: rawText.slice(0, 500),
          english: rawText.slice(500) || rawText
        }
      ];
    }

    return res.json({
      pairs,
      rawText,
      totalExtracted: pairs.length
    });
  } catch (error: any) {
    console.error('Word document parse error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse Word document.' });
  }
});

// Helper: convert Chinese string with <Na>...</Na> tags into Word TextRuns
function buildChineseRuns(chineseText: string, colorHighlight = true): TextRun[] {
  const runs: TextRun[] = [];
  const tagRegex = /(<Na>)([\s\S]*?)(<\/Na>)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(chineseText)) !== null) {
    const matchStart = match.index;
    const fullMatch = match[0];
    const openTag = match[1];
    const innerContent = match[2];
    const closeTag = match[3];

    // Add preceding normal text
    if (matchStart > lastIndex) {
      runs.push(
        new TextRun({
          text: chineseText.substring(lastIndex, matchStart),
          font: 'Microsoft YaHei',
          size: 21
        })
      );
    }

    // Opening <Na> tag
    runs.push(
      new TextRun({
        text: openTag,
        font: 'Consolas',
        size: 18,
        bold: true,
        color: '4338CA', // Indigo
        shading: colorHighlight ? { type: ShadingType.CLEAR, fill: 'EEF2FF' } : undefined
      })
    );

    // Tagged Chinese abbreviation entity
    runs.push(
      new TextRun({
        text: innerContent,
        font: 'Microsoft YaHei',
        size: 21,
        bold: true,
        color: '312E81', // Deep indigo
        shading: colorHighlight ? { type: ShadingType.CLEAR, fill: 'EEF2FF' } : undefined
      })
    );

    // Closing </Na> tag
    runs.push(
      new TextRun({
        text: closeTag,
        font: 'Consolas',
        size: 18,
        bold: true,
        color: '4338CA',
        shading: colorHighlight ? { type: ShadingType.CLEAR, fill: 'EEF2FF' } : undefined
      })
    );

    lastIndex = matchStart + fullMatch.length;
  }

  // Trailing text
  if (lastIndex < chineseText.length) {
    runs.push(
      new TextRun({
        text: chineseText.substring(lastIndex),
        font: 'Microsoft YaHei',
        size: 21
      })
    );
  }

  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text: chineseText,
        font: 'Microsoft YaHei',
        size: 21
      })
    );
  }

  return runs;
}

// Helper: convert annotated English string with <Natrans-X> (or legacy <NuTrans-X>) tags into Word TextRuns
function buildAnnotatedRuns(annotatedText: string, colorHighlight = true): TextRun[] {
  const runs: TextRun[] = [];
  const tagRegex = /(<(?:NuTrans|Natrans)-(I{1,3}|IV)>)([\s\S]*?)(<\/(?:NuTrans|Natrans)-(I{1,3}|IV)>)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(annotatedText)) !== null) {
    const matchStart = match.index;
    const fullMatch = match[0];
    const openTag = match[1];
    const techCode = match[2]; // I, II, III, IV
    const innerContent = match[3];
    const closeTag = match[4];

    // Add preceding normal text
    if (matchStart > lastIndex) {
      runs.push(
        new TextRun({
          text: annotatedText.substring(lastIndex, matchStart),
          font: 'Times New Roman',
          size: 22 // 11pt
        })
      );
    }

    // Colors mapping
    const colorMap: Record<string, { color: string; shading?: string; tagColor: string }> = {
      I: { color: '1E40AF', shading: 'DBEAFE', tagColor: '2563EB' }, // Blue
      II: { color: '92400E', shading: 'FEF3C7', tagColor: 'D97706' }, // Amber
      III: { color: '065F46', shading: 'D1FAE5', tagColor: '059669' }, // Emerald
      IV: { color: '5B21B6', shading: 'EDE9FE', tagColor: '7C3AED' } // Purple
    };

    const techInfo = colorMap[techCode] || { color: '1E40AF', shading: 'F3F4F6', tagColor: '4B5563' };

    // Add Opening Tag TextRun
    runs.push(
      new TextRun({
        text: openTag,
        font: 'Consolas',
        size: 18,
        bold: true,
        color: techInfo.tagColor,
        shading: colorHighlight && techInfo.shading ? { type: ShadingType.CLEAR, fill: techInfo.shading } : undefined
      })
    );

    // Add Tagged Content TextRun
    runs.push(
      new TextRun({
        text: innerContent,
        font: 'Times New Roman',
        size: 22,
        bold: true,
        underline: { color: techInfo.color },
        color: techInfo.color,
        shading: colorHighlight && techInfo.shading ? { type: ShadingType.CLEAR, fill: techInfo.shading } : undefined
      })
    );

    // Add Closing Tag TextRun
    runs.push(
      new TextRun({
        text: closeTag,
        font: 'Consolas',
        size: 18,
        bold: true,
        color: techInfo.tagColor,
        shading: colorHighlight && techInfo.shading ? { type: ShadingType.CLEAR, fill: techInfo.shading } : undefined
      })
    );

    lastIndex = matchStart + fullMatch.length;
  }

  // Trailing text
  if (lastIndex < annotatedText.length) {
    runs.push(
      new TextRun({
        text: annotatedText.substring(lastIndex),
        font: 'Times New Roman',
        size: 22
      })
    );
  }

  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text: annotatedText,
        font: 'Times New Roman',
        size: 22
      })
    );
  }

  return runs;
}

// API: Export professional annotated Word document (.docx)
app.post('/api/export-docx', async (req, res) => {
  try {
    const { pairs, options = {} } = req.body;
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ error: 'No pairs to export.' });
    }

    const targetLangCode = options.targetLanguage || 'en';
    const targetLangInfo = SERVER_TARGET_LANGUAGES[targetLangCode] || SERVER_TARGET_LANGUAGES['en'];

    const docTitle = options.title || `${targetLangInfo.pairName}双语数字式缩略语翻译技巧标注交付文档`;
    const layout = options.layout || 'top-bottom'; // 'top-bottom' | 'table'
    const colorHighlight = options.colorHighlight !== false;
    const includeStats = options.includeStatsTable !== false;
    const includeGuide = options.includeClassificationGuide !== false;

    // Calculate technique statistics and source Na counts
    const stats: Record<string, number> = { I: 0, II: 0, III: 0, IV: 0 };
    let totalDetectedTerms = 0;
    let sourceNaSentences = 0;
    let sourceNaTotalTerms = 0;
    const termFrequencyMap = new Map<string, { chinese: string; english: string; tech: string; count: number }>();

    pairs.forEach((p) => {
      const matches = (p.chinese || '').match(/<Na>[\s\S]*?<\/Na>/g);
      if (matches && matches.length > 0) {
        sourceNaSentences++;
        sourceNaTotalTerms += matches.length;
      }

      if (Array.isArray(p.detectedTerms)) {
        p.detectedTerms.forEach((t: any) => {
          totalDetectedTerms++;
          if (stats[t.technique] !== undefined) {
            stats[t.technique]++;
          }
          const key = `${t.chineseTerm}___${t.englishTranslation}___${t.technique}`;
          const current = termFrequencyMap.get(key) || {
            chinese: t.chineseTerm,
            english: t.englishTranslation,
            tech: t.technique,
            count: 0
          };
          current.count++;
          termFrequencyMap.set(key, current);
        });
      }
    });

    const docChildren: any[] = [];

    // 1. Document Header Title
    docChildren.push(
      new Paragraph({
        text: docTitle,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 120 }
      })
    );

    // Document Subtitle / Metadata
    const subtitleText = sourceNaTotalTerms > 0
      ? `目标语言: ${targetLangInfo.name} (${targetLangInfo.nativeName}) | 生成时间: ${new Date().toLocaleDateString('zh-CN')} | 语料总句数: ${pairs.length} | 含缩略语句: ${sourceNaSentences} 句 | 缩略语总数: ${sourceNaTotalTerms} 个 | 技巧标注项: ${totalDetectedTerms}`
      : `目标语言: ${targetLangInfo.name} (${targetLangInfo.nativeName}) | 生成时间: ${new Date().toLocaleDateString('zh-CN')} | 标注句对数: ${pairs.length} | 识别缩略语项: ${totalDetectedTerms}`;

    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: subtitleText,
            font: 'Microsoft YaHei',
            size: 18,
            color: '6B7280'
          })
        ]
      })
    );

    // 2. Classification Guide Section (Optional)
    if (includeGuide) {
      docChildren.push(
        new Paragraph({
          text: `一、${targetLangInfo.pairName}数字式缩略语翻译技巧标注规范说明`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 }
        })
      );

      const guideRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 1200, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: '类别标识', bold: true, font: 'Microsoft YaHei', size: 19 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 1800, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: '翻译技巧', bold: true, font: 'Microsoft YaHei', size: 19 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 3600, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: '技巧定义与特征', bold: true, font: 'Microsoft YaHei', size: 19 })]
                })
              ]
            }),
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `标准标注示例 (${targetLangInfo.name})`, bold: true, font: 'Microsoft YaHei', size: 19 })]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '<Natrans-I>', bold: true, color: '1E40AF', font: 'Consolas', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'I（直译）', bold: true, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `完全按照汉语原文的词语形式逐字译出${targetLangInfo.name}，保留数字和共有成分，不添加额外解释。`, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${targetLangInfo.sampleTranslations.I.term} → ${targetLangInfo.sampleTranslations.I.tag}`, font: 'Consolas', size: 17 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '<Natrans-II>', bold: true, color: '92400E', font: 'Consolas', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'II（意译）', bold: true, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `抛弃原文的字面形式，只根据原文的概念语义在${targetLangInfo.name}中进行翻译展开，不保留数字结构。`, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${targetLangInfo.sampleTranslations.II.term} → ${targetLangInfo.sampleTranslations.II.tag}`, font: 'Consolas', size: 17 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '<Natrans-III>', bold: true, color: '065F46', font: 'Consolas', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'III（直译+意译）', bold: true, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `保留原文字面形式（直译），同时附加解释性内容（意译），通常用括号或同位语补充。`, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${targetLangInfo.sampleTranslations.III.term} → ${targetLangInfo.sampleTranslations.III.tag}`, font: 'Consolas', size: 16 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '<Natrans-IV>', bold: true, color: '5B21B6', font: 'Consolas', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'IV（仿拟/借用）', bold: true, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `仿照${targetLangInfo.name}数字缩略语的结构翻译，或直接借用${targetLangInfo.name}已有成熟固化词汇。`, font: 'Microsoft YaHei', size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${targetLangInfo.sampleTranslations.IV.term} → ${targetLangInfo.sampleTranslations.IV.tag}`, font: 'Consolas', size: 17 })] })]
            })
          ]
        })
      ];

      docChildren.push(
        new Table({
          rows: guideRows,
          width: { size: 9600, type: WidthType.DXA },
          margins: { top: 120, bottom: 120, left: 160, right: 160 }
        })
      );

      docChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // 3. Bilingual Aligned Corpus Body
    docChildren.push(
      new Paragraph({
        text: `二、${targetLangInfo.pairName}句对齐双语标注正文`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 160 }
      })
    );

    if (layout === 'table') {
      // Table Layout
      const tableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 800, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '序号', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 4400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '汉语原文 (Chinese)', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 4400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: `${targetLangInfo.name}译文及标注 (${targetLangInfo.nativeName})`, bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            })
          ]
        })
      ];

      pairs.forEach((pair, idx) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, font: 'Consolas', size: 18 })] })]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: buildChineseRuns(pair.chinese, colorHighlight),
                    spacing: { after: 60 }
                  })
                ]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: buildAnnotatedRuns(pair.annotatedEnglish || pair.english, colorHighlight),
                    spacing: { after: 60 }
                  })
                ]
              })
            ]
          })
        );
      });

      docChildren.push(
        new Table({
          rows: tableRows,
          width: { size: 9600, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 140, right: 140 }
        })
      );
    } else {
      // Top-Bottom Paragraphs Layout (上下对照)
      pairs.forEach((pair, idx) => {
        // Chinese Paragraph with <Na> support
        const zhRuns = buildChineseRuns(pair.chinese, colorHighlight);
        docChildren.push(
          new Paragraph({
            spacing: { before: 160, after: 60 },
            children: [
              new TextRun({
                text: `[${idx + 1}] [ZH] `,
                font: 'Consolas',
                bold: true,
                color: '4B5563',
                size: 19
              }),
              ...zhRuns
            ]
          })
        );

        // Target Language Annotated Paragraph
        const enRuns = buildAnnotatedRuns(pair.annotatedEnglish || pair.english, colorHighlight);
        docChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 180 },
            children: [
              new TextRun({
                text: `    [${targetLangInfo.code.toUpperCase()}] `,
                font: 'Consolas',
                bold: true,
                color: '6B7280',
                size: 19
              }),
              ...enRuns
            ]
          })
        );
      });
    }

    // 4. Statistics & Vocabulary Distribution Table (Optional)
    if (includeStats && totalDetectedTerms > 0) {
      docChildren.push(
        new Paragraph({
          text: '三、翻译技巧分布统计与术语清单',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 140 }
        })
      );

      // Summary table
      const statRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '翻译技巧类别', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '标签标识符', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '出现频次 (Count)', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            }),
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: 'F3F4F6' },
              children: [new Paragraph({ children: [new TextRun({ text: '占比 (Percentage)', bold: true, font: 'Microsoft YaHei', size: 19 })] })]
            })
          ]
        })
      ];

      const techLabels: Record<string, string> = {
        I: 'I（直译 Literal）',
        II: 'II（意译 Free）',
        III: 'III（直译+意译 Literal+Gloss）',
        IV: 'IV（仿拟/借用 Analogy/Borrowing）'
      };

      (['I', 'II', 'III', 'IV'] as const).forEach((cat) => {
        const count = stats[cat] || 0;
        const pct = totalDetectedTerms > 0 ? ((count / totalDetectedTerms) * 100).toFixed(1) + '%' : '0.0%';
        statRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: techLabels[cat], font: 'Microsoft YaHei', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `<Natrans-${cat}>`, font: 'Consolas', bold: true, size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${count}`, font: 'Consolas', size: 18 })] })] }),
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: pct, font: 'Consolas', size: 18 })] })] })
            ]
          })
        );
      });

      docChildren.push(
        new Table({
          rows: statRows,
          width: { size: 9600, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 140, right: 140 }
        })
      );
    }

    // Build the complete docx Document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);

    // Generate output filename with submitted file name
    let outFileName = options.exportFileName;
    if (!outFileName) {
      const baseName = (options.sourceFileName || 'Natrans')
        .replace(/\.(docx?|txt|tsv|csv|json)$/i, '')
        .replace(/[\\/:*?"<>|]/g, '_')
        .trim();
      outFileName = `${baseName}_Natrans标注交付文档_${Date.now()}.docx`;
    }
    if (!outFileName.toLowerCase().endsWith('.docx')) {
      outFileName += '.docx';
    }

    const encodedFileName = encodeURIComponent(outFileName);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="export_${Date.now()}.docx"; filename*=UTF-8''${encodedFileName}`
    );
    res.send(buffer);
  } catch (error: any) {
    console.error('DOCX export error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate Word document.' });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Natrans Server running on port ${PORT}`);
  });
}

startServer();
