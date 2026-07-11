import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Users, Shield, Hash, MessageSquare, Sparkles, CheckCircle2, 
  ThumbsUp, ThumbsDown, Copy, Heart, Phone, Sliders, AlertTriangle
} from "lucide-react";
import { TRANSLATIONS } from "../translations";

interface PeerMessage {
  id: string;
  author: string;
  bloodGroup: string;
  role: "Donor" | "Seeker" | "Volunteer" | "Moderator";
  location: string;
  text: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  userInteraction: "like" | "dislike" | null;
  verified: boolean;
}

interface ChatSectionProps {
  language?: "hi" | "en" | "hinglish";
  isDarkMode?: boolean;
  donorsCount: number;
}

export default function ChatSection({
  language = "hi",
  isDarkMode = true,
  donorsCount
}: ChatSectionProps) {
  const [activeChannel, setActiveChannel] = useState<"emergency" | "donors" | "general">("emergency");
  const [inputText, setInputText] = useState("");
  
  // Real-time peer messages database
  const [channelMessages, setChannelMessages] = useState<Record<string, PeerMessage[]>>({
    emergency: [
      {
        id: "peer_e1",
        author: "Siddharth Verma",
        bloodGroup: "O-",
        role: "Seeker",
        location: "Delhi",
        text: "🚨 Emergency! Sagar District Hospital me O- negative blood donor ki bohot urgent jarurat hai! Patient ki open heart surgery honi hai. Phone: +91 95432 10987",
        timestamp: "10:14 AM",
        likes: 12,
        dislikes: 0,
        userInteraction: null,
        verified: true
      },
      {
        id: "peer_e2",
        author: "Meera Deshmukh",
        bloodGroup: "A+",
        role: "Volunteer",
        location: "Mumbai",
        text: "I am tracking O- donors in Mumbai zone, 2 donors are ready to donate! Please coordinate with the coordinator immediately.",
        timestamp: "11:20 AM",
        likes: 8,
        dislikes: 0,
        userInteraction: null,
        verified: true
      }
    ],
    donors: [
      {
        id: "peer_d1",
        author: "Vikram Malhotra",
        bloodGroup: "AB-",
        role: "Donor",
        location: "Delhi",
        text: "❤️ Successfully donated 1 unit of blood today at Delhi Medical Center! It was my 15th time. Feel blessed and highly recommend everyone to donate!",
        timestamp: "09:30 AM",
        likes: 24,
        dislikes: 0,
        userInteraction: null,
        verified: true
      },
      {
        id: "peer_d2",
        author: "Pooja Hegde",
        bloodGroup: "B+",
        role: "Donor",
        location: "Bengaluru",
        text: "Registered my name on Blood AI donor list today! Ready to volunteer whenever someone needs B+ blood.",
        timestamp: "10:05 AM",
        likes: 18,
        dislikes: 0,
        userInteraction: null,
        verified: false
      }
    ],
    general: [
      {
        id: "peer_g1",
        author: "Dr. Anish Gupta",
        bloodGroup: "O+",
        role: "Moderator",
        location: "Noida AIIMS",
        text: "💡 Tip of the day: Ensure you are well hydrated and have a light meal before donating blood. Avoid strenuous exercises for 24 hours post-donation.",
        timestamp: "08:15 AM",
        likes: 31,
        dislikes: 1,
        userInteraction: null,
        verified: true
      },
      {
        id: "peer_g2",
        author: "Rohan Kumar",
        bloodGroup: "O-",
        role: "Volunteer",
        location: "Mumbai",
        text: "What is the minimum age to register as a donor? Is 17 allowed in India?",
        timestamp: "09:10 AM",
        likes: 4,
        dislikes: 0,
        userInteraction: null,
        verified: false
      }
    ]
  });

  const [onlineCounters, setOnlineCounters] = useState<Record<string, number>>({
    emergency: 142,
    donors: 89,
    general: 204
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Auto-scroll on active channel message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, channelMessages]);

  // Simulate active real-time community peer messages coming in!
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      // Pick a random channel
      const channels: Array<"emergency" | "donors" | "general"> = ["emergency", "donors", "general"];
      const randomChan = channels[Math.floor(Math.random() * channels.length)];

      // Peer pool templates
      const templates: Record<string, string[]> = {
        emergency: [
          "🚨 O+ blood urgently required in Max Hospital Delhi for a kidney patient! Units needed: 3. Please call +91 99887 76655.",
          "Emergency solved! Thank you everyone, Siddharth Malhotra volunteered and successfully donated O- blood just now! ❤️",
          "Need A- donor urgently in Fortis Bangalore, patient name Rohan Malhotra. Urgency is Critical! +91 76543 21098"
        ],
        donors: [
          "Scheduled a voluntary blood donation camp in Delhi Dwarka this Sunday! Join us to save lives! ❤️",
          "Just completed my 3-month cooling period, my blood group is B+ Delhi. Ready to donate again!",
          "Registered my family members as emergency standby donors. Great initiative by Blood AI! ✅"
        ],
        general: [
          "Is it true that O Negative is universal donor? My friend says AB+ is universal recipient.",
          "Blood AI chatbot works exceptionally fast! Grounding maps are accurate.",
          "Just had healthy pomegranate juice post donation. Doctor says it helps replenish iron levels!"
        ]
      };

      const authors = ["Aman Singh", "Shivani Roy", "Kartik Iyer", "Preeti Patil", "Harsh Vardhan", "Nisha Sethi"];
      const groups = ["O+", "O-", "A+", "B+", "AB-", "B-"];
      const roles: Array<"Donor" | "Seeker" | "Volunteer"> = ["Donor", "Seeker", "Volunteer"];
      const locations = ["Delhi", "Mumbai", "Bengaluru", "Noida", "Hyderabad", "Pune"];

      const chosenMsg = templates[randomChan][Math.floor(Math.random() * templates[randomChan].length)];
      const newMsg: PeerMessage = {
        id: "peer_sim_" + Date.now(),
        author: authors[Math.floor(Math.random() * authors.length)],
        bloodGroup: groups[Math.floor(Math.random() * groups.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        text: chosenMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        likes: Math.floor(Math.random() * 5),
        dislikes: 0,
        userInteraction: null,
        verified: Math.random() > 0.4
      };

      // Add to database
      setChannelMessages(prev => ({
        ...prev,
        [randomChan]: [...prev[randomChan], newMsg]
      }));

      // Update counters slightly to simulate fluctuations
      setOnlineCounters(prev => ({
        ...prev,
        [randomChan]: prev[randomChan] + (Math.random() > 0.5 ? 1 : -1)
      }));

    }, 15000); // Trigger message every 15 seconds

    return () => clearInterval(simulationInterval);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const myMsg: PeerMessage = {
      id: "my_peer_" + Date.now(),
      author: language === "hi" ? "आप (You)" : "You (Verified User)",
      bloodGroup: "O-", // Current logged user
      role: "Volunteer",
      location: "Sagar, MP",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      dislikes: 0,
      userInteraction: null,
      verified: true
    };

    setChannelMessages(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], myMsg]
    }));

    setInputText("");
  };

  const handleLikeMessage = (id: string) => {
    setChannelMessages(prev => {
      const updatedList = prev[activeChannel].map(msg => {
        if (msg.id === id) {
          const isLiked = msg.userInteraction === "like";
          return {
            ...msg,
            userInteraction: isLiked ? null : ("like" as const),
            likes: isLiked ? msg.likes - 1 : msg.likes + 1,
            dislikes: msg.userInteraction === "dislike" ? Math.max(0, msg.dislikes - 1) : msg.dislikes
          };
        }
        return msg;
      });
      return { ...prev, [activeChannel]: updatedList };
    });
  };

  const handleDislikeMessage = (id: string) => {
    setChannelMessages(prev => {
      const updatedList = prev[activeChannel].map(msg => {
        if (msg.id === id) {
          const isDisliked = msg.userInteraction === "dislike";
          return {
            ...msg,
            userInteraction: isDisliked ? null : ("dislike" as const),
            dislikes: isDisliked ? msg.dislikes - 1 : msg.dislikes + 1,
            likes: msg.userInteraction === "like" ? Math.max(0, msg.likes - 1) : msg.likes
          };
        }
        return msg;
      });
      return { ...prev, [activeChannel]: updatedList };
    });
  };

  const quickTemplates = [
    { text: "Emergency solved! Thank you everyone.", label: "Solved ✅" },
    { text: "My donor group is ready to support.", label: "Ready to Donate ❤️" },
    { text: "Please share patient contact number.", label: "Need Contact 📞" },
    { text: "O- donor urgently required Sagar Hospital.", label: "Sagar Emergency 🚨" }
  ];

  return (
    <div id="community_chat_root" className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950/40 backdrop-blur-md">
      
      {/* Top Header Selector & Channel Stats */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center border border-red-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-1">
              <span>Community Chat Hub</span>
              <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-mono font-bold animate-pulse">LIVE</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">Coordinate with active donors & volunteers in real-time</p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>{onlineCounters[activeChannel]} Active Online</span>
          </span>
          <span className="text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 font-bold">
            Total Logs: {donorsCount} Donors
          </span>
        </div>
      </div>

      {/* Grid containing Channel Sidebar & Chat Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Channels List - Hidden on mobile, flex on desktop */}
        <div className="hidden md:flex w-48 bg-slate-950/40 border-r border-slate-900/80 flex-col p-2.5 space-y-1">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider px-2 mb-2 block">CHANNELS / समूह</span>
          
          <button
            onClick={() => setActiveChannel("emergency")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-left ${
              activeChannel === "emergency"
                ? "bg-red-600/15 border border-red-500/30 text-red-500"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Emergency Alerts</span>
          </button>

          <button
            onClick={() => setActiveChannel("donors")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-left ${
              activeChannel === "donors"
                ? "bg-red-600/15 border border-red-500/30 text-red-500"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Verified Donors</span>
          </button>

          <button
            onClick={() => setActiveChannel("general")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 text-left ${
              activeChannel === "general"
                ? "bg-red-600/15 border border-red-500/30 text-red-500"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>General Support</span>
          </button>

          <div className="mt-auto p-2 bg-slate-900/50 rounded-xl border border-slate-850/60 text-[10px] text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 mb-1 animate-pulse" />
            <span className="font-bold block text-white text-[10px]">Secure Gateway</span>
            <span>All conversations are end-to-end medical verified.</span>
          </div>
        </div>

        {/* Messaging Box Panel */}
        <div className="flex-1 flex flex-col bg-slate-950/10">
          
          {/* Mobile-only horizontal channel switcher bar */}
          <div className="flex md:hidden bg-slate-950/80 border-b border-slate-900/80 p-2.5 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveChannel("emergency")}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChannel === "emergency"
                  ? "bg-red-600/15 text-red-500 border border-red-500/25 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 border border-slate-850 hover:text-slate-200"
              }`}
            >
              <span>🚨 Emergency Alerts</span>
            </button>
            <button
              onClick={() => setActiveChannel("donors")}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChannel === "donors"
                  ? "bg-red-600/15 text-red-500 border border-red-500/25 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 border border-slate-850 hover:text-slate-200"
              }`}
            >
              <span>❤️ Verified Donors</span>
            </button>
            <button
              onClick={() => setActiveChannel("general")}
              className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeChannel === "general"
                  ? "bg-red-600/15 text-red-500 border border-red-500/25 shadow-sm"
                  : "bg-slate-900/40 text-slate-400 border border-slate-850 hover:text-slate-200"
              }`}
            >
              <span>💬 General</span>
            </button>
          </div>
          
          {/* Scroll messages window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-900">
            {channelMessages[activeChannel].map((msg) => {
              const isMyPost = msg.author.includes("You") || msg.author.includes("आप");
              return (
                <div key={msg.id} className={`flex flex-col ${isMyPost ? "items-end" : "items-start"}`}>
                  
                  {/* Message Bubble Box */}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm border shadow-lg ${
                    isMyPost
                      ? "bg-red-600/15 border-red-500/30 text-white rounded-br-none"
                      : "bg-slate-900 border-slate-800/80 text-slate-200 rounded-bl-none"
                  }`}>
                    
                    {/* User Metadata Line */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-1.5 text-left">
                        <span className="font-black text-white text-[11px] truncate max-w-[100px]">{msg.author}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded font-black font-mono uppercase border ${
                          msg.role === "Moderator"
                            ? "bg-purple-600/10 text-purple-400 border-purple-500/20"
                            : msg.role === "Donor"
                              ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-600/10 text-red-400 border-red-500/20"
                        }`}>{msg.role}</span>
                        {msg.verified && (
                          <span className="text-emerald-400 text-[8px] font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> verified
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{msg.timestamp}</span>
                    </div>

                    {/* Actual Text Body */}
                    <p className="whitespace-pre-line text-slate-300 font-medium leading-relaxed text-left">{msg.text}</p>

                    {/* Meta Location Tag & Action Stats */}
                    <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                      <span className="font-sans uppercase text-[8px] tracking-wide text-slate-500 bg-slate-950 border border-slate-900 px-1.5 py-0.2 rounded">Zone: {msg.location}</span>
                      
                      {/* Likes/Dislikes Counters */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeMessage(msg.id)}
                          className={`flex items-center gap-0.5 hover:text-emerald-400 transition-colors cursor-pointer ${
                            msg.userInteraction === "like" ? "text-emerald-400" : ""
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{msg.likes}</span>
                        </button>
                        <button
                          onClick={() => handleDislikeMessage(msg.id)}
                          className={`flex items-center gap-0.5 hover:text-red-400 transition-colors cursor-pointer ${
                            msg.userInteraction === "dislike" ? "text-red-400" : ""
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>{msg.dislikes}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions template tags */}
          <div className="px-4 py-2 border-t border-slate-900/80 flex flex-wrap gap-1.5 text-[9px] bg-slate-950/20">
            {quickTemplates.map((item, index) => (
              <button
                key={index}
                onClick={() => setInputText(item.text)}
                className="bg-slate-900 hover:bg-slate-850 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition-all active:scale-95 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User message input submission bar */}
          <div className="p-3 border-t border-slate-900/80 bg-slate-950 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={language === "hi" ? "समूह में संदेश लिखें..." : "Type message in this channel..."}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500/40 rounded-xl text-xs px-3.5 py-2.5 outline-none text-white font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                inputText.trim()
                  ? "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/10"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
