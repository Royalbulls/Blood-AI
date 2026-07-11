import React, { useState } from "react";
import { 
  Heart, 
  Sparkles, 
  AlertCircle, 
  User, 
  Activity, 
  HelpCircle, 
  Clock, 
  X, 
  ShieldCheck, 
  Info,
  Layers,
  Send,
  PlusCircle,
  Shield,
  Sun,
  Moon,
  Mail,
  Copy,
  Phone,
  Globe,
  Award,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Instagram,
  Youtube,
  Twitter,
  FileText,
  MessageSquare,
  Lock,
  Terminal,
  BookOpen,
  MapPin,
  Flame,
  Users,
  Star,
  Check
} from "lucide-react";

interface AboutTrustCenterProps {
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export default function AboutTrustCenter({ isDarkMode, onShowToast }: AboutTrustCenterProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Support / Donation States
  const [donationStep, setDonationStep] = useState<"input" | "processing" | "awaiting" | "success">("input");
  const [customAmount, setCustomAmount] = useState<string>("500");

  const handleInitiateDonation = () => {
    setDonationStep("processing");
    setTimeout(() => {
      setDonationStep("awaiting");
    }, 1500);
  };

  const handleApproveDonation = () => {
    setDonationStep("success");
    onShowToast(`₹${customAmount} दान प्राप्त हुआ! धन्यवाद ❤️`);
  };
  
  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState<string>("Feedback");
  const [feedbackEmail, setFeedbackEmail] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) {
      onShowToast("कृपया अपना संदेश दर्ज करें!");
      return;
    }
    setFeedbackSuccess(true);
    onShowToast("आपका संदेश सफलतापूर्वक भेज दिया गया है!");
    setTimeout(() => {
      setFeedbackEmail("");
      setFeedbackMessage("");
      setFeedbackSuccess(false);
    }, 4000);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} कॉपी किया गया!`);
  };

  // 4 Premium Cards data
  const sections = [
    {
      id: "about-blood-ai",
      title: "About Blood AI",
      hindiTitle: "ब्लड एआई के बारे में",
      desc: "Vision, Mission, Core Values & Humanitarian Goals",
      icon: Heart,
      color: "text-red-500 bg-red-500/10",
      accent: "from-red-600 to-rose-700"
    },
    {
      id: "trust-center",
      title: "Trust Center",
      hindiTitle: "सुरक्षा एवं गोपनीयता",
      desc: "Privacy Policy, AI Usage, Disclaimers & Transparency",
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10",
      accent: "from-emerald-500 to-teal-600"
    },
    {
      id: "contact-support",
      title: "Contact & Support",
      hindiTitle: "सहायता केंद्र और संपर्क",
      desc: "FAQs, Support Desk, Report Issue & Feedback Portal",
      icon: HelpCircle,
      color: "text-sky-400 bg-sky-500/10",
      accent: "from-sky-500 to-blue-600"
    },
    {
      id: "legal-app",
      title: "Legal & Version",
      hindiTitle: "कानूनी सूचनाएं और संस्करण",
      desc: "Changelog, Licenses, Terms of Service & System Status",
      icon: FileText,
      color: "text-slate-400 bg-slate-500/10",
      accent: "from-slate-500 to-zinc-600"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title Divider */}
      <div className="border-t border-slate-800/10 pt-6">
        <span className={`text-[10px] uppercase font-bold tracking-widest block pb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Trust & Safety Portal
        </span>
        <h3 className={`text-base font-black uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
          <Shield className="w-5 h-5 text-red-500" />
          <span>सुरक्षा एवं गोपनीयता गाइड (Trust & Safety Guidelines)</span>
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-1">
          ब्लड एआई के विज़न, कानूनी सुरक्षा नियमों, गोपनीयता नीति और आपातकालीन सहायता प्रणाली के बारे में आधिकारिक जानकारी।
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div 
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={`border p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isDarkMode 
                  ? "bg-slate-900/30 border-slate-850/80 hover:bg-slate-900/50 hover:border-slate-800" 
                  : "bg-white border-slate-200 hover:shadow-lg hover:border-slate-300"
              }`}
            >
              {/* Top Accent line on hover */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sec.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${sec.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>

                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                    {sec.title}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{sec.hindiTitle}</span>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{sec.desc}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900/5 mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-red-500">
                <span>View Details</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED EXPANDED MODAL OVERLAY */}
      {selectedSection && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border flex flex-col my-8 max-h-[90vh] ${
              isDarkMode ? "bg-slate-950 border-slate-850 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? "bg-slate-900/60 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-red-600/10 text-red-500`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block font-mono">Blood AI Corporate Seal</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    {sections.find(s => s.id === selectedSection)?.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSection(null)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 font-sans text-xs leading-relaxed max-h-[calc(90vh-140px)]">
              
              {/* SECTION 1: ABOUT BLOOD AI */}
              {selectedSection === "about-blood-ai" && (
                <div className="space-y-6">
                  
                  {/* Hero Banner */}
                  <div className="bg-gradient-to-br from-red-950/40 to-slate-950 p-5 rounded-2xl border border-red-500/15 space-y-2 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                    <div className="flex items-center gap-2 text-red-500">
                      <Flame className="w-5 h-5 animate-pulse" />
                      <h4 className="text-sm font-black uppercase tracking-wider font-display">What is Blood AI?</h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Blood AI</strong> एक अत्याधुनिक जीवन-रक्षक डिजिटल नेटवर्क है, जो भारत के रक्तदाताओं और अस्पतालों/मरीजों के बीच की दूरी को शून्य करने के लिए कृत्रिम बुद्धिमत्ता (AI) का उपयोग करता है। यह कोई साधारण रक्त रजिस्ट्री नहीं है, बल्कि एक वास्तविक समय का आपातकालीन लाइफलाइन ईकोसिस्टम है।
                    </p>
                  </div>

                  {/* Why Created */}
                  <div className="space-y-1.5">
                    <h5 className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>इसे क्यों बनाया गया? (Why was it created?)</span>
                    </h5>
                    <p className="text-slate-400">
                      भारत में आज भी सोशल मीडिया या असत्यापित व्हाट्सएप ग्रुप्स पर रक्त के लिए आपातकालीन संदेश फैलाए जाते हैं, जिससे समय पर सही डोनर नहीं मिल पाता। कई बार रक्तदाताओं की पात्रता (eligibility) की सही जांच न होने के कारण अंतिम क्षणों में प्रयास विफल हो जाते हैं। Blood AI को इसी अफरा-तफरी और संकटपूर्ण स्थिति को सुव्यवस्थित तथा तकनीक-सक्षम बनाने के लिए बनाया गया है।
                    </p>
                  </div>

                  {/* Vision & Mission Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest block font-mono">Our Vision (विज़न)</span>
                      <p className="text-slate-300">
                        एक ऐसा भारत जहाँ किसी भी मरीज की जान सिर्फ इसलिए न जाए क्योंकि उसे समय पर आवश्यक ब्लड ग्रुप या प्लाज्मा प्राप्त नहीं हो सका। हम तकनीक को मानवता का रक्षक बनाना चाहते हैं।
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2">
                      <span className="text-[10px] text-sky-400 font-extrabold uppercase tracking-widest block font-mono">Our Mission (मिशन)</span>
                      <p className="text-slate-300">
                        देश के दूर-दराज के क्षेत्रों में भी प्रत्येक नागरिक को निःशुल्क, तीव्र और अत्यधिक सुरक्षित जीपीएस-आधारित लाइव डोनर नेटवर्क और डिजिटल मेडिकल प्रिस्क्रिप्शन वेरिफिकेशन टूल प्रदान करना।
                      </p>
                    </div>
                  </div>

                  {/* Core Values */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider">हमारे मूल सिद्धांत (Core Values)</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "Humanity First", hindi: "इंसानियत सर्वोपरि", desc: "जीवन बचाने से बड़ा कोई कर्तव्य नहीं।" },
                        { title: "100% Free", hindi: "पूर्णतः निःशुल्क", desc: "रक्तदान का व्यावसायीकरण पूर्णतः वर्जित है।" },
                        { title: "Absolute Security", hindi: "डेटा सुरक्षा", desc: "आपकी व्यक्तिगत जानकारी हमारे पास सुरक्षित है।" },
                        { title: "AI Transparency", hindi: "तकनीकी पारदर्शिता", desc: "सत्यापित प्रिस्क्रिप्शन और वास्तविक जानकारी।" }
                      ].map((val, i) => (
                        <div key={i} className="border border-slate-850 p-3 rounded-xl bg-slate-950/50 space-y-1">
                          <div className="flex items-center gap-1 text-red-500 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-[10px] uppercase font-mono">{val.title}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-slate-300 block">{val.hindi}</span>
                          <p className="text-[9px] text-slate-500 leading-normal">{val.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Humanitarian Goals */}
                  <div className="space-y-1.5 border-t border-slate-900 pt-4">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-red-500" />
                      <span>मानवतावादी लक्ष्य (Humanitarian Goals)</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>वर्ष 2028 तक भारत में 10 लाख से अधिक सक्रिय, सत्यापित डोनर्स का नेटवर्क तैयार करना।</li>
                      <li>ग्रामीण और अर्ध-शहरी (Tier-3) क्षेत्रों में ब्लड बैंकिंग और डोनर रीयल-टाइम सूचना अंतराल को समाप्त करना।</li>
                      <li>स्थानीय संगठनों और सामाजिक संस्थाओं को इस निःशुल्क प्लेटफार्म से जोड़ना।</li>
                    </ul>
                  </div>

                </div>
              )}

              {/* SECTION 4: TRUST CENTER */}
              {selectedSection === "trust-center" && (
                <div className="space-y-6">
                  
                  {/* Trust Banner */}
                  <div className="bg-emerald-950/20 border border-emerald-500/25 p-4 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide">Privacy & Encryption Guarantee</h4>
                      <p className="text-[11px] text-slate-300">हम आपके विश्वास की रक्षा करते हैं। रक्तदाता का व्यक्तिगत डेटा पूर्णतः सुरक्षित और एन्क्रिप्टेड है।</p>
                    </div>
                  </div>

                  {/* Detailed Policies Grid */}
                  <div className="space-y-4">
                    
                    <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-200 uppercase tracking-wider">1. Privacy Policy (गोपनीयता नीति)</h5>
                      <p className="text-slate-400">
                        हम कभी भी रक्तदाताओं या मरीजों का व्यक्तिगत डेटा तीसरे पक्षों को नहीं बेचते और न ही इसका व्यावसायिक उपयोग करते हैं। केवल आपातकाल के समय, मरीज की सत्यापन स्थिति के बाद ही रक्तदाता की सहमति से संपर्क साधा जा सकता है।
                      </p>
                    </div>

                    <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-200 uppercase tracking-wider">2. Medical Disclaimer (चिकित्सा अस्वीकरण)</h5>
                      <p className="text-slate-400">
                        रक्तदान मंच एक डिजिटल मिलन केंद्र है। हम कोई भी चिकित्सा परीक्षण, चिकित्सीय सलाह या डोनर की वर्तमान शारीरिक स्थिति के चिकित्सा प्रमाण की वारंटी नहीं देते। उपयोगकर्ताओं से अनुरोध है कि रक्त के आदान-प्रदान से पूर्व चिकित्सकीय दिशा-निर्देशों का पूरी तरह से पालन करें और डोनर के स्वास्थ्य की स्वयं पुष्टि करें।
                      </p>
                    </div>

                    <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-200 uppercase tracking-wider">3. AI Usage & Data Protection</h5>
                      <p className="text-slate-400">
                        हमारी एआई प्रणालियाँ केवल आपके द्वारा अपलोड किए गए मेडिकल नुस्खों (Prescriptions) को पार्स करने, रक्त समूह सत्यापित करने और लाइव जीपीएस कोऑर्डिनेट्स की दूरी मापने के लिए काम करती हैं। डेटाबेस को बैंक-ग्रेड एईएस-256 (AES-256) सुरक्षा एल्गोरिदम का उपयोग करके संग्रहीत किया जाता है।
                      </p>
                    </div>

                    <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-200 uppercase tracking-wider">4. Community Guidelines (सामुदायिक नियम)</h5>
                      <p className="text-slate-400">
                        किसी भी प्रकार का वित्तीय लेनदेन या व्यावसायिक प्रस्ताव इस मंच पर प्रतिबंधित है। यह पूर्णतः स्वैच्छिक और निःशुल्क सेवा है। दुर्व्यवहार, गलत प्रिस्क्रिप्शन अपलोड करने या स्पैम फैलाने वाले नंबरों को बिना किसी पूर्व सूचना के स्थायी रूप से ब्लैकलिस्ट कर दिया जाएगा।
                      </p>
                    </div>

                    <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl space-y-1.5">
                      <h5 className="font-bold text-slate-200 uppercase tracking-wider">5. Transparency Report & Audits</h5>
                      <p className="text-slate-400">
                        Blood AI प्रतिवर्ष सार्वजनिक पारदर्शिता ऑडिट रिपोर्ट प्रकाशित करता है। हमारा कोडबेस और आर्किटेक्चर सुरक्षा दिशानिर्देशों के अनुरूप है, जो यह सुनिश्चित करता है कि हमारे सर्वर से कोई डेटा लीक न हो।
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* SECTION 5: CONTACT & SUPPORT */}
              {selectedSection === "contact-support" && (
                <div className="space-y-6">
                  
                  {/* FAQ Accordion */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-sky-400" />
                      <span>बार-बार पूछे जाने वाले प्रश्न (FAQ)</span>
                    </h5>
                    
                    <div className="divide-y divide-slate-900 border border-slate-850 rounded-xl overflow-hidden bg-slate-900/20">
                      {[
                        { q: "क्या Blood AI के उपयोग के लिए कोई शुल्क है?", a: "नहीं, यह सेवा 100% निःशुल्क है और हमेशा निःशुल्क रहेगी। रक्तदान का बेचना या खरीदना कानूनी तौर पर अपराध है।" },
                        { q: "क्या मेरा नंबर सभी को दिखाई देता है?", a: "नहीं, रक्तदाताओं का फोन नंबर केवल आपातकालीन स्थिति में मरीज द्वारा सत्यापित प्रिस्क्रिप्शन के बाद ही देखा जा सकता है, अन्यथा सुरक्षा कोड द्वारा सुरक्षित रहता है।" },
                        { q: "प्रिस्क्रिप्शन वेरिफिकेशन कैसे काम करता है?", a: "जब आप प्रिस्क्रिप्शन अपलोड करते हैं, हमारा एआई पार्सर डॉक्टर के पर्चे से मरीज का नाम, अस्पताल और रक्त समूह का वास्तविक समय में सत्यापन करता है ताकि फर्जी अपीलों को रोका जा सके।" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-3.5 space-y-1">
                          <strong className="text-slate-200 font-bold block">Q: {item.q}</strong>
                          <p className="text-slate-400">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback, Problem Report & Feature Request Form */}
                  <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-red-400" />
                      <span>फीडबैक, समस्या रिपोर्ट या फीचर अनुरोध</span>
                    </h5>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Type (प्रकार)</label>
                          <select 
                            value={feedbackType} 
                            onChange={(e) => setFeedbackType(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="Feedback">Feedback (फीडबैक)</option>
                            <option value="Problem">Report Problem (समस्या रिपोर्ट)</option>
                            <option value="Feature">Feature Request (फीचर अनुरोध)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Your Email (आपका ईमेल)</label>
                          <input 
                            type="email" 
                            required
                            placeholder="yourname@gmail.com"
                            value={feedbackEmail}
                            onChange={(e) => setFeedbackEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Message (संदेश)</label>
                        <textarea 
                          rows={3}
                          required
                          placeholder="अपनी राय या समस्या यहाँ लिखें..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>सुरक्षित रूप से भेजें (Submit Message)</span>
                      </button>

                      {feedbackSuccess && (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg text-center text-[10px] font-bold">
                          ✓ आपका अनुरोध पंजीकृत कर लिया गया है। धन्यवाद!
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Supporting Blood AI / Donation details info */}
                  <div className="border border-slate-900 bg-slate-900/30 p-5 rounded-2xl space-y-4">
                    <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest block font-mono">Support Blood AI (योगदान और सहायता)</span>
                    <p className="text-slate-400 text-[11px]">
                      Blood AI एक गैर-लाभकारी सामाजिक पहल है। इस पूर्णतः निःशुल्क और विज्ञापन-मुक्त एआई सर्वर को चालू रखने और ग्रामीण क्षेत्रों में सेवाएं पहुँचाने में आप सीधे सहयोग कर सकते हैं।
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-left">
                      {/* LEFT PANEL: INTERACTIVE SIMULATOR (7 Columns) */}
                      <div className="md:col-span-7 bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-4 text-slate-100">
                        {donationStep === "input" && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">योगदान राशि चुनें (Select Amount)</label>
                              <div className="grid grid-cols-5 gap-1.5 font-sans">
                                {[100, 250, 500, 1000, 2000].map((amt) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => {
                                      setCustomAmount(amt.toString());
                                      onShowToast(`राशि चुनी गई: ₹${amt}`);
                                    }}
                                    className={`py-1.5 px-0.5 rounded-lg text-xs font-bold font-mono transition-all border active:scale-95 cursor-pointer ${
                                      customAmount === amt.toString()
                                        ? "bg-red-600/20 border-red-500 text-red-400"
                                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300"
                                    }`}
                                  >
                                    ₹{amt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">या कस्टम राशि दर्ज करें (Or Enter Custom Amount)</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-xs">₹</span>
                                <input
                                  type="text"
                                  pattern="[0-9]*"
                                  placeholder="इच्छानुसार राशि लिखें..."
                                  value={customAmount}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, "");
                                    setCustomAmount(val);
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleInitiateDonation}
                              disabled={!customAmount || parseInt(customAmount) <= 0}
                              className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-[11px] font-extrabold tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>Proceed to Support ₹{customAmount || "0"}</span>
                            </button>
                          </div>
                        )}

                        {donationStep === "processing" && (
                          <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full border-2 border-red-500/10 border-t-2 border-t-red-500 animate-spin"></div>
                              <Heart className="w-4 h-4 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div>
                              <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">सुरक्षित गेटवे से जुड़ रहे हैं...</h5>
                              <p className="text-[9px] text-slate-500 mt-0.5">Connecting to secure UPI interface. Please wait.</p>
                            </div>
                          </div>
                        )}

                        {donationStep === "awaiting" && (
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                            </div>
                            <div className="space-y-1">
                              <h5 className="text-[11px] font-bold text-white uppercase tracking-wider">पेमेंट स्वीकृति का इंतजार है...</h5>
                              <p className="text-[9px] text-slate-400 leading-relaxed">
                                We have sent a collect request of <strong className="text-red-400 font-mono">₹{customAmount}</strong> to your UPI app. Open GPay, PhonePe, or Paytm to authorize.
                              </p>
                            </div>

                            <div className="pt-1 flex flex-col sm:flex-row gap-1.5 max-w-xs mx-auto">
                              <button
                                type="button"
                                onClick={handleApproveDonation}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold transition-all active:scale-95 cursor-pointer uppercase"
                              >
                                ✓ Approve (Simulate)
                              </button>
                              <button
                                type="button"
                                onClick={() => setDonationStep("input")}
                                className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg text-[9px] font-bold transition-all active:scale-95 cursor-pointer uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {donationStep === "success" && (
                          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/20 space-y-4 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-bounce">
                              <Check className="w-6 h-6" />
                            </div>

                            <div className="space-y-1">
                              <h5 className="text-xs font-black text-emerald-400 uppercase tracking-widest">योगदान प्राप्त हुआ!</h5>
                              <p className="text-[10px] text-slate-200 font-sans">
                                Amount Contributed: <strong className="text-white text-xs font-mono">₹{customAmount}</strong>
                              </p>
                            </div>

                            <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 text-left relative overflow-hidden">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[7px] bg-red-600/15 border border-red-500/25 text-red-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Official Contributor Pass</span>
                                  <h6 className="text-[10px] font-extrabold text-white uppercase mt-1">
                                    {localStorage.getItem("blood_ai_profile_name") || "Verified Donor"}
                                  </h6>
                                  <p className="text-[7px] text-slate-500 font-mono">Contributor ID: BAI-CONT-{Math.floor(100000 + Math.random() * 900000)}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[7px] text-slate-500 block">Date</span>
                                  <p className="text-[9px] font-mono font-bold text-slate-300">{new Date().toLocaleDateString()}</p>
                                  <p className="text-[9px] font-mono font-extrabold text-red-400 mt-0.5">₹{customAmount}</p>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setDonationStep("input")}
                              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer uppercase font-sans"
                            >
                              Donate Again
                            </button>
                          </div>
                        )}
                      </div>

                      {/* RIGHT PANEL: SECURE COPY DETAILS (5 Columns) */}
                      <div className="md:col-span-5 bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-900 pb-1">
                          Official Corporate Account
                        </span>

                        <div className="space-y-1">
                          <span className="text-[8px] font-bold text-slate-500 uppercase block">Official Corporate UPI ID</span>
                          <div className="flex bg-slate-950 border border-slate-850 rounded-lg p-0.5 items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-200 pl-2 truncate max-w-[110px]">7869690819@okbizaxis</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("7869690819@okbizaxis");
                                onShowToast("UPI ID copied!");
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-bold rounded transition-all active:scale-95 cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-850 p-2.5 rounded-lg space-y-1.5 text-[10px] text-slate-300 font-mono">
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">Bank:</span>
                            <strong className="text-white">HDFC Bank Ltd.</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">Account:</span>
                            <strong className="text-white">50200058334856</strong>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-0.5">
                            <span className="text-slate-500">IFSC:</span>
                            <strong className="text-white">HDFC0000449</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Type:</span>
                            <strong className="text-teal-400 font-bold uppercase">Current Account</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* News & Partners */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                    <div className="space-y-1">
                      <strong className="text-slate-200 block text-[10px] uppercase">News & Updates</strong>
                      <p className="text-slate-500 text-[10px] leading-relaxed">
                        • "Blood AI" का नया v2.4.0 अपडेट लाइव है।<br/>
                        • कृष्णा विश्वकर्मा ने डोनर गोपनीयता में सुधार की घोषणा की।
                      </p>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-slate-200 block text-[10px] uppercase">Our Partners</strong>
                      <p className="text-slate-500 text-[10px] leading-relaxed">
                        • Red Cross India (Volunteer Network)<br/>
                        • Tigers Socio Consulting Ltd.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 6: LEGAL & APP META */}
              {selectedSection === "legal-app" && (
                <div className="space-y-6">
                  
                  {/* System Health Indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 space-y-1 text-center">
                      <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">System Status</span>
                      <span className="text-emerald-400 font-extrabold text-xs block flex items-center justify-center gap-1 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Operational</span>
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 space-y-1 text-center">
                      <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">Active Database</span>
                      <span className="text-sky-400 font-extrabold text-xs block">Firebase Real-time</span>
                    </div>
                  </div>

                  {/* App Version Grid */}
                  <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-[10px]">
                    <div className="bg-slate-900 p-3 text-slate-300 font-sans font-bold border-b border-slate-850">
                      सिस्टम विनिर्देश (App Metadata)
                    </div>
                    <div className="divide-y divide-slate-900 p-1 bg-slate-950/50">
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Current Version</span>
                        <span className="text-slate-300">v2.4.0 Stable</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Build Number</span>
                        <span className="text-slate-300">b8294-prod</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Release Date</span>
                        <span className="text-slate-300">July 11, 2026</span>
                      </div>
                      <div className="flex justify-between p-2">
                        <span className="text-slate-500">Author & Licenses</span>
                        <span className="text-slate-300">MIT License</span>
                      </div>
                    </div>
                  </div>

                  {/* Changelog */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-200 uppercase tracking-wider">Changelog (अपडेट का इतिहास)</h5>
                    <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                      <div className="space-y-1">
                        <strong className="text-red-400 text-[11px] block">v2.4.0 (Latest Release) — July 2026</strong>
                        <ul className="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
                          <li>सेटिंग्स पेज पर "About & Trust Center" जोड़ा गया।</li>
                          <li>संस्थापक कृष्णा विश्वकर्मा और सोशल लिंक्स का एकीकरण।</li>
                          <li>UPI और बैंक खाता विवरण में "Current Account" लेबल किया गया।</li>
                        </ul>
                      </div>

                      <div className="space-y-1 border-t border-slate-900 pt-2 mt-2">
                        <strong className="text-slate-400 text-[11px] block">v2.3.0 — June 2026</strong>
                        <ul className="list-disc list-inside text-slate-400 text-[10px] space-y-0.5">
                          <li>सुरक्षित प्रमाणीकरण के लिए Firebase Real-time Auth जोड़ा गया।</li>
                          <li>जीपीएस रडार लोकेटर को और तेज बनाया गया।</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Copyright and Trademark Details */}
                  <div className="text-center text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-900">
                    <p>© 2026 Royal Bulls Advisory Private Limited. All rights reserved.</p>
                    <p>
                      All content, logo designs, and AI software configurations are registered trademarks of Royal Bulls Advisory under Intellectual Property Rights of India.
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex justify-end gap-2 ${isDarkMode ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-200"}`}>
              <button 
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all border border-slate-800"
              >
                Close (बंद करें)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
