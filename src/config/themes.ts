export type ThemeVibe = 'amber-gold' | 'dark-space' | 'blue' | 'rose' | 'emerald' | 'purple';

export interface ThemeConfig {
  id: ThemeVibe;
  label: string;
  emoji: string;
  dotClass: string;
  
  // Page / Root App
  pageBg: string;
  
  // Sidebar
  sidebarBg: string;
  sidebarActivePill: string;
  sidebarActiveText: string;
  
  // Top bar
  topBarBg: string;
  topBarBorder: string;
  
  // Front card (Warm/Luxury)
  frontBg: string;
  frontBorder: string;
  frontTextColor: string;
  frontAccent: string;
  frontTagBg: string;
  frontTagText: string;
  frontIpaBg: string;
  frontControlBtn: string;
  frontHintText: string;
  mascotBg: string;
  mascotEmoji: string;
  
  // Back card
  backBg: string;
  backBorder: string;
  backTextColor: string;
  backBoxBg: string;
  backBoxBorder: string;
  
  // 3 Action Buttons (Chưa nhớ, Lật thẻ, Đã nhớ)
  btn1Bg: string;
  btn1Border: string;
  btn1Text: string;
  btn1Kbd: string;
  
  btnSpaceBg: string;
  btnSpaceBorder: string;
  btnSpaceText: string;
  btnSpaceKbd: string;
  
  btn2Bg: string;
  btn2Border: string;
  btn2Text: string;
  btn2Kbd: string;
  
  // Companion Widgets
  companion1Bg: string;
  companion1Border: string;
  companion1TagBg: string;
  companion1TagText: string;
  companion1Mascot: string;
  
  companion2Bg: string;
  companion2Border: string;
  
  // Accents & Progress
  accentColor: string;
  accentBg: string;
  accentText: string;
  progressBarColor: string;
  nextBtnBg: string;
}

