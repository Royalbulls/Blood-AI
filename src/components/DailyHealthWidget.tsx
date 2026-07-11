import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Share2, 
  Copy, 
  Check, 
  Zap,
  Info,
  ChevronRight,
  ClipboardList,
  RefreshCw
} from "lucide-react";

interface DailyHealthWidgetProps {
  language: "hi" | "en" | "hinglish";
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
  registeredName?: string;
  registeredBloodGroup?: string;
}

interface DietPlanItem {
  mealType: string;
  recommendation: string;
  ironRichFood: string;
}

interface HealthAdviceResponse {
  dailyQuote: string;
  vitalityScore: number;
  isHighRisk: boolean;
  hemoglobinAdvice: string;
  dietPlan: DietPlanItem[];
  dos: string[];
  donts: string[];
  lifestyleAdvice: string;
}

export default function DailyHealthWidget({ 
  language, 
  isDarkMode, 
  onShowToast,
  registeredName = "",
  registeredBloodGroup = "O+"
}: DailyHealthWidgetProps) {
  
  // Load initial settings and history from local storage
  const [name, setName] = useState<string>(() => {
    return localStorage.getItem("blood_ai_health_name") || registeredName || localStorage.getItem("blood_ai_profile_name") || "";
  });
  const [age, setAge] = useState<string>(() => {
    return localStorage.getItem("blood_ai_health_age") || "25";
  });
  const [gender, setGender] = useState<string>(() => {
    return localStorage.getItem("blood_ai_health_gender") || "Female";
  });
  const [bloodGroup, setBloodGroup] = useState<string>(() => {
    return localStorage.getItem("blood_ai_health_bg") || registeredBloodGroup || "O+";
  });
  const [dietType, setDietType] = useState<string>(() => {
    return localStorage.getItem("blood_ai_health_diet") || "Vegetarian";
  });
  const [hemoglobin, setHemoglobin] = useState<number>(() => {
    const saved = localStorage.getItem("blood_ai_health_hb");
    return saved ? parseFloat(saved) : 12.0;
  });

  // Streak state
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("blood_ai_nutrition_streak");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Checklist state (to keep users engaged daily)
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_nutrition_checklist");
      const savedDate = localStorage.getItem("blood_ai_nutrition_checklist_date");
      const todayStr = new Date().toDateString();
      if (saved && savedDate === todayStr) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      water: false,
      noTeaAfterMeal: false,
      ironVeg: false,
      vitCPairing: false,
    };
  });

  // Advice states
  const [adviceData, setAdviceData] = useState<HealthAdviceResponse | null>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_health_advice_cache");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("blood_ai_health_name", name);
    localStorage.setItem("blood_ai_health_age", age);
    localStorage.setItem("blood_ai_health_gender", gender);
    localStorage.setItem("blood_ai_health_bg", bloodGroup);
    localStorage.setItem("blood_ai_health_diet", dietType);
    localStorage.setItem("blood_ai_health_hb", hemoglobin.toString());
  }, [name, age, gender, bloodGroup, dietType, hemoglobin]);

  // Save checklist to localStorage
  useEffect(() => {
    localStorage.setItem("blood_ai_nutrition_checklist", JSON.stringify(checklist));
    localStorage.setItem("blood_ai_nutrition_checklist_date", new Date().toDateString());
  }, [checklist]);

  const handleFetchAdvice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/health-nutrition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name || "Satyapit User",
          age: parseInt(age, 10) || 25,
          gender,
          bloodGroup,
          dietType,
          hemoglobin
        })
      });

      if (res.ok) {
        const data: HealthAdviceResponse = await res.json();
        setAdviceData(data);
        localStorage.setItem("blood_ai_health_advice_cache", JSON.stringify(data));

        // Update streak logic
        const todayStr = new Date().toDateString();
        const lastLogDate = localStorage.getItem("blood_ai_last_nutrition_date");

        if (lastLogDate !== todayStr) {
          let newStreak = 1;
          if (lastLogDate) {
            const lastLog = new Date(lastLogDate);
            const today = new Date();
            // Calculate day difference
            const diffTime = Math.abs(today.getTime() - lastLog.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
              newStreak = streak + 1;
            }
          }
          setStreak(newStreak);
          localStorage.setItem("blood_ai_nutrition_streak", newStreak.toString());
          localStorage.setItem("blood_ai_last_nutrition_date", todayStr);
          onShowToast(`🔥 Awesome! Daily Streak updated: ${newStreak} Days!`);
        } else {
          onShowToast(language === "hi" ? "स्वास्थ्य सलाह सफलतापूर्वक अपडेट हो गई!" : "Health advice updated successfully!");
        }
      } else {
        onShowToast("Unable to fetch advice. Please try again.");
      }
    } catch (err) {
      console.error(err);
      onShowToast("Connection error while loading health nutrition advice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAdvice = () => {
    if (!adviceData) return;
    const text = `🩸 Daily Blood Health & Nutrition Advice for ${name || "User"}:
------------------------------------------
Daily Motto: "${adviceData.dailyQuote}"
Hemoglobin Level: ${hemoglobin} g/dL (Vitality Score: ${adviceData.vitalityScore}/100)
Advice: ${adviceData.hemoglobinAdvice}

Diet Plan:
${adviceData.dietPlan.map(d => `- ${d.mealType}: ${d.recommendation} [Iron Rich: ${d.ironRichFood}]`).join("\n")}

Dos:
${adviceData.dos.map(d => `✅ ${d}`).join("\n")}

Donts:
${adviceData.donts.map(d => `❌ ${d}`).join("\n")}

Lifestyle & Hydration:
${adviceData.lifestyleAdvice}
------------------------------------------
Generated by Blood AI India Platform. Stay Safe, Save Lives.`;
    
    navigator.clipboard.writeText(text);
    onShowToast(language === "hi" ? "सलाह क्लिपबोर्ड पर कॉपी की गई!" : "Advice copied to clipboard!");
  };

  const toggleChecklistItem = (itemKey: string) => {
    setChecklist(prev => {
      const updated = { ...prev, [itemKey]: !prev[itemKey] };
      // Give simple reward toast
      if (updated[itemKey]) {
        onShowToast(language === "hi" ? "शानदार! आपने आज का लक्ष्य पूरा किया। 🌟" : "Great job completing your daily habit! 🌟");
      }
      return updated;
    });
  };

  const calculatedProgress = Object.values(checklist).filter(Boolean).length * 25;

  return (
    <div id="daily-health-nutrition-widget" className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Header Promo Banner with Streak Status */}
      <div className="bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-500/20 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-red-500/15 text-red-500 text-[10px] font-black uppercase border border-red-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500 animate-pulse" /> AI HEALTH DESK
            </span>
            {streak > 0 && (
              <span className="bg-orange-500/15 text-orange-400 text-[10px] font-bold border border-orange-500/20 px-2 py-1 rounded-full flex items-center gap-1 animate-bounce">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> {streak}-Day Streak
              </span>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
            {language === "hi" ? "दैनिक रक्त स्वास्थ्य और पोषण मार्गदर्शन" : "Daily Blood Health & Nutrition Guide"}
          </h2>
          <p className="text-xs text-slate-400 leading-normal max-w-xl">
            {language === "hi" 
              ? "अपने हीमोग्लोबिन को बनाए रखने, संतुलित आहार लेने और स्वस्थ जीवन शैली के लिए कस्टमाइज़्ड AI सलाह प्राप्त करें।"
              : "Get personalized, AI-driven diet and lifestyle advice specifically tailored to maintain optimal hemoglobin levels."}
          </p>
        </div>

        {/* Small Progress Indicator for the engagement checklist */}
        {streak > 0 && (
          <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 p-3 rounded-2xl w-full sm:w-36 text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today's Habits</span>
            <div className="w-full bg-slate-900 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
              <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${calculatedProgress}%` }}></div>
            </div>
            <span className="text-xs text-slate-300 font-bold mt-1.5">{calculatedProgress}% Done</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile/Input Parameter Form Panel */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-red-500" /> {language === "hi" ? "आपकी स्वास्थ्य प्रोफ़ाइल" : "Your Health Profile"}
          </h3>

          <div className="space-y-3.5">
            {/* User Name input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name (अपना नाम)</label>
              <input
                type="text"
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 text-white border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-red-500/40"
              />
            </div>

            {/* Grid for Age, Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Age (उम्र)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500/40 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Gender (लिंग)</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500/40"
                >
                  <option value="Female">Female (महिला)</option>
                  <option value="Male">Male (पुरुष)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Grid for Blood Group, Diet Type */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500/40"
                >
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Diet Preference</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-red-500/40"
                >
                  <option value="Vegetarian">Veg (शाकाहारी)</option>
                  <option value="Non-Vegetarian">Non-Veg (मांसाहारी)</option>
                  <option value="Vegan">Vegan (वीगन)</option>
                </select>
              </div>
            </div>

            {/* Slider for Hemoglobin */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span className="uppercase">HEMOGLOBIN (हीमोग्लोबिन)</span>
                <span className="text-red-400 font-mono text-xs">{hemoglobin.toFixed(1)} g/dL</span>
              </div>
              <input
                type="range"
                min="6.0"
                max="18.0"
                step="0.1"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(parseFloat(e.target.value))}
                className="w-full accent-red-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-600 font-mono font-bold">
                <span>6.0 (Severely Low)</span>
                <span>12.0 (Normal F)</span>
                <span>14.0 (Normal M)</span>
                <span>18.0 (High)</span>
              </div>
            </div>

            {/* Dynamic medically oriented reference alert based on inputs */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/50 flex items-start gap-2 text-[11px] leading-normal">
              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-slate-400">
                {gender === "Female" ? (
                  hemoglobin < 12.0 ? (
                    <span className="text-orange-400 font-medium">⚠️ Female average target is 12.0-15.5 g/dL. Your input indicates mild anemia risk.</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">✅ Your level lies within the optimal biological target for adult females.</span>
                  )
                ) : (
                  hemoglobin < 13.5 ? (
                    <span className="text-orange-400 font-medium">⚠️ Male average target is 13.5-17.5 g/dL. Your input indicates mild anemia risk.</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">✅ Your level lies within the optimal biological target for adult males.</span>
                  )
                )}
              </div>
            </div>

            {/* Big Fetch Button */}
            <button
              onClick={handleFetchAdvice}
              disabled={isLoading}
              className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-white ${
                isLoading 
                  ? "bg-slate-800 border border-slate-700 cursor-not-allowed" 
                  : "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/10"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Calculating Advice...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white fill-white" />
                  <span>{adviceData ? "Generate Fresh Advice" : "Get AI Advice"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel for the advice */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!adviceData && !isLoading ? (
              // Initial state
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px] space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center text-xl font-bold font-mono">
                  🩸
                </div>
                <h4 className="text-sm font-black text-white">
                  {language === "hi" ? "कोई दैनिक योजना नहीं मिली" : "No Custom Plan Loaded"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm leading-normal">
                  {language === "hi" 
                    ? "अपनी उम्र, रक्त समूह, आहार प्राथमिकता और हीमोग्लोबिन इनपुट करें और AI संचालित दैनिक सलाह प्राप्त करने के लिए बटन पर क्लिक करें।"
                    : "Fill out your profile inputs on the left and click 'Get AI Advice' to unlock your bespoke, medically integrated diet, lifestyle, and nutrition blueprint."}
                </p>
              </motion.div>
            ) : isLoading ? (
              // Loading state loader
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[350px] space-y-4"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-red-600/10 border-t-red-500 animate-spin"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-lg">🧬</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Rakt Poshan AI Engine</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-normal mx-auto">
                    {language === "hi" 
                      ? "लौह तत्व संतुलन, विटामिन-सी सिंर्जी और टैनिन ब्लॉकर्स का विश्लेषण किया जा रहा है..." 
                      : "Analyzing iron absorption synergetics, dietary preferences, and metabolic hemoglobin factors via Gemini..."}
                  </p>
                </div>
              </motion.div>
            ) : (
              // Advice response layout
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 text-left"
              >
                
                {/* 1. Vitality Score Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:12px_12px]"></div>
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">Blood Vitality Score</span>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">Overall hematology energy profile</p>
                    </div>

                    <div className="flex items-baseline gap-1 py-4 justify-center">
                      <span className="text-4xl font-black text-white font-mono tracking-tighter">{adviceData.vitalityScore}</span>
                      <span className="text-slate-500 text-xs font-bold">/100</span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${adviceData.vitalityScore < 70 ? "bg-red-500" : adviceData.vitalityScore < 85 ? "bg-orange-400" : "bg-emerald-400"}`}
                        style={{ width: `${adviceData.vitalityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI Daily Motto (दैनिक ध्येय)</span>
                        {adviceData.isHighRisk && (
                          <span className="bg-red-500/15 text-red-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20 animate-pulse">Low HB Warning</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-200 italic mt-2 leading-relaxed">
                        "{adviceData.dailyQuote}"
                      </p>
                    </div>

                    <div className="border-t border-slate-800/60 pt-2 mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Tailored for {dietType} ({bloodGroup})</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={handleCopyAdvice}
                          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer flex items-center gap-1 text-[9px]"
                          title="Copy Full Report"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personalized Hemoglobin Advice */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4.5 space-y-2">
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">Medical Summary (हीमोग्लोबिन स्तर का अर्थ)</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-medium">
                    {adviceData.hemoglobinAdvice}
                  </p>
                </div>

                {/* 3. AI Curated Meal/Diet Plan */}
                <div className="space-y-2.5 text-left">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    🥗 AI Curated Nutritional Blueprint (दैनिक आहार योजना)
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {adviceData.dietPlan.map((d, index) => (
                      <div key={index} className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700/60 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-red-400 font-mono tracking-wider">{d.mealType}</span>
                          <span className="bg-red-500/10 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-red-500/20 font-mono uppercase">
                            {d.ironRichFood}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {d.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Action Checklists - Dos and Don'ts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Dos List */}
                  <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      ✅ DO'S (क्या करें - हीमोग्लोबिन बढ़ाने के लिए)
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300 leading-normal">
                      {adviceData.dos.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-medium">
                          <span className="text-emerald-400 text-xs select-none mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Don'ts List */}
                  <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-4.5 space-y-3">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                      ❌ DONT'S (क्या न करें - लौह अवशोषण की रुकावटें)
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300 leading-normal">
                      {adviceData.donts.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 font-medium text-slate-300">
                          <span className="text-red-500 text-xs select-none mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* 5. Lifestyle & Hydration Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Lifestyle, Sleep & Hydration</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                      {adviceData.lifestyleAdvice}
                    </p>
                  </div>
                </div>

                {/* 6. Daily Engagement Habits Tracker Checklist (Gamification) */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-red-500" /> Daily Habits Checklist (दैनिक स्वास्थ्य संकल्प)
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tick off today's healthy targets to cement your streak!</p>
                    </div>
                    <span className="bg-red-500/15 text-red-400 text-[10px] font-bold border border-red-500/20 px-2 py-1 rounded">
                      Streak Active 🔥
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    <button
                      onClick={() => toggleChecklistItem("water")}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        checklist.water 
                          ? "bg-blue-500/5 border-blue-500/30 text-blue-300" 
                          : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                        checklist.water 
                          ? "bg-blue-500 border-blue-500 text-white" 
                          : "border-slate-700 bg-slate-900"
                      }`}>
                        {checklist.water && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white">Drink 3 Liters Water (3 लीटर पानी पिया)</span>
                        <p className="text-[9px] text-slate-500 mt-0.5">Essential to maintain healthy blood volume & circulation.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChecklistItem("noTeaAfterMeal")}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        checklist.noTeaAfterMeal 
                          ? "bg-orange-500/5 border-orange-500/30 text-orange-300" 
                          : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                        checklist.noTeaAfterMeal 
                          ? "bg-orange-500 border-orange-500 text-white" 
                          : "border-slate-700 bg-slate-900"
                      }`}>
                        {checklist.noTeaAfterMeal && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white">Avoided Tea/Coffee Post-Meals</span>
                        <p className="text-[9px] text-slate-500 mt-0.5">Blocked tannins today to allow 100% iron assimilation.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChecklistItem("ironVeg")}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        checklist.ironVeg 
                          ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-300" 
                          : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                        checklist.ironVeg 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-slate-700 bg-slate-900"
                      }`}>
                        {checklist.ironVeg && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white">Consumed Iron Rich Food (हरी सब्जी/फल)</span>
                        <p className="text-[9px] text-slate-500 mt-0.5">Had dark greens, pomegranate, sprouts, or nuts today.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleChecklistItem("vitCPairing")}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        checklist.vitCPairing 
                          ? "bg-yellow-500/5 border-yellow-500/30 text-yellow-300" 
                          : "bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                        checklist.vitCPairing 
                          ? "bg-yellow-500 border-yellow-500 text-white" 
                          : "border-slate-700 bg-slate-900"
                      }`}>
                        {checklist.vitCPairing && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white">Vitamin C Pairing (विटामिन सी जोड़ा)</span>
                        <p className="text-[9px] text-slate-500 mt-0.5">Squeezed lemon juice or ate an orange with meals.</p>
                      </div>
                    </button>

                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
