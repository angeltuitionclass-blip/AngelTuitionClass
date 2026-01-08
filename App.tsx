
import React, { useState, useEffect } from 'react';
import { ViewState, Student, BehaviorType, STUDENT_TRAITS, Language, TRANSLATIONS } from './types';
import StudentCard from './components/StudentCard';
import GameHub from './components/GameHub';
import { generateStudentReport, generateTuitionReceipt } from './services/geminiService';

const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Aliff Danial', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aliff', points: 45, behaviors: [], tuitionStatus: 'paid', lastPaidAmount: 350 },
  { id: '2', name: 'Mei Ling', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Meiling', points: 72, behaviors: [], tuitionStatus: 'unpaid' },
  { id: '3', name: 'Karthik Raja', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Karthik', points: 58, behaviors: [], tuitionStatus: 'paid', lastPaidAmount: 350 },
  { id: '4', name: 'Sarah Tan', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah', points: 91, behaviors: [], tuitionStatus: 'paid', lastPaidAmount: 400 },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [lang, setLang] = useState<Language>('zh');
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [academyName, setAcademyName] = useState('EduPro Plus');
  const [teacherName, setTeacherName] = useState('Teacher');
  const [showSettings, setShowSettings] = useState(false);

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customTraits, setCustomTraits] = useState<string[]>([]);
  const [customTraitInput, setCustomTraitInput] = useState('');
  const [billAmount, setBillAmount] = useState<string>('');
  const [customPointInput, setCustomPointInput] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedAcademy = localStorage.getItem('edupro_academy');
    const savedTeacher = localStorage.getItem('edupro_teacher');
    if (savedAcademy) setAcademyName(savedAcademy);
    if (savedTeacher) setTeacherName(savedTeacher);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('edupro_academy', academyName);
    localStorage.setItem('edupro_teacher', teacherName);
    setShowSettings(false);
    showToast(t.copied);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: (students.length + 1).toString(),
      name: newStudentName,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newStudentName}`,
      points: 0,
      behaviors: [],
      tuitionStatus: 'unpaid'
    };
    setStudents([...students, newStudent]);
    setNewStudentName('');
    setShowAddModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setStudents(students.filter(s => s.id !== id));
      setSelectedStudent(null);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedStudent) return;
    const reminderText = t.reminderTemplate(selectedStudent.name);
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Class Reminder', text: reminderText });
        showToast(t.reminderSent);
      } catch (err) { console.log('Error sharing', err); }
    } else {
      navigator.clipboard.writeText(reminderText);
      showToast(t.copied);
    }
  };

  const handleShare = async () => {
    if (!aiResult) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EduPro Report', text: aiResult });
      } catch (err) { console.log('Error sharing', err); }
    } else {
      navigator.clipboard.writeText(aiResult);
      showToast(t.copied);
    }
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]);
  };

  const handleAddCustomTrait = () => {
    if (customTraitInput.trim() && !customTraits.includes(customTraitInput)) {
      setCustomTraits(prev => [...prev, customTraitInput]);
      setSelectedTraits(prev => [...prev, customTraitInput]);
      setCustomTraitInput('');
    }
  };

  const updatePoints = (studentId: string, amount: number, label: string, type: BehaviorType) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          points: Math.max(0, s.points + amount),
          behaviors: [{ id: Math.random().toString(), type, label, timestamp: Date.now() }, ...s.behaviors]
        };
      }
      return s;
    }));
  };

  const handleCustomPointAward = () => {
    if (selectedStudent && customPointInput) {
      const pts = parseInt(customPointInput);
      if (!isNaN(pts)) {
        updatePoints(selectedStudent.id, pts, lang === 'zh' ? '特别表现' : 'Special performance', pts >= 0 ? BehaviorType.POSITIVE : BehaviorType.NEED_WORK);
        setCustomPointInput('');
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent || selectedTraits.length === 0) return;
    setIsGenerating(true);
    try {
      const report = await generateStudentReport(selectedStudent, selectedTraits, lang, teacherName);
      setAiResult(report);
    } catch (err) {
      setAiResult(lang === 'zh' ? '生成失败，请重试。' : 'Failed to generate, please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedStudent || !billAmount) return;
    setIsGenerating(true);
    try {
      const receipt = await generateTuitionReceipt(selectedStudent, parseFloat(billAmount), 'Nov 2024', lang, academyName);
      setAiResult(receipt);
    } catch (err) {
      setAiResult(lang === 'zh' ? '生成失败，请重试。' : 'Failed to generate, please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Kawaii Background Header */}
      <div className="fixed top-0 left-0 w-full h-[32rem] bg-gradient-to-b from-[#FFDEE9] to-[#B5FFFC] -z-10 rounded-b-[6rem] shadow-inner overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/40 rounded-full blur-xl float-animation"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white/30 rounded-full blur-2xl float-animation" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-white text-pink-500 border-2 border-pink-200 px-8 py-4 rounded-full shadow-2xl font-bold text-sm animate-in fade-in slide-in-from-top-4 duration-300">
          ✨ {toast}
        </div>
      )}

      <header className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer group" onClick={() => { setView('dashboard'); setSelectedStudent(null); }}>
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-lg border-4 border-pink-100 group-hover:scale-110 group-hover:rotate-6 transition-all">✨</div>
          <div>
            <h1 className="text-3xl font-black text-pink-600 font-branding tracking-tight">{academyName}</h1>
            <p className="text-sm font-bold text-pink-400/80">{lang === 'zh' ? `${teacherName} 的魔法课堂` : `${teacherName}'s Magic Class`}</p>
          </div>
        </div>
        
        <nav className="hidden md:flex gap-4 bg-white/60 backdrop-blur-xl p-2 rounded-full border-2 border-white shadow-xl">
          <button onClick={() => { setView('dashboard'); setSelectedStudent(null); }} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-pink-500 text-white shadow-lg scale-105' : 'text-pink-400 hover:bg-white/40'}`}>{t.dashboard}</button>
          <button onClick={() => { setView('billing'); setSelectedStudent(null); }} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${view === 'billing' ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'text-indigo-400 hover:bg-white/40'}`}>{t.billing}</button>
          <button onClick={() => { setView('games'); setSelectedStudent(null); }} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${view === 'games' ? 'bg-orange-400 text-white shadow-lg scale-105' : 'text-orange-400 hover:bg-white/40'}`}>{t.games}</button>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="bg-white hover:bg-pink-50 text-pink-500 px-4 py-3 rounded-2xl border-2 border-pink-100 font-bold text-sm transition-all shadow-sm">
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <div onClick={() => setShowSettings(true)} className="cursor-pointer group relative">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${teacherName}`} className="w-14 h-14 rounded-3xl border-4 border-white shadow-xl bg-pink-50 group-hover:scale-110 transition-all" alt="Profile" />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 border-2 border-pink-100 shadow-md">🍭</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-6">
        {view === 'dashboard' && !selectedStudent && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[4rem] p-10 mb-10 border-4 border-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-pink-600 mb-2 font-branding">{t.explorers}</h2>
                <p className="text-pink-400 font-medium">{lang === 'zh' ? '给可爱的小朋友们发星星吧！' : 'Select a student to give some magic stars!'}</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="bg-pink-500 text-white px-10 py-5 rounded-[2.5rem] font-black shadow-xl kawaii-btn-shadow flex items-center gap-3 active:scale-95 transition-all text-lg">
                <span className="text-2xl">🧸</span> {t.addStudent}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {students.map(s => (
                <StudentCard key={s.id} student={s} lang={lang} onClick={() => setSelectedStudent(s)} />
              ))}
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="bg-white/90 backdrop-blur-3xl rounded-[4rem] shadow-2xl border-4 border-white overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            {/* Cute Student Header */}
            <div className="bg-gradient-to-r from-pink-300 to-indigo-300 p-12 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
               <button onClick={() => { setSelectedStudent(null); setAiResult(null); setSelectedTraits([]); setCustomTraits([]); }} className="absolute top-8 left-8 bg-white/30 hover:bg-white/50 p-4 rounded-3xl backdrop-blur-xl transition-all border-2 border-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              </button>

              <div className="relative">
                <div className="w-40 h-40 rounded-[3rem] bg-white p-2 shadow-2xl border-4 border-pink-100 rotate-3">
                  <img src={selectedStudent.avatar} className="w-full h-full rounded-[2.5rem] object-cover" alt="" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-300 text-pink-700 px-6 py-2 rounded-3xl font-black text-2xl shadow-xl border-4 border-white -rotate-6">
                  {selectedStudent.points} ⭐
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-6xl font-black mb-3 font-branding drop-shadow-sm text-white">{selectedStudent.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <span className="bg-white/30 px-5 py-2 rounded-full text-sm font-bold border border-white/40 backdrop-blur-md italic"># {selectedStudent.id}</span>
                  <span className={`px-6 py-2 rounded-full text-sm font-black shadow-sm border-2 ${selectedStudent.tuitionStatus === 'paid' ? 'bg-green-300/40 border-green-100' : 'bg-pink-400/40 border-pink-100 animate-pulse'}`}>
                    {selectedStudent.tuitionStatus === 'paid' ? `🍓 ${t.paid}` : `🍬 ${t.unpaid}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button onClick={handleSendReminder} className="bg-yellow-300 text-pink-800 px-8 py-5 rounded-[2rem] font-black text-sm flex items-center gap-3 transition-all kawaii-btn-shadow hover:scale-105 active:scale-95">
                  🔔 {t.sendReminder}
                </button>
                <button onClick={() => handleDeleteStudent(selectedStudent.id)} className="bg-white/20 hover:bg-white/40 px-8 py-4 rounded-[1.5rem] font-bold text-xs flex items-center gap-2 border border-white/30">
                  ☁️ {t.deleteStudent}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-x divide-pink-50">
              {/* Left Column */}
              <div className="lg:col-span-4 p-10 space-y-12 bg-pink-50/20">
                <section>
                  <h3 className="text-xs font-black text-pink-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-pink-400 rounded-full"></span> {t.quickAward}
                  </h3>
                  <div className="grid grid-cols-2 gap-5 mb-8">
                    {[
                      { icon: '🎨', label: t.helpful, pts: 5, color: 'bg-rose-100 text-rose-600 border-rose-200' },
                      { icon: '🌙', label: t.focused, pts: 5, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
                      { icon: '🎀', label: t.excellent, pts: 10, color: 'bg-pink-100 text-pink-600 border-pink-200' },
                      { icon: '☁️', label: t.tardy, pts: -5, color: 'bg-slate-100 text-slate-500 border-slate-200' },
                    ].map((btn, i) => (
                      <button key={i} onClick={() => updatePoints(selectedStudent.id, btn.pts, btn.label, btn.pts >= 0 ? BehaviorType.POSITIVE : BehaviorType.NEED_WORK)} className={`flex flex-col items-center gap-2 p-6 rounded-[2.5rem] ${btn.color} border-2 transition-all hover:scale-110 kawaii-btn-shadow active:scale-95 group`}>
                        <span className="text-4xl group-hover:rotate-12 transition-all">{btn.icon}</span>
                        <span className="font-bold text-[10px] uppercase tracking-widest">{btn.label} ({btn.pts > 0 ? '+' : ''}{btn.pts})</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 bg-white p-3 rounded-[2rem] border-2 border-pink-100 shadow-inner">
                    <input type="number" placeholder={t.customPoint} value={customPointInput} onChange={(e) => setCustomPointInput(e.target.value)} className="w-full px-5 py-3 rounded-2xl border-none outline-none font-bold text-pink-500 placeholder:text-pink-200" />
                    <button onClick={handleCustomPointAward} className="bg-pink-400 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-pink-500 transition-all active:scale-95">OK</button>
                  </div>
                </section>

                <section>
                   <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-400 rounded-full"></span> {t.customBill}
                  </h3>
                  <div className="p-8 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100 space-y-4 shadow-sm">
                    <input type="number" placeholder={t.enterAmount} value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="w-full px-6 py-5 rounded-2xl border-2 border-white bg-white/80 outline-none font-bold text-indigo-600 focus:border-indigo-400 text-lg shadow-inner" />
                    <button onClick={handleGenerateBill} disabled={!billAmount || isGenerating} className="w-full bg-indigo-500 text-white py-5 rounded-[2rem] font-black shadow-lg kawaii-btn-shadow hover:bg-indigo-600 transition-all disabled:opacity-50 text-sm">
                      {isGenerating ? '🍭...' : `🧾 ${t.genBill}`}
                    </button>
                  </div>
                </section>
              </div>

              {/* Middle Column */}
              <div className="lg:col-span-4 p-10 bg-white space-y-10">
                 <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-400 rounded-full"></span> {t.aiReport}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {STUDENT_TRAITS.map(trait => (
                      <button
                        key={trait.id}
                        onClick={() => toggleTrait(lang === 'zh' ? trait.label_zh : trait.label_en)}
                        className={`p-4 rounded-3xl border-2 text-left transition-all flex items-center gap-3 ${selectedTraits.includes(lang === 'zh' ? trait.label_zh : trait.label_en) ? 'bg-purple-500 border-purple-500 text-white shadow-xl scale-105' : 'bg-slate-50 border-white text-slate-400 hover:border-purple-200'}`}
                      >
                        <span className="text-2xl">{trait.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                          {lang === 'zh' ? trait.label_zh : trait.label_en}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input type="text" value={customTraitInput} onChange={(e) => setCustomTraitInput(e.target.value)} placeholder={t.customTrait} className="flex-1 px-6 py-4 rounded-2xl border-2 border-purple-100 focus:border-purple-400 outline-none text-xs font-bold bg-purple-50/30" onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTrait()} />
                      <button onClick={handleAddCustomTrait} className="bg-purple-500 text-white px-6 py-4 rounded-2xl font-black text-xs hover:bg-purple-600 shadow-md active:scale-95">+</button>
                    </div>
                  </div>

                  <button onClick={handleGenerateReport} disabled={selectedTraits.length === 0 || isGenerating} className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-6 rounded-[2.5rem] font-black shadow-2xl hover:scale-105 transition-all disabled:opacity-50 text-lg kawaii-btn-shadow">
                    {isGenerating ? '🪄...' : `🧁 ${t.genReport}`}
                  </button>
              </div>

              {/* Right Column (Preview & Share) */}
              <div className="lg:col-span-4 p-10 bg-slate-50 flex flex-col">
                 <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span> {t.preview}
                  </h3>
                  <div className="flex-1 flex flex-col">
                    {aiResult ? (
                      <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
                        <div className="flex-1 bg-white p-10 rounded-[3.5rem] border-4 border-white shadow-inner overflow-y-auto text-sm leading-loose font-medium text-slate-600 mb-8 italic relative">
                          <div className="absolute top-4 right-4 text-4xl opacity-10">✉️</div>
                          {aiResult}
                        </div>
                        <button onClick={handleShare} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-slate-800 transition-all kawaii-btn-shadow active:scale-95 text-lg">
                          <span className="text-2xl">🍰</span> {t.shareToParent}
                        </button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[4rem] border-4 border-dashed border-pink-100 opacity-80">
                        <div className="text-7xl mb-8 float-animation">🍧</div>
                        <h4 className="text-2xl font-black text-pink-400 mb-3 font-branding tracking-tight">{lang === 'zh' ? '甜甜的评语' : 'Sugar-coated Notes'}</h4>
                        <p className="text-[10px] text-pink-300 font-bold uppercase tracking-[0.2em]">{lang === 'zh' ? '选好标签，看我变魔术' : 'Select traits to start the magic'}</p>
                      </div>
                    )}
                  </div>
              </div>
            </div>
          </div>
        )}

        {view === 'games' && <GameHub lang={lang} />}
        
        {view === 'billing' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="bg-white/60 backdrop-blur-3xl rounded-[4rem] p-12 mb-10 border-4 border-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-4xl font-black text-indigo-600 mb-2 font-branding">{t.ledger}</h2>
                <p className="text-indigo-400 font-medium">{lang === 'zh' ? '看看我们的云端零用钱宝库' : 'Let\'s check our digital treasure chest!'}</p>
              </div>
              <div className="bg-indigo-500 px-12 py-8 rounded-[3.5rem] border-4 border-white text-center shadow-xl kawaii-btn-shadow">
                <p className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest mb-1">{t.totalCollection}</p>
                <p className="text-4xl font-black text-white">RM {students.reduce((acc, s) => acc + (s.lastPaidAmount || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl rounded-[4rem] shadow-2xl overflow-hidden border-4 border-white">
               <table className="w-full text-left">
                <thead className="bg-indigo-50 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-12 py-8">{lang === 'zh' ? '魔法学生' : 'Magical Student'}</th>
                    <th className="px-12 py-8">{lang === 'zh' ? '心情状态' : 'Mood'}</th>
                    <th className="px-12 py-8">{lang === 'zh' ? '最近零用' : 'Recent Fee'}</th>
                    <th className="px-12 py-8 text-right">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="px-12 py-8 font-black text-slate-700 flex items-center gap-4">
                        <img src={s.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                        {s.name}
                      </td>
                      <td className="px-12 py-8">
                         <span className={`px-5 py-2 rounded-full font-black text-[10px] uppercase ${s.tuitionStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                           {s.tuitionStatus === 'paid' ? `🍭 ${t.paid}` : `🍬 ${t.unpaid}`}
                         </span>
                      </td>
                      <td className="px-12 py-8 font-bold text-slate-400">{s.lastPaidAmount ? `RM ${s.lastPaidAmount}` : '--'}</td>
                      <td className="px-12 py-8 text-right">
                        <button onClick={() => { setSelectedStudent(s); setView('dashboard'); }} className="px-6 py-3 bg-indigo-500 text-white rounded-[1.5rem] text-[10px] font-black hover:bg-indigo-600 shadow-lg active:scale-95 transition-all">CHECK</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Kawaii Modal Template */}
      {(showAddModal || showSettings) && (
        <div className="fixed inset-0 z-[300] bg-indigo-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] p-12 max-w-md w-full shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full blur-2xl"></div>
            <h2 className="text-4xl font-black text-pink-500 mb-8 font-branding tracking-tight">{showAddModal ? t.addStudent : t.settings}</h2>
            <div className="space-y-8 relative z-10">
              {showAddModal ? (
                <div>
                  <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-3 ml-2">{t.studentName}</label>
                  <input autoFocus type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-pink-50 focus:border-pink-300 outline-none font-black text-slate-700 bg-slate-50 shadow-inner" onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()} />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-3 ml-2">{t.academyName}</label>
                    <input type="text" value={academyName} onChange={(e) => setAcademyName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-indigo-50 focus:border-indigo-300 outline-none font-black text-slate-700 bg-slate-50 shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-widest mb-3 ml-2">{t.teacherName}</label>
                    <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full px-8 py-5 rounded-[2rem] border-4 border-indigo-50 focus:border-indigo-300 outline-none font-black text-slate-700 bg-slate-50 shadow-inner" />
                  </div>
                </>
              )}
              <div className="flex gap-4 pt-6">
                <button onClick={() => { setShowAddModal(false); setShowSettings(false); }} className="flex-1 px-8 py-5 rounded-[2rem] font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">{t.exit}</button>
                <button onClick={showAddModal ? handleAddStudent : saveSettings} className="flex-1 px-8 py-5 rounded-[2rem] bg-pink-500 text-white font-black shadow-xl kawaii-btn-shadow hover:bg-pink-600 transition-all text-xs uppercase tracking-widest">{showAddModal ? t.add : t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav (The Cloud) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl px-8 py-5 rounded-[3rem] shadow-2xl border-4 border-white flex gap-6 z-[100] scale-110">
         <button onClick={() => { setView('dashboard'); setSelectedStudent(null); }} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all ${view === 'dashboard' ? 'bg-pink-500 text-white shadow-lg scale-105' : 'text-pink-300 hover:text-pink-500'}`}>
            <span className="text-xl">🏠</span>
            {view === 'dashboard' && <span className="font-black text-[10px] uppercase tracking-widest">{t.dashboard}</span>}
         </button>
         <button onClick={() => { setView('billing'); setSelectedStudent(null); }} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all ${view === 'billing' ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'text-indigo-300 hover:text-indigo-500'}`}>
            <span className="text-xl">💰</span>
            {view === 'billing' && <span className="font-black text-[10px] uppercase tracking-widest">{t.billing}</span>}
         </button>
         <button onClick={() => { setView('games'); setSelectedStudent(null); }} className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] transition-all ${view === 'games' ? 'bg-orange-400 text-white shadow-lg scale-105' : 'text-orange-300 hover:text-orange-500'}`}>
            <span className="text-xl">🎮</span>
            {view === 'games' && <span className="font-black text-[10px] uppercase tracking-widest">{t.games}</span>}
         </button>
      </div>
    </div>
  );
};

export default App;