export const THEME_CONFIGS: Record<ThemeVibe, ThemeConfig> = {
  'amber-gold': {
    id: 'amber-gold',
    label: 'Vàng Hoàng Kim (Mặc định)',
    emoji: '☀️',
    dotClass: 'bg-amber-400 border border-amber-600',
    pageBg: 'bg-[#fcf9f2] dark:bg-[#12160e]',
    sidebarBg: 'bg-[#3b4e24] dark:bg-[#1c2810]',
    sidebarActivePill: 'bg-[#f5b84c] text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-slate-200/80 dark:border-slate-800/80',
    frontBg: 'bg-gradient-to-br from-[#f5b945] via-[#e5a832] to-[#d69620]',
    frontBorder: 'border-amber-400/50 shadow-[0_15px_50px_rgba(245,185,69,0.35)]',
    frontTextColor: 'text-slate-950',
    frontAccent: 'text-slate-900',
    frontTagBg: 'bg-black/20 border-black/10',
    frontTagText: 'text-slate-900 font-black',
    frontIpaBg: 'bg-black/15 text-slate-950 border-black/15',
    frontControlBtn: 'bg-black/15 hover:bg-black/25 text-slate-950',
    frontHintText: 'text-slate-950/80',
    mascotBg: 'bg-amber-300 border-4 border-amber-400',
    mascotEmoji: '☀️',
    backBg: 'bg-gradient-to-br from-[#3b4e24] via-[#4d632f] to-[#31421e]',
    backBorder: 'border-lime-500/40 shadow-[0_15px_50px_rgba(59,78,36,0.5)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-black/30 backdrop-blur-md',
    backBoxBorder: 'border-lime-400/20',
    btn1Bg: 'bg-[#edd9d6] dark:bg-[#3d1818] hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-800',
    btn1Text: 'text-[#84231e] dark:text-rose-200',
    btn1Kbd: 'bg-white/70 dark:bg-rose-950 text-[#84231e] dark:text-rose-300 border-rose-300 dark:border-rose-700',
    btnSpaceBg: 'bg-[#4d632f] dark:bg-[#3b4e24] hover:bg-[#597337]',
    btnSpaceBorder: 'border-lime-600/60',
    btnSpaceText: 'text-white',
    btnSpaceKbd: 'bg-lime-950 text-lime-300 border-lime-700/60',
    btn2Bg: 'bg-[#dceddb] dark:bg-[#1a3821] hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-800',
    btn2Text: 'text-[#1b5e28] dark:text-emerald-200',
    btn2Kbd: 'bg-white/70 dark:bg-emerald-950 text-[#1b5e28] dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    companion1Bg: 'bg-[#3b4e24]',
    companion1Border: 'border-lime-600/30 shadow-xl',
    companion1TagBg: 'bg-black/30 border-lime-400/30',
    companion1TagText: 'text-yellow-300',
    companion1Mascot: '☀️',
    companion2Bg: 'bg-white dark:bg-[#182215]',
    companion2Border: 'border-slate-200 dark:border-slate-800 shadow-xl',
    accentColor: '#f5b84c',
    accentBg: 'bg-[#f5b84c] hover:bg-amber-400',
    accentText: 'text-amber-500',
    progressBarColor: 'bg-amber-400',
    nextBtnBg: 'bg-[#f5b84c] hover:bg-amber-400 text-slate-950',
  },
  'dark-space': {
    id: 'dark-space',
    label: 'Đêm Vũ Trụ',
    emoji: '🌌',
    dotClass: 'bg-indigo-900 border border-amber-400',
    pageBg: 'bg-[#f1f5f9] dark:bg-[#060910]',
    sidebarBg: 'bg-[#0e1626] dark:bg-[#090f1a]',
    sidebarActivePill: 'bg-cyan-400 text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-slate-200/80 dark:border-slate-800/80',
    frontBg: 'bg-gradient-to-b from-[#132743] via-[#0f1d33] to-[#0a1526]',
    frontBorder: 'border-blue-500/40 shadow-[0_15px_50px_rgba(15,29,51,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-cyan-300',
    frontTagBg: 'bg-slate-900/70 border-white/10',
    frontTagText: 'text-cyan-200',
    frontIpaBg: 'bg-white/15 text-cyan-200 border-white/15',
    frontControlBtn: 'bg-white/15 hover:bg-white/25 text-white',
    frontHintText: 'text-white/80',
    mascotBg: 'bg-blue-900/80 border-4 border-blue-400/40',
    mascotEmoji: '🌙',
    backBg: 'bg-gradient-to-b from-[#203a43] via-[#0f2027] to-[#2c5364]',
    backBorder: 'border-cyan-500/40 shadow-[0_15px_50px_rgba(32,58,67,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-black/35 backdrop-blur-md',
    backBoxBorder: 'border-cyan-500/20',
    btn1Bg: 'bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700/60 hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-700/60',
    btn1Text: 'text-rose-800 dark:text-rose-200',
    btn1Kbd: 'bg-white/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    btnSpaceBg: 'bg-cyan-800 dark:bg-cyan-950/80 hover:bg-cyan-700 dark:hover:bg-cyan-900',
    btnSpaceBorder: 'border-cyan-600/60',
    btnSpaceText: 'text-white dark:text-cyan-100',
    btnSpaceKbd: 'bg-cyan-950 text-cyan-200 border-cyan-600/60',
    btn2Bg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/60 hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-600/60',
    btn2Text: 'text-emerald-800 dark:text-emerald-200',
    btn2Kbd: 'bg-white/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#132743] to-[#0a1526]',
    companion1Border: 'border-blue-500/30 shadow-xl',
    companion1TagBg: 'bg-blue-950/80 border-blue-400/30',
    companion1TagText: 'text-blue-300',
    companion1Mascot: '🌙',
    companion2Bg: 'bg-white dark:bg-[#111722]',
    companion2Border: 'border-slate-200 dark:border-slate-800 shadow-xl',
    accentColor: '#38bdf8',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400',
    accentText: 'text-cyan-400',
    progressBarColor: 'bg-cyan-400',
    nextBtnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
  },
  blue: {
    id: 'blue',
    label: 'Xanh Đại Dương',
    emoji: '🌊',
    dotClass: 'bg-blue-500',
    pageBg: 'bg-[#f0f7ff] dark:bg-[#06101f]',
    sidebarBg: 'bg-[#0d2850] dark:bg-[#081830]',
    sidebarActivePill: 'bg-cyan-400 text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-blue-200 dark:border-blue-900/60',
    frontBg: 'bg-gradient-to-b from-[#0f2c59] via-[#091e3d] to-[#06142a]',
    frontBorder: 'border-cyan-500/40 shadow-[0_15px_50px_rgba(15,44,89,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-cyan-300',
    frontTagBg: 'bg-blue-950/80 border-cyan-400/20',
    frontTagText: 'text-cyan-200',
    frontIpaBg: 'bg-white/15 text-cyan-200 border-white/15',
    frontControlBtn: 'bg-white/15 hover:bg-white/25 text-white',
    frontHintText: 'text-white/80',
    mascotBg: 'bg-cyan-900/80 border-4 border-cyan-400/40',
    mascotEmoji: '🌊',
    backBg: 'bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0f172a]',
    backBorder: 'border-blue-400/50 shadow-[0_15px_50px_rgba(30,58,138,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-blue-950/50 backdrop-blur-md',
    backBoxBorder: 'border-blue-400/30',
    btn1Bg: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700/60 hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-700/60',
    btn1Text: 'text-rose-800 dark:text-rose-200',
    btn1Kbd: 'bg-white/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    btnSpaceBg: 'bg-blue-700 dark:bg-blue-900/80 hover:bg-blue-600 dark:hover:bg-blue-800',
    btnSpaceBorder: 'border-blue-500/60',
    btnSpaceText: 'text-white dark:text-blue-100',
    btnSpaceKbd: 'bg-blue-950 text-blue-200 border-blue-600/60',
    btn2Bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/60 hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-600/60',
    btn2Text: 'text-emerald-800 dark:text-emerald-200',
    btn2Kbd: 'bg-white/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#0f2c59] to-[#07172f]',
    companion1Border: 'border-cyan-500/30 shadow-xl',
    companion1TagBg: 'bg-blue-950/90 border-cyan-400/30',
    companion1TagText: 'text-cyan-300',
    companion1Mascot: '🌊',
    companion2Bg: 'bg-white dark:bg-[#091b35]',
    companion2Border: 'border-blue-200 dark:border-blue-900/60 shadow-xl',
    accentColor: '#38bdf8',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400',
    accentText: 'text-cyan-400',
    progressBarColor: 'bg-cyan-400',
    nextBtnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
  },
  rose: {
    id: 'rose',
    label: 'Đỏ Ruby',
    emoji: '🔥',
    dotClass: 'bg-rose-500',
    pageBg: 'bg-[#fff1f2] dark:bg-[#1a050d]',
    sidebarBg: 'bg-[#3d0f1e] dark:bg-[#260711]',
    sidebarActivePill: 'bg-rose-400 text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-rose-200 dark:border-rose-950/60',
    frontBg: 'bg-gradient-to-b from-[#3d0f1e] via-[#2a0914] to-[#1a050c]',
    frontBorder: 'border-rose-500/40 shadow-[0_15px_50px_rgba(61,15,30,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-rose-300',
    frontTagBg: 'bg-rose-950/80 border-rose-400/20',
    frontTagText: 'text-rose-200',
    frontIpaBg: 'bg-white/15 text-rose-200 border-white/15',
    frontControlBtn: 'bg-white/15 hover:bg-white/25 text-white',
    frontHintText: 'text-white/80',
    mascotBg: 'bg-rose-900/80 border-4 border-rose-400/40',
    mascotEmoji: '🔥',
    backBg: 'bg-gradient-to-b from-[#881337] via-[#4c0519] to-[#1f020a]',
    backBorder: 'border-rose-400/50 shadow-[0_15px_50px_rgba(136,19,55,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-rose-950/50 backdrop-blur-md',
    backBoxBorder: 'border-rose-400/30',
    btn1Bg: 'bg-rose-100 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700/60 hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-700/60',
    btn1Text: 'text-rose-800 dark:text-rose-200',
    btn1Kbd: 'bg-white/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    btnSpaceBg: 'bg-rose-700 dark:bg-rose-900/80 hover:bg-rose-600 dark:hover:bg-rose-800',
    btnSpaceBorder: 'border-rose-500/60',
    btnSpaceText: 'text-white dark:text-rose-100',
    btnSpaceKbd: 'bg-rose-950 text-rose-200 border-rose-600/60',
    btn2Bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/60 hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-600/60',
    btn2Text: 'text-emerald-800 dark:text-emerald-200',
    btn2Kbd: 'bg-white/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#380e1c] to-[#1f050e]',
    companion1Border: 'border-rose-500/30 shadow-xl',
    companion1TagBg: 'bg-rose-950/90 border-rose-400/30',
    companion1TagText: 'text-rose-300',
    companion1Mascot: '🔥',
    companion2Bg: 'bg-white dark:bg-[#220712]',
    companion2Border: 'border-rose-200 dark:border-rose-950/80 shadow-xl',
    accentColor: '#fb7185',
    accentBg: 'bg-rose-500 hover:bg-rose-400',
    accentText: 'text-rose-500',
    progressBarColor: 'bg-rose-400',
    nextBtnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
  },
  emerald: {
    id: 'emerald',
    label: 'Xanh Rừng Rậm',
    emoji: '🌿',
    dotClass: 'bg-emerald-500',
    pageBg: 'bg-[#f0fdf4] dark:bg-[#03140c]',
    sidebarBg: 'bg-[#0a2f1d] dark:bg-[#051c11]',
    sidebarActivePill: 'bg-emerald-400 text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-emerald-200 dark:border-emerald-950/60',
    frontBg: 'bg-gradient-to-b from-[#0a2f1d] via-[#062013] to-[#03130b]',
    frontBorder: 'border-emerald-500/40 shadow-[0_15px_50px_rgba(10,47,29,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-emerald-300',
    frontTagBg: 'bg-emerald-950/80 border-emerald-400/20',
    frontTagText: 'text-emerald-200',
    frontIpaBg: 'bg-white/15 text-emerald-200 border-white/15',
    frontControlBtn: 'bg-white/15 hover:bg-white/25 text-white',
    frontHintText: 'text-white/80',
    mascotBg: 'bg-emerald-900/80 border-4 border-emerald-400/40',
    mascotEmoji: '🌿',
    backBg: 'bg-gradient-to-b from-[#065f46] via-[#064e3b] to-[#022c22]',
    backBorder: 'border-emerald-400/50 shadow-[0_15px_50px_rgba(6,95,70,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-emerald-950/50 backdrop-blur-md',
    backBoxBorder: 'border-emerald-400/30',
    btn1Bg: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700/60 hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-700/60',
    btn1Text: 'text-rose-800 dark:text-rose-200',
    btn1Kbd: 'bg-white/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    btnSpaceBg: 'bg-emerald-700 dark:bg-emerald-900/80 hover:bg-emerald-600 dark:hover:bg-emerald-800',
    btnSpaceBorder: 'border-emerald-500/60',
    btnSpaceText: 'text-white dark:text-emerald-100',
    btnSpaceKbd: 'bg-emerald-950 text-emerald-200 border-emerald-600/60',
    btn2Bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/60 hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-600/60',
    btn2Text: 'text-emerald-800 dark:text-emerald-200',
    btn2Kbd: 'bg-white/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#0a2e1d] to-[#04170e]',
    companion1Border: 'border-emerald-500/30 shadow-xl',
    companion1TagBg: 'bg-emerald-950/90 border-emerald-400/30',
    companion1TagText: 'text-emerald-300',
    companion1Mascot: '🌿',
    companion2Bg: 'bg-white dark:bg-[#082016]',
    companion2Border: 'border-emerald-200 dark:border-emerald-950/80 shadow-xl',
    accentColor: '#34d399',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400',
    accentText: 'text-emerald-500',
    progressBarColor: 'bg-emerald-400',
    nextBtnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
  },
  purple: {
    id: 'purple',
    label: 'Tím Huyền Bí',
    emoji: '🔮',
    dotClass: 'bg-purple-500',
    pageBg: 'bg-[#faf5ff] dark:bg-[#12061f]',
    sidebarBg: 'bg-[#24133b] dark:bg-[#160b24]',
    sidebarActivePill: 'bg-purple-400 text-slate-950',
    sidebarActiveText: 'text-slate-950',
    topBarBg: 'bg-transparent',
    topBarBorder: 'border-purple-200 dark:border-purple-950/60',
    frontBg: 'bg-gradient-to-b from-[#24133b] via-[#190c29] to-[#0e0618]',
    frontBorder: 'border-purple-500/40 shadow-[0_15px_50px_rgba(36,19,59,0.8)]',
    frontTextColor: 'text-white',
    frontAccent: 'text-purple-300',
    frontTagBg: 'bg-purple-950/80 border-purple-400/20',
    frontTagText: 'text-purple-200',
    frontIpaBg: 'bg-white/15 text-purple-200 border-white/15',
    frontControlBtn: 'bg-white/15 hover:bg-white/25 text-white',
    frontHintText: 'text-white/80',
    mascotBg: 'bg-purple-900/80 border-4 border-purple-400/40',
    mascotEmoji: '🔮',
    backBg: 'bg-gradient-to-b from-[#581c87] via-[#3b0764] to-[#1c0332]',
    backBorder: 'border-purple-400/50 shadow-[0_15px_50px_rgba(88,28,135,0.8)]',
    backTextColor: 'text-white',
    backBoxBg: 'bg-purple-950/50 backdrop-blur-md',
    backBoxBorder: 'border-purple-400/30',
    btn1Bg: 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700/60 hover:opacity-90',
    btn1Border: 'border-rose-300 dark:border-rose-700/60',
    btn1Text: 'text-rose-800 dark:text-rose-200',
    btn1Kbd: 'bg-white/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    btnSpaceBg: 'bg-purple-700 dark:bg-purple-900/80 hover:bg-purple-600 dark:hover:bg-purple-800',
    btnSpaceBorder: 'border-purple-500/60',
    btnSpaceText: 'text-white dark:text-purple-100',
    btnSpaceKbd: 'bg-purple-950 text-purple-200 border-purple-600/60',
    btn2Bg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/60 hover:opacity-90',
    btn2Border: 'border-emerald-300 dark:border-emerald-600/60',
    btn2Text: 'text-emerald-800 dark:text-emerald-200',
    btn2Kbd: 'bg-white/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/60',
    companion1Bg: 'bg-gradient-to-b from-[#25103d] to-[#120520]',
    companion1Border: 'border-purple-500/30 shadow-xl',
    companion1TagBg: 'bg-purple-950/90 border-purple-400/30',
    companion1TagText: 'text-purple-300',
    companion1Mascot: '🔮',
    companion2Bg: 'bg-white dark:bg-[#1a0a2b]',
    companion2Border: 'border-purple-200 dark:border-purple-950/80 shadow-xl',
    accentColor: '#c084fc',
    accentBg: 'bg-purple-500 hover:bg-purple-400',
    accentText: 'text-purple-400',
    progressBarColor: 'bg-purple-400',
    nextBtnBg: 'bg-purple-500 hover:bg-purple-400 text-white',
  },
};
