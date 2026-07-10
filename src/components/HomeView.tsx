import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, AlertCircle, AlertTriangle, 
  Heart, Navigation, HelpCircle, Phone, MessageSquare, Share2, Copy, 
  ThumbsUp, ThumbsDown, ShieldAlert, MapPin, Eye, Info, CheckCircle2, 
  Map, Calendar, Users, FileText, Camera, Image, Paperclip, Check
} from "lucide-react";
import { ChatMessage, Donor, EmergencyRequest, BloodBank } from "../types";
import { TRANSLATIONS } from "../translations";

interface HomeViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onResetDb: () => void;
  apiError: string | null;
  language?: "hi" | "en" | "hinglish";
  isDarkMode?: boolean;
  donors: Donor[];
  emergencyRequests: EmergencyRequest[];
  bloodBanks: BloodBank[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onViewMapItem: (item: any) => void;
  onShowToast: (msg: string) => void;
  favoriteServices?: string[];
  onNavigate?: (view: string) => void;
  onUpdateFavoriteServices?: (services: string[]) => void;
}

export default function HomeView({
  messages,
  onSendMessage,
  isLoading,
  onResetDb,
  apiError,
  language = "hi",
  isDarkMode = true,
  donors,
  emergencyRequests,
  bloodBanks,
  favorites,
  onToggleFavorite,
  onViewMapItem,
  onShowToast,
  favoriteServices = ["Blood Search", "Donor Search", "Emergency Requests", "Live Map", "Live Peer Chat"],
  onNavigate,
  onUpdateFavoriteServices
}: HomeViewProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeaking, setCurrentlySpeaking] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Simulated Dialing Modal State
  const [dialingContact, setDialingContact] = useState<{ name: string; phone: string } | null>(null);
  const [isCallRinging, setIsCallRinging] = useState(true);
  const [isCustomizingServices, setIsCustomizingServices] = useState(false);

  // Interactive Card Likes & Comments Local State
  const [cardLikes, setCardLikes] = useState<Record<string, number>>({});
  const [cardDislikes, setCardDislikes] = useState<Record<string, number>>({});
  const [cardUserInteractions, setCardUserInteractions] = useState<Record<string, "like" | "dislike" | null>>({});
  const [cardComments, setCardComments] = useState<Record<string, Array<{ id: string; author: string; text: string; time: string }>>>({});
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState("");
  const [commentAuthorName, setCommentAuthorName] = useState("");

  // Simulated Camera / Attachment State
  const [simulatedAttachment, setSimulatedAttachment] = useState<string | null>(null);

  // Medical Matrix selected blood group for compatibility
  const [matrixBloodGroup, setMatrixBloodGroup] = useState<string>("O-");

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === "hi" ? "hi-IN" : "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
    setSimulatedAttachment(null);
  };

  const toggleListening = () => {
    if (!speechSupported) {
      onShowToast("माइक्रोफ़ोन आपके ब्राउज़र में उपलब्ध नहीं है।");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handleSimulateCall = (name: string, phone: string) => {
    setDialingContact({ name, phone });
    setIsCallRinging(true);
    onShowToast(`Calling: ${name}...`);
    // Simulated dial sound
    setTimeout(() => {
      setIsCallRinging(false);
    }, 3000);
  };

  const speakText = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (currentlySpeaking === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`\[\]()]/g, "")
      .replace(/❤️/g, "धन्यवाद")
      .replace(/🚨/g, "आपातकाल");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasHindi = /[\u0900-\u097F]/.test(cleanText);
    utterance.lang = hasHindi ? "hi-IN" : "en-US";

    utterance.onend = () => {
      setCurrentlySpeaking(null);
    };

    setCurrentlySpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(t.copied || "Copied to clipboard!");
  };

  const handleLikeCard = (id: string) => {
    const status = cardUserInteractions[id];
    if (status === "like") {
      setCardUserInteractions(prev => ({ ...prev, [id]: null }));
      setCardLikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
    } else {
      if (status === "dislike") {
        setCardDislikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
      }
      setCardUserInteractions(prev => ({ ...prev, [id]: "like" }));
      setCardLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      onShowToast("Liked!");
    }
  };

  const handleDislikeCard = (id: string) => {
    const status = cardUserInteractions[id];
    if (status === "dislike") {
      setCardUserInteractions(prev => ({ ...prev, [id]: null }));
      setCardDislikes(prev => ({ ...prev, [id]: (prev[id] || 0) - 1 }));
    } else {
      if (status === "like") {
        setCardLikes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
      }
      setCardUserInteractions(prev => ({ ...prev, [id]: "dislike" }));
      setCardDislikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      onShowToast("Disliked!");
    }
  };

  const handleAddComment = (cardId: string) => {
    if (!commentInputText.trim()) return;
    const author = commentAuthorName.trim() || "Visitor";
    const newComment = {
      id: "comment_" + Date.now(),
      author,
      text: commentInputText,
      time: "Just now"
    };

    setCardComments(prev => ({
      ...prev,
      [cardId]: [...(prev[cardId] || []), newComment]
    }));

    setCommentInputText("");
    onShowToast("टिप्पणी सहेजी गई! (Comment saved!)");
  };

  const handleSimulateAttachment = (type: "camera" | "gallery" | "file") => {
    const name = type === "camera" ? "doctor_prescription_scan.png" : type === "gallery" ? "blood_report.jpeg" : "medical_certificate.pdf";
    setSimulatedAttachment(name);
    setInputText((prev) => prev ? prev + ` [Attached: ${name}]` : `Scan and analyze attached medical document: ${name}`);
    onShowToast(`सफलतापूर्वक संलग्न: ${name}`);
  };

  const handleSimulateLocation = () => {
    setInputText((prev) => {
      const base = "Find active O- negative blood donors near my current GPS location (Delhi)";
      return prev ? prev + " " + base : base;
    });
    onShowToast("वर्तमान स्थान जीपीएस विवरण संदेश बॉक्स में प्रविष्ट!");
  };

  const suggestions = language === "hi" ? [
    { text: "O+ blood needed in Delhi urgent", label: "O+ आपातकाल (Delhi)", icon: "🚨" },
    { text: "मैं रक्तदान करना चाहता हूँ, मुझे रजिस्टर करो", label: "डोनर पंजीकरण", icon: "❤️" },
    { text: "क्या O- Universal Donor है? अनुकूलता बताएं", label: "संगतता सूची", icon: "📊" },
    { text: "आपातकालीन अनुरोध: रमेश गुप्ता के लिए 2 यूनिट B+ खून चाहिए दिल्ली में", label: "इमरजेंसी अनुरोध", icon: "🏥" }
  ] : language === "hinglish" ? [
    { text: "O+ blood needed in Delhi urgent", label: "O+ Emergency (Delhi)", icon: "🚨" },
    { text: "Mujhe blood donor register karna hai", label: "Donor Registration", icon: "❤️" },
    { text: "Kya O- Universal Donor hai? compatibility batao", label: "Compatibility Chart", icon: "📊" },
    { text: "Emergency Request: Ramesh Gupta ke liye 2 unit B+ blood chahiye Delhi me", label: "Emergency Post", icon: "🏥" }
  ] : [
    { text: "O+ blood needed in Delhi urgent", label: "O+ Emergency (Delhi)", icon: "🚨" },
    { text: "I want to donate blood, register me as donor", label: "Donor Registration", icon: "❤️" },
    { text: "Is O- a Universal Donor? Explain compatibility", label: "Compatibility Chart", icon: "📊" },
    { text: "Emergency Request: 2 units of B+ required for Ramesh Gupta in Delhi", label: "Emergency Post", icon: "🏥" }
  ];

  // BLOOD COMPATIBILITY DATA FOR THE MATRIX CARD
  const compatibilityMatrix: Record<string, { give: string[]; receive: string[] }> = {
    "O-": { give: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], receive: ["O-"] },
    "O+": { give: ["O+", "A+", "B+", "AB+"], receive: ["O-", "O+"] },
    "A-": { give: ["A-", "A+", "AB-", "AB+"], receive: ["O-", "A-"] },
    "A+": { give: ["A+", "AB+"], receive: ["O-", "O+", "A-", "A+"] },
    "B-": { give: ["B-", "B+", "AB-", "AB+"], receive: ["O-", "B-"] },
    "B+": { give: ["B+", "AB+"], receive: ["O-", "O+", "B-", "B+"] },
    "AB-": { give: ["AB-", "AB+"], receive: ["O-", "A-", "B-", "AB-"] },
    "AB+": { give: ["AB+"], receive: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] },
  };

  return (
    <div id="chat_view_root" className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl relative bg-slate-950/40 backdrop-blur-md">
      
      {/* Dialing Phone Simulator Overlay */}
      {dialingContact && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center text-center p-6 text-white">
          <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl mb-4 relative">
            <Phone className="w-10 h-10 animate-bounce" />
            <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></div>
          </div>
          <h2 className="text-xl font-extrabold">{dialingContact.name}</h2>
          <p className="text-sm text-slate-400 font-mono mt-1">{dialingContact.phone}</p>
          <div className="text-red-500 text-xs uppercase font-mono tracking-widest font-black mt-4 animate-pulse">
            {isCallRinging ? "RINGING / डायल किया जा रहा है..." : "CALL CONNECTED / कॉल जारी है"}
          </div>
          
          <div className="flex flex-col gap-2 mt-8 w-full max-w-xs">
            <p className="text-[11px] text-slate-500 italic">This is a fully operational dial helper for direct connection.</p>
            <button
              onClick={() => {
                window.open(`tel:${dialingContact.phone}`);
                setDialingContact(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> Open Dialer App
            </button>
            <button
              onClick={() => setDialingContact(null)}
              className="bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95 cursor-pointer mt-1"
            >
              Cancel / कॉल समाप्त
            </button>
          </div>
        </div>
      )}

      {/* Main chat messaging section */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60%] text-center px-4 max-w-xl mx-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 animate-fade-in"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600/20 to-red-600/5 text-red-500 flex items-center justify-center text-4xl border border-red-500/20 mb-2 mx-auto animate-pulse">
                🩸
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
                Blood AI Chat
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                यह आपातकालीन रक्त सहायक प्रणाली है। आप सामान्य भाषा में लिखकर या बोलकर रक्तदाता खोज सकते हैं, स्वयं पंजीकरण कर सकते हैं या आपातकालीन बोर्ड पर रोगी का विवरण दर्ज कर सकते हैं।
              </p>
            </motion.div>

            {/* Dynamic Customizable Pinned Favorite Services */}
            <div className="w-full mt-8 border-t border-slate-900 pt-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>पसंदीदा सेवाएँ (Pinned Services)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomizingServices(!isCustomizingServices)}
                  className="text-[10px] text-red-500 hover:underline font-bold transition-all active:scale-95"
                >
                  {isCustomizingServices ? "Done (पूरा हुआ)" : "Customize (व्यवस्थित करें)"}
                </button>
              </div>

              {isCustomizingServices ? (
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                  {[
                    "Blood Search",
                    "Donor Search",
                    "Emergency Requests",
                    "Live Map",
                    "Live Peer Chat",
                    "Support / Donation"
                  ].map(service => {
                    const isSelected = favoriteServices.includes(service);
                    const labelHindi = 
                      service === "Blood Search" ? "रक्त खोज (Blood Search)" :
                      service === "Donor Search" ? "दाता खोज (Donor Search)" :
                      service === "Emergency Requests" ? "आपातकालीन अनुरोध" :
                      service === "Live Map" ? "लाइव मानचित्र (Live Map)" :
                      service === "Live Peer Chat" ? "लाइव चैट (Live Peer Chat)" : "स्वैच्छिक दान (Support)";
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          if (onUpdateFavoriteServices) {
                            const updated = isSelected 
                              ? favoriteServices.filter(s => s !== service)
                              : [...favoriteServices, service];
                            onUpdateFavoriteServices(updated);
                          } else {
                            onShowToast("Cannot update favorite services.");
                          }
                        }}
                        className={`p-2.5 text-left rounded-xl border text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-red-600/10 border-red-500 text-red-500"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span className="truncate">{labelHindi}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {favoriteServices.map((service) => {
                    let icon = "🩸";
                    let label = service;
                    let desc = "Quick action";
                    let action = () => {};

                    if (service === "Blood Search") {
                      icon = "🔍";
                      label = "रक्त खोज";
                      desc = "O+ / AB- blood donors";
                      action = () => onSendMessage("O+ रक्तदाता की खोज करें (Search O+ blood donor)");
                    } else if (service === "Donor Search") {
                      icon = "👥";
                      label = "दाता खोज";
                      desc = "Active volunteer list";
                      action = () => onSendMessage("सभी पंजीकृत रक्तदाताओं की सूची दिखाएं (Show list of all registered blood donors)");
                    } else if (service === "Emergency Requests") {
                      icon = "🚨";
                      label = "आपातकालीन बोर्ड";
                      desc = "Active emergency requests";
                      action = () => onNavigate && onNavigate("emergency");
                    } else if (service === "Live Map") {
                      icon = "🗺️";
                      label = "लाइव मानचित्र";
                      desc = "Near real-time tracking";
                      action = () => onNavigate && onNavigate("map");
                    } else if (service === "Live Peer Chat") {
                      icon = "💬";
                      label = "लाइव चैट (Group Room)";
                      desc = "Connect with community";
                      action = () => onNavigate && onNavigate("chat");
                    } else if (service === "Support / Donation") {
                      icon = "💝";
                      label = "स्वैच्छिक दान (Support)";
                      desc = "Information & support";
                      action = () => onSendMessage("रक्तदान और स्वैच्छिक दान के बारे में जानकारी (Information about blood donation & support)");
                    }

                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={action}
                        className="p-3 text-left rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-red-500/25 text-slate-300 transition-all active:scale-95 cursor-pointer flex flex-col justify-between min-h-[75px]"
                      >
                        <span className="text-lg">{icon}</span>
                        <div className="mt-2 text-left">
                          <p className="text-[11px] font-extrabold text-slate-200 line-clamp-1">{label}</p>
                          <p className="text-[9px] text-slate-500 font-medium font-sans mt-0.5 line-clamp-1">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Suggestions Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s.text)}
                  className="p-3 text-left rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500/30 text-slate-300 transition-all active:scale-98 cursor-pointer group hover:bg-slate-900"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{s.icon}</span>
                    <span className="text-[10px] text-red-500 font-black tracking-wider uppercase font-sans">{s.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-100 font-mono italic truncate">"{s.text}"</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => {
              const isModel = msg.role === "model";
              const commentList = cardComments[msg.id] || [];
              const likesCount = cardLikes[msg.id] || 0;
              const dislikesCount = cardDislikes[msg.id] || 0;
              const interaction = cardUserInteractions[msg.id];

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${!isModel ? "items-end" : "items-start"}`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 text-xs sm:text-sm shadow-xl leading-relaxed border relative ${
                      !isModel
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/20 rounded-br-none"
                        : "bg-slate-950/80 text-slate-200 border-slate-800/80 rounded-bl-none"
                    }`}
                  >
                    {/* Speaker Header / Robot Avatar */}
                    {isModel && (
                      <div className="flex items-center gap-1.5 mb-2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span>Blood AI</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line break-words font-sans font-medium">
                      {msg.text}
                    </div>

                    {/* Metadata Footer */}
                    <div className="mt-3.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">{msg.timestamp}</span>
                      {isModel && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakText(msg.id, msg.text)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Speak Response"
                          >
                            {currentlySpeaking === msg.id ? (
                              <VolumeX className="w-3 h-3 text-red-500" />
                            ) : (
                              <Volume2 className="w-3 h-3 text-red-500" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyText(msg.text)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                            title="Copy text"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EMBEDDED DYNAMIC ACTION CARD */}
                  {isModel && msg.action && msg.action.type !== "NONE" && (
                    <div className="w-full max-w-[90%] sm:max-w-[80%] mt-3">
                      
                      {/* ACTION 1: SEARCH_BLOOD MATCH RESULTS */}
                      {msg.action.type === "SEARCH_BLOOD" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 text-left space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-500 tracking-wide flex items-center gap-1">
                              <Users className="w-4 h-4" /> Live Blood Matches
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              Filtered: {msg.action.params?.bloodGroup || "All"} • {msg.action.params?.location || "India"}
                            </span>
                          </div>

                          {/* Mini Map Preview */}
                          <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col justify-between relative overflow-hidden h-32">
                            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Dynamic Proximity Map Preview</span>
                              <p className="text-xs text-slate-300 font-bold mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                <span>{msg.action.params?.location || "Delhi, India"} Zone Coverage</span>
                              </p>
                            </div>
                            
                            <button
                              onClick={() => onViewMapItem({ id: "search_map_focus", name: msg.action?.params?.location || "Delhi", location: msg.action?.params?.location || "Delhi" })}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] w-fit cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all z-10 uppercase tracking-wider"
                            >
                              <Map className="w-3 h-3" /> Focus Proximity Map
                            </button>
                          </div>

                          {/* Donors Match Sub-list */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <span>Match Donors ({donors.filter(d => !msg.action?.params?.bloodGroup || d.bloodGroup.toUpperCase() === msg.action.params.bloodGroup.toUpperCase()).length})</span>
                            </h4>
                            
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                              {donors
                                .filter(d => {
                                  const bgMatch = !msg.action?.params?.bloodGroup || d.bloodGroup.toUpperCase() === msg.action.params.bloodGroup.toUpperCase();
                                  const locMatch = !msg.action?.params?.location || d.location.toLowerCase().includes(msg.action.params.location.toLowerCase());
                                  return bgMatch && locMatch;
                                })
                                .map((donor) => (
                                  <div key={donor.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
                                    <div className="text-left">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-white">{donor.name}</span>
                                        <span className="bg-red-500/10 text-red-400 text-[9px] font-black border border-red-500/20 px-1.5 rounded uppercase font-mono">Group {donor.bloodGroup}</span>
                                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-red-500" />
                                        <span>{donor.location} • Age {donor.age} • Last: {donor.lastDonation}</span>
                                      </p>
                                    </div>

                                    {/* Phone & WA actions directly available */}
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleSimulateCall(donor.name, donor.contact)}
                                        className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all active:scale-95 cursor-pointer"
                                        title="Direct Call"
                                      >
                                        <Phone className="w-3.5 h-3.5" />
                                      </button>
                                      <a
                                        href={`https://wa.me/${donor.contact.replace(/\s+/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
                                        title="WhatsApp Message"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                ))}

                              {donors.filter(d => {
                                const bgMatch = !msg.action?.params?.bloodGroup || d.bloodGroup.toUpperCase() === msg.action.params.bloodGroup.toUpperCase();
                                const locMatch = !msg.action?.params?.location || d.location.toLowerCase().includes(msg.action.params.location.toLowerCase());
                                return bgMatch && locMatch;
                              }).length === 0 && (
                                <p className="text-slate-500 text-[11px] italic">No matching direct donors found in the immediate local logs. Try search query 'O- Delhi'.</p>
                              )}
                            </div>
                          </div>

                          {/* Blood Banks Matching */}
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <span>Local Verified Blood Banks</span>
                            </h4>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                              {bloodBanks
                                .filter(b => !msg.action?.params?.location || b.location.toLowerCase().includes(msg.action.params.location.toLowerCase()))
                                .map((bank) => (
                                  <div key={bank.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                                    <div className="text-left">
                                      <span className="text-xs font-bold text-white">{bank.name}</span>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{bank.address}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {bank.availableGroups.map(g => (
                                          <span key={g} className="text-[8px] bg-slate-900 border border-slate-800 px-1 py-0.2 rounded text-slate-300 font-mono font-bold">{g}</span>
                                        ))}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleSimulateCall(bank.name, bank.contact)}
                                      className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all active:scale-95 cursor-pointer"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* BOTTOM STANDARD USER ACTION BUTTONS */}
                          <div className="flex flex-wrap items-center justify-between border-t border-slate-800/60 pt-3 text-[10px] text-slate-400">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLikeCard(msg.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer transition-colors ${interaction === "like" ? "text-emerald-400 font-bold" : ""}`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{likesCount}</span>
                              </button>
                              <button
                                onClick={() => handleDislikeCard(msg.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer transition-colors ${interaction === "dislike" ? "text-red-400 font-bold" : ""}`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>{dislikesCount}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveCommentBox(activeCommentBox === msg.id ? null : msg.id);
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Comment ({commentList.length})</span>
                              </button>
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleCopyText(`Match details found for blood search in ${msg.action?.params?.location || "Delhi"}`)}
                                className="p-1.5 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                                title="Copy details"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (navigator.share) {
                                    navigator.share({ title: "Blood Match Alert", text: "Verified Donors list shared via Blood AI." });
                                  } else {
                                    handleCopyText(`Blood Search: ${msg.action?.params?.bloodGroup || "O+"} in ${msg.action?.params?.location || "Delhi"}`);
                                  }
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 hover:text-white cursor-pointer"
                                title="Share details"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  onShowToast("इस कार्ड की रिपोर्ट व्यवस्थापक को दर्ज करा दी गई है।");
                                }}
                                className="p-1.5 rounded hover:bg-slate-800 text-red-500 cursor-pointer"
                                title="Report item"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* COLLAPSIBLE COMMENTS SECTION */}
                          {activeCommentBox === msg.id && (
                            <div className="border-t border-slate-800/80 pt-3 mt-2 space-y-2">
                              <span className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Comments / चर्चा</span>
                              <div className="space-y-1.5 max-h-24 overflow-y-auto text-[11px] pr-1">
                                {commentList.map(c => (
                                  <div key={c.id} className="bg-slate-950/80 p-2 rounded-lg border border-slate-900 flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-red-400">{c.author}</span>
                                      <p className="text-slate-300 mt-0.5">{c.text}</p>
                                    </div>
                                    <span className="text-[8px] text-slate-500 font-mono">{c.time}</span>
                                  </div>
                                ))}
                                {commentList.length === 0 && (
                                  <p className="text-slate-600 text-[10px] italic">No comments yet. Post your update or request status.</p>
                                )}
                              </div>

                              <div className="flex gap-1.5 mt-2">
                                <input
                                  type="text"
                                  placeholder="Your Name (अपना नाम)"
                                  value={commentAuthorName}
                                  onChange={e => setCommentAuthorName(e.target.value)}
                                  className="bg-slate-950 border border-slate-800 rounded-lg text-[11px] px-2 py-1 outline-none text-white w-24 focus:border-red-500/40"
                                />
                                <input
                                  type="text"
                                  placeholder="Type comment (टिप्पणी लिखें)..."
                                  value={commentInputText}
                                  onChange={e => setCommentInputText(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && handleAddComment(msg.id)}
                                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] px-2 py-1 outline-none text-white focus:border-red-500/40"
                                />
                                <button
                                  onClick={() => handleAddComment(msg.id)}
                                  className="bg-red-600 text-white font-bold px-2.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* ACTION 2: REGISTER_DONOR VERIFIED PASS */}
                      {msg.action.type === "REGISTER_DONOR" && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl p-4 text-left space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-emerald-400 tracking-wide flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Donor Pass (डोनर पास)
                            </span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-mono font-bold animate-pulse">Satyapit ✅</span>
                          </div>

                          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold font-mono">
                              {msg.action.params?.name?.[0]?.toUpperCase() || "D"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-white truncate">{msg.action.params?.name || "Rohan Sharma"}</h4>
                              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                <span>{msg.action.params?.location || "Delhi, India"}</span>
                              </p>
                            </div>
                            <div className="text-center bg-red-600/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                              <span className="text-[9px] text-red-400 font-extrabold uppercase block leading-none">Group</span>
                              <span className="text-base font-black text-red-500 leading-none">{msg.action.params?.bloodGroup || "O+"}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">Age / उम्र</span>
                              <span className="text-slate-200 font-bold">{msg.action.params?.age || 26} Years</span>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">Last Donation</span>
                              <span className="text-slate-200 font-bold">{msg.action.params?.lastDonation || "Never"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSimulateCall(msg.action?.params?.name || "Verified Donor", msg.action?.params?.contact || "+91 98765 43210")}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Registered Contact
                            </button>
                            
                            <button
                              onClick={() => {
                                onToggleFavorite("donor_pass_" + msg.id);
                              }}
                              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                                favorites.includes("donor_pass_" + msg.id)
                                  ? "bg-red-500/20 border-red-500 text-red-500"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                              title="Save to favorites"
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes("donor_pass_" + msg.id) ? "fill-red-500" : ""}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION 3: EMERGENCY_REQUEST ACTIVE CARD */}
                      {msg.action.type === "EMERGENCY_REQUEST" && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-red-500/30 rounded-2xl overflow-hidden shadow-2xl p-4 text-left space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-500 tracking-wide flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-4 h-4 text-red-500" /> Active Emergency Request
                            </span>
                            <span className="text-[9px] bg-red-600/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded uppercase font-mono font-black tracking-widest animate-pulse">Critical 🚨</span>
                          </div>

                          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-black">Patient / रोगी</span>
                              <h4 className="text-sm font-extrabold text-white mt-0.5">{msg.action.params?.name || "Ramesh Gupta"}</h4>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-red-500" />
                                <span>{msg.action.params?.location || "Delhi, India"}</span>
                              </p>
                            </div>

                            <div className="text-right flex gap-2">
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center min-w-[50px]">
                                <span className="text-[8px] text-slate-500 block font-bold">GROUP</span>
                                <span className="text-base font-black text-red-500 font-mono">{msg.action.params?.bloodGroup || "O-"}</span>
                              </div>
                              <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-center min-w-[50px]">
                                <span className="text-[8px] text-slate-500 block font-bold">UNITS</span>
                                <span className="text-base font-black text-slate-200 font-mono">{msg.action.params?.units || 2}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSimulateCall(msg.action?.params?.name || "Patient Contact", msg.action?.params?.contact || "+91 98112 23344")}
                              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-[11px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Hospital Coordinator
                            </button>
                            
                            <button
                              onClick={() => {
                                onToggleFavorite("emergency_card_" + msg.id);
                              }}
                              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                                favorites.includes("emergency_card_" + msg.id)
                                  ? "bg-red-500/20 border-red-500 text-red-500"
                                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                              title="Save to favorites"
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes("emergency_card_" + msg.id) ? "fill-red-500" : ""}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION 4: MEDICAL_INFO COMPATIBILITY INTERACTIVE CHART */}
                      {msg.action.type === "MEDICAL_INFO" && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 text-left space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-black uppercase text-red-500 tracking-wide flex items-center gap-1">
                              <Info className="w-4 h-4" /> Blood Compatibility matrix
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">Interactive Widget</span>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Select a blood group to find out which groups can donate to them or accept donations from them.
                            </p>

                            {/* Dropdown/Buttons selector */}
                            <div className="flex flex-wrap gap-1.5">
                              {Object.keys(compatibilityMatrix).map((bg) => (
                                <button
                                  key={bg}
                                  onClick={() => setMatrixBloodGroup(bg)}
                                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all active:scale-95 cursor-pointer ${
                                    matrixBloodGroup === bg
                                      ? "bg-red-500 text-white border border-red-600"
                                      : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700"
                                  }`}
                                >
                                  {bg}
                                </button>
                              ))}
                            </div>

                            {/* Dynamic Matrix output */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-emerald-400 block font-bold text-[9px] uppercase tracking-wider mb-1">🎁 CAN DONATE TO (इनको रक्त दे सकते हैं)</span>
                                <div className="flex flex-wrap gap-1">
                                  {compatibilityMatrix[matrixBloodGroup]?.give.map(g => (
                                    <span key={g} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold rounded">{g}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                <span className="text-sky-400 block font-bold text-[9px] uppercase tracking-wider mb-1">📥 CAN RECEIVE FROM (इनसे रक्त ले सकते हैं)</span>
                                <div className="flex flex-wrap gap-1">
                                  {compatibilityMatrix[matrixBloodGroup]?.receive.map(r => (
                                    <span key={r} className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono font-bold rounded">{r}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-none px-5 py-3.5 text-xs sm:text-sm shadow-xl border bg-slate-950/60 border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                    <div className="w-2.5 h-2.5 bg-red-300 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                    <span className="text-xs text-slate-500 ml-2 font-mono">
                      {language === "hi" ? "रक्त एआई विश्लेषण कर रहा है..." : language === "hinglish" ? "Blood AI analysis kar raha hai..." : "Blood AI is analyzing..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice Dictation Status HUD Bar */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800 py-3 px-6 text-center text-xs text-red-500 flex items-center justify-center space-x-4 bg-slate-950"
          >
            <div className="flex items-center space-x-1">
              <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1 h-4 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
              <span className="w-1 h-6 bg-red-500 rounded-full animate-bounce [animation-delay:0.45s]"></span>
            </div>
            <span className="font-bold tracking-wide">
              {language === "hi" ? "बोलिए, मैं सुन रहा हूँ... (हिंदी/English)" : "Listening to dictation... Speak now"}
            </span>
            <button
              onClick={() => setIsListening(false)}
              className="text-[9px] bg-red-600/10 hover:bg-red-600/20 text-red-500 px-2 py-0.5 rounded border border-red-500/20 cursor-pointer font-bold font-mono"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ChatGPT Persistent Bottom Input Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        
        {/* Attachment badge representation */}
        {simulatedAttachment && (
          <div className="max-w-4xl mx-auto mb-2.5 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-[10px] w-fit font-mono font-bold animate-pulse">
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attached: {simulatedAttachment}</span>
            <button
              onClick={() => setSimulatedAttachment(null)}
              className="ml-2 hover:text-white font-sans text-xs"
            >
              ×
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-center space-x-2 rounded-2xl px-4 py-2.5 border border-slate-800/80 bg-slate-900 focus-within:border-red-500/40 transition-all shadow-xl">
          
          {/* Action buttons list in bottom input box */}
          <div className="flex items-center gap-1 md:gap-1.5">
            {/* 1. Mic Voice typing */}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="Voice Input (बोलकर टाइप करें)"
            >
              <Mic className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>

            {/* 2. Camera Simulation */}
            <button
              onClick={() => handleSimulateAttachment("camera")}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Camera Scan prescription (कैमरा स्कैन)"
            >
              <Camera className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>

            {/* 3. Gallery Simulation */}
            <button
              onClick={() => handleSimulateAttachment("gallery")}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Upload prescription/report from Gallery"
            >
              <Image className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>

            {/* 4. Live GPS coordinates injection */}
            <button
              onClick={handleSimulateLocation}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Share GPS Location (स्थान विवरण)"
            >
              <MapPin className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>

            {/* 5. General Document attachments */}
            <button
              onClick={() => handleSimulateAttachment("file")}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Attach Medical reports (संलग्नक)"
            >
              <Paperclip className="w-4 h-4 md:w-4.5 md:h-4.5" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-800"></div>

          {/* Core message text box */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "hi" ? "Blood AI से कुछ भी पूछें…" : "Ask Blood AI anything..."}
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs sm:text-sm font-medium py-2 text-white placeholder-slate-500"
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              inputText.trim() && !isLoading
                ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-2 font-bold uppercase tracking-wider">
          {language === "hi" 
            ? "आपातकालीन रक्तदाता खोज, पंजीकरण और चिकित्सा मार्गदर्शन AI द्वारा संचालित है।" 
            : "Emergency donor search, registration, and medical guidelines are AI-powered."}
        </p>
      </div>

    </div>
  );
}
