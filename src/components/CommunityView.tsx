import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Search, 
  MapPin, 
  Heart, 
  UserPlus, 
  UserCheck, 
  Globe, 
  Radio, 
  Hospital, 
  Phone, 
  Sparkles, 
  Calendar, 
  Clock,
  ArrowRight
} from "lucide-react";
import { RegisteredUser } from "../types";

interface CommunityViewProps {
  registeredUsers: RegisteredUser[];
  currentUser: RegisteredUser | null;
  onFollowUser: (userId: string) => Promise<void>;
}

interface JankariReport {
  city: string;
  emergencyStatus: string;
  activeDonorsCount: number;
  liveEmergencyAlerts: Array<{
    hospitalName: string;
    bloodGroupNeeded: string;
    urgency: string;
    message: string;
  }>;
  localBloodBanks: Array<{
    name: string;
    address: string;
    contact: string;
    availableGroups: string;
  }>;
  upcomingDrives: Array<{
    campName: string;
    organizer: string;
    date: string;
    location: string;
  }>;
  healthTips: string;
}

export function CommunityView({ registeredUsers, currentUser, onFollowUser }: CommunityViewProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "jankari">("directory");
  const [citySearch, setCitySearch] = useState("");
  const [directorySearch, setDirectorySearch] = useState("");
  const [isLoadingJankari, setIsLoadingJankari] = useState(false);
  const [jankariReport, setJankariReport] = useState<JankariReport | null>(null);
  const [jankariError, setJankariError] = useState("");

  const handleSearchJankari = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    setIsLoadingJankari(true);
    setJankariError("");
    setJankariReport(null);

    try {
      const response = await fetch("/api/jankari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: citySearch.trim() })
      });

      if (!response.ok) {
        throw new Error("जानकारी प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।");
      }

      const data = await response.json();
      setJankariReport(data);
    } catch (err: any) {
      setJankariError(err.message || "त्रुटि आई।");
    } finally {
      setIsLoadingJankari(false);
    }
  };

  const isFollowing = (userId: string) => {
    if (!currentUser) return false;
    return currentUser.followingIds?.includes(userId) || false;
  };

  // Helper colors for avatars
  const avatarColors = [
    "bg-red-500/20 text-red-400 border-red-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-sky-500/20 text-sky-400 border-sky-500/30",
    "bg-violet-500/20 text-violet-400 border-violet-500/30",
    "bg-rose-500/20 text-rose-400 border-rose-500/30"
  ];

  return (
    <div id="community-view-root" className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1.5 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2.5">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500"><Users className="w-6 h-6" /></span>
            सामुदायिक और लाइव जानकारी
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            प्लेटफ़ॉर्म के पंजीकृत सदस्यों से जुड़ें और दुनिया भर के शहरों की लाइव जानकारी प्राप्त करें।
          </p>
        </div>
        
        {/* Toggle Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "directory" 
                ? "bg-slate-850 text-red-500 shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            सामुदायिक सूची ({registeredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("jankari")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "jankari" 
                ? "bg-slate-850 text-red-500 shadow-sm" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            वैश्विक जानकारी (AI)
          </button>
        </div>
      </div>

      {/* Directory Tab */}
      {activeTab === "directory" && (() => {
        const filteredUsers = registeredUsers.filter(user => {
          if (!directorySearch.trim()) return false; // Show none by default for ultimate privacy
          const query = directorySearch.toLowerCase().trim();
          return (
            user.name.toLowerCase().includes(query) ||
            user.bloodGroup.toLowerCase().includes(query) ||
            user.location?.toLowerCase().includes(query) ||
            user.pinCode?.includes(query) ||
            user.roles?.some(r => r.toLowerCase().includes(query))
          );
        });

        return (
          <div className="space-y-5">
            {/* Search Input Bar */}
            <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                  <Search className="w-4 h-4 text-red-500 animate-pulse" />
                  यूनिवर्सल सदस्य खोज (Universal Member & Donor Search)
                </h3>
                <p className="text-[11px] text-slate-500">
                  फ़ेसबुक, गूगल या यूट्यूब की तरह पूरे देश या दुनिया के किसी भी पंजीकृत सदस्य को उनके नाम, ब्लड ग्रुप, शहर या पिनकोड से खोजें।
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="सदस्य का नाम, ब्लड ग्रुप (उदा. O+), शहर, या पिनकोड टाइप करें..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-all"
                />
                {directorySearch && (
                  <button
                    onClick={() => setDirectorySearch("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 font-bold bg-slate-900 px-2 py-1 rounded"
                  >
                    साफ़ करें (Clear)
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">त्वरित फ़िल्टर:</span>
                {["O+", "B-", "A+", "Delhi", "Mumbai", "Sagar", "Volunteer"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setDirectorySearch(tag)}
                    className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Results Display */}
            {directorySearch.trim() === "" ? (
              <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-sm font-black text-slate-200">खोजने के लिए ऊपर टाइप करें</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    🔒 **डेटा गोपनीयता एवं सुरक्षा:** सदस्यों की सुरक्षा के लिए पूरी डायरेक्टरी सूची सार्वजनिक रूप से एक साथ नहीं दिखाई जाती है। किसी भी विशिष्ट दाता, स्वयंसेवक या रक्त बैंक प्रतिनिधि की जानकारी के लिए ऊपर नाम, ब्लड ग्रुप या स्थान खोजें।
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    खोज परिणाम (Search Results)
                  </h3>
                  <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-full">
                    मिले परिणाम: <b>{filteredUsers.length}</b> लोग
                  </span>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="bg-slate-900/10 border border-slate-850 rounded-2xl p-8 text-center text-xs text-slate-500 italic">
                    ⚠️ आपकी खोज <b>"{directorySearch}"</b> के लिए कोई मेल खाता हुआ सदस्य नहीं मिला। कृपया दूसरा शब्द आज़माएं।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.map((user, idx) => {
                      const isSelf = currentUser && currentUser.id === user.id;
                      const following = isFollowing(user.id);
                      const colorClass = avatarColors[idx % avatarColors.length];
                      
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex items-start gap-4 hover:border-slate-800 transition-all"
                        >
                          {/* Avatar */}
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.name} 
                              className="w-12 h-12 rounded-full border border-slate-750 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-lg uppercase ${colorClass}`}>
                              {user.name.charAt(0)}
                            </div>
                          )}

                          {/* Profile Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="font-bold text-sm text-slate-100 truncate">{user.name}</h4>
                              {user.bloodGroup && (
                                <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-black px-2 py-0.5 rounded">
                                  {user.bloodGroup}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {user.location || "अज्ञात स्थान"}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/20" />
                                <span>{user.followersCount || 0} फ़ॉलोअर्स</span>
                              </div>

                              {/* Action buttons */}
                              {isSelf ? (
                                <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                  आप (You)
                                </span>
                              ) : (
                                <button
                                  onClick={() => onFollowUser(user.id)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    following 
                                      ? "bg-slate-950 text-emerald-500 border border-emerald-500/30" 
                                      : "bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                  }`}
                                >
                                  {following ? (
                                    <>
                                      <UserCheck className="w-3 h-3" />
                                      फ़ॉलो किया है
                                    </>
                                  ) : (
                                    <>
                                      <UserPlus className="w-3 h-3" />
                                      फ़ॉलो करें
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Jankari Tab */}
      {activeTab === "jankari" && (
        <div className="space-y-6">
          
          {/* City search input form */}
          <form onSubmit={handleSearchJankari} className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl space-y-3">
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wide">
              दुनिया के किसी भी शहर की लाइव रक्त जानकारी (Live City Search)
            </label>
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="उदा. Delhi, Mumbai, New York, London, Patna..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoadingJankari || !citySearch.trim()}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isLoadingJankari ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    AI खोज रहा है...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    जानकारी खोजें
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Jankari Loading and Report Displays */}
          {isLoadingJankari && (
            <div className="bg-slate-900/20 border border-slate-850/60 rounded-2xl p-10 text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-red-400 absolute inset-0 m-auto animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200">स्थानीय डेटाबेस और AI से नवीनतम जानकारी संकलित की जा रही है...</p>
                <p className="text-[11px] text-slate-500 font-sans">Gemini is fetching live blood bank networks, health advisory & drives in {citySearch}</p>
              </div>
            </div>
          )}

          {jankariError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs font-medium text-red-400 text-center">
              ⚠️ {jankariError}
            </div>
          )}

          {/* Report rendering */}
          {jankariReport && !isLoadingJankari && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5"
            >
              
              {/* City Summary Top Banner */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
                  <div>
                    <span className="text-[10px] tracking-widest font-black text-red-500 uppercase">AI शहर रिपोर्ट</span>
                    <h3 className="text-xl font-black text-slate-100">{jankariReport.city} के नवीनतम समाचार</h3>
                  </div>
                  
                  {/* Status pills */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">आपातकालीन स्तर:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm border ${
                      jankariReport.emergencyStatus.toLowerCase().includes("high") 
                        ? "bg-red-500/15 text-red-400 border-red-500/30"
                        : jankariReport.emergencyStatus.toLowerCase().includes("moderate")
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        jankariReport.emergencyStatus.toLowerCase().includes("high") 
                          ? "bg-red-500 animate-ping"
                          : jankariReport.emergencyStatus.toLowerCase().includes("moderate")
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}></span>
                      {jankariReport.emergencyStatus}
                    </span>
                  </div>
                </div>

                {/* Estimate counts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center sm:text-left">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">पंजीकृत सक्रिय दाता नेटवर्क</p>
                    <p className="text-2xl font-black text-red-500 mt-1">{jankariReport.activeDonorsCount}+</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">संभावित रक्तदाता उपलब्ध हैं</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center sm:text-left">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">स्थानीय अस्पताल और संस्थान</p>
                    <p className="text-2xl font-black text-emerald-500 mt-1">{jankariReport.localBloodBanks.length}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">पैनल पर पंजीकृत केंद्र</p>
                  </div>
                </div>
              </div>

              {/* Live Alerts */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  आपातकालीन अलर्ट (Live Emergency Alerts)
                </h4>
                {jankariReport.liveEmergencyAlerts && jankariReport.liveEmergencyAlerts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {jankariReport.liveEmergencyAlerts.map((alert, i) => (
                      <div key={i} className="bg-red-500/5 border border-red-500/15 hover:border-red-500/30 p-4 rounded-2xl flex items-start gap-3.5 transition-all">
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs uppercase shrink-0">
                          {alert.bloodGroupNeeded}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-xs text-slate-200">{alert.hospitalName}</h5>
                            <span className="text-[10px] font-black text-red-400">{alert.urgency}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{alert.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-900/20 p-4 rounded-xl border border-slate-850 text-center">
                    इस समय कोई सक्रिय आपातकालीन अलर्ट नहीं है।
                  </p>
                )}
              </div>

              {/* Local Blood Banks */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-sky-400" />
                  शहर के रक्त बैंक और भंडार (Local Blood Banks)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jankariReport.localBloodBanks.map((bank, i) => (
                    <div key={i} className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-1.5">
                          <h5 className="font-bold text-xs text-slate-200 leading-snug">{bank.name}</h5>
                          <span className="shrink-0 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black px-1.5 py-0.5 rounded">
                            सक्रिय
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-start gap-1 font-sans">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{bank.address}</span>
                        </p>
                        {bank.availableGroups && (
                          <div className="pt-1.5 flex flex-wrap gap-1 items-center">
                            <span className="text-[9px] text-slate-500 font-black">उपलब्ध:</span>
                            {bank.availableGroups.split(",").map((g, gi) => (
                              <span key={gi} className="bg-slate-950 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-850">
                                {g.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t border-slate-900 mt-3 flex justify-between items-center text-[11px] font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {bank.contact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Donation Drives */}
              <div className="space-y-3">
                <h4 className="text-xs font-black tracking-wider text-slate-400 uppercase flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  आगामी रक्तदान शिविर (Local Donation Drives)
                </h4>
                {jankariReport.upcomingDrives && jankariReport.upcomingDrives.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {jankariReport.upcomingDrives.map((drive, i) => (
                      <div key={i} className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-sm text-slate-200">{drive.campName}</h5>
                          <p className="text-[11px] text-slate-400">आयोजक: {drive.organizer}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {drive.location}
                          </p>
                        </div>
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-xs text-red-400 font-extrabold flex items-center gap-1.5 self-start sm:self-center">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          {drive.date}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-900/20 p-4 rounded-xl border border-slate-850 text-center">
                    इस समय कोई आगामी शिविर निर्धारित नहीं है।
                  </p>
                )}
              </div>

              {/* AI Health Tip Block */}
              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 shadow-md">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                  <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-black tracking-wider text-slate-300 uppercase">AI स्वास्थ्य और रक्तदान परामर्श</h5>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">{jankariReport.healthTips}</p>
                </div>
              </div>

            </motion.div>
          )}

          {/* Quick city suggestions */}
          {!jankariReport && !isLoadingJankari && (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-500">त्वरित खोज सुझाव (Quick Search Examples):</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Delhi", "Mumbai", "London", "New York", "Lucknow", "Patna"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCitySearch(c);
                    }}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
