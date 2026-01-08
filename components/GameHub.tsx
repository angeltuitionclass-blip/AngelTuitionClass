
import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../types';
import { generateGameQuestion } from '../services/geminiService';

interface GameHubProps {
  lang: Language;
}

const GameHub: React.FC<GameHubProps> = ({ lang }) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<'Math' | 'English' | 'Chinese' | 'Malay' | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const t = TRANSLATIONS[lang];

  const startGame = async (subject: 'Math' | 'English' | 'Chinese' | 'Malay') => {
    if (!selectedGrade) return;
    setLoading(true);
    setSelectedSubject(subject);
    try {
      const data = await generateGameQuestion(subject, selectedGrade, lang);
      setQuestions(data);
      setCurrentIndex(0);
      setScore(0);
      setGameFinished(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (option === questions[currentIndex].answer) {
      setScore(prev => prev + 10);
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <div className="relative">
          <div className="w-24 h-24 border-8 border-white/30 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🎮</div>
        </div>
        <p className="mt-8 text-white font-black text-2xl drop-shadow-lg animate-pulse uppercase tracking-widest">
          {lang === 'zh' ? `正在准备第 ${selectedGrade} 学年挑战...` : `Crafting Grade ${selectedGrade} Challenges...`}
        </p>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl max-w-lg mx-auto border-8 border-yellow-400 animate-in zoom-in-95 duration-500">
        <h2 className="text-5xl font-black text-blue-600 mb-4 font-branding tracking-tight">{lang === 'zh' ? '大获全胜！' : 'VICTORY!'}</h2>
        <div className="text-8xl mb-8 animate-bounce">🏆</div>
        <p className="text-2xl text-gray-700 mb-10 font-bold">{lang === 'zh' ? `${selectedGrade} 学年关卡达成！` : `Grade ${selectedGrade} Level Clear!`}<br/><span className="text-4xl text-orange-500">+{score} PTS</span></p>
        <button 
          onClick={() => { setSelectedSubject(null); setSelectedGrade(null); }}
          className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          {lang === 'zh' ? '返回大厅' : 'BACK TO LOBBY'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {!selectedGrade ? (
        <div className="space-y-8">
          <div className="bg-white/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-xl text-center">
             <h2 className="text-3xl font-black text-white drop-shadow-md mb-2 font-branding uppercase tracking-tighter">
               {lang === 'zh' ? '选择你的等级' : 'CHOOSE YOUR LEVEL'}
             </h2>
             <p className="text-blue-100 font-bold uppercase text-xs tracking-[0.2em]">{lang === 'zh' ? '选择小学年级 (P1 - P6)' : 'Select Primary Year (P1 - P6)'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl hover:scale-110 transition-all border-4 border-transparent hover:border-blue-400 group"
              >
                <div className="text-3xl mb-2 group-hover:animate-bounce">
                  {['🐣', '🐥', '🐰', '🦊', '🦁', '🐉'][grade-1]}
                </div>
                <div className="font-black text-slate-800 uppercase text-xs tracking-widest">{lang === 'zh' ? '第' : 'YEAR'}</div>
                <div className="text-4xl font-black text-blue-600">{grade}</div>
                {lang === 'zh' && <div className="font-black text-slate-800 text-xs tracking-widest">学年</div>}
              </button>
            ))}
          </div>
        </div>
      ) : !selectedSubject ? (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedGrade(null)} className="bg-white/20 p-4 rounded-2xl hover:bg-white/40 transition-all text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
             </button>
             <h2 className="text-3xl font-black text-white font-branding drop-shadow-md">
               {lang === 'zh' ? `第 ${selectedGrade} 学年: 选择科目` : `YEAR ${selectedGrade}: SELECT SUBJECT`}
             </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'Math', label: lang === 'zh' ? '数学' : 'Math', color: 'from-blue-400 to-blue-700', icon: '🔢', subtitle: 'Numbers Fun' },
              { id: 'English', label: lang === 'zh' ? '英文' : 'English', color: 'from-pink-400 to-pink-700', icon: '🔤', subtitle: 'Word Power' },
              { id: 'Chinese', label: lang === 'zh' ? '华文' : 'Chinese', color: 'from-red-400 to-red-700', icon: '🏮', subtitle: 'Character Quest' },
              { id: 'Malay', label: lang === 'zh' ? '国文' : 'Malay', color: 'from-green-400 to-green-700', icon: '🌴', subtitle: 'Bahasa Fun' },
            ].map((subj) => (
              <button
                key={subj.id}
                onClick={() => startGame(subj.id as any)}
                className={`bg-gradient-to-br ${subj.color} text-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all flex flex-col items-center gap-4 relative overflow-hidden group`}
              >
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                <span className="text-6xl group-hover:rotate-12 transition-transform">{subj.icon}</span>
                <div className="text-center">
                  <span className="block text-2xl font-black font-branding mb-1">{subj.label}</span>
                  <span className="block text-[10px] font-bold text-white/60 uppercase tracking-widest">{subj.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : questions.length > 0 ? (
        <div className="bg-slate-900 rounded-[3.5rem] p-1 shadow-2xl max-w-3xl mx-auto border-8 border-slate-800">
          <div className="bg-white rounded-[2.8rem] p-10 min-h-[550px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex flex-col">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg text-center">
                  {selectedSubject.toUpperCase()} {lang === 'zh' ? '模式' : 'MODE'}
                </span>
                <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest ml-1">{lang === 'zh' ? `第 ${selectedGrade} 学年` : `PRIMARY YEAR ${selectedGrade}`}</span>
              </div>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`h-2 w-8 rounded-full transition-all ${i === currentIndex ? 'bg-orange-500 w-12' : i < currentIndex ? 'bg-green-400' : 'bg-gray-100'}`}></div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-4xl font-black text-slate-800 mb-12 font-branding leading-tight px-4">
                {questions[currentIndex].question}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full px-4">
                {questions[currentIndex].options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className="p-6 text-center rounded-3xl border-4 border-gray-50 hover:border-blue-500 hover:bg-blue-50 transition-all font-black text-lg text-slate-700 shadow-sm active:scale-95 bg-white"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-between items-center px-6">
               <button onClick={() => setSelectedSubject(null)} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2">
                 <span className="text-lg">🚪</span> {lang === 'zh' ? '退出游戏' : 'Quit Level'}
               </button>
               <div className="flex items-center gap-3 bg-slate-50 px-6 py-2 rounded-2xl border border-slate-100">
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{lang === 'zh' ? '分数:' : 'Score:'}</span>
                 <span className="text-3xl font-black text-orange-500 font-branding">{score}</span>
               </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default GameHub;
