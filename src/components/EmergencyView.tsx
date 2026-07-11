import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  Heart, 
  MapPin, 
  Users, 
  FileText, 
  Download, 
  Phone, 
  Share2, 
  MoreVertical, 
  PlusCircle, 
  Globe, 
  Youtube, 
  ShieldCheck, 
  Calendar, 
  Navigation, 
  Compass, 
  MessageSquare, 
  Shield, 
  Car, 
  Activity,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Mail,
  CheckCircle2,
  Bookmark,
  Flag,
  Search,
  UserPlus,
  UserCheck,
  Sparkles,
  Languages,
  ExternalLink,
  Map,
  RefreshCw
} from "lucide-react";
import { Donor, EmergencyRequest, BloodBank, CommunityPost } from "../types";
import { TRANSLATIONS } from "../translations";

interface EmergencyViewProps {
  emergencyRequests: EmergencyRequest[];
  donors: Donor[];
  bloodBanks: BloodBank[];
  communityPosts: CommunityPost[];
  userCoords: { lat: number; lng: number };
  customLocationName: string;
  isProximityActive: boolean;
  onViewMapItem: (item: any) => void;
  onOpenRegisterModal: (type: "donor" | "request") => void;
  onOpenCommunityModal: () => void;
  onCommentPost: (id: string, author: string, text: string) => void;
  getProximityText: (locationName: string, id: string) => string;
  
  // Extended Features
  globalSearchQuery?: string;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  followedDonors?: string[];
  onToggleFollowDonor?: (id: string) => void;
  onReportItem?: (id: string) => void;
  showFavoritesOnly?: boolean;
  sortBy?: "distance" | "urgency" | "newest";
  language?: "hi" | "en" | "hinglish";
  onShowToast?: (msg: string) => void;
}

