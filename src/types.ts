export type TranslationTechnique = 'I' | 'II' | 'III' | 'IV';

export type TargetLanguage = 'en' | 'es' | 'de' | 'ru' | 'fr' | 'ja' | 'ar';

export interface TargetLanguageInfo {
  code: TargetLanguage;
  name: string; // 英语, 西班牙语, 德语, 俄语, 法语, 日语, 阿拉伯语
  englishName: string; // English, Spanish, German, Russian, French, Japanese, Arabic
  nativeName: string; // English, Español, Deutsch, Русский, Français, 日本語, العربية
  flag: string; // Emoji flag icon
  shortName: string; // 英, 西, 德, 俄, 法, 日, 阿
  pairName: string; // 汉英, 汉西, 汉德, 汉俄, 汉法, 汉日, 汉阿
  direction?: 'ltr' | 'rtl';
  techniqueExamples: Record<TranslationTechnique, {
    term: string;
    translation: string;
    annotated: string;
    explanation: string;
  }>;
}

export const TARGET_LANGUAGES: Record<TargetLanguage, TargetLanguageInfo> = {
  en: {
    code: 'en',
    name: '英语',
    englishName: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    shortName: '英',
    pairName: '汉英',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'Three Platforms',
        annotated: '<Natrans-I>Three Platforms</Natrans-I>',
        explanation: '完全按照汉语词面逐字直译，保留基数词 Three 及共有成分 Platforms。'
      },
      II: {
        term: '三农',
        translation: 'agriculture, rural areas, and farmers',
        annotated: '<Natrans-II>agriculture, rural areas, and farmers</Natrans-II>',
        explanation: '采用意译策略，省略数字形式，直接阐述农业、农村、农民具体实质内涵。'
      },
      III: {
        term: '两重',
        translation: 'the "two majors" (major national strategies and security capacity in key areas)',
        annotated: '<Natrans-III>the "two majors" (major national strategies and security capacity in key areas)</Natrans-III>',
        explanation: '字面直译保留 two majors，括号内用意译补充阐述重大国家战略与重点领域安全能力。'
      },
      IV: {
        term: '三位一体',
        translation: 'trinity',
        annotated: '<Natrans-IV>trinity</Natrans-IV>',
        explanation: '直接借用英语固有固化文化词汇 trinity 或采用首字母仿拟构词。'
      }
    }
  },
  es: {
    code: 'es',
    name: '西班牙语',
    englishName: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    shortName: '西',
    pairName: '汉西',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'Tres Plataformas',
        annotated: '<Natrans-I>Tres Plataformas</Natrans-I>',
        explanation: '按汉语字面逐字对应译出，保留数词 Tres 与中心名词 Plataformas。'
      },
      II: {
        term: '三农',
        translation: 'la agricultura, el campo y los campesinos',
        annotated: '<Natrans-II>la agricultura, el campo y los campesinos</Natrans-II>',
        explanation: '意译展开具体概念（农业、农村和农民），不保留数字形式。'
      },
      III: {
        term: '两重',
        translation: 'los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)',
        annotated: '<Natrans-III>los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)</Natrans-III>',
        explanation: '直译保留 dos proyectos clave，并在括号内以西语说明政策内涵。'
      },
      IV: {
        term: '三位一体',
        translation: 'trinidad',
        annotated: '<Natrans-IV>trinidad</Natrans-IV>',
        explanation: '借用西语固有固化词汇 trinidad 表达三位一体。'
      }
    }
  },
  de: {
    code: 'de',
    name: '德语',
    englishName: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    shortName: '德',
    pairName: '汉德',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'Drei Plattformen',
        annotated: '<Natrans-I>Drei Plattformen</Natrans-I>',
        explanation: '完全依汉语逐词直译，保留基数词 Drei 和中心名词 Plattformen。'
      },
      II: {
        term: '三农',
        translation: 'Landwirtschaft, ländliche Gebiete und Bauern',
        annotated: '<Natrans-II>Landwirtschaft, ländliche Gebiete und Bauern</Natrans-II>',
        explanation: '意译展开“农业、农村和农民”概念，不保留数字3结构。'
      },
      III: {
        term: '两重',
        translation: 'die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)',
        annotated: '<Natrans-III>die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)</Natrans-III>',
        explanation: '直译保留 zwei Schwerpunkte，附带括号说明具体战略内涵。'
      },
      IV: {
        term: '三位一体',
        translation: 'Trinität / Dreieinigkeit',
        annotated: '<Natrans-IV>Trinität</Natrans-IV>',
        explanation: '借用德语既有固化词汇 Trinität 或 Dreieinigkeit。'
      }
    }
  },
  ru: {
    code: 'ru',
    name: '俄语',
    englishName: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    shortName: '俄',
    pairName: '汉俄',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'Три платформы',
        annotated: '<Natrans-I>Три платформы</Natrans-I>',
        explanation: '按汉语字面逐词对应直译，保留数词 Три 与名词 платформы。'
      },
      II: {
        term: '三农',
        translation: 'сельское хозяйство, сельские районы и крестьянство',
        annotated: '<Natrans-II>сельское хозяйство, сельские районы и крестьянство</Natrans-II>',
        explanation: '意译展开语义阐释，省略数字结构。'
      },
      III: {
        term: '两重',
        translation: '«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)',
        annotated: '<Natrans-III>«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)</Natrans-III>',
        explanation: '直译保留 два важнейших направления，括号中以俄语补充具体政策解释。'
      },
      IV: {
        term: '三位一体',
        translation: 'триединство / троица',
        annotated: '<Natrans-IV>триединство</Natrans-IV>',
        explanation: '借用俄语既有哲学/固化词汇 триединство。'
      }
    }
  },
  fr: {
    code: 'fr',
    name: '法语',
    englishName: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    shortName: '法',
    pairName: '汉法',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'Trois plateformes',
        annotated: '<Natrans-I>Trois plateformes</Natrans-I>',
        explanation: '依原文逐字直译，保留数词 Trois 和名词 plateformes。'
      },
      II: {
        term: '三农',
        translation: "l'agriculture, les zones rurales et les paysans",
        annotated: "<Natrans-II>l'agriculture, les zones rurales et les paysans</Natrans-II>",
        explanation: '意译展开具体实质内容，不保留数字 3 形式。'
      },
      III: {
        term: '两重',
        translation: 'les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)',
        annotated: '<Natrans-III>les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)</Natrans-III>',
        explanation: '直译保留 deux priorités majeures，括号内添加法语解释性说明。'
      },
      IV: {
        term: '三位一体',
        translation: 'trinité',
        annotated: '<Natrans-IV>trinité</Natrans-IV>',
        explanation: '直接借用法语成熟固有词汇 trinité。'
      }
    }
  },
  ja: {
    code: 'ja',
    name: '日语',
    englishName: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    shortName: '日',
    pairName: '汉日',
    direction: 'ltr',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: '三大プラットフォーム',
        annotated: '<Natrans-I>三大プラットフォーム</Natrans-I>',
        explanation: '完全保留原文汉字数字与中心词的逐字直译形式。'
      },
      II: {
        term: '三农',
        translation: '農業・農村・農民（に関する諸課題）',
        annotated: '<Natrans-II>農業・農村・農民（に関する諸課題）</Natrans-II>',
        explanation: '抛弃单一数字代码，意译展开农业、农村、农民具体语义。'
      },
      III: {
        term: '两重',
        translation: '「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）',
        annotated: '<Natrans-III>「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）</Natrans-III>',
        explanation: '直译保留「二つの重点」，并在括号中附加日语详细政策内涵注释。'
      },
      IV: {
        term: '三位一体',
        translation: '三位一体（トリニティ）',
        annotated: '<Natrans-IV>三位一体</Natrans-IV>',
        explanation: '借用日文固有的「三位一体」或外来借词トリニティ。'
      }
    }
  },
  ar: {
    code: 'ar',
    name: '阿拉伯语',
    englishName: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    shortName: '阿',
    pairName: '汉阿',
    direction: 'rtl',
    techniqueExamples: {
      I: {
        term: '三大平台',
        translation: 'المنصات الثلاث الكبرى',
        annotated: '<Natrans-I>المنصات الثلاث الكبرى</Natrans-I>',
        explanation: '按汉语字面逐字对应直译，保留数词 الثلاث 与名词 المنصات。'
      },
      II: {
        term: '三农',
        translation: 'الزراعة والمناطق الريفية والمزارعين',
        annotated: '<Natrans-II>الزراعة والمناطق الريفية والمزارعين</Natrans-II>',
        explanation: '意译展开“农业、农村与农民”具体概念，省略数字形式。'
      },
      III: {
        term: '两重',
        translation: '«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)',
        annotated: '<Natrans-III>«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)</Natrans-III>',
        explanation: '直译保留 المهمتان الرئيسيتان，括号内以阿语补充解释国家战略与安全能力。'
      },
      IV: {
        term: '三位一体',
        translation: 'الثالوث',
        annotated: '<Natrans-IV>الثالوث</Natrans-IV>',
        explanation: '借用阿拉伯语固有固化词汇 الثالوث。'
      }
    }
  }
};

