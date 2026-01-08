
import React from 'react';
import { Student, Language, TRANSLATIONS } from '../types';

interface StudentCardProps {
  student: Student;
  lang: Language;
  onClick: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, lang, onClick }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[3.5rem] p-10 shadow-2xl hover:shadow-pink-200/50 hover:-translate-y-4 transition-all duration-500 cursor-pointer border-4 border-white flex flex-col items-center text-center relative kawaii-shadow"
    >
      <div className="absolute -top-4 -right-2 bg-gradient-to-br from-yellow-300 to-orange-400 text-pink-900 px-6 py-2 rounded-full text-[10px] font-black shadow-xl uppercase tracking-widest border-4 border-white -rotate-6">
        {student.points} ⭐
      </div>
      
      <div className="w-32 h-32 mb-8 rounded-[2.5rem] bg-pink-50 p-2 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-inner border-2 border-pink-100/50">
        <img 
          src={student.avatar} 
          alt={student.name}
          className="w-full h-full rounded-[2rem] object-cover"
        />
      </div>
      
      <h3 className="text-2xl font-black text-slate-700 mb-2 font-branding">{student.name}</h3>
      <p className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em]">{t.rank}</p>
      
      <div className={`mt-8 flex items-center gap-3 px-6 py-2.5 rounded-full border-2 transition-all ${student.tuitionStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-pink-50 border-pink-100 text-pink-600 animate-pulse'}`}>
        <div className={`w-3 h-3 rounded-full ${student.tuitionStatus === 'paid' ? 'bg-green-400' : 'bg-pink-400'}`}></div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          {student.tuitionStatus === 'paid' ? t.paid : t.unpaid}
        </span>
      </div>
    </div>
  );
};

export default StudentCard;