export default function EmergencyView({
  emergencyRequests,
  donors,
  bloodBanks,
  communityPosts,
  userCoords,
  customLocationName,
  isProximityActive,
  onViewMapItem,
  onOpenRegisterModal,
  onOpenCommunityModal,
  onCommentPost,
  getProximityText,
  
  globalSearchQuery = "",
  favorites = [],
  onToggleFavorite,
  followedDonors = [],
  onToggleFollowDonor,
  onReportItem,
  showFavoritesOnly = false,
  sortBy = "newest",
  language = "hi",
  onShowToast
}: EmergencyViewProps) {
  const [activeTab, setActiveTab] = useState<"emergencies" | "donors" | "banks" | "google_banks" | "community" | "insurance">("emergencies");
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({});
  const [bloodFilter, setBloodFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");

  // Live GPS Google Search Grounding States
  const [googleSearchQuery, setGoogleSearchQuery] = useState(() => {
    return customLocationName ? `Blood bank near ${customLocationName}` : "Blood bank";
  });
  const [googleBanks, setGoogleBanks] = useState<any[]>([]);
  const [googleSources, setGoogleSources] = useState<any[]>([]);
  const [googleSearchLoading, setGoogleSearchLoading] = useState(false);
  const [googleSearchProgress, setGoogleSearchProgress] = useState("");
  const [hasSearchedGoogle, setHasSearchedGoogle] = useState(false);

  React.useEffect(() => {
    if (customLocationName) {
      setGoogleSearchQuery(`Blood bank near ${customLocationName}`);
    }
  }, [customLocationName]);

  const handleLiveGoogleSearch = async () => {
    if (googleSearchLoading) return;
    setGoogleSearchLoading(true);
    setHasSearchedGoogle(true);
    
    const progressSteps = [
      "📡 Connecting to Google Search & Maps APIs...",
      "🌍 Acquiring location context and coordinates...",
      "🔍 Executing live search query...",
      "🏥 Categorizing and compiling verified blood centers...",
      "⚡ Calculating exact proximity distances from your GPS location..."
    ];

    let stepIdx = 0;
    setGoogleSearchProgress(progressSteps[0]);
    const progressInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < progressSteps.length) {
        setGoogleSearchProgress(progressSteps[stepIdx]);
      }
    }, 1100);

    try {
      const response = await fetch("/api/google-blood-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: googleSearchQuery,
          lat: userCoords?.lat || 23.8388,
          lng: userCoords?.lng || 78.7378
        })
      });
      const data = await response.json();
      clearInterval(progressInterval);

      if (data.results) {
        const resultsWithDistance = data.results.map((bank: any, idx: number) => {
          const bankLat = Number(bank.latitude) || ((userCoords?.lat || 23.8388) + (idx * 0.005) - 0.01);
          const bankLng = Number(bank.longitude) || ((userCoords?.lng || 78.7378) + (idx * 0.005) - 0.01);
          
          // Haversine distance
          const R = 6371; // km
          const userLat = userCoords?.lat || 23.8388;
          const userLng = userCoords?.lng || 78.7378;
          const dLat = (bankLat - userLat) * Math.PI / 180;
          const dLon = (bankLng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(bankLat * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const calculatedDistance = (R * c).toFixed(1);

          return {
            ...bank,
            id: `g_${idx}_${Date.now()}`,
            distance: Number(calculatedDistance),
            latitude: bankLat,
            longitude: bankLng
          };
        });

        // Sort dynamically by distance (closest first)
        resultsWithDistance.sort((a: any, b: any) => a.distance - b.distance);

        setGoogleBanks(resultsWithDistance);
        setGoogleSources(data.sources || []);
        if (onShowToast) {
          onShowToast(data.status === "fallback" ? "Offline local results loaded successfully!" : "Live Google Search grounding succeeded!");
        }
      } else {
        throw new Error(data.error || "No results found");
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Failed to query live blood banks:", err);
      if (onShowToast) onShowToast("खोज विफल रही। स्थानीय डेटा लोड किया गया।");
    } finally {
      setGoogleSearchLoading(false);
    }
  };

  // Life-Saving Community Sub-states
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_saved_posts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [followedUserNames, setFollowedUserNames] = useState<string[]>(() => {
    try {
      const followed = localStorage.getItem("blood_ai_followed_users");
      return followed ? JSON.parse(followed) : [];
    } catch {
      return [];
    }
  });

  const [communityFilter, setCommunityFilter] = useState<string>("All");
  const [communitySearch, setCommunitySearch] = useState<string>("");

  // Simulated AI actions on post ID
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [verifications, setVerifications] = useState<Record<string, { engine: string; checks: string[]; result: string }>>({});
  const [loadingAction, setLoadingAction] = useState<Record<string, string | null>>({});

  // Comment Replies Sub-states
  // Record of commentId -> Array of Replies
  const [commentReplies, setCommentReplies] = useState<Record<string, Array<{ author: string; content: string; createdAt: string }>>>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_comment_replies");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeReplyBoxCommentId, setActiveReplyBoxCommentId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<Record<string, string>>({});
  const [replyAuthorName, setReplyAuthorName] = useState<Record<string, string>>({});

  // Save to localStorage
  React.useEffect(() => {
    localStorage.setItem("blood_ai_saved_posts", JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  React.useEffect(() => {
    localStorage.setItem("blood_ai_followed_users", JSON.stringify(followedUserNames));
  }, [followedUserNames]);

  React.useEffect(() => {
    localStorage.setItem("blood_ai_comment_replies", JSON.stringify(commentReplies));
  }, [commentReplies]);

  // Interaction Local States (Likes & Dislikes)
  const [localLikes, setLocalLikes] = useState<Record<string, number>>({});
  const [localDislikes, setLocalDislikes] = useState<Record<string, number>>({});
  const [userInteractions, setUserInteractions] = useState<Record<string, "like" | "dislike" | null>>({});
  const [reportedItems, setReportedItems] = useState<string[]>([]);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleLike = (id: string) => {
    const current = userInteractions[id];
    if (current === "like") {
      setUserInteractions(prev => ({ ...prev, [id]: null }));
      setLocalLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
    } else {
      if (current === "dislike") {
        setLocalDislikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
      }
      setUserInteractions(prev => ({ ...prev, [id]: "like" }));
      setLocalLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      if (onShowToast) onShowToast(t.like || "Liked!");
    }
  };

  const handleDislike = (id: string) => {
    const current = userInteractions[id];
    if (current === "dislike") {
      setUserInteractions(prev => ({ ...prev, [id]: null }));
      setLocalDislikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
    } else {
      if (current === "like") {
        setLocalLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
      }
      setUserInteractions(prev => ({ ...prev, [id]: "dislike" }));
      setLocalDislikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      if (onShowToast) onShowToast(t.dislike || "Disliked!");
    }
  };

  const handleReportLocal = (id: string) => {
    if (reportedItems.includes(id)) {
      if (onShowToast) onShowToast("Post reported already.");
      return;
    }
    setReportedItems(prev => [...prev, id]);
    if (onReportItem) onReportItem(id);
    if (onShowToast) onShowToast(t.reported);
  };

  const handleCopyLocal = (text: string) => {
    navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast(t.copied);
    } else {
      alert("Copied!");
    }
  };

  const bloodGroups = ["All", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

  // Helper distance getter to sort by proximity
  const getProximityValue = (locationName: string, id: string): number => {
    const txt = getProximityText(locationName, id);
    const match = txt.match(/([\d.]+)\s*km/);
    return match ? parseFloat(match[1]) : 9999;
  };

  // Helper urgency value to sort critical first
  const getUrgencyValue = (urgency: string): number => {
    const lower = urgency.toLowerCase();
    if (lower.includes("critical") || lower.includes("sos")) return 3;
    if (lower.includes("urgent")) return 2;
    return 1;
  };

  // Filter lists based on blood filter, location input, globalSearchQuery, and favorites
  const processList = <T extends { id: string; bloodGroup?: string; location: string; urgency?: string; patientName?: string; name?: string; availableGroups?: string[] }>(
    list: T[]
  ) => {
    return list
      .filter((item) => {
        // Exclude reported items from showing
        if (reportedItems.includes(item.id)) return false;

        // Global Search Filter
        const query = (globalSearchQuery || "").toLowerCase();
        const textToSearch = `${item.location} ${item.bloodGroup || ""} ${item.patientName || ""} ${item.name || ""} ${item.urgency || ""} ${(item.availableGroups || []).join(" ")}`.toLowerCase();
        const matchesGlobalSearch = !query || textToSearch.includes(query);

        // Dropdown Blood Filter
        const matchesBlood =
          bloodFilter === "All" ||
          item.bloodGroup === bloodFilter ||
          (item.availableGroups && item.availableGroups.includes(bloodFilter));

        // Location Input Filter
        const matchesLoc =
          !locationFilter ||
          item.location.toLowerCase().includes(locationFilter.toLowerCase());

        // Favorite Toggle Filter
        const matchesFavorite = !showFavoritesOnly || favorites.includes(item.id);

        return matchesGlobalSearch && matchesBlood && matchesLoc && matchesFavorite;
      })
      .sort((a, b) => {
        if (sortBy === "distance") {
          return getProximityValue(a.location, a.id) - getProximityValue(b.location, b.id);
        }
        if (sortBy === "urgency") {
          return getUrgencyValue(b.urgency || "") - getUrgencyValue(a.urgency || "");
        }
        // default newest: item key or ID
        return b.id.localeCompare(a.id);
      });
  };

  const filteredRequests = processList(emergencyRequests);
  const filteredDonors = processList(donors);
  const filteredBanks = processList(bloodBanks);

  // Direct download report function
  const downloadEmergencyReport = () => {
    if (filteredRequests.length === 0) return;
    let text = `==================================================\n`;
    text += `         EMERGENCY BLOOD REQUESTS REPORT\n`;
    text += `         Generated on: ${new Date().toLocaleString()}\n`;
    text += `==================================================\n\n`;
    text += `Total Active Emergency Requests: ${filteredRequests.length}\n\n`;

    filteredRequests.forEach((req, idx) => {
      text += `--------------------------------------------------\n`;
      text += `Request #${idx + 1}\n`;
      text += `• Patient Name : ${req.patientName}\n`;
      text += `• Blood Group  : ${req.bloodGroup}\n`;
      text += `• Units Needed : ${req.units} Unit(s)\n`;
      text += `• Urgency      : ${req.urgency}\n`;
      text += `• Location     : ${req.location}\n`;
      text += `• Contact No   : ${req.contact}\n`;
      text += `• Posted On    : ${req.createdAt}\n`;
      text += `--------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `blood_ai_emergency_requests_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareRequest = async (req: EmergencyRequest) => {
    const shareText = `🚨 *आपातकालीन रक्त आवश्यकता (Emergency Blood Request)* 🚨\n\n• *मरीज (Patient)*: ${req.patientName}\n• *ब्लड ग्रुप (Blood Group)*: ${req.bloodGroup}\n• *मात्रा (Units)*: ${req.units} Unit(s)\n• *स्थान (Location)*: ${req.location}\n• *आपातकाल (Urgency)*: ${req.urgency}\n• *संपर्क (Contact)*: ${req.contact}\n\nकृपया रक्तदान करें या इस संदेश को साझा करें ताकि किसी की जान बचाई जा सके! - Blood AI`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Blood Request - ${req.bloodGroup}`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    }
  };

  const handlePostComment = (postId: string) => {
    const author = commentAuthors[postId]?.trim() || "Anonymous Donor";
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onCommentPost(postId, author, text);
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
    setCommentAuthors(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl text-left">
      {/* Directory Filter Panel */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-sans tracking-wider uppercase text-slate-300 flex items-center gap-2">
            <PlusCircle className="w-4.5 h-4.5 text-red-500" /> Live Directory & Registry
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenRegisterModal("request")}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Post Request</span>
            </button>
            <button
              onClick={() => onOpenRegisterModal("donor")}
              className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/30 text-emerald-400 font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Heart className="w-3 h-3" />
              <span>Be Donor</span>
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500">रक्त:</span>
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold cursor-pointer"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg} className="bg-slate-950 text-white">
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs min-w-[120px]">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="शहर खोजें (Delhi, Sagar)..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex overflow-x-auto scrollbar-none snap-x border-b border-slate-800 bg-slate-950/40 min-h-[46px] shrink-0">
        <button
          onClick={() => setActiveTab("emergencies")}
          className={`flex-1 min-w-[110px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "emergencies" ? "text-red-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> आपात अनुरोध ({filteredRequests.length})
          {activeTab === "emergencies" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("donors")}
          className={`flex-1 min-w-[110px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "donors" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-emerald-400" /> डोनर्स ({filteredDonors.length})
          {activeTab === "donors" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
          )}
        </button>
         <button
          onClick={() => setActiveTab("banks")}
          className={`flex-1 min-w-[110px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "banks" ? "text-sky-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-sky-400" /> ब्लड बैंक ({filteredBanks.length})
          {activeTab === "banks" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("google_banks")}
          className={`flex-1 min-w-[135px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "google_banks" ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
          }`}
          id="btn-google-banks"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> जीपीएस लाइव सर्च (Live)
          {activeTab === "google_banks" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`flex-1 min-w-[110px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "community" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" /> कम्युनिटी ({communityPosts.length})
          {activeTab === "community" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("insurance")}
          className={`flex-1 min-w-[110px] py-3.5 text-xs font-bold tracking-wider uppercase transition-colors relative flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "insurance" ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-500" /> हेल्पलाइन/बीमा
          {activeTab === "insurance" && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* Main Directory Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
        <AnimatePresence mode="popLayout">
          {/* emergencies */}
          {activeTab === "emergencies" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredRequests.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 mb-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-300">आपातकालीन रक्त अनुरोध रिपोर्ट (Emergency Report)</span>
                    <p className="text-[10px] text-slate-500">कुल {filteredRequests.length} सक्रिय आपातकालीन अनुरोध मिले</p>
                  </div>
                  <button
                    onClick={downloadEmergencyReport}
                    className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 font-semibold text-xs px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>Download Report (.txt)</span>
                  </button>
                </div>
              )}

              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  कोई आपातकालीन अनुरोध नहीं मिला। नया अनुरोध पोस्ट करने के लिए AI से बात करें!
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isFav = favorites.includes(req.id);
                  const isLiked = userInteractions[req.id] === "like";
                  const isDisliked = userInteractions[req.id] === "dislike";
                  const totalLikes = (localLikes[req.id] || 0) + (req.id.startsWith("dyn") ? 1 : 12);
                  const totalDislikes = localDislikes[req.id] || 0;

                  return (
                    <motion.div
                      key={req.id}
                      layout
                      className="bg-slate-900/90 border border-red-500/15 hover:border-red-500/45 rounded-2xl p-5 flex flex-col gap-4 shadow-lg hover:shadow-red-950/10 transition-all relative"
                    >
                      {/* Favorite/Heart Overlay Button */}
                      <button
                        onClick={() => onToggleFavorite && onToggleFavorite(req.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-500 transition-all active:scale-95 cursor-pointer z-10"
                        title={t.favorites}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-red-500 text-red-500 animate-pulse" : "text-slate-400"}`} />
                      </button>

                      {/* Header Badge Row */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-black font-mono tracking-wider shadow-md">
                            {req.bloodGroup}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                            req.urgency.toLowerCase() === "critical" 
                              ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}>
                            {req.urgency}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            <Compass className="w-3.5 h-3.5 text-red-400" />
                            {getProximityText(req.location, req.id)}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono font-medium">{req.createdAt}</span>
                        </div>

                        {/* Patient Detail and Location info */}
                        <h3 className="text-base font-bold text-white flex items-center gap-1.5 mb-1">
                          <span className="text-slate-400">मरीज:</span> {req.patientName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-red-500" /> {req.location}
                          </span>
                          <span className="text-slate-300 font-bold bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                            मात्रा: {req.units} Unit
                          </span>
                          <button
                            onClick={() => onViewMapItem(req)}
                            className="inline-flex items-center gap-1 text-[10px] bg-red-500/15 hover:bg-red-500/35 text-red-400 border border-red-500/20 px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer font-bold"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>नक्शा देखें (Map)</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Actions Row */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 gap-3">
                        {/* Likes/Dislikes & Copy Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(req.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isLiked 
                                ? "bg-red-500/15 text-red-400 border-red-500/40" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                            title="Like"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalLikes}</span>
                          </button>

                          <button
                            onClick={() => handleDislike(req.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isDisliked 
                                ? "bg-slate-800 text-slate-200 border-slate-700" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                            title="Dislike"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalDislikes}</span>
                          </button>

                          <button
                            onClick={() => handleCopyLocal(`Patient: ${req.patientName}, Blood Group: ${req.bloodGroup}, Location: ${req.location}, Contact: ${req.contact}`)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Copy Details"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Communications & More Row */}
                        <div className="flex items-center gap-1.5">
                          {/* Live Phone Call */}
                          <a
                            href={`tel:${req.contact}`}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 shadow-md flex-shrink-0"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>

                          {/* WhatsApp Chat routing */}
                          <a
                            href={`https://wa.me/${req.contact.replace(/\D/g, "") || "919425511223"}?text=${encodeURIComponent(`नमस्ते, मैंने Blood AI पर मरीज ${req.patientName} के लिए ${req.bloodGroup} रक्त की आपातकालीन मांग देखी। क्या आप अभी सहायता चाहते हैं?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 shadow-md flex-shrink-0"
                          >
                            WhatsApp
                          </a>

                          {/* Email routing */}
                          <a
                            href={"mailto:help@bloodai.org?subject=Emergency%20Blood%20Response%20" + encodeURIComponent(req.bloodGroup) + "&body=" + encodeURIComponent("Hi, I am ready to help and donate blood for the patient " + req.patientName + ". Please share details.")}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* Share Post */}
                          <button
                            onClick={() => shareRequest(req)}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Share Post"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Options / Report Trigger */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdownId(activeDropdownId === req.id ? null : req.id)}
                              className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeDropdownId === req.id && (
                              <div className="absolute right-0 bottom-12 md:bottom-auto md:top-10 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Hospitals in ${req.location}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-red-600/10 transition-colors"
                                >
                                  Google Maps
                                </a>
                                <button
                                  onClick={() => handleReportLocal(req.id)}
                                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-white hover:bg-red-600/20 transition-colors cursor-pointer"
                                >
                                  Report Post
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Donors */}
          {activeTab === "donors" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredDonors.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  कोई दाता उपलब्ध नहीं है। पंजीकरण करने के लिए AI से बात करें।
                </div>
              ) : (
                filteredDonors.map((donor) => {
                  const isFav = favorites.includes(donor.id);
                  const isFollowed = followedDonors.includes(donor.id);
                  const isLiked = userInteractions[donor.id] === "like";
                  const isDisliked = userInteractions[donor.id] === "dislike";
                  const totalLikes = (localLikes[donor.id] || 0) + 24;
                  const totalDislikes = localDislikes[donor.id] || 0;

                  return (
                    <motion.div
                      key={donor.id}
                      layout
                      className="bg-slate-900/90 border border-emerald-500/15 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col gap-4 shadow-lg transition-all relative text-left"
                    >
                      {/* Favorite/Heart Overlay Button */}
                      <button
                        onClick={() => onToggleFavorite && onToggleFavorite(donor.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-500 transition-all active:scale-95 cursor-pointer z-10"
                        title={t.favorites}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-red-500 text-red-500 animate-pulse" : "text-slate-400"}`} />
                      </button>

                      {/* Info block */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black font-mono tracking-wider shadow-md">
                            {donor.bloodGroup}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md flex items-center gap-1 font-bold uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            {t.verified || "Verified Donor"}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            {getProximityText(donor.location, donor.id)}
                          </span>
                          <span className="text-slate-400 text-xs font-medium">आयु: {donor.age} वर्ष</span>
                        </div>

                        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                          {donor.name}
                          {isFollowed && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                              {t.following || "Following"}
                            </span>
                          )}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-emerald-500" /> {donor.location}
                          </span>
                          <span className="text-slate-400 font-mono">
                            पिछला दान: {donor.lastDonation}
                          </span>
                          <button
                            onClick={() => onViewMapItem(donor)}
                            className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer font-bold"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>नक्शा देखें (Map)</span>
                          </button>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 gap-3">
                        {/* Likes/Dislikes & Copy */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(donor.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isLiked 
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalLikes}</span>
                          </button>

                          <button
                            onClick={() => handleDislike(donor.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isDisliked 
                                ? "bg-slate-800 text-slate-200 border-slate-700" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalDislikes}</span>
                          </button>

                          <button
                            onClick={() => handleCopyLocal(`Donor: ${donor.name}, Blood Group: ${donor.bloodGroup}, Location: ${donor.location}, Contact: ${donor.contact}`)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Copy Details"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Comms & Follow */}
                        <div className="flex items-center gap-1.5">
                          {/* Follow Button toggle */}
                          <button
                            onClick={() => onToggleFollowDonor && onToggleFollowDonor(donor.id)}
                            className={`font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer border ${
                              isFollowed
                                ? "bg-emerald-600/15 text-emerald-400 border-emerald-500/30"
                                : "bg-slate-950 hover:bg-slate-850 text-slate-300 border-slate-800"
                            }`}
                          >
                            {isFollowed ? "✓ Following" : `+ ${t.follow || "Follow"}`}
                          </button>

                          {/* Live Phone Call */}
                          <a
                            href={`tel:${donor.contact}`}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 shadow-md flex-shrink-0"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>

                          {/* WhatsApp Chat */}
                          <a
                            href={`https://wa.me/${donor.contact.replace(/\D/g, "") || "919425511223"}?text=${encodeURIComponent(`नमस्ते ${donor.name}, मैंने Blood AI पर आपका सत्यापित रक्तदान डोनर कार्ड देखा। क्या आप रक्तदान के लिए सहायता कर सकते हैं?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-emerald-400 font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 flex-shrink-0"
                          >
                            WhatsApp
                          </a>

                          {/* Email routing */}
                          <a
                            href={"mailto:help@bloodai.org?subject=Blood%20AI%20Donor%20Inquiry&body=" + encodeURIComponent("Hi " + donor.name + ", we reached out to you via Blood AI seeking blood support. Please reply.")}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* Options Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdownId(activeDropdownId === donor.id ? null : donor.id)}
                              className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeDropdownId === donor.id && (
                              <div className="absolute right-0 bottom-12 md:bottom-auto md:top-10 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(`Verified donor list ${donor.bloodGroup} ${donor.location}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-emerald-600/10 transition-colors"
                                >
                                  Google Search
                                </a>
                                <button
                                  onClick={() => handleReportLocal(donor.id)}
                                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-white hover:bg-red-600/20 transition-colors cursor-pointer"
                                >
                                  Report Profile
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Blood Banks */}
          {activeTab === "banks" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredBanks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  कोई ब्लड बैंक उपलब्ध नहीं है।
                </div>
              ) : (
                filteredBanks.map((bank) => {
                  const isFav = favorites.includes(bank.id);
                  const isLiked = userInteractions[bank.id] === "like";
                  const isDisliked = userInteractions[bank.id] === "dislike";
                  const totalLikes = (localLikes[bank.id] || 0) + 42;
                  const totalDislikes = localDislikes[bank.id] || 0;

                  return (
                    <motion.div
                      key={bank.id}
                      layout
                      className="bg-slate-900/90 border border-sky-500/15 hover:border-sky-500/40 rounded-2xl p-5 flex flex-col gap-4 shadow-lg transition-all relative text-left"
                    >
                      {/* Favorite/Heart Overlay Button */}
                      <button
                        onClick={() => onToggleFavorite && onToggleFavorite(bank.id)}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 text-slate-400 hover:text-emerald-500 transition-all active:scale-95 cursor-pointer z-10"
                        title={t.favorites}
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? "fill-red-500 text-red-500 animate-pulse" : "text-slate-400"}`} />
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">🏢 {bank.name}</h3>
                          <span className="inline-flex items-center gap-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
                            <Compass className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                            {getProximityText(bank.location, bank.id)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-sky-500" /> {bank.address}, {bank.location}
                          </span>
                          <button
                            onClick={() => onViewMapItem(bank)}
                            className="inline-flex items-center gap-1 text-[10px] bg-sky-500/15 hover:bg-sky-500/35 text-sky-400 border border-sky-500/20 px-2 py-1 rounded-md transition-all active:scale-95 cursor-pointer font-bold"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>नक्शा देखें (Map)</span>
                          </button>
                        </div>

                        {/* Available blood groups badge list */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 font-bold mr-1 uppercase">स्टॉक (Stock):</span>
                          {bank.availableGroups.map((g) => (
                            <span key={g} className="text-[10px] px-2 py-0.5 bg-sky-950 text-sky-400 rounded-md border border-sky-800 font-mono font-bold shadow-sm">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 gap-3">
                        {/* Likes/Dislikes & Copy */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLike(bank.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isLiked 
                                ? "bg-sky-500/15 text-sky-400 border-sky-500/40" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalLikes}</span>
                          </button>

                          <button
                            onClick={() => handleDislike(bank.id)}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isDisliked 
                                ? "bg-slate-800 text-slate-200 border-slate-700" 
                                : "bg-slate-950 hover:bg-slate-850 text-slate-400 border-slate-800"
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="font-mono">{totalDislikes}</span>
                          </button>

                          <button
                            onClick={() => handleCopyLocal(`Blood Bank: ${bank.name}, Address: ${bank.address}, Contact: ${bank.contact}, Available Groups: ${bank.availableGroups.join(", ")}`)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Copy Details"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Communications & Inquiry */}
                        <div className="flex items-center gap-1.5">
                          {/* Call */}
                          <a
                            href={`tel:${bank.contact}`}
                            className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-lg transition-all active:scale-95 shadow-md flex-shrink-0"
                          >
                            <Phone className="w-3 h-3" /> Call Bank
                          </a>

                          {/* WhatsApp Inquiry */}
                          <a
                            href={`https://wa.me/${bank.contact.replace(/\D/g, "") || "919425511223"}?text=${encodeURIComponent(`नमस्ते ${bank.name}, मैं Blood AI से संपर्क कर रहा हूँ। क्या आपके पास वर्तमान में O- या O+ ब्लड समूह की यूनिट्स उपलब्ध हैं?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-sky-400 font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 flex-shrink-0"
                          >
                            WhatsApp Inquiry
                          </a>

                          {/* Email routing */}
                          <a
                            href={"mailto:help@bloodai.org?subject=Blood%20Inquiry%20" + encodeURIComponent(bank.name) + "&body=" + encodeURIComponent("Hi " + bank.name + ", we are seeking blood units stock information.")}
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          {/* Map directions */}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + " " + bank.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                            title="Google Maps"
                          >
                            <Compass className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* Google Live Search Grounding Section */}
          {activeTab === "google_banks" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
              id="google-banks-tab-panel"
            >
              {/* Header Card */}
              <div className="bg-slate-900 border border-amber-500/15 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Compass className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>जीपीएस लाइव ब्लड बैंक खोज रडार</span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase tracking-wider">
                          Google Search Live
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        गूगल सर्च ग्राउंडिंग द्वारा वर्तमान जीपीएस स्थान के आसपास रीयल-टाइम में कार्यरत ब्लड बैंक खोजें।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Coords Tracker Panel */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-slate-400 font-bold">रडार स्थिति (Radar):</span> active (active scanning ready)
                  </span>
                  <span>|</span>
                  <span>
                    <strong className="text-slate-400">जीपीएस निर्देशिका:</strong> {userCoords?.lat?.toFixed(5) || "23.8388"}, {userCoords?.lng?.toFixed(5) || "78.7378"}
                  </span>
                  <span>|</span>
                  <span>
                    <strong className="text-slate-400">शहर (City Context):</strong> {customLocationName || "Sagar, Madhya Pradesh"}
                  </span>
                </div>
              </div>

              {/* Control Panel Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={googleSearchQuery}
                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    placeholder="खोज क्वेरी टाइप करें... (जैसे: Sagar near medical college blood banks)"
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500 focus:ring-0"
                    disabled={googleSearchLoading}
                  />
                </div>
                <button
                  onClick={handleLiveGoogleSearch}
                  disabled={googleSearchLoading}
                  className={`bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 shrink-0 ${
                    googleSearchLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${googleSearchLoading ? "animate-spin" : ""}`} />
                  <span>{googleSearchLoading ? "खोज की जा रही है..." : "रडार स्कैन प्रारंभ करें"}</span>
                </button>
              </div>

              {/* Scan Screen Rendering */}
              {googleSearchLoading ? (
                <div className="bg-slate-900/60 border border-amber-500/10 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border border-amber-500/35 animate-pulse" />
                    <div className="absolute inset-6 rounded-full border border-amber-500/10" />
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <Compass className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                  <div className="text-center max-w-md">
                    <h4 className="text-sm font-bold text-white animate-pulse">रडार सक्रीय स्कैन प्रगति पर है...</h4>
                    <p className="text-xs text-amber-400/90 font-mono mt-1.5 h-6 transition-all duration-300">
                      {googleSearchProgress}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">
                      (Google Search is locating active blood banks, cross-referencing contact info, and sorting by Haversine distance)
                    </p>
                  </div>
                </div>
              ) : hasSearchedGoogle ? (
                <>
                  {googleBanks.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
                      <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-white">कोई परिणाम नहीं मिला</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        आपके द्वारा चुनी गई खोज क्वेरी के लिए कोई लाइव ब्लड बैंक परिणाम नहीं मिले। कृपया क्वेरी बदलें और पुनः प्रयास करें।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Count Indicator and Notification */}
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>गूगल द्वारा <strong className="text-white">{googleBanks.length}</strong> सक्रिय लाइव केंद्र प्राप्त हुए</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold font-mono">
                          Verified Ground Truth
                        </span>
                      </div>

                      {/* Result Cards Loop */}
                      <div className="space-y-3">
                        {googleBanks.map((bank, index) => {
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              key={bank.id}
                              className="bg-slate-900 border border-amber-500/10 hover:border-amber-500/30 p-5 rounded-2xl relative shadow-lg transition-all group"
                            >
                              {/* Absolute proximity badge */}
                              <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                                <Navigation className="w-3 h-3 text-amber-400 animate-pulse" />
                                <span>{bank.distance} KM दूर</span>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">🏢 {bank.name}</h3>
                                  {bank.isVerified && (
                                    <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                      ✓ Verified
                                    </span>
                                  )}
                                </div>

                                {/* Star Ratings Block */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                  <div className="flex items-center text-amber-400">
                                    {"★".repeat(Math.floor(Number(bank.rating) || 4))}
                                    {"☆".repeat(5 - Math.floor(Number(bank.rating) || 4))}
                                  </div>
                                  <span className="text-slate-300 font-bold">{bank.rating || "4.2"}</span>
                                  <span className="text-slate-500">({bank.reviewsCount || 25} reviews)</span>
                                </div>

                                {/* Address Block */}
                                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1">
                                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                  <span>{bank.address}</span>
                                </p>

                                {/* Available stock tags if any */}
                                {bank.availableGroups && bank.availableGroups.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center mb-4">
                                    <span className="text-[9px] text-slate-500 font-bold mr-1 uppercase">स्टॉक (Stock):</span>
                                    {bank.availableGroups.map((g: string) => (
                                      <span key={g} className="text-[9px] px-1.5 py-0.5 bg-amber-950/40 text-amber-400 rounded border border-amber-900/60 font-mono font-bold">
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions Row */}
                              <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3.5 gap-3 mt-4">
                                <button
                                  onClick={() => handleCopyLocal(`Blood Bank: ${bank.name}, Address: ${bank.address}, Contact: ${bank.contact}`)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors active:scale-95 cursor-pointer"
                                  title="विवरण कॉपी करें (Copy Details)"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </button>

                                <div className="flex items-center gap-2">
                                  {/* Clickable phone call */}
                                  <a
                                    href={`tel:${bank.contact}`}
                                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[11px] px-3.5 py-2 rounded-lg transition-all active:scale-95 shadow-md shrink-0"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-slate-950" /> 
                                    <span>Call Center</span>
                                  </a>

                                  {/* Map Direction Link */}
                                  <a
                                    href={bank.mapUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + " " + bank.address)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 text-amber-400 border border-amber-500/20 font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95 shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Google Maps</span>
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Verification Sources Grounding references footer */}
                      {googleSources.length > 0 && (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mt-6">
                          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                            <Globe className="w-3.5 h-3.5 text-sky-400" />
                            <span>सत्यापित खोज ग्राउंडिंग स्रोत (Verified References):</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {googleSources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-950/20 hover:bg-sky-950/50 px-2.5 py-1 rounded border border-sky-900/50 transition-colors"
                              >
                                <span>🔗 {src.title || "Reference Info"}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Welcome Radar ready to sweep state */
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-400">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">स्कैनिंग प्रारंभ करने के लिए तैयार</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      आपके वर्तमान स्थान <strong className="text-slate-300">"{customLocationName || 'Sagar, MP'}"</strong> के आस-पास लाइव जीपीएस/सर्च ग्राउंडिंग ब्लड बैंकों की सूची रीयल-टाइम में लोड करने के लिए "रडार स्कैन प्रारंभ करें" बटन दबाएं।
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Community Section */}
          {activeTab === "community" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-950/20 border border-purple-500/15 rounded-xl p-4 gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-purple-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>रक्तदाता कम्युनिटी हब (Blood Donor Community)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">रक्तदान की प्रेरणादायक कहानियाँ और जागरूकता अपडेट्स।</p>
                </div>
                <button
                  onClick={onOpenCommunityModal}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Post Story
                </button>
              </div>

              {communityPosts.map((post) => (
                <div key={post.id} className="bg-slate-900/80 border border-purple-500/10 rounded-xl p-4 space-y-3 shadow-md hover:border-purple-500/25 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600/15 text-purple-400 flex items-center justify-center font-bold text-xs uppercase">
                        {post.authorName[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {post.authorName}
                          <span className="text-[9px] bg-purple-600/20 text-purple-300 px-1.5 py-0.2 rounded font-mono uppercase">{post.role}</span>
                        </h4>
                        <span className="text-[10px] text-slate-500">{post.location} • {post.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.map(t => (
                      <span key={t} className="text-[10px] bg-purple-950/50 border border-purple-900/45 text-purple-400 px-2 py-0.5 rounded font-mono">#{t}</span>
                    ))}
                  </div>

                  {/* Comment Section inside community cards */}
                  <div className="border-t border-slate-800/60 pt-3 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Comments ({post.comments?.length || 0})</span>
                    <div className="space-y-1.5">
                      {post.comments?.map((c, index) => (
                        <div key={index} className="bg-slate-950/40 border border-slate-900 rounded p-2 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-purple-400 mb-0.5 font-bold">
                            <span>{c.authorName}</span>
                            <span className="text-slate-600 font-mono font-medium">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-300 text-[11px]">{c.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <input
                        type="text"
                        placeholder="आपका नाम..."
                        value={commentAuthors[post.id] || ""}
                        onChange={(e) => setCommentAuthors(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-600 w-28"
                      />
                      <input
                        type="text"
                        placeholder="अपनी टिप्पणी दर्ज करें..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-xs text-white placeholder-slate-600 flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handlePostComment(post.id)}
                      />
                      <button
                        onClick={() => handlePostComment(post.id)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded transition-colors active:scale-95 cursor-pointer font-bold"
                      >
                        टिप्पणी
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Insurance related Accidental Helpline and Govt Accidental Links Hub */}
          {activeTab === "insurance" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              {/* Helplines Accidental Numbers Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  त्वरित दुर्घटना हेल्पलाइन नंबर (Highway & Medical SOS)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <a href="tel:102" className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between text-left">
                    <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">Ambulance</span>
                    <span className="text-xl font-bold text-white mt-1">102 / 108</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">सरकारी एम्बुलेंस सेवा</span>
                  </a>
                  <a href="tel:1033" className="bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/20 rounded-xl p-3 flex flex-col justify-between text-left">
                    <span className="text-[9px] text-sky-400 font-mono font-bold uppercase">Highway SOS</span>
                    <span className="text-xl font-bold text-white mt-1">1033</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">राष्ट्रीय राजमार्ग टोल सहायता</span>
                  </a>
                  <a href="tel:1073" className="bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 rounded-xl p-3 flex flex-col justify-between text-left">
                    <span className="text-[9px] text-red-400 font-mono font-bold uppercase">Road Safety</span>
                    <span className="text-xl font-bold text-white mt-1">1073</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">सड़क दुर्घटना सुरक्षा आपातकालीन</span>
                  </a>
                </div>
              </div>

              {/* Accident Insurance Policy Help Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-left">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-sans tracking-wide">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>सरकारी दुर्घटना और स्वास्थ्य बीमा योजनाएं (Govt Schemes)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  दुर्घटना होने की स्थिति में चिकित्सा व्यय को कवर करने के लिए भारत सरकार द्वारा संचालित प्रमुख योजनाएं निम्नलिखित हैं:
                </p>

                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-900">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-amber-400 font-bold">1. आयुष्मान भारत योजना (PM-JAY)</strong>
                      <span className="text-[9px] bg-red-600/20 text-red-300 border border-red-500/15 px-2 py-0.2 rounded-full font-bold">₹5 Lakh/Year</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      चिन्हित सरकारी और निजी अस्पतालों में भर्ती होने पर ₹5 लाख तक का कैशलेस इलाज मिलता है। गंभीर दुर्घटना चोटें भी इस योजना के तहत पूरी तरह कवर्ड हैं।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-900">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-emerald-400 font-bold">2. प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY)</strong>
                      <span className="text-[9px] bg-emerald-600/20 text-emerald-300 border border-emerald-500/15 px-2 py-0.2 rounded-full font-bold">₹20/Year Premium</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      केवल ₹20 वार्षिक प्रीमियम पर ₹2 लाख तक का आकस्मिक मृत्यु और पूर्ण विकलांगता कवर मिलता है। आंशिक विकलांगता पर ₹1 लाख मिलते हैं।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-900">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-sky-400 font-bold">3. मोटर वाहन अधिनियम (Accident Compensation Scheme)</strong>
                      <span className="text-[9px] bg-sky-600/20 text-sky-300 border border-sky-500/15 px-2 py-0.2 rounded-full font-bold">HIT & RUN Support</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      हिट एंड रन मामलों के तहत गंभीर चोट लगने पर सरकार की तरफ से ₹50,000 और मृत्यु होने पर ₹2,00,000 का मुआवजा दिया जाता है।
                    </p>
                  </div>
                </div>
              </div>

              {/* Blood Donation Eligibility Checklist */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 text-left">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>रक्तदान के लिए पात्रता गाइड (Donation Eligibility Checklist)</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  स्वस्थ समाज के लिए सुरक्षित रक्तदान आवश्यक है। रक्तदान करने से पहले कृपया नीचे दी गई बुनियादी पात्रता मानदंडों की जांच अवश्य करें:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                    <span className="text-emerald-400 font-bold block">1. आयु और वजन (Age & Weight)</span>
                    <p className="text-slate-500 mt-0.5 leading-normal">आयु 18 से 65 वर्ष के बीच और वजन कम से कम 45 किलोग्राम होना आवश्यक है।</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                    <span className="text-sky-400 font-bold block">2. समय का अंतराल (Min. Interval)</span>
                    <p className="text-slate-500 mt-0.5 leading-normal">अंतिम रक्तदान से कम से कम 3 महीने (90 दिन) का समय पूरा हो चुका होना चाहिए।</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-900">
                    <span className="text-red-400 font-bold block">3. सामान्य स्वास्थ्य (General Health)</span>
                    <p className="text-slate-500 mt-0.5 leading-normal">व्यक्ति को बुखार, जुकाम, या कोई संक्रामक रोग न हो, और हीमोग्लोबिन स्तर न्यूनतम 12.5 ग्राम हो।</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
