import { BilingualPair, TargetLanguage } from '../types';

export interface SampleCorpusGroup {
  id: string;
  name: string;
  targetLanguage: TargetLanguage;
  description: string;
  pairs: BilingualPair[];
}

export const SAMPLE_CORPORA: SampleCorpusGroup[] = [
  {
    id: 'benchmark-20-sentences-27-terms',
    name: '经典数字缩略语基准语料（20个重点句 · 共27项缩略语）',
    targetLanguage: 'en',
    description: '严格对应研究基准：包含20个含数字缩略语的汉英对齐句对，其中多句包含2项缩略语（如“六稳”与“六保”、“五位一体”与“四个全面”），合计27项数字缩略语实体。',
    pairs: [
      {
        id: 'bench-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'We need to coordinate the implementation of the "two majors" (major national strategies and security capacity in key areas) and accelerate the construction of a modern infrastructure system.',
        annotatedEnglish: 'We need to coordinate the implementation of <Natrans-III>the "two majors" (major national strategies and security capacity in key areas)</Natrans-III> and accelerate the construction of a modern infrastructure system.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-1',
            chineseTerm: '两重',
            englishTranslation: 'the "two majors" (major national strategies and security capacity in key areas)',
            technique: 'III',
            explanation: '字面直译“the two majors”，并在括号内以意译补充说明国家重大战略实施和重点领域安全能力建设具体含义。'
          }
        ]
      },
      {
        id: 'bench-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'We must make solid progress in the construction of Three Platforms and deepen practical cooperation across all fields.',
        annotatedEnglish: 'We must make solid progress in the construction of <Natrans-I>Three Platforms</Natrans-I> and deepen practical cooperation across all fields.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-2',
            chineseTerm: '三大平台',
            englishTranslation: 'Three Platforms',
            technique: 'I',
            explanation: '完全按照汉语原文形式逐字直译，保留数字“Three”及共有成分“Platforms”，未附加解释。'
          }
        ]
      },
      {
        id: 'bench-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'We must coordinate efforts on agriculture, rural areas, and farmers, and continuously consolidate and expand the achievements of poverty alleviation.',
        annotatedEnglish: 'We must coordinate efforts on <Natrans-II>agriculture, rural areas, and farmers</Natrans-II>, and continuously consolidate and expand the achievements of poverty alleviation.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-3',
            chineseTerm: '三农',
            englishTranslation: 'agriculture, rural areas, and farmers',
            technique: 'II',
            explanation: '采用意译策略，抛弃原文数字“三”，直接阐释“农业、农村、农民”三大具体内涵概念。'
          }
        ]
      },
      {
        id: 'bench-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Governments at all levels must strictly implement two guarantees (guarantee of a basic living allowance and pension payment) and secure the bottom line of people\'s livelihoods.',
        annotatedEnglish: 'Governments at all levels must strictly implement <Natrans-III>two guarantees (guarantee of a basic living allowance and pension payment)</Natrans-III> and secure the bottom line of people\'s livelihoods.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-4',
            chineseTerm: '两个确保',
            englishTranslation: 'two guarantees (guarantee of a basic living allowance and pension payment)',
            technique: 'III',
            explanation: '保留字面直译“two guarantees”，同时在括号内用意译补充阐明“基本生活费与养老金发放”具体内容。'
          }
        ]
      },
      {
        id: 'bench-5',
        pairIndex: 5,
        chinese: '通过深化<Na>四换三名</Na>工程，全力激发地方产业创新活力。',
        english: 'Through deepening the 4-R & 3-W initiative, we will fully stimulate the vitality of local industrial innovation.',
        annotatedEnglish: 'Through deepening the <Natrans-IV>4-R & 3-W</Natrans-IV> initiative, we will fully stimulate the vitality of local industrial innovation.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-5',
            chineseTerm: '四换三名',
            englishTranslation: '4-R & 3-W',
            technique: 'IV',
            explanation: '仿照英语字母+数字复合缩略法（4-Replacements & 3-Names）进行仿拟构词翻译。'
          }
        ]
      },
      {
        id: 'bench-6',
        pairIndex: 6,
        chinese: '构建教育、科技、人才<Na>三位一体</Na>协同融合发展新格局。',
        english: 'We shall build a new pattern for the coordinated and integrated development of education, technology, and talent in a trinity.',
        annotatedEnglish: 'We shall build a new pattern for the coordinated and integrated development of education, technology, and talent in a <Natrans-IV>trinity</Natrans-IV>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-6',
            chineseTerm: '三位一体',
            englishTranslation: 'trinity',
            technique: 'IV',
            explanation: '借用英语中现存的宗教/哲学经典数字缩略词汇“trinity”表达三合一有机整体。'
          }
        ]
      },
      {
        id: 'bench-7',
        pairIndex: 7,
        chinese: '强化财政纪律，严厉压缩<Na>三公经费</Na>支出。',
        english: 'We must strengthen financial discipline and strictly curtail spending on official overseas visits, official vehicles, and official hospitality.',
        annotatedEnglish: 'We must strengthen financial discipline and strictly curtail <Natrans-II>spending on official overseas visits, official vehicles, and official hospitality</Natrans-II>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-7',
            chineseTerm: '三公经费',
            englishTranslation: 'spending on official overseas visits, official vehicles, and official hospitality',
            technique: 'II',
            explanation: '完全舍弃数字“三”，将公出国、公车、公务接待三项具体开支意译展开。'
          }
        ]
      },
      {
        id: 'bench-8',
        pairIndex: 8,
        chinese: '全面落实<Na>三去一降一补</Na>重点任务，推动经济结构持续优化。',
        english: 'We have fully implemented the tasks of three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links), driving continuous optimization of the economic structure.',
        annotatedEnglish: 'We have fully implemented the tasks of <Natrans-III>three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links)</Natrans-III>, driving continuous optimization of the economic structure.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-8',
            chineseTerm: '三去一降一补',
            englishTranslation: 'three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links)',
            technique: 'III',
            explanation: '前段直译保留数字结构，后段括号展开去产能、去库存、去杠杆、降成本、补短板具体释义。'
          }
        ]
      },
      {
        id: 'bench-9',
        pairIndex: 9,
        chinese: '全力抓好推动大规模设备更新和消费品以旧换新（<Na>两新</Na>）工作落实。',
        english: 'We will make all-out efforts to implement the policy of large-scale equipment renewals and trade-ins of consumer goods (two renewals).',
        annotatedEnglish: 'We will make all-out efforts to implement the policy of large-scale equipment renewals and trade-ins of consumer goods (<Natrans-I>two renewals</Natrans-I>).',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-9',
            chineseTerm: '两新',
            englishTranslation: 'two renewals',
            technique: 'I',
            explanation: '字面直译为 two renewals，保留数字“two”及概念核心。'
          }
        ]
      },
      {
        id: 'bench-10',
        pairIndex: 10,
        chinese: '统筹推进<Na>五位一体</Na>总体布局，协调推进<Na>四个全面</Na>战略布局。',
        english: 'We have promoted the Five-in-One overall layout and coordinated the Four-Pronged Comprehensive Strategy.',
        annotatedEnglish: 'We have promoted the <Natrans-I>Five-in-One</Natrans-I> overall layout and coordinated the <Natrans-I>Four-Pronged Comprehensive Strategy</Natrans-I>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-10-1',
            chineseTerm: '五位一体',
            englishTranslation: 'Five-in-One',
            technique: 'I',
            explanation: '采用直译复合构词法，保留数字 Five 并对译五位一体结构。'
          },
          {
            id: 'bt-10-2',
            chineseTerm: '四个全面',
            englishTranslation: 'Four-Pronged Comprehensive Strategy',
            technique: 'I',
            explanation: '保留数字 Four 及直译修饰成分。'
          }
        ]
      },
      {
        id: 'bench-11',
        pairIndex: 11,
        chinese: '优化<Na>四大板块</Na>区域发展格局，促进各地区优势互补。',
        english: 'We will optimize the regional development pattern of the four major economic plates and promote mutual complementarity among regions.',
        annotatedEnglish: 'We will optimize the regional development pattern of <Natrans-I>the four major economic plates</Natrans-I> and promote mutual complementarity among regions.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-11',
            chineseTerm: '四大板块',
            englishTranslation: 'the four major economic plates',
            technique: 'I',
            explanation: '直译保留数字 four 与 plates 板块概念。'
          }
        ]
      },
      {
        id: 'bench-12',
        pairIndex: 12,
        chinese: '深入开展<Na>两学一做</Na>学习教育，坚决克服<Na>四风</Na>问题。',
        english: 'We carried out activities to study the Party Constitution and rules, study series of speeches, and become qualified Party members, and resolutely curbed the four undesirable work styles (formalism, bureaucratism, hedonism, and extravagance).',
        annotatedEnglish: 'We carried out activities to <Natrans-II>study the Party Constitution and rules, study series of speeches, and become qualified Party members</Natrans-II>, and resolutely curbed <Natrans-III>the four undesirable work styles (formalism, bureaucratism, hedonism, and extravagance)</Natrans-III>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-12-1',
            chineseTerm: '两学一做',
            englishTranslation: 'study the Party Constitution and rules, study series of speeches, and become qualified Party members',
            technique: 'II',
            explanation: '意译展开具体学习与实践内容，舍弃数字结构。'
          },
          {
            id: 'bt-12-2',
            chineseTerm: '四风',
            englishTranslation: 'the four undesirable work styles (formalism, bureaucratism, hedonism, and extravagance)',
            technique: 'III',
            explanation: '前段直译保留数字 four，后段括号展开四种不良风气具体形式。'
          }
        ]
      },
      {
        id: 'bench-13',
        pairIndex: 13,
        chinese: '统筹做好<Na>六稳</Na>工作，全面落实<Na>六保</Na>任务。',
        english: 'We will maintain stability in six key areas and ensure security in six key areas.',
        annotatedEnglish: 'We will <Natrans-I>maintain stability in six key areas</Natrans-I> and <Natrans-I>ensure security in six key areas</Natrans-I>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-13-1',
            chineseTerm: '六稳',
            englishTranslation: 'maintain stability in six key areas',
            technique: 'I',
            explanation: '字面直译保留数字 six 与稳（stability）核心。'
          },
          {
            id: 'bt-13-2',
            chineseTerm: '六保',
            englishTranslation: 'ensure security in six key areas',
            technique: 'I',
            explanation: '字面直译保留数字 six 与保（security）核心。'
          }
        ]
      },
      {
        id: 'bench-14',
        pairIndex: 14,
        chinese: '构建以国内大循环为主体、国内国际<Na>双循环</Na>相互促进的新发展格局。',
        english: 'We will foster a new development paradigm with domestic circulation as the mainstay and domestic and international dual circulations reinforcing each other.',
        annotatedEnglish: 'We will foster a new development paradigm with domestic circulation as the mainstay and domestic and international <Natrans-I>dual circulations</Natrans-I> reinforcing each other.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-14',
            chineseTerm: '双循环',
            englishTranslation: 'dual circulations',
            technique: 'I',
            explanation: '直译双为 dual，保留双重循环概念。'
          }
        ]
      },
      {
        id: 'bench-15',
        pairIndex: 15,
        chinese: '推动<Na>一带一路</Na>高质量发展，深化国际产能与经贸合作。',
        english: 'We will advance the high-quality development of the Belt and Road Initiative and deepen international industrial capacity and economic cooperation.',
        annotatedEnglish: 'We will advance the high-quality development of <Natrans-I>the Belt and Road Initiative</Natrans-I> and deepen international industrial capacity and economic cooperation.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-15',
            chineseTerm: '一带一路',
            englishTranslation: 'the Belt and Road Initiative',
            technique: 'I',
            explanation: '直译带与路（the Belt and Road），保留象征性意象。'
          }
        ]
      },
      {
        id: 'bench-16',
        pairIndex: 16,
        chinese: '严格遵守中央<Na>八项规定</Na>及其实施细则精神，驰而不息纠治<Na>四风</Na>。',
        english: 'We must strictly abide by the spirit of the Central Eight-Point Decision and its implementation rules, and untiringly rectify the four styles of formalism, bureaucratism, hedonism, and extravagance.',
        annotatedEnglish: 'We must strictly abide by the spirit of <Natrans-I>the Central Eight-Point Decision</Natrans-I> and its implementation rules, and untiringly rectify <Natrans-II>the four styles of formalism, bureaucratism, hedonism, and extravagance</Natrans-II>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-16-1',
            chineseTerm: '八项规定',
            englishTranslation: 'the Central Eight-Point Decision',
            technique: 'I',
            explanation: '直译保留 Eight-Point 及规定（Decision）。'
          },
          {
            id: 'bt-16-2',
            chineseTerm: '四风',
            englishTranslation: 'the four styles of formalism, bureaucratism, hedonism, and extravagance',
            technique: 'II',
            explanation: '意译列举具体四种风气。'
          }
        ]
      },
      {
        id: 'bench-17',
        pairIndex: 17,
        chinese: '稳步推进深化农村<Na>三块地</Na>改革，切实保障农民土地权益。',
        english: 'We will steadily advance the reform of rural land system, specifically rural contracted land, rural collective commercial land, and residential land.',
        annotatedEnglish: 'We will steadily advance the reform of rural land system, specifically <Natrans-II>rural contracted land, rural collective commercial land, and residential land</Natrans-II>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-17',
            chineseTerm: '三块地',
            englishTranslation: 'rural contracted land, rural collective commercial land, and residential land',
            technique: 'II',
            explanation: '意译展开承包地、集体经营性建设用地、宅基地具体三项土地类型。'
          }
        ]
      },
      {
        id: 'bench-18',
        pairIndex: 18,
        chinese: '全面打赢<Na>三大攻坚战</Na>，精准防范化解重大风险。',
        english: 'We have won all-round victories in three critical battles (preventing and defusing major risks, targeted poverty alleviation, and pollution control).',
        annotatedEnglish: 'We have won all-round victories in <Natrans-III>three critical battles (preventing and defusing major risks, targeted poverty alleviation, and pollution control)</Natrans-III>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-18',
            chineseTerm: '三大攻坚战',
            englishTranslation: 'three critical battles (preventing and defusing major risks, targeted poverty alleviation, and pollution control)',
            technique: 'III',
            explanation: '直译 three critical battles，括号内补充三大攻坚战具体内容。'
          }
        ]
      },
      {
        id: 'bench-19',
        pairIndex: 19,
        chinese: '协同推进新型工业化、信息化、城镇化、农业现代化<Na>四化同步</Na>发展，构建<Na>双核多极</Na>城市群格局。',
        english: 'We will promote the synchronized development of the Four Modernizations and build a dual-core and multi-polar urban cluster pattern.',
        annotatedEnglish: 'We will promote the synchronized development of <Natrans-I>the Four Modernizations</Natrans-I> and build a <Natrans-I>dual-core and multi-polar</Natrans-I> urban cluster pattern.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-19-1',
            chineseTerm: '四化同步',
            englishTranslation: 'the Four Modernizations',
            technique: 'I',
            explanation: '直译保留 Four 及 Modernizations。'
          },
          {
            id: 'bt-19-2',
            chineseTerm: '双核多极',
            englishTranslation: 'dual-core and multi-polar',
            technique: 'I',
            explanation: '直译保留 dual 与 multi 构词结构。'
          }
        ]
      },
      {
        id: 'bench-20',
        pairIndex: 20,
        chinese: '坚持统筹发展和安全，抓好防范化解重点领域风险<Na>两手抓</Na>，深化涉企收费治理<Na>三清理</Na>。',
        english: 'We must coordinate development and security, adhere to a two-pronged approach (holding development and security concurrently), and carry out the three clean-ups of enterprise-related fees.',
        annotatedEnglish: 'We must coordinate development and security, adhere to <Natrans-III>a two-pronged approach (holding development and security concurrently)</Natrans-III>, and carry out <Natrans-I>the three clean-ups</Natrans-I> of enterprise-related fees.',
        status: 'completed',
        detectedTerms: [
          {
            id: 'bt-20-1',
            chineseTerm: '两手抓',
            englishTranslation: 'a two-pronged approach (holding development and security concurrently)',
            technique: 'III',
            explanation: '直译 two-pronged 并括号补充两手抓具体内容。'
          },
          {
            id: 'bt-20-2',
            chineseTerm: '三清理',
            englishTranslation: 'the three clean-ups',
            technique: 'I',
            explanation: '直译保留 three 及 clean-ups。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-standard',
    name: '官方政务经典译例精选（8句精选版）',
    description: '精选8个涵盖I/II/III/IV类核心翻译技巧的基准样本。',
    pairs: [
      {
        id: 'sample-0',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'We need to coordinate the implementation of the "two majors" (major national strategies and security capacity in key areas) and accelerate the construction of a modern infrastructure system.',
        annotatedEnglish: 'We need to coordinate the implementation of <Natrans-III>the "two majors" (major national strategies and security capacity in key areas)</Natrans-III> and accelerate the construction of a modern infrastructure system.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-0',
            chineseTerm: '两重',
            englishTranslation: 'the "two majors" (major national strategies and security capacity in key areas)',
            technique: 'III',
            explanation: '字面直译“the two majors”，并在括号内以意译补充说明国家重大战略实施和重点领域安全能力建设具体含义。'
          }
        ]
      },
      {
        id: 'sample-1',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'We must make solid progress in the construction of Three Platforms and deepen practical cooperation across all fields.',
        annotatedEnglish: 'We must make solid progress in the construction of <Natrans-I>Three Platforms</Natrans-I> and deepen practical cooperation across all fields.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-1',
            chineseTerm: '三大平台',
            englishTranslation: 'Three Platforms',
            technique: 'I',
            explanation: '完全按照汉语原文形式逐字直译，保留数字“Three”及共有成分“Platforms”，未附加解释。'
          }
        ]
      },
      {
        id: 'sample-2',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'We must coordinate efforts on agriculture, rural areas, and farmers, and continuously consolidate and expand the achievements of poverty alleviation.',
        annotatedEnglish: 'We must coordinate efforts on <Natrans-II>agriculture, rural areas, and farmers</Natrans-II>, and continuously consolidate and expand the achievements of poverty alleviation.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-2',
            chineseTerm: '三农',
            englishTranslation: 'agriculture, rural areas, and farmers',
            technique: 'II',
            explanation: '采用意译策略，抛弃原文数字“三”，直接阐释“农业、农村、农民”三大具体内涵概念。'
          }
        ]
      },
      {
        id: 'sample-3',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Governments at all levels must strictly implement two guarantees (guarantee of a basic living allowance and pension payment) and secure the bottom line of people\'s livelihoods.',
        annotatedEnglish: 'Governments at all levels must strictly implement <Natrans-III>two guarantees (guarantee of a basic living allowance and pension payment)</Natrans-III> and secure the bottom line of people\'s livelihoods.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-3',
            chineseTerm: '两个确保',
            englishTranslation: 'two guarantees (guarantee of a basic living allowance and pension payment)',
            technique: 'III',
            explanation: '保留字面直译“two guarantees”，同时在括号内用意译补充阐明“基本生活费与养老金发放”具体内容。'
          }
        ]
      },
      {
        id: 'sample-4',
        pairIndex: 5,
        chinese: '通过深化<Na>四换三名</Na>工程，全力激发地方产业创新活力。',
        english: 'Through deepening the 4-R & 3-W initiative, we will fully stimulate the vitality of local industrial innovation.',
        annotatedEnglish: 'Through deepening the <Natrans-IV>4-R & 3-W</Natrans-IV> initiative, we will fully stimulate the vitality of local industrial innovation.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-4',
            chineseTerm: '四换三名',
            englishTranslation: '4-R & 3-W',
            technique: 'IV',
            explanation: '仿照英语字母+数字复合缩略法（4-Replacements & 3-Names）进行仿拟构词翻译。'
          }
        ]
      },
      {
        id: 'sample-5',
        pairIndex: 6,
        chinese: '构建教育、科技、人才<Na>三位一体</Na>协同融合发展新格局。',
        english: 'We shall build a new pattern for the coordinated and integrated development of education, technology, and talent in a trinity.',
        annotatedEnglish: 'We shall build a new pattern for the coordinated and integrated development of education, technology, and talent in a <Natrans-IV>trinity</Natrans-IV>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-5',
            chineseTerm: '三位一体',
            englishTranslation: 'trinity',
            technique: 'IV',
            explanation: '借用英语中现存的宗教/哲学经典数字缩略词汇“trinity”表达三合一有机整体。'
          }
        ]
      },
      {
        id: 'sample-6',
        pairIndex: 7,
        chinese: '强化财政纪律，严厉压缩<Na>三公经费</Na>支出。',
        english: 'We must strengthen financial discipline and strictly curtail spending on official overseas visits, official vehicles, and official hospitality.',
        annotatedEnglish: 'We must strengthen financial discipline and strictly curtail <Natrans-II>spending on official overseas visits, official vehicles, and official hospitality</Natrans-II>.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-6',
            chineseTerm: '三公经费',
            englishTranslation: 'spending on official overseas visits, official vehicles, and official hospitality',
            technique: 'II',
            explanation: '完全舍弃数字“三”，将公出国、公车、公务接待三项具体开支意译展开。'
          }
        ]
      },
      {
        id: 'sample-7',
        pairIndex: 8,
        chinese: '全面落实<Na>三去一降一补</Na>重点任务，推动经济结构持续优化。',
        english: 'We have fully implemented the tasks of three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links), driving continuous optimization of the economic structure.',
        annotatedEnglish: 'We have fully implemented the tasks of <Natrans-III>three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links)</Natrans-III>, driving continuous optimization of the economic structure.',
        status: 'completed',
        detectedTerms: [
          {
            id: 't-7',
            chineseTerm: '三去一降一补',
            englishTranslation: 'three cuts, one reduction and one improvement (cutting overcapacity, reducing excess inventory, deleveraging, lowering business costs, and strengthening weak links)',
            technique: 'III',
            explanation: '前段直译保留数字结构，后段括号展开去产能、去库存、去杠杆、降成本、补短板具体释义。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-spanish-standard',
    name: '西班牙语典型双语基准语料（汉西对齐 · 5句精选）',
    targetLanguage: 'es',
    description: '涵盖西语直译（Tres Plataformas）、意译（el campo）、直译+意译（dos proyectos clave）及文化借用（trinidad）的标准汉西句对。',
    pairs: [
      {
        id: 'bench-es-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'Debemos coordinar la implementación de los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave) y acelerar la construcción de un sistema de infraestructura moderno.',
        annotatedEnglish: 'Debemos coordinar la implementación de <Natrans-III>los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)</Natrans-III> y acelerar la construcción de un sistema de infraestructura moderno.',
        status: 'completed',
        targetLanguage: 'es',
        detectedTerms: [
          {
            id: 'bt-es-1',
            chineseTerm: '两重',
            englishTranslation: 'los "dos proyectos clave" (estrategias nacionales importantes y capacidad de seguridad en áreas clave)',
            technique: 'III',
            explanation: '直译保留 dos proyectos clave，并在括号内以西语意译阐述重大国家战略与重点领域安全能力建设。'
          }
        ]
      },
      {
        id: 'bench-es-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'Debemos avanzar sólidamente en la construcción de Tres Plataformas y profundizar la cooperación práctica en todas las áreas.',
        annotatedEnglish: 'Debemos avanzar sólidamente en la construcción de <Natrans-I>Tres Plataformas</Natrans-I> y profundizar la cooperación práctica en todas las áreas.',
        status: 'completed',
        targetLanguage: 'es',
        detectedTerms: [
          {
            id: 'bt-es-2',
            chineseTerm: '三大平台',
            englishTranslation: 'Tres Plataformas',
            technique: 'I',
            explanation: '完全按照汉语词面逐字直译，保留数词 Tres 及中心名词 Plataformas。'
          }
        ]
      },
      {
        id: 'bench-es-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'Debemos coordinar el trabajo en la agricultura, las zonas rurales y los campesinos, y consolidar y expandir continuamente los logros de la superación de la pobreza.',
        annotatedEnglish: 'Debemos coordinar el trabajo en <Natrans-II>la agricultura, las zonas rurales y los campesinos</Natrans-II>, y consolidar y expandir continuamente los logros de la superación de la pobreza.',
        status: 'completed',
        targetLanguage: 'es',
        detectedTerms: [
          {
            id: 'bt-es-3',
            chineseTerm: '三农',
            englishTranslation: 'la agricultura, las zonas rurales y los campesinos',
            technique: 'II',
            explanation: '采用意译策略，不保留数字3结构，展开农业、农村与农民具体内涵概念。'
          }
        ]
      },
      {
        id: 'bench-es-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Los gobiernos de todos los niveles deben implementar estrictamente dos garantías (garantía de subsidio de subsistencia y pago de pensiones) y asegurar la línea base del bienestar del pueblo.',
        annotatedEnglish: 'Los gobiernos de todos los niveles deben implementar estrictamente <Natrans-III>dos garantías (garantía de subsidio de subsistencia y pago de pensiones)</Natrans-III> y asegurar la línea base del bienestar del pueblo.',
        status: 'completed',
        targetLanguage: 'es',
        detectedTerms: [
          {
            id: 'bt-es-4',
            chineseTerm: '两个确保',
            englishTranslation: 'dos garantías (garantía de subsidio de subsistencia y pago de pensiones)',
            technique: 'III',
            explanation: '直译保留 dos garantías，并在括号内用意译补充基本生活费与养老金发放说明。'
          }
        ]
      },
      {
        id: 'bench-es-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: 'Construir una estructura de gobernanza de trinidad entre la toma de decisiones, la ejecución y la supervisión.',
        annotatedEnglish: 'Construir una estructura de gobernanza de <Natrans-IV>trinidad</Natrans-IV> entre la toma de decisiones, la ejecución y la supervisión.',
        status: 'completed',
        targetLanguage: 'es',
        detectedTerms: [
          {
            id: 'bt-es-5',
            chineseTerm: '三位一体',
            englishTranslation: 'trinidad',
            technique: 'IV',
            explanation: '借用西班牙语固有固化词汇 trinidad 表达三位一体治理架构。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-german-standard',
    name: '德语典型双语基准语料（汉德对齐 · 5句精选）',
    targetLanguage: 'de',
    description: '涵盖德语直译（Drei Plattformen）、意译（Landwirtschaft）、直译+意译（zwei Schwerpunkte）及借用（Trinität）的标准汉德句对。',
    pairs: [
      {
        id: 'bench-de-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'Wir müssen die Umsetzung der "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen) koordinieren und den Aufbau eines modernen Infrastruktursystems beschleunigen.',
        annotatedEnglish: 'Wir müssen die Umsetzung der <Natrans-III>die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)</Natrans-III> koordinieren und den Aufbau eines modernen Infrastruktursystems beschleunigen.',
        status: 'completed',
        targetLanguage: 'de',
        detectedTerms: [
          {
            id: 'bt-de-1',
            chineseTerm: '两重',
            englishTranslation: 'die "zwei Schwerpunkte" (wichtige nationale Strategien und Sicherheitskapazitäten in Schlüsselbereichen)',
            technique: 'III',
            explanation: '直译保留 zwei Schwerpunkte，并在括号内以德语说明重要战略与安全能力建设。'
          }
        ]
      },
      {
        id: 'bench-de-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'Wir müssen den Aufbau von Drei Plattformen solide vorantreiben und die praktische Zusammenarbeit in allen Bereichen vertiefen.',
        annotatedEnglish: 'Wir müssen den Aufbau von <Natrans-I>Drei Plattformen</Natrans-I> solide vorantreiben und die praktische Zusammenarbeit in allen Bereichen vertiefen.',
        status: 'completed',
        targetLanguage: 'de',
        detectedTerms: [
          {
            id: 'bt-de-2',
            chineseTerm: '三大平台',
            englishTranslation: 'Drei Plattformen',
            technique: 'I',
            explanation: '按汉语字面逐字对应直译，保留数词 Drei 与中心名词 Plattformen。'
          }
        ]
      },
      {
        id: 'bench-de-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'Wir müssen die Arbeiten im Bereich Landwirtschaft, ländliche Gebiete und Bauern koordinieren und die Erfolge bei der Armutsbekämpfung kontinuierlich festigen und ausbauen.',
        annotatedEnglish: 'Wir müssen die Arbeiten im Bereich <Natrans-II>Landwirtschaft, ländliche Gebiete und Bauern</Natrans-II> koordinieren und die Erfolge bei der Armutsbekämpfung kontinuierlich festigen und ausbauen.',
        status: 'completed',
        targetLanguage: 'de',
        detectedTerms: [
          {
            id: 'bt-de-3',
            chineseTerm: '三农',
            englishTranslation: 'Landwirtschaft, ländliche Gebiete und Bauern',
            technique: 'II',
            explanation: '意译展开“农业、农村和农民”概念，不保留数字3结构。'
          }
        ]
      },
      {
        id: 'bench-de-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Regierungen aller Ebenen müssen zwei Garantien (Garantie der Grundsicherung und Auszahlung der Renten) strikt umsetzen.',
        annotatedEnglish: 'Regierungen aller Ebenen müssen <Natrans-III>zwei Garantien (Garantie der Grundsicherung und Auszahlung der Renten)</Natrans-III> strikt umsetzen.',
        status: 'completed',
        targetLanguage: 'de',
        detectedTerms: [
          {
            id: 'bt-de-4',
            chineseTerm: '两个确保',
            englishTranslation: 'zwei Garantien (Garantie der Grundsicherung und Auszahlung der Renten)',
            technique: 'III',
            explanation: '直译保留 zwei Garantien，并在括号内附注基本生活与养老金保障阐释。'
          }
        ]
      },
      {
        id: 'bench-de-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: 'Aufbau einer Trinität von Entscheidungsfindung, Durchführung und Aufsicht in der Führungsstruktur.',
        annotatedEnglish: 'Aufbau einer <Natrans-IV>Trinität</Natrans-IV> von Entscheidungsfindung, Durchführung und Aufsicht in der Führungsstruktur.',
        status: 'completed',
        targetLanguage: 'de',
        detectedTerms: [
          {
            id: 'bt-de-5',
            chineseTerm: '三位一体',
            englishTranslation: 'Trinität',
            technique: 'IV',
            explanation: '借用德语既有经典固化词汇 Trinität。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-russian-standard',
    name: '俄语典型双语基准语料（汉俄对齐 · 5句精选）',
    targetLanguage: 'ru',
    description: '涵盖俄语直译（Три платформы）、意译（сельское хозяйство）、直译+意译（два важнейших направления）及借用（триединство）的标准汉俄句对。',
    pairs: [
      {
        id: 'bench-ru-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'Мы должны комплексно продвигать «два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях) и ускорять создание современной инфраструктурной системы.',
        annotatedEnglish: 'Мы должны комплексно продвигать <Natrans-III>«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)</Natrans-III> и ускорять создание современной инфраструктурной системы.',
        status: 'completed',
        targetLanguage: 'ru',
        detectedTerms: [
          {
            id: 'bt-ru-1',
            chineseTerm: '两重',
            englishTranslation: '«два важнейших направления» (важные национальные стратегии и потенциал безопасности в ключевых областях)',
            technique: 'III',
            explanation: '直译保留 два важнейших направления，括号内用意译补充阐述重大国家战略与重点领域安全能力。'
          }
        ]
      },
      {
        id: 'bench-ru-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'Мы должны неуклонно продвигать строительство Трех платформ и углублять практическое сотрудничество во всех областях.',
        annotatedEnglish: 'Мы должны неуклонно продвигать строительство <Natrans-I>Трех платформ</Natrans-I> и углублять практическое сотрудничество во всех областях.',
        status: 'completed',
        targetLanguage: 'ru',
        detectedTerms: [
          {
            id: 'bt-ru-2',
            chineseTerm: '三大平台',
            englishTranslation: 'Трех платформ',
            technique: 'I',
            explanation: '完全按照汉语词面逐字直译，保留数词 Трех 与中心词 платформ。'
          }
        ]
      },
      {
        id: 'bench-ru-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'Необходимо координировать работу в сфере сельского хозяйства, сельских районов и крестьянства, продолжая закреплять и расширять успехи в ликвидации бедности.',
        annotatedEnglish: 'Необходимо координировать работу в сфере <Natrans-II>сельского хозяйства, сельских районов и крестьянства</Natrans-II>, продолжая закреплять и расширять успехи в ликвидации бедности.',
        status: 'completed',
        targetLanguage: 'ru',
        detectedTerms: [
          {
            id: 'bt-ru-3',
            chineseTerm: '三农',
            englishTranslation: 'сельского хозяйства, сельских районов и крестьянства',
            technique: 'II',
            explanation: '意译展开“农业、农村与农民”具体概念，省略数字3结构。'
          }
        ]
      },
      {
        id: 'bench-ru-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Правительства всех уровней должны строго выполнять две гарантии (гарантия базового прожиточного минимума и своевременная выплата пенсий).',
        annotatedEnglish: 'Правительства всех уровней должны строго выполнять <Natrans-III>две гарантии (гарантия базового прожиточного минимума и своевременная выплата пенсий)</Natrans-III>.',
        status: 'completed',
        targetLanguage: 'ru',
        detectedTerms: [
          {
            id: 'bt-ru-4',
            chineseTerm: '两个确保',
            englishTranslation: 'две гарантии (гарантия базового прожиточного минимума и своевременная выплата пенсий)',
            technique: 'III',
            explanation: '保留直译 две гарантии，括号中附加基本生活补助与养老金支付的俄语意译解释。'
          }
        ]
      },
      {
        id: 'bench-ru-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: 'Сформировать эффективную структуру управления на основе триединства принятия решений, исполнения и контроля.',
        annotatedEnglish: 'Сформировать эффективную структуру управления на основе <Natrans-IV>триединства</Natrans-IV> принятия решений, исполнения и контроля.',
        status: 'completed',
        targetLanguage: 'ru',
        detectedTerms: [
          {
            id: 'bt-ru-5',
            chineseTerm: '三位一体',
            englishTranslation: 'триединства',
            technique: 'IV',
            explanation: '借用俄语经典固化词汇 триединство。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-french-standard',
    name: '法语典型双语基准语料（汉法对齐 · 5句精选）',
    targetLanguage: 'fr',
    description: '涵盖法语直译（Trois plateformes）、意译（agriculture）、直译+意译（deux priorités majeures）及借用（trinité）的标准汉法语对。',
    pairs: [
      {
        id: 'bench-fr-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'Nous devons coordonner la mise en œuvre des « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés) et accélérer la construction d\'un système d\'infrastructure moderne.',
        annotatedEnglish: 'Nous devons coordonner la mise en œuvre de <Natrans-III>les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)</Natrans-III> et accélérer la construction d\'un système d\'infrastructure moderne.',
        status: 'completed',
        targetLanguage: 'fr',
        detectedTerms: [
          {
            id: 'bt-fr-1',
            chineseTerm: '两重',
            englishTranslation: 'les « deux priorités majeures » (stratégies nationales majeures et capacité de sécurité dans les domaines clés)',
            technique: 'III',
            explanation: '直译保留 deux priorités majeures，并在括号中用意译详细说明国家战略与重点安全保障。'
          }
        ]
      },
      {
        id: 'bench-fr-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'Nous devons faire avancer solidement la construction de Trois plateformes et approfondir la coopération pragmatique dans tous les domaines.',
        annotatedEnglish: 'Nous devons faire avancer solidement la construction de <Natrans-I>Trois plateformes</Natrans-I> et approfondir la coopération pragmatique dans tous les domaines.',
        status: 'completed',
        targetLanguage: 'fr',
        detectedTerms: [
          {
            id: 'bt-fr-2',
            chineseTerm: '三大平台',
            englishTranslation: 'Trois plateformes',
            technique: 'I',
            explanation: '完全按照汉语词面逐字直译，保留基数词 Trois 及中心词 plateformes。'
          }
        ]
      },
      {
        id: 'bench-fr-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'Nous devons coordonner les travaux concernant l\'agriculture, les zones rurales et les paysans, et consolider sans cesse les acquis de la lutte contre la pauvreté.',
        annotatedEnglish: 'Nous devons coordonner les travaux concernant <Natrans-II>l\'agriculture, les zones rurales et les paysans</Natrans-II>, et consolider sans cesse les acquis de la lutte contre la pauvreté.',
        status: 'completed',
        targetLanguage: 'fr',
        detectedTerms: [
          {
            id: 'bt-fr-3',
            chineseTerm: '三农',
            englishTranslation: "l'agriculture, les zones rurales et les paysans",
            technique: 'II',
            explanation: '意译展开“农业、农村与农民”概念，完全省略数字形式。'
          }
        ]
      },
      {
        id: 'bench-fr-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'Les gouvernements à tous les échelons doivent appliquer rigoureusement les deux garanties (garantie du minimum vital et versement régulier des pensions de retraite).',
        annotatedEnglish: 'Les gouvernements à tous les échelons doivent appliquer rigoureusement <Natrans-III>les deux garanties (garantie du minimum vital et versement régulier des pensions de retraite)</Natrans-III>.',
        status: 'completed',
        targetLanguage: 'fr',
        detectedTerms: [
          {
            id: 'bt-fr-4',
            chineseTerm: '两个确保',
            englishTranslation: 'les deux garanties (garantie du minimum vital et versement régulier des pensions de retraite)',
            technique: 'III',
            explanation: '直译保留 deux garanties，括号内用意译补充基本生活费与养老金保障。'
          }
        ]
      },
      {
        id: 'bench-fr-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: 'Construire une structure de gouvernance en trinité associant prise de décision, exécution et supervision.',
        annotatedEnglish: 'Construire une structure de gouvernance en <Natrans-IV>trinité</Natrans-IV> associant prise de décision, exécution et supervision.',
        status: 'completed',
        targetLanguage: 'fr',
        detectedTerms: [
          {
            id: 'bt-fr-5',
            chineseTerm: '三位一体',
            englishTranslation: 'trinité',
            technique: 'IV',
            explanation: '直接借用法语固有文化/哲学成熟词汇 trinité。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-japanese-standard',
    name: '日语典型双语基准语料（汉日对齐 · 5句精选）',
    targetLanguage: 'ja',
    description: '涵盖日语直译（三大プラットフォーム）、意译（農業・農村・農民）、直译+意译（「二つの重点」）及借用（三位一体）的标准汉日句对。',
    pairs: [
      {
        id: 'bench-ja-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: '我々は「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）の建設を統一的に推進し、現代的なインフラ体系の構築を加速させなければならない。',
        annotatedEnglish: '我々は<Natrans-III>「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）</Natrans-III>の建設を統一的に推進し、現代的なインフラ体系の構築を加速させなければならない。',
        status: 'completed',
        targetLanguage: 'ja',
        detectedTerms: [
          {
            id: 'bt-ja-1',
            chineseTerm: '两重',
            englishTranslation: '「二つの重点」（国家重大戦略の実施および重点分野の安全保障能力構築）',
            technique: 'III',
            explanation: '直译保留「二つの重点」，并在括号中附加日语详细政策内涵注释。'
          }
        ]
      },
      {
        id: 'bench-ja-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: '我々は国家の三大プラットフォームの建設を着実に推進し、各分野の実務協力を深めなければならない。',
        annotatedEnglish: '我々は国家の<Natrans-I>三大プラットフォーム</Natrans-I>の建設を着実に推進し、各分野の実務協力を深めなければならない。',
        status: 'completed',
        targetLanguage: 'ja',
        detectedTerms: [
          {
            id: 'bt-ja-2',
            chineseTerm: '三大平台',
            englishTranslation: '三大プラットフォーム',
            technique: 'I',
            explanation: '完全保留原文汉字数字与中心词的逐字直译形式。'
          }
        ]
      },
      {
        id: 'bench-ja-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: '農業・農村・農民（問題）に関する諸活動を統一的に推進し、貧困脱却の難関攻略の成果を持続的に強固・拡大する。',
        annotatedEnglish: '<Natrans-II>農業・農村・農民（問題）</Natrans-II>に関する諸活動を統一的に推進し、貧困脱却の難関攻略の成果を持続的に強固・拡大する。',
        status: 'completed',
        targetLanguage: 'ja',
        detectedTerms: [
          {
            id: 'bt-ja-3',
            chineseTerm: '三农',
            englishTranslation: '農業・農村・農民（問題）',
            technique: 'II',
            explanation: '抛弃单一数字代码，意译展开农业、农村、农民具体语义。'
          }
        ]
      },
      {
        id: 'bench-ja-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: '各級政府は「二つの確保」（基本的生活保障の支給と年金支給の確保）を厳格に実行しなければならない。',
        annotatedEnglish: '各級政府は<Natrans-III>「二つの確保」（基本的生活保障の支給と年金支給の確保）</Natrans-III>を厳格に実行しなければならない。',
        status: 'completed',
        targetLanguage: 'ja',
        detectedTerms: [
          {
            id: 'bt-ja-4',
            chineseTerm: '两个确保',
            englishTranslation: '「二つの確保」（基本的生活保障の支給と年金支給の確保）',
            technique: 'III',
            explanation: '直译保留「二つの確保」，括号内附带日语基本生活费与年金发放意译补充说明。'
          }
        ]
      },
      {
        id: 'bench-ja-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: '意思決定・執行・監督の三位一体となった効率的なガバナンス構造を構築する。',
        annotatedEnglish: '意思決定・執行・監督の<Natrans-IV>三位一体</Natrans-IV>となった効率的なガバナンス構造を構築する。',
        status: 'completed',
        targetLanguage: 'ja',
        detectedTerms: [
          {
            id: 'bt-ja-5',
            chineseTerm: '三位一体',
            englishTranslation: '三位一体',
            technique: 'IV',
            explanation: '借用日文固有的既成词汇「三位一体」。'
          }
        ]
      }
    ]
  },
  {
    id: 'benchmark-arabic-standard',
    name: '阿拉伯语典型双语基准语料（汉阿对齐 · 5句精选）',
    targetLanguage: 'ar',
    description: '涵盖阿拉伯语直译（المنصات الثلاث الكبرى）、意译（الزراعة والمناطق الريفية）、直译+意译（المهمتان الرئيسيتان）及借用（الثالوث）的标准汉阿句对。',
    pairs: [
      {
        id: 'bench-ar-1',
        pairIndex: 1,
        chinese: '我们要统筹推进<Na>两重</Na>建设，加快构建现代化基础设施体系。',
        english: 'يجب علينا التنسيق لدفع تنفيذ «المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية) وتسريع بناء نظام بنية تحتية حديث.',
        annotatedEnglish: 'يجب علينا التنسيق لدفع تنفيذ <Natrans-III>«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)</Natrans-III> وتسريع بناء نظام بنية تحتية حديث.',
        status: 'completed',
        targetLanguage: 'ar',
        detectedTerms: [
          {
            id: 'bt-ar-1',
            chineseTerm: '两重',
            englishTranslation: '«المهمتان الرئيسيتان» (الاستراتيجيات الوطنية الكبرى والقدرات الأمنية في المجالات الرئيسية)',
            technique: 'III',
            explanation: '直译保留 المهمتان الرئيسيتان，并在括号内以阿语补充说明国家重大战略和关键安全能力。'
          }
        ]
      },
      {
        id: 'bench-ar-2',
        pairIndex: 2,
        chinese: '我们要扎实推进国家<Na>三大平台</Na>建设，深化各领域务实合作。',
        english: 'يجب علينا المضي قدماً في بناء المنصات الثلاث الكبرى وتعميق التعاون العملي في جميع المجالات.',
        annotatedEnglish: 'يجب علينا المضي قدماً في بناء <Natrans-I>المنصات الثلاث الكبرى</Natrans-I> وتعميق التعاون العملي في جميع المجالات.',
        status: 'completed',
        targetLanguage: 'ar',
        detectedTerms: [
          {
            id: 'bt-ar-2',
            chineseTerm: '三大平台',
            englishTranslation: 'المنصات الثلاث الكبرى',
            technique: 'I',
            explanation: '完全按照汉语词面逐字直译，保留数词 الثلاث 与中心词 المنصات。'
          }
        ]
      },
      {
        id: 'bench-ar-3',
        pairIndex: 3,
        chinese: '统筹做好<Na>三农</Na>各项工作，持续巩固拓展脱贫攻坚成果。',
        english: 'يجب تنسيق مختلف الأعمال في مجالات الزراعة والمناطق الريفية والمزارعين ومواصلة تعزيز وتوسيع إنجازات القضاء على الفقر.',
        annotatedEnglish: 'يجب تنسيق مختلف الأعمال في مجالات <Natrans-II>الزراعة والمناطق الريفية والمزارعين</Natrans-II> ومواصلة تعزيز وتوسيع إنجازات القضاء على الفقر.',
        status: 'completed',
        targetLanguage: 'ar',
        detectedTerms: [
          {
            id: 'bt-ar-3',
            chineseTerm: '三农',
            englishTranslation: 'الزراعة والمناطق الريفية والمزارعين',
            technique: 'II',
            explanation: '意译展开“农业、农村与农民”具体概念，省略数字形式。'
          }
        ]
      },
      {
        id: 'bench-ar-4',
        pairIndex: 4,
        chinese: '各级政府要严格落实<Na>两个确保</Na>，兜牢民生保障底线。',
        english: 'يجب على الحكومات على جميع المستويات تطبيق الضمانين (ضمان بدل المعيشة الأساسي ودفع المعاشات التقاعدية) بدقة.',
        annotatedEnglish: 'يجب على الحكومات على جميع المستويات تطبيق <Natrans-III>الضمانين (ضمان بدل المعيشة الأساسي ودفع المعاشات التقاعدية)</Natrans-III> بدقة.',
        status: 'completed',
        targetLanguage: 'ar',
        detectedTerms: [
          {
            id: 'bt-ar-4',
            chineseTerm: '两个确保',
            englishTranslation: 'الضمانين (ضمان بدل المعيشة الأساسي ودفع المعاشات التقاعدية)',
            technique: 'III',
            explanation: '直译保留 الضمانين，括号内补充基本生活津贴与养老金发放说明。'
          }
        ]
      },
      {
        id: 'bench-ar-5',
        pairIndex: 5,
        chinese: '构建科学高效的决策、执行与监督<Na>三位一体</Na>治理架构。',
        english: 'بناء هيكل حوكمة يقوم على الثالوث بين اتخاذ القرارات والتنفيذ والإشراف.',
        annotatedEnglish: 'بناء هيكل حوكمة يقوم على <Natrans-IV>الثالوث</Natrans-IV> بين اتخاذ القرارات والتنفيذ والإشراف.',
        status: 'completed',
        targetLanguage: 'ar',
        detectedTerms: [
          {
            id: 'bt-ar-5',
            chineseTerm: '三位一体',
            englishTranslation: 'الثالوث',
            technique: 'IV',
            explanation: '借用阿拉伯语固有固化词汇 الثالوث 表达三位一体。'
          }
        ]
      }
    ]
  }
];

export function getSampleCorporaForLanguage(lang: TargetLanguage): SampleCorpusGroup[] {
  return SAMPLE_CORPORA.filter((c) => c.targetLanguage === lang);
}

