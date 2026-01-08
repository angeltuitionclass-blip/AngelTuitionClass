
export enum BehaviorType {
  POSITIVE = 'POSITIVE',
  NEED_WORK = 'NEED_WORK'
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  points: number;
  behaviors: BehaviorLog[];
  tuitionStatus: 'paid' | 'unpaid';
  lastPaidAmount?: number;
}

export interface BehaviorLog {
  id: string;
  type: BehaviorType;
  label: string;
  timestamp: number;
}

export type ViewState = 'dashboard' | 'billing' | 'games';

export type Language = 'en' | 'zh';

export const STUDENT_TRAITS = [
  { id: 'creative', label_en: 'Creative', label_zh: '思维活跃', icon: '🎨' },
  { id: 'diligent', label_en: 'Diligent', label_zh: '勤奋好学', icon: '📚' },
  { id: 'helpful', label_en: 'Helpful', label_zh: '乐于助人', icon: '🤝' },
  { id: 'focused', label_en: 'Focused', label_zh: '专注认真', icon: '🧘' },
  { id: 'math', label_en: 'Math Whiz', label_zh: '数学小能手', icon: '🧮' },
  { id: 'polite', label_en: 'Polite', label_zh: '懂礼貌', icon: '🙏' },
  { id: 'leadership', label_en: 'Leader', label_zh: '有领导力', icon: '👑' },
  { id: 'improvement', label_en: 'Big Progress', label_zh: '进步很大', icon: '📈' },
];

export const TRANSLATIONS = {
  en: {
    dashboard: 'Home',
    billing: 'Tuition',
    games: 'Fun Zone',
    explorers: 'My Students',
    welcome: 'Welcome back',
    points: 'Points',
    id: 'Student ID',
    unpaid: 'Pending',
    paid: 'Settled',
    addPoints: 'Give Points',
    quickAward: 'Award Stars',
    helpful: 'Being Helpful',
    focused: 'Staying Focused',
    excellent: 'Great Work',
    tardy: 'Needs Effort',
    aiReport: 'AI Report Builder',
    genReport: 'Generate AI Letter',
    genBill: 'Generate Receipt',
    customBill: 'Payment Entry',
    enterAmount: 'Amount (e.g. 200)',
    preview: 'AI Output Preview',
    history: 'Classroom Moments',
    exit: 'Go Back',
    rank: 'Personal Progress',
    totalCollection: 'Total Fees Received',
    ledger: 'Tuition Tracking',
    customTrait: 'Add custom note...',
    add: 'Add',
    customPoint: 'Custom Pts',
    award: 'Award',
    addStudent: 'New Student',
    deleteStudent: 'Remove Student',
    confirmDelete: 'Are you sure you want to remove this student?',
    sendReminder: 'Class Reminder',
    reminderSent: 'Reminder prepared!',
    shareToParent: 'Share to Parent',
    copied: 'Copied to clipboard!',
    studentName: 'Student Name',
    settings: 'Settings',
    academyName: 'Academy Name',
    teacherName: 'Teacher Name',
    save: 'Save Changes',
    reminderTemplate: (name: string) => `Hello! This is a friendly reminder that ${name}'s class is about to start soon. Looking forward to seeing them in class! 🚀`
  },
  zh: {
    dashboard: '首页',
    billing: '学费管理',
    games: '互动空间',
    explorers: '学生名单',
    welcome: '欢迎回来',
    points: '积分',
    id: '学号',
    unpaid: '待缴纳',
    paid: '已缴清',
    addPoints: '奖励分数',
    quickAward: '颁发星星',
    helpful: '乐于助人',
    focused: '专注认真',
    excellent: '表现优异',
    tardy: '需多关注',
    aiReport: 'AI 评语生成',
    genReport: '生成温情评语',
    genBill: '生成电子收据',
    customBill: '自定义缴费',
    enterAmount: '输入金额 (例如 200)',
    preview: 'AI 预览窗口',
    history: '成长记录',
    exit: '返回',
    rank: '个人成长进度',
    totalCollection: '学费总收入',
    ledger: '缴费进度跟踪',
    customTrait: '输入自定义观察...',
    add: '添加',
    customPoint: '自定义分数',
    award: '奖励',
    addStudent: '新增学生',
    deleteStudent: '移除学生',
    confirmDelete: '确定要移除这位学生吗？',
    sendReminder: '上课提醒',
    reminderSent: '提醒已生成！',
    shareToParent: '发送给家长',
    copied: '已复制到剪贴板！',
    studentName: '学生姓名',
    settings: '基本设置',
    academyName: '学院/中心名称',
    teacherName: '老师名称',
    save: '保存修改',
    reminderTemplate: (name: string) => `您好！温馨提醒：${name} 的课程即将开始，请准时参加。期待在课堂上见到宝贝！🚀`
  }
};
