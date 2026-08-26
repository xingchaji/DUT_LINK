import type { WinningWorkInsight } from "@/lib/types";

export type WinningWorkReader = {
  major?: string;
  skills?: string[];
  bio?: string;
  interests?: string[];
  potentialDirections?: string[];
};

export type WinningWorkEvidence = {
  id: string;
  competitionId: string;
  competitionTitle: string;
  workTitle: string;
  award: string;
  year: number | null;
  school: string;
  evidence: string;
  relevanceSignals: string[];
  fallbackIntroduction: string;
  fallbackSections: Array<{ heading: string; body: string }>;
  fallbackDomains: Array<{ name: string; role: string; integration: string }>;
  fallbackValue: string;
  fallbackTakeaways: string[];
  source: { title: string; url: string; publisher: string };
};

export const winningWorkEvidenceCatalog: WinningWorkEvidence[] = [
  {
    id: "innovation-2025-hybrid-agriculture",
    competitionId: "innovation-2026",
    competitionTitle: "中国国际大学生创新大赛",
    workTitle: "大型农机装备电驱混合动力总成关键技术研发与应用",
    award: "2025 产业赛道金奖（企业命题组）",
    year: 2025,
    school: "大连理工大学",
    evidence: "教育部公布的中国国际大学生创新大赛（2025）产业赛道获奖名单将该项目列为金奖，企业命题来自广西玉柴机器股份有限公司。",
    relevanceSignals: ["机械", "车辆", "能源", "电气", "自动化", "控制", "工业工程", "农业工程", "产品"],
    fallbackIntroduction: "这件作品值得关注，不只是因为它讨论混合动力，而是因为它把大型农机的真实工况转化成了一个多学科系统问题：机械负载决定动力需求，电驱系统负责能量转换，控制策略决定不同动力源何时介入，企业场景又对可靠性、维护成本和可部署性提出约束。官方资料确认了作品名称、学校、赛道和奖项；下面对技术结构的讨论，是基于题目与企业命题所做的工程分析，不把未公开的参数或实验结论当成事实。",
    fallbackSections: [
      { heading: "一、作品试图解决什么问题", body: "大型农业机械并不是匀速运行的普通车辆。耕作、转场、起步和重载作业会形成完全不同的负载曲线，单纯追求峰值功率往往会牺牲油耗、续航或设备寿命。因此，这类题目真正要解决的，是在复杂工况下同时满足动力性、经济性和可靠性。竞赛团队需要先把模糊的‘节能’目标拆成可测量指标，例如能耗、响应时间、持续作业能力、温升和故障率，再决定动力总成结构。" },
      { heading: "二、可能的系统方案如何分层", body: "从题目可以合理推断，方案至少包含机械动力链、电机与功率电子、储能或供能单元、传感器、控制器和上位分析工具。机械层给出转矩与转速需求；电气层完成能量转换；传感层持续获取负载、温度和能量状态；控制层根据工况分配动力；验证层用台架或实际作业数据比较不同策略。关键不在于把这些模块罗列出来，而在于明确输入、输出和约束，让每个专业的成果能够被下一个模块使用。" },
      { heading: "三、其他领域的知识怎样真正结合进来", body: "机械工程提供可承受的结构和传动边界，电气工程把控制指令变成稳定功率输出，控制科学则根据负载预测与状态反馈协调动力源。软件工程并非只做一个显示界面，而要承担数据采集、控制状态管理、故障诊断、参数版本管理和实验复现。产业设计与运维知识进一步约束方案：如果系统难以检修、对环境过于敏感或成本无法接受，即使实验室指标优秀，也很难成为完整的企业解决方案。" },
      { heading: "四、竞赛作品应如何建立证据链", body: "专业的作品介绍应从典型工况出发，给出基线方案，再说明新方案在哪些指标上改进。控制策略必须与传感数据和执行结果对应；机械、电气和软件模块都应保留版本、测试条件与异常记录。最终答辩不应只展示一条理想曲线，而应解释极端负载、传感器漂移、部件过热或通信中断时系统如何退化。这样，跨学科合作才从‘多人分工’变成可验证的系统工程。" },
      { heading: "五、证据边界", body: "公开获奖名单没有给出该作品的具体动力结构、算法、实验数值或产业化结果，因此本文没有替团队补写这些事实。上述系统分层和验证方法，是依据作品题目、企业命题与相关工程常识作出的分析，用来帮助读者理解这类项目通常如何组织，而不是对原作品技术细节的复述。" },
    ],
    fallbackDomains: [
      { name: "机械工程", role: "定义负载谱、传动结构、强度与热管理边界", integration: "机械模型向控制层提供转矩、转速和安全范围，控制结果又反向决定结构承受的动态载荷。" },
      { name: "电气工程", role: "负责电机、功率电子、能量转换与保护", integration: "电气系统把算法输出变成实际功率，同时把电流、温度和能量状态反馈给控制器。" },
      { name: "控制科学", role: "识别工况并协调多动力源的能量分配", integration: "控制策略连接机械需求与电气执行，是不同物理模块之间的实时决策层。" },
      { name: "软件工程", role: "实现数据采集、状态机、诊断、标定和实验追踪", integration: "软件把传感、控制与验证串成可观测流程，使跨专业接口能够重复测试和定位问题。" },
    ],
    fallbackValue: "如果你的专业是软件、设计或管理，这件作品提供的关键启发是：优秀竞赛作品不是给成熟硬件附加一个应用，而是把真实工况转化成接口清晰、指标一致、能够联调和验证的系统。",
    fallbackTakeaways: ["从真实工况而不是技术名词开始", "用统一指标连接机械、电气和软件", "保留异常与退化场景的验证证据", "明确官方事实和技术推断的边界"],
    source: { title: "教育部关于公布中国国际大学生创新大赛（2025）获奖名单的通知", url: "https://cy.ncss.cn/information/2c9583329714f692019ca229d24001c4", publisher: "全国大学生创业服务网" },
  },
  {
    id: "challenge-cup-green-space-engine",
    competitionId: "challenge-cup",
    competitionTitle: "“挑战杯”全国大学生课外学术科技作品竞赛",
    workTitle: "“助燃航天梦”——基于电点火方式的新概念绿色无毒 ADN 基空间发动机",
    award: "特等奖",
    year: null,
    school: "北京交通大学",
    evidence: "挑战杯官方项目库将其标记为特等奖。官方简介说明，作品面向航天器推进、姿态控制与轨道机动需求，针对传统催化点火的高温失活和冷启动问题，提出电点火方式的绿色无毒 ADN 基空间发动机。",
    relevanceSignals: ["航空", "航天", "力学", "化学", "材料", "能源", "机械", "电气", "自动化", "控制"],
    fallbackIntroduction: "这件作品的价值在于，它没有把‘绿色推进剂’停留在材料选择层面，而是围绕点火这一关键瓶颈重新组织发动机系统。官方项目库明确说明了传统催化点火存在高温失活和难以冷启动的问题，并确认作品采用电点火思路。由此可以看到，化学推进剂、电气激励、燃烧过程、机械结构和航天任务约束必须在同一个验证框架中协同。",
    fallbackSections: [
      { heading: "一、从任务场景定位核心瓶颈", body: "航天推进系统必须在极端环境中可靠启动，且每次点火都直接关联姿态控制、轨道机动或位置保持。官方简介把问题集中到催化剂高温失活与冷启动困难，这种表述非常适合竞赛研究：它把宏大的航天目标压缩成了可以设计、测试和比较的关键环节。作品的创新逻辑不是‘换一种推进剂’，而是重新思考推进剂被可靠触发的方式。" },
      { heading: "二、电点火为什么会牵动整个系统", body: "电点火需要电源、点火部件和精确时序，但点火能量最终必须作用于化学反应，并在燃烧室、喷注与热结构允许的范围内形成稳定推力。因此，电路参数不能脱离推进剂特性，材料选择不能脱离温度场，机械结构也不能脱离点火压力和重复启动需求。任一学科局部最优，都可能在系统层面制造新的风险。" },
      { heading: "三、跨领域知识如何形成闭环", body: "化学与材料研究给出推进剂反应和耐受边界；电气工程设计能量注入与保护；控制系统负责点火时序、状态判断和异常终止；机械与热设计保证燃烧室、喷注结构和连接部件承受压力与温度；航天工程则用任务剖面规定质量、可靠性和响应速度。测试数据必须跨层流动：电信号、温度、压力和推力需要同步记录，才能判断失败究竟来自材料、控制还是结构。" },
      { heading: "四、软件与数据方法在其中的真实位置", body: "即便作品的核心是发动机，软件仍承担试验控制、传感同步、数据清洗、状态识别和安全联锁。专业的软件实现应提供可追踪的测试配置、时间戳一致的数据链和异常回放，而不是只绘制结果图。数据分析还可以帮助团队比较不同点火能量、环境条件和结构版本，但任何模型结论都必须回到物理试验验证。" },
      { heading: "五、从作品中可复用的方法", body: "这类项目最值得迁移的方法，是用‘瓶颈—机理—系统方案—多源证据’组织研究。先用任务约束说明为什么问题重要，再用机理解释方案为何可能有效，随后展示不同专业模块如何连接，最后用同步实验数据证明改进。官方页面未公开全部参数，本文不对具体性能作额外推断。" },
    ],
    fallbackDomains: [
      { name: "化学与材料", role: "定义推进剂反应、点火条件和耐高温材料边界", integration: "材料和反应特性决定电点火所需能量，也约束燃烧室与绝热结构。" },
      { name: "电气工程", role: "设计点火能量注入、电源与保护电路", integration: "电气参数必须与化学反应窗口和机械安全上限共同标定。" },
      { name: "控制与软件", role: "管理点火时序、状态监测、联锁和试验数据", integration: "控制系统把传感反馈转成继续、重试或终止动作，并为多学科故障定位提供统一时间线。" },
      { name: "航空宇航与机械", role: "定义任务剖面并设计承压、喷注和热结构", integration: "任务需求给出质量和可靠性指标，结构测试反过来验证点火方案能否用于真实推进系统。" },
    ],
    fallbackValue: "对计算机、控制或材料专业学生而言，这件作品说明了跨学科创新的核心不是堆叠技术名词，而是围绕同一物理瓶颈建立共同变量、接口和验证数据。",
    fallbackTakeaways: ["把宏大场景缩小成关键瓶颈", "用同步多源数据定位跨模块问题", "让控制策略服从物理与安全边界", "用机理而不是口号解释创新"],
    source: { title: "挑战杯官方人才项目库", url: "https://xmk.tiaozhanbei.net/project/", publisher: "挑战杯官方项目库" },
  },
  {
    id: "ccdc-2021-smart-logistics",
    competitionId: "ccdc-2026",
    competitionTitle: "中国大学生计算机设计大赛",
    workTitle: "智慧物流分拣机器人",
    award: "2021 人工智能应用二等奖",
    year: 2021,
    school: "广西科技大学",
    evidence: "中国大学生计算机设计大赛组委会发布的 2021 年获奖作品公示将“智慧物流分拣机器人”列为人工智能应用类二等奖。公开名单提供作品名称、类别、奖项和参赛学校，不包含未核验的技术细节。",
    relevanceSignals: ["软件", "计算机", "人工智能", "数据", "自动化", "机器人", "物流", "工业工程", "电子信息"],
    fallbackIntroduction: "对于软件工程或计算机专业，这件作品比一个普通的图像识别 Demo 更有研究价值，因为‘分拣机器人’要求算法进入连续运行的物理流程。系统不仅要识别物品，还要把识别结果转成可执行任务，在传送、抓取、放置和异常恢复之间维持一致状态。官方名单只确认了作品名称、类别、奖项和学校，因此下面的架构分析明确属于基于题目的工程推演，不声称原团队使用了某个特定模型、框架或硬件。",
    fallbackSections: [
      { heading: "一、把‘识别物品’改写成系统问题", body: "真实分拣任务的输入不是一张干净图片，而是持续到达、姿态不一、可能遮挡或破损的物品流。输出也不是一个分类标签，而是带位置、置信度、目标去向和处理时限的作业指令。因此，问题需要同时定义识别准确率、漏检率、单件处理时延、吞吐量、误分拣代价和人工接管条件。软件团队只有先理解物流流程，才能知道模型指标如何转化为业务指标。" },
      { heading: "二、软件架构应如何支撑物理流程", body: "一个可落地的系统通常需要感知层、识别层、任务规划层、设备控制层和监控层。感知层统一相机或传感器数据；识别层输出类别与置信度；规划层结合传送带位置和执行器能力生成任务；控制层把任务转换为机械动作；监控层记录每个物品从进入到离开的完整事件链。消息队列、状态机、超时与幂等处理在这里比页面效果更重要，因为重复指令或状态丢失会直接造成物理错误。" },
      { heading: "三、其他领域的知识具体用在哪里", body: "机器人学提供坐标变换、运动规划与执行反馈，使视觉结果能够落到真实空间；机械设计决定抓取器、传送结构和允许的速度范围；物流工程提供分拣规则、队列优先级和吞吐评价；人因工程规定告警如何被操作员理解以及何时允许人工介入。人工智能模型只是其中一个模块，它必须向下游提供稳定、可解释且带置信度的输出，同时接受设备和业务规则的约束。" },
      { heading: "四、软件工程如何把不同领域连接起来", body: "软件工程的核心贡献是定义稳定接口和可观测状态。数据结构要同时表达视觉检测结果、物理坐标、任务状态和异常原因；时间同步要保证图像、传送带位置与机械动作对应同一物品；日志与指标要支持从一次误分拣反查模型版本、设备状态和规则配置。测试也应分层进行：离线数据集验证识别，仿真验证规划，硬件在环验证控制，完整产线验证吞吐和恢复能力。" },
      { heading: "五、如何形成专业的竞赛证据", body: "高质量答辩不应只展示‘机器人成功抓取’的视频，而应给出基线、指标和失败案例。团队可以比较人工分拣、固定规则与智能方案的准确率和节拍，展示低置信度、遮挡、设备卡滞或网络延迟时的退化策略，并说明数据如何采集、标注和分割。这样才能证明系统不是偶然运行，而是一个可复现、可诊断、可扩展的工程成果。" },
      { heading: "六、事实与推断的边界", body: "官方获奖公示没有提供该作品的技术报告，所以本文没有把任何算法名称、硬件型号或性能数值写成原作品事实。上述分层架构来自对‘智慧物流分拣机器人’这类系统的专业分析，用于说明不同知识领域怎样结合。若要进一步研究原作品，应继续寻找团队论文、演示视频或技术文档并交叉核验。" },
    ],
    fallbackDomains: [
      { name: "人工智能", role: "从传感数据中识别物品、位置与置信度", integration: "识别结果需要转换为带空间坐标和可靠度的任务输入，并受物流规则与设备能力约束。" },
      { name: "机器人学", role: "完成坐标变换、运动规划和执行反馈", integration: "机器人把数字识别结果映射到物理动作，并把执行状态回传给任务状态机。" },
      { name: "物流工程", role: "定义分拣路径、队列优先级、吞吐量和错误代价", integration: "业务规则决定算法优化目标，也用于判断一次识别或动作在流程上是否正确。" },
      { name: "软件工程", role: "组织消息、状态、异常恢复、监控与版本追踪", integration: "软件通过统一事件模型连接视觉、规划、控制和运营数据，使整套系统可测试、可诊断。" },
      { name: "人因工程", role: "设计告警、人工接管和安全交互", integration: "当算法置信度不足或设备异常时，人机协作流程负责让系统安全降级而不是继续误操作。" },
    ],
    fallbackValue: "对软件工程专业而言，这件作品最重要的启发是：算法价值取决于它能否进入稳定的业务与物理闭环。接口设计、状态一致性、可观测性、异常恢复和分层测试，正是软件专业把 AI、机器人与物流知识真正结合起来的位置。",
    fallbackTakeaways: ["把模型指标翻译成业务与系统指标", "用事件和状态机连接数字判断与物理动作", "为低置信度和设备故障设计降级路径", "用分层测试证明系统可复现", "明确区分官方事实与架构推演"],
    source: { title: "2021 年中国大学生计算机设计大赛获奖作品公示", url: "https://jsjds.blcu.edu.cn/__local/7/B1/D0/0132E73AA6616D838CF0DC81C02_4B1BF8DA_35E06.pdf?e=.pdf", publisher: "中国大学生计算机设计大赛组委会" },
  },
  {
    id: "ccdc-2019-ar-cultural-tools",
    competitionId: "ccdc-2026",
    competitionTitle: "中国大学生计算机设计大赛",
    workTitle: "楚国农耕器具的 AR 技术可视化展示",
    award: "2019 人工智能应用系统三等奖",
    year: 2019,
    school: "华中师范大学",
    evidence: "中国大学生计算机设计大赛官方获奖名单记录了作品名称、人工智能应用系统类别、三等奖和参赛学校。名单未提供交互流程、建模方法或展示效果。",
    relevanceSignals: ["建筑", "设计", "视觉", "数字媒体", "历史", "文化遗产", "交互", "AR"],
    fallbackIntroduction: "这件作品把传统农耕器具转化为可交互的数字展示对象，天然位于文化研究、视觉叙事、三维表达和软件实现的交叉点。对建筑、设计或数字媒体专业来说，它提供了一个很好的范例：数字化不是给文物模型增加炫目的动画，而是要把器物结构、使用方式、历史语境和观众探索路径重新组织成可理解的空间叙事。官方名单没有公开完整方案，以下内容是基于题目进行的方法论分析。",
    fallbackSections: [
      { heading: "一、先确定展示的知识目标", body: "农耕器具的价值不只在外形，还在材料、结构、动作方式和特定生产关系。项目首先需要回答观众看完后应该理解什么：是器具的构造，是使用动作，还是它与地域生活的关系。历史与博物馆知识在这里负责筛选可靠信息，避免三维模型精美却丢失文化语境。" },
      { heading: "二、从实物资料到数字资产", body: "建筑测绘、工业设计和数字媒体方法可以共同建立器物的尺度、结构和表面信息。采集结果需要经过三维建模、拓扑优化、纹理处理和移动端性能适配。每一次简化都应保留对理解器具最重要的特征，并记录资料来源；这使视觉效果与学术准确性不再互相冲突。" },
      { heading: "三、AR 与空间设计怎样结合", body: "AR 系统要识别现实环境、确定虚拟物体的尺度与位置，并维持稳定跟踪。空间与交互设计则决定观众从哪里开始、以什么距离观察、如何切换结构剖面或使用动画。软件中的锚点、坐标和状态管理，必须服从人的观看动线和信息层级，技术稳定性也会直接影响叙事可信度。" },
      { heading: "四、跨学科内容如何进入交互", body: "历史研究提供事实与术语，设计学把知识转成视觉层级，三维技术重建形态，动画表现使用动作，计算机视觉完成环境跟踪，前端或游戏引擎组织交互状态。真正的结合点是同一个知识节点：例如观众点击某个结构时，模型高亮、动作演示、文字解释和来源标注应同时响应，而不是四套内容各自存在。" },
      { heading: "五、如何验证它不是技术展示", body: "除了跟踪稳定性和帧率，团队还应测试观众是否正确理解器具结构、是否能在合理时间完成探索、哪些交互造成误解，以及不同年龄用户是否需要不同信息层级。这样的用户研究能把文化准确性、视觉表达和软件性能放入共同评价框架。" },
      { heading: "六、证据边界", body: "官方名单只确认作品基本获奖事实，没有公开上述实现细节。本文讨论的是这一题目若要专业落地所需要的知识结构和验证方法，不能替代原团队的作品说明。" },
    ],
    fallbackDomains: [
      { name: "历史与文化遗产", role: "核验器物背景、用途、术语和叙事重点", integration: "研究成果成为模型标注、动画和交互说明的内容依据。" },
      { name: "建筑与空间设计", role: "处理尺度、观看距离、动线与信息空间", integration: "空间逻辑决定虚拟对象如何进入现实环境，也约束交互顺序。" },
      { name: "三维与视觉设计", role: "重建形态并形成清晰的视觉层级", integration: "数字资产既要服从历史证据，也要适配实时渲染与教学表达。" },
      { name: "计算机视觉与软件", role: "实现环境跟踪、坐标锚定、状态管理和性能优化", integration: "软件把现实空间、数字模型和知识内容同步到同一次用户操作中。" },
      { name: "用户研究", role: "验证观众是否理解内容并发现交互障碍", integration: "用户反馈反向修正叙事层级、空间布局和软件交互。" },
    ],
    fallbackValue: "对建筑或设计专业而言，这件作品表明数字技术的作用不是替代专业知识，而是把尺度、结构、使用动作和历史语境组织成可探索的体验；对软件专业而言，真正的难点是让每次交互都保持内容、空间和状态一致。",
    fallbackTakeaways: ["先定义知识目标再选择媒介", "让空间动线决定交互结构", "数字资产必须保留来源和尺度依据", "同时验证技术性能与用户理解"],
    source: { title: "2019 年中国大学生计算机设计大赛获奖名单", url: "https://jsjds.blcu.edu.cn/virtual_attach_file.vsb?afc=woRGXYnz-iUNQ2o%2FzUDU4laL8-ZM8UKsozUPMzVVMN-8M770gihFp2hmCIa0MkybnSh7nShRU4MVUNM2UlWknll8U4W2M874ozNanR-bozfFU4rkMzGDLRTFLz7aL46RgjfNQmOeLmGPozlPMm7PLmlPM47sLSbaQ2CeosXjQdA4qjM%2FQdL0qIbtpYyPLRU4g47PMRNJqdOnx&e=.pdf&nid=1149&oid=1825439128&tid=1043", publisher: "中国大学生计算机设计大赛组委会" },
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function relevanceScore(evidence: WinningWorkEvidence, reader: WinningWorkReader) {
  const weightedSignals = [
    { value: reader.major ?? "", weight: 10 },
    ...(reader.skills ?? []).map((value) => ({ value, weight: 6 })),
    ...(reader.interests ?? []).map((value) => ({ value, weight: 4 })),
    ...(reader.potentialDirections ?? []).map((value) => ({ value, weight: 4 })),
    { value: reader.bio ?? "", weight: 2 },
  ].filter((item) => item.value.trim());
  return evidence.relevanceSignals.reduce((total, signal) => total + weightedSignals.reduce((sum, readerSignal) => {
    const a = normalize(signal);
    const b = normalize(readerSignal.value);
    return sum + (a.includes(b) || b.includes(a) ? readerSignal.weight : 0);
  }, 0), 0);
}

export function rankWinningWorkEvidence(candidates: WinningWorkEvidence[], reader?: WinningWorkReader) {
  if (!reader) return [...candidates];
  return [...candidates].sort((left, right) => relevanceScore(right, reader) - relevanceScore(left, reader) || left.id.localeCompare(right.id));
}

export function describeWinningWorkRelevance(evidence: WinningWorkEvidence, reader?: WinningWorkReader) {
  const major = reader?.major?.trim() || "你的专业";
  const readerText = normalize([major, ...(reader?.skills ?? []), ...(reader?.interests ?? []), ...(reader?.potentialDirections ?? [])].join(" "));
  const matched = evidence.relevanceSignals.filter((signal) => readerText.includes(normalize(signal)) || normalize(signal).includes(normalize(major))).slice(0, 3);
  const complementary = evidence.fallbackDomains.filter((item) => !matched.some((signal) => item.name.includes(signal))).slice(0, 2).map((item) => item.name);
  return matched.length
    ? `该作品与${major}中的${matched.join("、")}能力直接相关，同时能补充${complementary.join("、")}视角。`
    : `该作品与${major}并非同一传统学科，但它展示了${evidence.fallbackDomains.slice(0, 3).map((item) => item.name).join("、")}如何围绕同一问题协作，适合作为跨专业方法案例。`;
}

export function toCuratedWinningWork(evidence: WinningWorkEvidence, reader?: WinningWorkReader): WinningWorkInsight {
  const recommendedFor = reader?.major?.trim() || "跨专业学习者";
  return {
    id: evidence.id,
    competitionId: evidence.competitionId,
    competitionTitle: evidence.competitionTitle,
    workTitle: evidence.workTitle,
    award: evidence.award,
    year: evidence.year,
    school: evidence.school,
    introduction: evidence.fallbackIntroduction,
    relevanceReason: describeWinningWorkRelevance(evidence, reader),
    articleSections: evidence.fallbackSections,
    knowledgeDomains: evidence.fallbackDomains,
    crossDisciplinaryValue: evidence.fallbackValue,
    takeaways: evidence.fallbackTakeaways,
    recommendedFor,
    mode: "curated",
    source: evidence.source,
  };
}