export interface BilingualPair {
  id: string;
  pairIndex: number;
  chinese: string;
  english: string; // Target text (English, Spanish, German, Russian, French, Japanese, Arabic)
  annotatedEnglish: string; // Annotated target text
  targetLanguage?: TargetLanguage;
  detectedTerms: DetectedTerm[];
  status: 'pending' | 'annotating' | 'completed' | 'error';
  errorMsg?: string;
}

export interface IdentifiedNaTerm {
  term: string;
  occurrences: number;
  sentenceIndices: number[];
  pairIds: string[];
}

export interface AnnotationStats {
  totalPairs: number;
  annotatedPairs: number;
  sourceNaSentencesCount: number;
  sourceNaTotalTermsCount: number;
  multiNaSentencesCount: number;
  totalTerms: number;
  counts: Record<TranslationTechnique, number>;
  percentages: Record<TranslationTechnique, number>;
  termList: {
    chineseTerm: string;
    englishTranslation: string;
    technique: TranslationTechnique;
    occurrences: number;
    explanation?: string;
    sentenceIndices?: number[];
  }[];
}

export type WorkflowStep = 1 | 2;

export interface ExportDocxOptions {
  title?: string;
  sourceFileName?: string;
  exportFileName?: string;
  layout: 'top-bottom' | 'table';
  includeHeaderSummary: boolean;
  includeClassificationGuide: boolean;
  includeStatsTable: boolean;
  colorHighlight: boolean;
  targetLanguage?: TargetLanguage;
}

export type ThinkingMode = 'auto' | 'off' | 'low' | 'high';
export type AIProvider = 'gemini' | 'openai_compatible';

export interface AIConfig {
  provider?: AIProvider;
  model: string;
  customModelName?: string;
  baseUrl?: string;
  temperature: number;
  batchSize: number;
  thinkingMode: ThinkingMode;
  strictExhaustiveCheck: boolean;
  customApiKey?: string;
  systemPromptModifier?: string;
  targetLanguage?: TargetLanguage;
}

export interface ModelPreset {
  id: string;
  name: string;
  nameEn: string;
  provider: AIProvider;
  baseUrl?: string;
  badge: string;
  description: string;
  tag: string;
  speed: 'fast' | 'balanced' | 'deep';
  recommended?: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  model: 'gemini-3.7-flash',
  baseUrl: '',
  temperature: 0.1,
  batchSize: 4,
  thinkingMode: 'auto',
  strictExhaustiveCheck: true,
  customApiKey: '',
  systemPromptModifier: '',
  targetLanguage: 'en'
};

export const AVAILABLE_MODELS: ModelPreset[] = [
  {
    id: 'glm-4-plus',
    name: 'GLM-4 Plus (智谱清言旗舰版)',
    nameEn: 'Tsinghua Zhipu GLM-4 Plus Flagship',
    provider: 'openai_compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    badge: '智谱AI · 清华基座学术旗舰主力',
    description: '清华智谱 AI 开放平台旗舰大模型，基于 OpenAI 兼容协议，擅长汉英双语长难句学术考证、复杂政经修辞及细粒度翻译技巧精准定性。',
    tag: 'GLM-4 Plus',
    speed: 'deep',
    recommended: true
  },
  {
    id: 'glm-4-air',
    name: 'GLM-4 Air (智谱清言高性价比版)',
    nameEn: 'Tsinghua Zhipu GLM-4 Air Efficient',
    provider: 'openai_compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    badge: '智谱AI · 均衡高精度与推理吞吐',
    description: '智谱高性价比主力推理模型，响应迅速、逻辑严密，适合多批次双语对齐与翻译技巧标注。',
    tag: 'GLM-4 Air',
    speed: 'fast'
  },
  {
    id: 'glm-4-flash',
    name: 'GLM-4 Flash (智谱清言极速版)',
    nameEn: 'Tsinghua Zhipu GLM-4 Flash Fast',
    provider: 'openai_compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    badge: '智谱AI · 超高速并发与批量初标',
    description: '超高吞吐极速推理模型，支持超大批量句对的快速并发流式处理与初阶技巧提取。',
    tag: 'GLM-4 Flash',
    speed: 'fast'
  },
  {
    id: 'glm-4-long',
    name: 'GLM-4 Long (智谱清言超长上下文)',
    nameEn: 'Tsinghua Zhipu GLM-4 Long Context',
    provider: 'openai_compatible',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    badge: '智谱AI · 100万Token超长篇章对齐',
    description: '专为超长文档、全书翻译审校设计的长上下文模型，支持百万 Token 跨段落术语与技巧统一。',
    tag: 'GLM-4 Long',
    speed: 'deep'
  },
  {
    id: 'qwen-plus',
    name: 'Qwen Plus (通义千问增强版)',
    nameEn: 'Qwen Plus Alibaba Cloud MaaS',
    provider: 'openai_compatible',
    baseUrl: 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    badge: 'Qwen · 阿里云千问增强版旗舰主力',
    description: '阿里云百炼 MaaS 托管通义千问增强版，基于 OpenAI 兼容协议，擅长政经社科汉英精准对齐与数字缩略语技巧判别。',
    tag: 'Qwen Plus',
    speed: 'fast',
    recommended: true
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max (通义千问顶配版)',
    nameEn: 'Qwen Max Alibaba Cloud MaaS',
    provider: 'openai_compatible',
    baseUrl: 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    badge: 'Qwen · 顶配深度长链推理',
    description: '阿里云通义千问系列最强推理模型，针对复杂长难句、多重直译加意译嵌套及仿拟借用具有极高精度与细致学术论述。',
    tag: 'Qwen Max',
    speed: 'deep'
  },
  {
    id: 'qwen-turbo',
    name: 'Qwen Turbo (通义千问极速版)',
    nameEn: 'Qwen Turbo Alibaba Cloud MaaS',
    provider: 'openai_compatible',
    baseUrl: 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    badge: 'Qwen · 极速吞吐与批量标注',
    description: '高性价比极速推理模型，适合成百上千句对的大规模批量初标与快速流式处理。',
    tag: 'Qwen Turbo',
    speed: 'fast'
  },
  {
    id: 'qwen2.5-72b-instruct',
    name: 'Qwen 2.5 72B Instruct',
    nameEn: 'Qwen 2.5 72B Alibaba Cloud MaaS',
    provider: 'openai_compatible',
    baseUrl: 'https://llm-an182rqwrbwslp1n.cn-beijing.maas.aliyuncs.com/compatible-mode/v1',
    badge: 'Qwen · 开源旗舰大模型',
    description: '通义千问 2.5 72B 开源旗舰大模型，语言学与翻译学知识储备雄厚，支持复杂上下文严谨推理。',
    tag: 'Qwen 2.5 72B',
    speed: 'balanced'
  },
  {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    nameEn: 'Ultra-Fast DeepSeek Reasoning',
    provider: 'openai_compatible',
    baseUrl: 'https://api.deepseek.com',
    badge: 'DeepSeek · 极速推理与高吞吐量产',
    description: 'DeepSeek V4 Flash 旗舰级高性价比推理模型，基于 OpenAI 兼容协议，在汉英政经数字缩略语技巧判别中兼备极致速度与高准确率。',
    tag: 'DeepSeek Flash',
    speed: 'fast',
    recommended: true
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    nameEn: 'Deep Academic Reasoning & Thinking',
    provider: 'openai_compatible',
    baseUrl: 'https://api.deepseek.com',
    badge: 'DeepSeek · 深度思考与复杂学术辨析',
    description: 'DeepSeek V4 Pro 顶配级深度长链推理模型，针对多层直译+意译、隐晦借用等复杂长难句提供严密的学术论证与技巧定位。',
    tag: 'DeepSeek Pro',
    speed: 'deep'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    nameEn: 'Next-gen Hybrid Reasoning',
    provider: 'gemini',
    badge: 'Google · 高速与严谨兼备',
    description: '最新一代高性能多模态/文本推理模型，在术语抽取、细粒度翻译技巧判定中表现卓越且耗时极短。',
    tag: 'Gemini 3.7',
    speed: 'fast',
    recommended: true
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    nameEn: 'Fast & Efficient',
    provider: 'gemini',
    badge: '成熟稳定 · 超大批次高吞吐',
    description: '稳定高效的量产级模型，适合数百句对的大规模批量快速翻译技巧标注。',
    tag: 'Gemini 2.5',
    speed: 'fast'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    nameEn: 'Deep Academic Reasoning',
    provider: 'gemini',
    badge: '深度推理 · 复杂长难句高精判别',
    description: '顶级高精度推理模型，对隐晦意译、多层括号直译加意译等长难政经学术句具有极高判别准确率。',
    tag: 'Gemini Pro',
    speed: 'deep'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    nameEn: 'Advanced Reasoning Preview',
    provider: 'gemini',
    badge: '前沿探索 · 顶尖推理',
    description: '最新前沿学术推理预览模型，适合针对前沿政经文献进行深度复杂语言学考证。',
    tag: 'Gemini 3.1 Pro',
    speed: 'deep'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    nameEn: 'Ultra-low Latency',
    provider: 'gemini',
    badge: '极速轻量 · 毫秒级响应',
    description: '超低时延模型，适合快速试标与初步概览测试。',
    tag: 'Flash Lite',
    speed: 'fast'
  },
  {
    id: 'custom',
    name: '自定义模型 (Custom Model ID)',
    nameEn: 'User-specified Model Identifier',
    provider: 'gemini',
    badge: '灵活扩展 · 自定义指定',
    description: '允许输入任意有效的 Gemini 模型名称或 OpenAI/DeepSeek 兼容端点自定义模型。',
    tag: 'Custom',
    speed: 'balanced'
  }
];

