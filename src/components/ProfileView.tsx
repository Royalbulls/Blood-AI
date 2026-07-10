import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  Database, 
  Wifi, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Terminal, 
  Clock, 
  MapPin, 
  Share2, 
  Download, 
  Camera, 
  Lock, 
  Eye, 
  Edit3, 
  Save, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  User, 
  Phone, 
  Plus, 
  Globe, 
  Check,
  Copy,
  Activity,
  Heart,
  Info,
  AlertCircle
} from "lucide-react";

interface ProfileViewProps {
  donorsCount: number;
  requestsCount: number;
  banksCount: number;
  onResetDb: () => void;
  onShowToast?: (msg: string) => void;
}

export default function ProfileView({
  donorsCount,
  requestsCount,
  banksCount,
  onResetDb,
  onShowToast
}: ProfileViewProps) {
  // Tabs: 'profile' (Card Builder) | 'admin' (Diagnostics) | 'donate' (Voluntary Donation)
  const [activeTab, setActiveTab] = useState<"profile" | "admin" | "donate">("profile");

  // Support / Donation States
  const [donationStep, setDonationStep] = useState<"input" | "processing" | "awaiting" | "success">("input");
  const [customAmount, setCustomAmount] = useState<string>("500");

  // Profile States
  const [profileName, setProfileName] = useState("Siddharth Sharma");
  const [bloodGroup, setBloodGroup] = useState("O-");
  const [location, setLocation] = useState("Sagar, Madhya Pradesh");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("Dedicated blood donor and community volunteer since 2024. Always ready to support in critical emergencies.");
  const [isAvailable, setIsAvailable] = useState(true);

  // Social Links
  const [instagram, setInstagram] = useState("https://instagram.com/siddharth");
  const [twitter, setTwitter] = useState("https://twitter.com/siddharth");
  const [facebook, setFacebook] = useState("https://facebook.com/siddharth");
  const [linkedin, setLinkedin] = useState("https://linkedin.com/in/siddharth");

  // Custom Image & Avatar Settings
  const [profilePhoto, setProfilePhoto] = useState<string>(""); // Base64 image
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0); // 0, 1, 2, 3
  const [cardTheme, setCardTheme] = useState<"crimson" | "sapphire" | "emerald" | "amber">("crimson");
  const [isPublic, setIsPublic] = useState(true);

  const [profileTags, setProfileTags] = useState<string[]>(["रक्त दाता (Blood Donor)"]);
  const [profileServices, setProfileServices] = useState<string[]>(["Blood Search", "Donor Search", "Emergency Requests", "Live Map", "Live Peer Chat"]);

  // System States
  const [isOffline, setIsOffline] = useState(false);
  const [cachedItemsCount, setCachedItemsCount] = useState(48);
  const [backupLogs, setBackupLogs] = useState<string[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);

  // Donor Diagnostics HUD States
  const [diagAge, setDiagAge] = useState<number>(28);
  const [diagWeight, setDiagWeight] = useState<number>(68);
  const [diagHemoglobin, setDiagHemoglobin] = useState<number>(13.5);
  const [diagLastDonation, setDiagLastDonation] = useState<string>("over_3_months");
  const [diagSleep, setDiagSleep] = useState<number>(7);
  const [diagSystolic, setDiagSystolic] = useState<number>(120);
  const [diagDiastolic, setDiagDiastolic] = useState<number>(80);
  
  interface DiagReport {
    score: number;
    eligible: boolean;
    warnings: string[];
    recommendations: string[];
  }
  const [diagReport, setDiagReport] = useState<DiagReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Default Medical Avatars (drawn in canvas if no custom uploaded photo is selected)
  const avatarColors = [
    { bg: "#ef4444", text: "#ffffff", name: "Red Cross Shield" },
    { bg: "#3b82f6", text: "#ffffff", name: "Sapphire Pulse" },
    { bg: "#10b981", text: "#ffffff", name: "Emerald Lifesaver" },
    { bg: "#f59e0b", text: "#ffffff", name: "Golden Guardian" }
  ];

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("blood_ai_profile_name");
    const savedBlood = localStorage.getItem("blood_ai_profile_blood");
    const savedLoc = localStorage.getItem("blood_ai_profile_location");
    const savedPhone = localStorage.getItem("blood_ai_profile_phone");
    const savedBio = localStorage.getItem("blood_ai_profile_bio");
    const savedInsta = localStorage.getItem("blood_ai_profile_insta");
    const savedTwit = localStorage.getItem("blood_ai_profile_twit");
    const savedFb = localStorage.getItem("blood_ai_profile_fb");
    const savedLnkd = localStorage.getItem("blood_ai_profile_lnkd");
    const savedPhoto = localStorage.getItem("blood_ai_profile_photo");
    const savedAvt = localStorage.getItem("blood_ai_profile_avatar");
    const savedPublic = localStorage.getItem("blood_ai_profile_public");
    const savedTheme = localStorage.getItem("blood_ai_profile_theme");
    const savedAvailable = localStorage.getItem("blood_ai_profile_available");
    const savedTags = localStorage.getItem("blood_ai_registered_tags");
    const savedServices = localStorage.getItem("blood_ai_favorite_services");

    if (savedName) setProfileName(savedName);
    if (savedBlood) setBloodGroup(savedBlood);
    if (savedLoc) setLocation(savedLoc);
    if (savedPhone) setPhone(savedPhone);
    if (savedBio) setBio(savedBio);
    if (savedInsta) setInstagram(savedInsta);
    if (savedTwit) setTwitter(savedTwit);
    if (savedFb) setFacebook(savedFb);
    if (savedLnkd) setLinkedin(savedLnkd);
    if (savedPhoto) setProfilePhoto(savedPhoto);
    if (savedAvt) setSelectedAvatar(parseInt(savedAvt));
    if (savedPublic) setIsPublic(savedPublic === "true");
    if (savedTheme) setCardTheme(savedTheme as any);
    if (savedAvailable) setIsAvailable(savedAvailable === "true");
    
    if (savedTags) {
      try {
        setProfileTags(JSON.parse(savedTags));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedServices) {
      try {
        setProfileServices(JSON.parse(savedServices));
      } catch (e) {
        console.error(e);
      }
    }

    // Listen to online status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial system logs
    setSystemLogs([
      `[${new Date().toLocaleTimeString()}] INF - System Initialized on port 3000`,
      `[${new Date().toLocaleTimeString()}] INF - LocalStorage cache validated (48 items)`,
      `[${new Date().toLocaleTimeString()}] INF - Connected to Gemini API Gateway v1`,
      `[${new Date().toLocaleTimeString()}] INF - Background Auto Backup scheduled successfully`
    ]);

    setBackupLogs([
      `Last Backup: Today, ${new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (Auto)`
    ]);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Support / Donation Handlers
  const handleInitiateDonation = () => {
    setDonationStep("processing");
    addLog(`INF - Donation of ₹${customAmount} initiated via secure gateway.`);
    setTimeout(() => {
      setDonationStep("awaiting");
    }, 1500);
  };

  const handleApproveDonation = () => {
    setDonationStep("success");
    addLog(`SUCCESS - Voluntary donation of ₹${customAmount} received. Thank you!`);
    if (onShowToast) {
      onShowToast(`₹${customAmount} दान प्राप्त हुआ! धन्यवाद ❤️`);
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText("donate@bloodai");
    if (onShowToast) {
      onShowToast("Donation UPI ID copied to clipboard!");
    } else {
      alert("📋 UPI ID कॉपी कर ली गई है: donate@bloodai");
    }
    addLog("INF - Donation UPI ID copied to clipboard.");
  };

  // Persistent Save
  const handleSaveProfile = () => {
    localStorage.setItem("blood_ai_profile_name", profileName);
    localStorage.setItem("blood_ai_profile_blood", bloodGroup);
    localStorage.setItem("blood_ai_profile_location", location);
    localStorage.setItem("blood_ai_profile_phone", phone);
    localStorage.setItem("blood_ai_profile_bio", bio);
    localStorage.setItem("blood_ai_profile_insta", instagram);
    localStorage.setItem("blood_ai_profile_twit", twitter);
    localStorage.setItem("blood_ai_profile_fb", facebook);
    localStorage.setItem("blood_ai_profile_lnkd", linkedin);
    localStorage.setItem("blood_ai_profile_photo", profilePhoto);
    localStorage.setItem("blood_ai_profile_avatar", selectedAvatar.toString());
    localStorage.setItem("blood_ai_profile_public", isPublic.toString());
    localStorage.setItem("blood_ai_profile_theme", cardTheme);
    localStorage.setItem("blood_ai_profile_available", isAvailable.toString());
    localStorage.setItem("blood_ai_registered_tags", JSON.stringify(profileTags));
    localStorage.setItem("blood_ai_favorite_services", JSON.stringify(profileServices));

    addLog(`SUCCESS - User Profile saved. Public visibility: ${isPublic}`);
    alert("💾 आपकी प्रोफ़ाइल और डिजिटल डोनर कार्ड विवरण सफलतापूर्वक सहेज लिए गए हैं!");
  };

  // Image Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("❌ कृपया 1.5 MB से छोटा फ़ोटो चुनें।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      setProfilePhoto(base64);
      addLog("INF - New custom profile photo uploaded.");
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setProfilePhoto("");
    addLog("INF - Custom profile photo removed, defaulted to selected medical avatar.");
  };

  // WhatsApp Share Function
  const shareOnWhatsApp = () => {
    const statusText = isAvailable ? "✅ AVAILABLE (रक्तदान के लिए तैयार)" : "⏳ BUSY (अभी असमर्थ)";
    const visibilityText = isPublic ? "🌐 Publicly discoverable" : "🔒 Private Card";
    
    const message = `🚨 *रक्तदाता डिजिटल कार्ड - Blood AI Verified Donor Card* 🚨\n\n` +
      `👤 *नाम (Name)*: ${profileName}\n` +
      `🩸 *ब्लड ग्रुप (Blood Group)*: ${bloodGroup}\n` +
      `📍 *स्थान (Location)*: ${location}\n` +
      `📞 *संपर्क (Contact)*: ${phone}\n` +
      `ℹ️ *स्टेटस (Status)*: ${statusText}\n` +
      `📝 *मेरे बारे में (Bio)*: ${bio}\n\n` +
      `🌐 *सोशल लिंक्स (Social Links)*:\n` +
      (instagram ? `• Instagram: ${instagram}\n` : "") +
      (twitter ? `• Twitter/X: ${twitter}\n` : "") +
      (linkedin ? `• LinkedIn: ${linkedin}\n` : "") +
      `\nइस संदेश को साझा करें ताकि आपातकाल में लोगों को आसानी से रक्त मिल सके! ${visibilityText} - Powered by Blood AI`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    addLog("INF - Profile card shared on WhatsApp.");
  };

  // Canvas Card Renderer and Downloader
  const generateAndDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Card dimensions: 600 x 380 (standard dynamic pass)
    canvas.width = 600;
    canvas.height = 380;

    // Theme Gradients
    let grad = ctx.createLinearGradient(0, 0, 600, 380);
    let borderAccent = "#ef4444";
    if (cardTheme === "crimson") {
      grad.addColorStop(0, "#1c0606");
      grad.addColorStop(0.5, "#3d0a0a");
      grad.addColorStop(1, "#120202");
      borderAccent = "#f87171";
    } else if (cardTheme === "sapphire") {
      grad.addColorStop(0, "#06132b");
      grad.addColorStop(0.5, "#0b2c5c");
      grad.addColorStop(1, "#020712");
      borderAccent = "#60a5fa";
    } else if (cardTheme === "emerald") {
      grad.addColorStop(0, "#041f14");
      grad.addColorStop(0.5, "#0a3d29");
      grad.addColorStop(1, "#010d08");
      borderAccent = "#34d399";
    } else { // amber
      grad.addColorStop(0, "#241804");
      grad.addColorStop(0.5, "#4d360a");
      grad.addColorStop(1, "#0f0901");
      borderAccent = "#fbbf24";
    }

    // Fill Background
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 380);

    // Draw Modern Grid/HUD lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 600; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 380);
      ctx.stroke();
    }
    for (let i = 0; i < 380; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(600, i);
      ctx.stroke();
    }

    // Elegant Glowing Border Frame
    ctx.strokeStyle = borderAccent;
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 588, 368);

    // Subtle Watermark Droplet
    ctx.font = "120px sans-serif";
    ctx.fillStyle = "rgba(239, 68, 68, 0.05)";
    ctx.fillText("🩸", 460, 320);

    // Top Header Text
    ctx.font = "bold 11px 'Space Grotesk', monospace, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("BLOOD AI SECURE VOLUNTEER NETWORK", 40, 35);

    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = borderAccent;
    ctx.fillText("STATUS: VERIFIED DONOR", 40, 50);

    // Blood Group display box (top right)
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.strokeStyle = borderAccent;
    ctx.lineWidth = 2;
    // rounded rectangular background for Blood Group
    ctx.beginPath();
    ctx.roundRect(460, 35, 100, 100, 15);
    ctx.fill();
    ctx.stroke();

    // Large Blood Group symbol
    ctx.font = "900 48px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(bloodGroup, 510, 105);
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("BLOOD GROUP", 510, 122);
    ctx.textAlign = "left"; // restore

    // Draw Profile Image/Avatar
    const drawDetailsAndDownload = () => {
      // Draw User details
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText(profileName, 175, 100);

      // Verified checkmark badge next to name
      ctx.fillStyle = borderAccent;
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("✓ ACTIVE VOLUNTEER", 175, 120);

      // Location, Phone, Availability Info
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(`📍 स्थान: ${location}`, 175, 145);
      ctx.fillText(`📞 संपर्क: ${phone}`, 175, 165);
      ctx.fillText(`⚡ उपलब्धता: ${isAvailable ? "तुरंत उपलब्ध (Ready)" : "व्यस्त (Busy)"}`, 175, 185);

      // Separator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 215);
      ctx.lineTo(560, 215);
      ctx.stroke();

      // Biography / Description
      ctx.font = "italic 11px sans-serif";
      ctx.fillStyle = "#94a3b8";
      // Wrap text helper for description
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(" ");
        let line = "";
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + " ";
          let metrics = ctx.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
      };
      wrapText(bio, 40, 238, 520, 16);

      // Bottom Footer Bar
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(6, 335, 588, 39);

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(`🔒 Card ID: BAI-${Math.abs(profileName.hashCode()) || "99281"}`, 25, 360);
      ctx.fillText(`Visibility: ${isPublic ? "PUBLIC DIRECTORY" : "PRIVATE STATE"}`, 230, 360);
      ctx.fillText("bloodai.in", 515, 360);

      // Trigger actual PNG download
      const imgURL = canvas.toDataURL("image/png");
      const dlLink = document.createElement("a");
      dlLink.download = `blood_ai_card_${profileName.replace(/\s+/g, "_")}.png`;
      dlLink.href = imgURL;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
      addLog("SUCCESS - Profile Card exported successfully as PNG.");
    };

    // Helper to generate hash code
    if (!(String.prototype as any).hashCode) {
      (String.prototype as any).hashCode = function() {
        let hash = 0;
        if (this.length === 0) return hash;
        for (let i = 0; i < this.length; i++) {
          let chr = this.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0;
        }
        return Math.abs(hash);
      };
    }

    if (profilePhoto) {
      // Draw uploaded custom profile picture
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(105, 125, 55, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 50, 70, 110, 110);
        ctx.restore();

        // draw border around avatar circle
        ctx.strokeStyle = borderAccent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(105, 125, 55, 0, Math.PI * 2, true);
        ctx.stroke();

        drawDetailsAndDownload();
      };
      img.src = profilePhoto;
    } else {
      // Draw pre-seeded beautiful emergency medical avatar icon representation
      const avtBg = avatarColors[selectedAvatar].bg;
      ctx.save();
      ctx.beginPath();
      ctx.arc(105, 125, 55, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = avtBg;
      ctx.fillRect(50, 70, 110, 110);
      ctx.restore();

      // Outer circle border
      ctx.strokeStyle = borderAccent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(105, 125, 55, 0, Math.PI * 2, true);
      ctx.stroke();

      // Draw stylized text/logo inside avatar
      ctx.font = "bold 34px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("🩸", 105, 137);
      ctx.textAlign = "left"; // reset

      drawDetailsAndDownload();
    }
  };

  // Run donor diagnostics assessment
  const handleRunDiagnostics = () => {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Age validation
    if (diagAge < 18) {
      warnings.push("न्यूनतम आयु सीमा: रक्तदान के लिए न्यूनतम आयु 18 वर्ष है। (Underage: Min 18 years required)");
      score -= 25;
    } else if (diagAge > 65) {
      warnings.push("अधिकतम आयु सीमा: रक्तदान के लिए अधिकतम आयु 65 वर्ष है। (Overage: Max 65 years allowed)");
      score -= 20;
    }

    // Weight validation
    if (diagWeight < 45) {
      warnings.push("कम वजन: रक्तदान के लिए न्यूनतम वजन 45 किलोग्राम होना चाहिए। (Underweight: Min 45 kg required)");
      score -= 25;
    } else if (diagWeight < 50) {
      recommendations.push("हल्का वजन: आपका वजन सीमा पर है (45-50 kg), कृपया पर्याप्त आराम और भोजन के बाद ही रक्तदान करें।");
      score -= 5;
    }

    // Hemoglobin validation
    if (diagHemoglobin < 12.5) {
      warnings.push("निम्न हीमोग्लोबिन: सुरक्षित रक्तदान के लिए हीमोग्लोबिन स्तर न्यूनतम 12.5 g/dl होना चाहिए। (Low Hb: Min 12.5 g/dl required)");
      score -= 30;
    } else if (diagHemoglobin > 18) {
      warnings.push("अत्यधिक हीमोग्लोबिन स्तर: कृपया चिकित्सक से परामर्श लें। (Abnormally high Hb)");
      score -= 15;
    }

    // Last donation interval validation
    if (diagLastDonation === "less_than_3_months") {
      warnings.push("समय अंतराल अपर्याप्त: अंतिम रक्तदान से कम से कम 90 दिन (3 महीने) का अंतर आवश्यक है। (Min 3 months gap required)");
      score -= 30;
    }

    // Sleep hours validation
    if (diagSleep < 6) {
      warnings.push("अपर्याप्त नींद: रक्तदान से पहले कम से कम 6 घंटे की स्वस्थ नींद आवश्यक है। (Insufficient Sleep: Min 6 hours required)");
      score -= 15;
    } else if (diagSleep < 7) {
      recommendations.push("मध्यम नींद: बेहतर स्वास्थ्य अनुभव के लिए रक्तदान से पहले अच्छी तरह आराम करें।");
      score -= 5;
    }

    // Blood pressure validation
    if (diagSystolic < 100 || diagSystolic > 140 || diagDiastolic < 60 || diagDiastolic > 90) {
      warnings.push("असामान्य रक्तचाप (BP): सामान्य सिस्टोलिक 100-140 और डायस्टोलिक 60-90 के बीच होना चाहिए। (Abnormal BP range)");
      score -= 20;
    }

    // General health suggestions
    if (score === 100) {
      recommendations.push("उत्कृष्ट स्वास्थ्य! आप रक्तदान करने के लिए पूरी तरह योग्य और फिट हैं।");
    } else if (score >= 70 && warnings.length === 0) {
      recommendations.push("सामान्य स्वास्थ्य। आप रक्तदान कर सकते हैं, लेकिन प्रचुर मात्रा में पानी और जूस लें।");
    } else if (warnings.length > 0) {
      recommendations.push("कृपया ऊपर दी गई चेतावनी सूची को दूर करने के बाद ही रक्तदान के लिए आगे बढ़ें। आयरन युक्त भोजन लें और आराम करें।");
    }

    const eligible = warnings.length === 0 && score >= 60;

    setDiagReport({
      score: Math.max(0, score),
      eligible,
      warnings,
      recommendations
    });
  };

  // Run diagnostics dynamically when inputs change
  useEffect(() => {
    handleRunDiagnostics();
  }, [diagAge, diagWeight, diagHemoglobin, diagLastDonation, diagSleep, diagSystolic, diagDiastolic]);

  // Blood compatibility matrix lookup
  const getCompatibilityData = (group: string) => {
    const data: { [key: string]: { canDonateTo: string[]; canReceiveFrom: string[] } } = {
      "O-": {
        canDonateTo: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
        canReceiveFrom: ["O-"]
      },
      "O+": {
        canDonateTo: ["O+", "A+", "B+", "AB+"],
        canReceiveFrom: ["O+", "O-"]
      },
      "A-": {
        canDonateTo: ["A+", "A-", "AB+", "AB-"],
        canReceiveFrom: ["A-", "O-"]
      },
      "A+": {
        canDonateTo: ["A+", "AB+"],
        canReceiveFrom: ["A+", "A-", "O+", "O-"]
      },
      "B-": {
        canDonateTo: ["B+", "B-", "AB+", "AB-"],
        canReceiveFrom: ["B-", "O-"]
      },
      "B+": {
        canDonateTo: ["B+", "AB+"],
        canReceiveFrom: ["B+", "B-", "O+", "O-"]
      },
      "AB-": {
        canDonateTo: ["AB+", "AB-"],
        canReceiveFrom: ["AB-", "A-", "B-", "O-"]
      },
      "AB+": {
        canDonateTo: ["AB+"],
        canReceiveFrom: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
      }
    };
    return data[group] || { canDonateTo: [], canReceiveFrom: [] };
  };

  // Diagnostic Controls
  const handleManualBackup = () => {
    setIsBackupInProgress(true);
    addLog("INF - Manual backup process initialized...");
    setTimeout(() => {
      setIsBackupInProgress(false);
      setBackupLogs(prev => [
        `Manual Backup: Just Now (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
        ...prev
      ]);
      addLog("SUCCESS - Encrypted state backup saved to local sandbox.");
      alert("💾 रीयल-टाइम डेटाबेेस और वर्तमान अवस्था का बैकअप सुरक्षित स्थानीय लोकल स्टोरेज (IndexedDB sandbox) में संग्रहीत कर लिया गया है।");
    }, 1200);
  };

  const handleClearCache = () => {
    setCachedItemsCount(0);
    addLog("WARN - LocalStorage queries cache flushed.");
    alert("🧹 स्थानीय कैशे (Query Response Cache) सफलतापूर्वक साफ़ कर दिया गया है।");
  };

  const handleSyncDatabase = async () => {
    addLog("INF - Initiating force database sync...");
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        setCachedItemsCount(52);
        addLog("SUCCESS - Successfully synchronised local client cache with server DB.");
        alert("🔄 सिंक्रोनाइजेशन सफल! आपके स्थानीय कैशे को लाइव सर्वर डेटाबेस के साथ सिंक्रनाइज़ कर दिया गया है।");
      }
    } catch (err) {
      addLog("ERR - Database sync failed. Network is unresponsive.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl p-4 sm:p-6 space-y-6 text-left">
      
      {/* Hidden Canvas used for PNG Card Generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header with Sub tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center border border-red-500/25">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-sans">Donor profile & identity</h3>
            <p className="text-xs text-slate-400 font-medium">डिजिटल रक्तदाता कार्ड कस्टमाइज़र और प्रोफ़ाइल सेटिंग्स</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start">
          <button
            onClick={() => {
              setActiveTab("profile");
              if (onShowToast) onShowToast("डिजिटल कार्ड बिल्डर सक्रिय");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile" 
                ? "bg-red-600/10 text-red-400 border border-red-500/15" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Digital Card Builder
          </button>
          <button
            onClick={() => {
              setActiveTab("admin");
              if (onShowToast) onShowToast("स्वास्थ्य निदान HUD सक्रिय");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "admin" 
                ? "bg-red-600/10 text-red-400 border border-red-500/15" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Diagnostics HUD
          </button>
          <button
            onClick={() => {
              setActiveTab("donate");
              setDonationStep("input");
              if (onShowToast) onShowToast("स्वैच्छिक दान और समर्थन सेक्शन सक्रिय ❤️");
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === "donate" 
                ? "bg-red-600/20 text-red-400 border border-red-500/35" 
                : "text-red-500/80 hover:text-red-400"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-red-500/20 animate-pulse text-red-500" />
            <span>स्वैच्छिक दान</span>
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: LIVE CARD PREVIEW (5 Columns) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Digital Card Preview</span>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-700"}`}></span>
            </h4>

            {/* Premium Generated Card Element */}
            <div className={`relative bg-gradient-to-br border rounded-2xl p-5 overflow-hidden shadow-2xl min-h-[220px] transition-all duration-300 ${
              cardTheme === "crimson" 
                ? "from-red-950/40 via-slate-900 to-black border-red-500/30 hover:border-red-500/50" 
                : cardTheme === "sapphire" 
                  ? "from-sky-950/40 via-slate-900 to-black border-sky-500/30 hover:border-sky-500/50"
                  : cardTheme === "emerald"
                    ? "from-emerald-950/40 via-slate-900 to-black border-emerald-500/30 hover:border-emerald-500/50"
                    : "from-amber-950/40 via-slate-900 to-black border-amber-500/30 hover:border-amber-500/50"
            }`}>
              {/* Floating watermark */}
              <div className="absolute right-[-10px] bottom-[-15px] text-8xl opacity-10 select-none pointer-events-none">🩸</div>

              <div className="flex justify-between items-start relative z-10 gap-3">
                {/* Photo & Basic Credentials */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Profile avatar" 
                        referrerPolicy="no-referrer"
                        className={`w-14 h-14 rounded-full object-cover border-2 shadow-md ${
                          cardTheme === "crimson" ? "border-red-500" : cardTheme === "sapphire" ? "border-sky-500" : cardTheme === "emerald" ? "border-emerald-500" : "border-amber-500"
                        }`}
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white border-2 text-xl font-bold shadow-md ${
                        cardTheme === "crimson" 
                          ? "bg-red-600 border-red-500" 
                          : cardTheme === "sapphire" 
                            ? "bg-sky-600 border-sky-500" 
                            : cardTheme === "emerald" 
                              ? "bg-emerald-600 border-emerald-500" 
                              : "bg-amber-600 border-amber-500"
                      }`}>
                        {profileName[0] || "U"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 p-1 rounded-full text-slate-400">
                      <Camera className="w-2.5 h-2.5 text-red-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className={`text-[9px] border px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider inline-block ${
                      cardTheme === "crimson" ? "bg-red-950/50 border-red-500/30 text-red-400" : cardTheme === "sapphire" ? "bg-sky-950/50 border-sky-500/30 text-sky-400" : cardTheme === "emerald" ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-400" : "bg-amber-950/50 border-amber-500/30 text-amber-400"
                    }`}>
                      Verified Volunteer
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">{profileName}</h3>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500" /> {location}
                    </span>
                  </div>
                </div>

                {/* Big stylized blood group badge */}
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-xl border shadow-lg ${
                  cardTheme === "crimson" 
                    ? "bg-gradient-to-tr from-red-600 to-red-800 border-red-500 text-white" 
                    : cardTheme === "sapphire" 
                      ? "bg-gradient-to-tr from-sky-600 to-sky-800 border-sky-500 text-white"
                      : cardTheme === "emerald"
                        ? "bg-gradient-to-tr from-emerald-600 to-emerald-800 border-emerald-500 text-white"
                        : "bg-gradient-to-tr from-amber-600 to-amber-800 border-amber-500 text-white"
                }`}>
                  <span className="leading-none">{bloodGroup}</span>
                  <span className="text-[7px] opacity-75 font-normal tracking-tighter">GROUP</span>
                </div>
              </div>

              {/* Contact, availability and last donation */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] relative z-10">
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider">Contact Number</span>
                  <span className="text-slate-200 font-mono font-bold">{phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[8px] uppercase font-bold tracking-wider">Emergency Status</span>
                  <span className={`font-bold uppercase ${isAvailable ? "text-emerald-400" : "text-amber-500"}`}>
                    {isAvailable ? "● AVAILABLE NOW" : "○ BUSY / OFF"}
                  </span>
                </div>
              </div>

              {/* Bio & Social Handles */}
              <div className="mt-3 pt-3 border-t border-slate-800/50 text-[10px] text-slate-400 leading-normal line-clamp-2 italic relative z-10">
                "{bio}"
              </div>

              {/* Social Media Link Icons display */}
              <div className="mt-3.5 pt-2 border-t border-slate-800/30 flex items-center justify-between text-xs relative z-10">
                <div className="flex items-center gap-2">
                  {instagram && (
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                      <Instagram className="w-3 h-3 text-pink-500" />
                    </a>
                  )}
                  {twitter && (
                    <a href={twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                      <Twitter className="w-3 h-3 text-sky-400" />
                    </a>
                  )}
                  {facebook && (
                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                      <Facebook className="w-3 h-3 text-blue-500" />
                    </a>
                  )}
                  {linkedin && (
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
                      <Linkedin className="w-3 h-3 text-indigo-400" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{isPublic ? "Public Directory Active" : "Private Sandbox Card"}</span>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Card Style Gradient Themes</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setCardTheme("crimson")}
                  className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    cardTheme === "crimson" 
                      ? "bg-red-950/30 border-red-500 text-red-400" 
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Crimson
                </button>
                <button
                  onClick={() => setCardTheme("sapphire")}
                  className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    cardTheme === "sapphire" 
                      ? "bg-sky-950/30 border-sky-500 text-sky-400" 
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Sapphire
                </button>
                <button
                  onClick={() => setCardTheme("emerald")}
                  className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    cardTheme === "emerald" 
                      ? "bg-emerald-950/30 border-emerald-500 text-emerald-400" 
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Emerald
                </button>
                <button
                  onClick={() => setCardTheme("amber")}
                  className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    cardTheme === "amber" 
                      ? "bg-amber-950/30 border-amber-500 text-amber-400" 
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  Golden
                </button>
              </div>
            </div>

            {/* Quick Card Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={generateAndDownloadCard}
                className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Card (PNG)</span>
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Share</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED PROFILE EDITOR FORM (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-red-500" />
                <span>Interactive Profile Customizer Form</span>
              </h4>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Save className="w-3 h-3" />
                <span>Save Changes</span>
              </button>
            </div>

            {/* Personal Details Row */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">पूरा नाम (Full Name) *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    placeholder="e.g. Siddharth Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">ब्लड ग्रुप (Blood Group) *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg} className="bg-slate-900">{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">संपर्क नंबर (Contact Phone) *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">शहर / स्थान (City, State) *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50"
                    placeholder="e.g. Sagar, Madhya Pradesh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">विवरण / जीवनी (Volunteer Bio Description) *</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  maxLength={180}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 resize-none leading-relaxed"
                  placeholder="Tell the community about yourself or why you donate..."
                />
                <span className="text-[9px] text-slate-500 font-mono float-right mt-1">{bio.length}/180 characters maximum</span>
              </div>
            </div>

            {/* Roles / Tags Selection */}
            <div className="border-t border-slate-850 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">पंजीकृत भूमिकाएं (My Registered Tags)</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "रक्त दाता (Blood Donor)",
                  "रक्त खोजी (Blood Seeker)",
                  "स्वयंसेवक (Volunteer)",
                  "चिकित्सक (Medical Expert)"
                ].map(tag => {
                  const isSelected = profileTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setProfileTags(prev => 
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`p-2.5 text-left rounded-xl border text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-red-600/10 border-red-500 text-red-500"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span>{tag}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite Services Pinning Selection */}
            <div className="border-t border-slate-850 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">होम स्क्रीन पसंदीदा सेवाएँ (Home Pinned Services)</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Blood Search",
                  "Donor Search",
                  "Emergency Requests",
                  "Live Map",
                  "Live Peer Chat",
                  "Support / Donation"
                ].map(service => {
                  const isSelected = profileServices.includes(service);
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
                        setProfileServices(prev => 
                          prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
                        );
                      }}
                      className={`p-2.5 text-left rounded-xl border text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-red-600/10 border-red-500 text-red-500"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="truncate">{labelHindi}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo uploading or avatar select */}
            <div className="border-t border-slate-850 pt-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Profile Photo Settings (फ़ोटो अपलोड)</span>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-red-500" />
                    <span>Upload custom photo</span>
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-slate-500 leading-normal flex-1">
                  {profilePhoto ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Custom photo loaded successfully.</span>
                  ) : (
                    <span>नो कस्टम फ़ोटो अपलोडेड। आप नीचे दिए गए मेडिकल अवतारों में से कोई एक चुन सकते हैं।</span>
                  )}
                </div>
              </div>

              {/* Avatar Selector Grid (if custom photo is not selected) */}
              {!profilePhoto && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Select Default Medical Avatar:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {avatarColors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(index);
                          addLog(`INF - Default avatar changed to ${color.name}`);
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          selectedAvatar === index 
                            ? "bg-slate-900 border-red-500" 
                            : "bg-slate-950 border-slate-900 hover:bg-slate-900"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: color.bg }}>
                          🩸
                        </div>
                        <span className="text-[9px] font-semibold text-slate-300 truncate">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Link Inputs */}
            <div className="border-t border-slate-850 pt-4 space-y-3 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Social Media Links (सोशल मीडिया लिंक जोड़ें)</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-700"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/yourprofile"
                    className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-700"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourprofile"
                    className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-700"
                  />
                </div>

                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                  <Linkedin className="w-4 h-4 text-indigo-400" />
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Profile Visibility and Readiness Controls */}
            <div className="border-t border-slate-850 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Ready to donate status */}
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">रक्तदान हेतु तत्परता (Readiness)</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Ready to Donate Blood Now:</span>
                  <button
                    onClick={() => {
                      setIsAvailable(!isAvailable);
                      addLog(`INF - Volunteer availability toggled to: ${!isAvailable}`);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                      isAvailable 
                        ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400" 
                        : "bg-slate-950 border border-slate-800 text-slate-500"
                    }`}
                  >
                    {isAvailable ? "● AVAILABLE" : "○ BUSY / OFF"}
                  </button>
                </div>
              </div>

              {/* Public Visibility Selector */}
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">सार्वजनिक दृश्यता (Profile Visibility)</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Public directory listing:</span>
                  <button
                    onClick={() => {
                      setIsPublic(!isPublic);
                      addLog(`INF - Profile search discoverability set to: ${!isPublic}`);
                    }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                      isPublic 
                        ? "bg-sky-600/20 border border-sky-500/30 text-sky-400" 
                        : "bg-slate-950 border border-slate-800 text-slate-500"
                    }`}
                  >
                    {isPublic ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>🌐 PUBLIC</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>🔒 PRIVATE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Help guidelines explaining who can see profile card */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-[10px] text-slate-400 leading-relaxed flex items-start gap-2 text-left">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300 block">दृश्यता दिशानिर्देश (Visibility Guide)</span>
                यदि आप अपनी प्रोफ़ाइल को <strong>PUBLIC</strong> रखते हैं, तो लाइव डोनर डायरेक्टरी और मानचित्र पर अन्य लोग आपको खोज और संपर्क कर सकते हैं। यदि आप इसे <strong>PRIVATE</strong> करते हैं, तो कोई भी आपकी व्यक्तिगत जानकारी नहीं देख पाएगा; आपका विवरण सुरक्षित रूप से केवल आपके डिवाइस पर कस्टमाइज़्ड कार्ड के रूप में रहेगा।
              </div>
            </div>

            {/* Bottom Save Reminder */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 italic">कृपया परिवर्तन प्रभावी करने के लिए सेव बटन पर क्लिक करें।</span>
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Settings</span>
              </button>
            </div>

          </div>

        </div>
      ) : activeTab === "admin" ? (
        /* HEALTH DIAGNOSTICS & ELIGIBILITY HUD */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Donor Health & Eligibility Diagnostics (स्वास्थ्य निदान)</span>
              </h4>
              <p className="text-[11px] text-slate-400">रक्तदान से पहले अपने स्वास्थ्य और पात्रता स्तर की तुरंत जांच करें</p>
            </div>
            <button
              onClick={() => {
                // Quick Sync from Profile settings
                setDiagAge(28);
                setDiagWeight(68);
                setDiagHemoglobin(13.5);
                setDiagSleep(7);
                setDiagSystolic(120);
                setDiagDiastolic(80);
                setDiagLastDonation("over_3_months");
                handleRunDiagnostics();
                addLog("INF - Reset diagnostic parameters to standard healthy profile.");
              }}
              className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCw className="w-3 h-3 text-red-400" />
              <span>मानक मान रीसेट करें (Reset to Default)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: ASSESSOR INPUTS (5 Columns) */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-900 pb-1.5">
                Physiological Parameters (शारीरिक मापदंड)
              </span>

              {/* Age & Weight Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold">आयु (Age) : {diagAge} वर्ष</label>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={diagAge}
                    onChange={(e) => setDiagAge(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>15 Yr</span>
                    <span>75 Yr</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold">वजन (Weight) : {diagWeight} kg</label>
                  <input
                    type="range"
                    min="35"
                    max="120"
                    value={diagWeight}
                    onChange={(e) => setDiagWeight(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>35 kg</span>
                    <span>120 kg</span>
                  </div>
                </div>
              </div>

              {/* Hemoglobin & Sleep Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold">हीमोग्लोबिन : {diagHemoglobin} g/dl</label>
                  <input
                    type="range"
                    min="8"
                    max="20"
                    step="0.1"
                    value={diagHemoglobin}
                    onChange={(e) => setDiagHemoglobin(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>8 g/dl</span>
                    <span>20 g/dl</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-bold">कल रात की नींद : {diagSleep} घंटे</label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    value={diagSleep}
                    onChange={(e) => setDiagSleep(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[8px] text-slate-600 font-mono">
                    <span>3 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>
              </div>

              {/* Blood Pressure Inputs */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">रक्तचाप (Blood Pressure mmHg)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                    <span className="block text-[8px] text-slate-500 uppercase font-mono">Systolic (सिस्टोलिक)</span>
                    <input
                      type="number"
                      value={diagSystolic}
                      onChange={(e) => setDiagSystolic(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-white text-xs font-bold font-mono outline-none focus:ring-0 p-0 mt-0.5"
                    />
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                    <span className="block text-[8px] text-slate-500 uppercase font-mono">Diastolic (डायस्टोलिक)</span>
                    <input
                      type="number"
                      value={diagDiastolic}
                      onChange={(e) => setDiagDiastolic(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-white text-xs font-bold font-mono outline-none focus:ring-0 p-0 mt-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Last Donation Interval Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">पिछला रक्तदान अंतराल (Last Donation)</label>
                <select
                  value={diagLastDonation}
                  onChange={(e) => setDiagLastDonation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-pointer font-sans"
                >
                  <option value="over_3_months" className="bg-slate-900">3 महीने या उससे अधिक समय पहले (More than 90 days ago)</option>
                  <option value="less_than_3_months" className="bg-slate-900">3 महीने से कम समय पहले (Within last 90 days)</option>
                  <option value="never" className="bg-slate-900">मैंने पहले कभी रक्तदान नहीं किया (First-time donor)</option>
                </select>
              </div>

              {/* Re-calculate Trigger */}
              <button
                onClick={handleRunDiagnostics}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>पुनः जाँच करें (Run Diagnostics)</span>
              </button>
            </div>

            {/* RIGHT PANEL: LIVE REPORT & ELIGIBILITY STATUS (7 Columns) */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-900 pb-1.5">
                Interactive Health Diagnostics Report (निदान रिपोर्ट)
              </span>

              {diagReport && (
                <div className="space-y-4 text-left">
                  {/* Score & Status Panel */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    {/* Score radial representation */}
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-900 fill-none" strokeWidth="6" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          className={`fill-none transition-all duration-500 ${
                            diagReport.eligible ? "stroke-emerald-500" : "stroke-amber-500"
                          }`} 
                          strokeWidth="6" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={2 * Math.PI * 34 * (1 - diagReport.score / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-black text-white leading-none font-mono">{diagReport.score}</span>
                        <span className="text-[8px] text-slate-500 font-bold">SCORE</span>
                      </div>
                    </div>

                    {/* Status Text Details */}
                    <div className="text-center sm:text-left space-y-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        diagReport.eligible 
                          ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-400" 
                          : "bg-amber-950/50 border border-amber-500/30 text-amber-400"
                      }`}>
                        {diagReport.eligible ? "● ELIGIBLE (रक्तदान के लिए सुरक्षित)" : "⚠ TEMPORARILY INELIGIBLE (अपात्र)"}
                      </span>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {diagReport.eligible 
                          ? "आपके शारीरिक स्वास्थ्य लक्षण रक्तदान के लिए बिल्कुल अनुकूल हैं। कृपया सुरक्षित रक्तदान करके जीवन बचाएं!"
                          : "सुरक्षा कारणों से, आज आपको रक्तदान न करने की सलाह दी जाती है। कृपया कारणों की सूची देखें।"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Warnings Checklist */}
                  {diagReport.warnings.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider block">सावधानियां और रुकावटें (Warnings checklist):</span>
                      <div className="space-y-1.5">
                        {diagReport.warnings.map((warn, index) => (
                          <div key={index} className="flex items-start gap-2 bg-red-950/20 border border-red-500/10 p-2.5 rounded-lg text-xs text-red-300 leading-normal">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-sky-400 tracking-wider block">चिकित्सीय सुझाव और सुधार गाइड (Advice & Care):</span>
                    <div className="space-y-1.5">
                      {diagReport.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-xs text-slate-300 leading-normal">
                          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* BLOOD GROUP COMPATIBILITY MATRIX SECTION */}
          <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 sm:p-5 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Blood Group Compatibility Matrix (रक्त समूह अनुकूलता मैट्रिक्स)</span>
                </h4>
                <p className="text-[10px] text-slate-500">विभिन्न रक्त समूहों के आदान-प्रदान और अनुकूलता की जाँच करें</p>
              </div>

              {/* Blood group quick selection row */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 font-bold font-mono uppercase">Select group:</span>
                <div className="flex flex-wrap gap-1 max-w-[240px] sm:max-w-none">
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                    <button
                      key={bg}
                      onClick={() => {
                        setBloodGroup(bg);
                        addLog(`INF - Compatibility lookup changed to ${bg}`);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        bloodGroup === bg
                          ? "bg-red-600 text-white"
                          : "bg-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Donor & Recipient compatibility lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Can Donate To Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                  <span>आप इन्हें रक्तदान कर सकते हैं (Can Donate To)</span>
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  रक्त समूह <strong>{bloodGroup}</strong> वाला डोनर सुरक्षित रूप से निम्नलिखित रक्त समूहों के मरीजों की जान बचा सकता है:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getCompatibilityData(bloodGroup).canDonateTo.map((targetBg) => (
                    <span
                      key={targetBg}
                      className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                    >
                      {targetBg}
                    </span>
                  ))}
                  {bloodGroup === "O-" && (
                    <span className="bg-emerald-500 text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase self-center ml-auto">
                      Universal Donor
                    </span>
                  )}
                </div>
              </div>

              {/* Can Receive From Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 space-y-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
                  <span>आप इनसे रक्त प्राप्त कर सकते हैं (Can Receive From)</span>
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  मरीज जिसका रक्त समूह <strong>{bloodGroup}</strong> है, वह आपातकाल में केवल निम्नलिखित रक्त समूहों से सुरक्षित रूप से प्राप्त कर सकता है:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {getCompatibilityData(bloodGroup).canReceiveFrom.map((sourceBg) => (
                    <span
                      key={sourceBg}
                      className="bg-red-950/40 border border-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs font-mono font-bold"
                    >
                      {sourceBg}
                    </span>
                  ))}
                  {bloodGroup === "AB+" && (
                    <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase self-center ml-auto">
                      Universal Recipient
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DONATE / SUPPORT US TAB SECTION */
        <div className="space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 animate-pulse fill-red-500/20" />
              <span>स्वैच्छिक दान और समर्थन (Voluntary Support)</span>
            </h4>
            <p className="text-[11px] text-slate-400">Blood AI एक गैर-लाभकारी सामाजिक पहल है। आपके छोटे से सहयोग से हम जीवन बचा सकते हैं।</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL: INTERACTIVE SIMULATOR (7 Columns) */}
            <div className="lg:col-span-7 bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4 text-slate-100">
              <div className="p-4 bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 rounded-xl border border-red-500/15 text-xs text-slate-300 leading-relaxed shadow-sm relative overflow-hidden">
                <div className="absolute top-1 right-2 text-3xl opacity-10">❤️</div>
                <p className="font-sans font-medium text-[13px] text-slate-200">
                  "Blood AI एक सामाजिक पहल है। यदि आप इस प्लेटफ़ॉर्म के विकास में सहयोग करना चाहते हैं, तो स्वैच्छिक दान कर सकते हैं। आपका योगदान ऐप को बेहतर बनाने, सर्वर चलाने और अधिक लोगों तक सेवा पहुँचाने में उपयोग किया जाएगा।"
                </p>
              </div>

              {donationStep === "input" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">योगदान राशि चुनें (Select Amount)</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[100, 250, 500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setCustomAmount(amt.toString());
                            if (onShowToast) onShowToast(`राशि चुनी गई: ₹${amt}`);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-all border active:scale-95 cursor-pointer ${
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
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">या कस्टम राशि दर्ज करें (Or Enter Custom Amount)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                      <input
                        type="text"
                        pattern="[0-9]*"
                        placeholder="अपनी इच्छानुसार कोई भी राशि लिखें..."
                        value={customAmount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setCustomAmount(val);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInitiateDonation}
                    disabled={!customAmount || parseInt(customAmount) <= 0}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-900/10 flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Support ₹{customAmount || "0"}</span>
                  </button>
                </div>
              )}

              {donationStep === "processing" && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-red-500/10 border-t-2 border-t-red-500 animate-spin"></div>
                    <Heart className="w-5 h-5 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">सुरक्षित भुगतान गेटवे से जुड़ रहे हैं...</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Connecting to secure UPI interface. Please do not close or refresh this page.</p>
                  </div>
                </div>
              )}

              {donationStep === "awaiting" && (
                <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-1">
                    <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">मोबाइल ऐप पर पेमेंट की स्वीकृति का इंतजार है...</h5>
                    <p className="text-[10px] text-slate-400">
                      We have sent a collect request of <strong className="text-red-400 font-mono">₹{customAmount}</strong> to your UPI app. Please open GPay, PhonePe, or Paytm and authorize the payment.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={handleApproveDonation}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-md uppercase"
                    >
                      ✓ Approve (Simulate Payment)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationStep("input")}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {donationStep === "success" && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/20 space-y-5 text-center relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-5 select-none pointer-events-none">🩸</div>
                  
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1 relative z-10 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <h5 className="text-sm font-black text-emerald-400 uppercase tracking-widest">योगदान सफलतापूर्वक प्राप्त हुआ!</h5>
                    <p className="text-xs text-slate-200">
                      Amount Contributed: <strong className="text-white text-sm font-mono">₹{customAmount}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed max-w-md mx-auto">
                      आपके इस स्वैच्छिक योगदान के लिए हम अत्यंत आभारी हैं। आपका यह उपहार Blood AI को सर्वर रखरखाव, डेटाबेस स्केलिंग और ग्रामीण क्षेत्रों में निःशुल्क आपातकालीन स्वास्थ्य सेवाएँ उपलब्ध कराने में मदद करेगा।
                    </p>
                  </div>

                  <div className="mx-auto max-w-sm bg-slate-900 border border-slate-800/80 rounded-xl p-4 text-left relative overflow-hidden shadow-inner">
                    <div className="absolute -right-3 -top-3 w-16 h-16 bg-red-600/10 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] bg-red-600/15 border border-red-500/25 text-red-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Official Contributor Pass</span>
                        <h6 className="text-[11px] font-extrabold text-white uppercase mt-1.5">{profileName}</h6>
                        <p className="text-[8px] text-slate-500 mt-0.5">Contributor ID: BAI-CONT-{Math.floor(100000 + Math.random() * 900000)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500">Date</span>
                        <p className="text-[10px] font-mono font-bold text-slate-300">{new Date().toLocaleDateString()}</p>
                        <p className="text-[10px] font-mono font-extrabold text-red-400 mt-1">₹{customAmount}</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-800/60 mt-3 pt-2 flex items-center justify-between text-[8px] text-slate-400">
                      <span>❤️ Life Saved With Blood AI Initiative</span>
                      <span className="font-mono font-bold text-slate-500">VERIFIED</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDonationStep("input")}
                    className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer uppercase relative z-10"
                  >
                    नया दान करें (Donate Again)
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: UPI DETAILS & SCANNER (5 Columns) */}
            <div className="lg:col-span-5 bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-900 pb-1.5">
                Scan & Contribute Directly (सीधा भुगतान)
              </span>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-white p-3 rounded-xl shadow-lg relative">
                  <svg className="w-32 h-32 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M5 5h30v30H5V5zm6 6v18h18V11H11zm54-6h30v30H65V5zm6 6v18h18V11H71zM5 65h30v30H5V65zm6 6v18h18V71H11zm50-10h4v4h-4v-4zm8 0h4v4h-4v-4zm-8 8h4v4h-4v-4zm8 0h4v4h-4v-4zm10-8h4v12h-4v-12zm-22 14h4v4h-4v-4zm14 0h4v4h-4v-4zm8 0h4v4h-4v-4zm-22 8h8v4h-8v-4zm12 0h8v4h-8v-4zm10-12h4v4h-4v-4zM20 20h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zM80 20h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zM20 80h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-lg border border-slate-100 text-xs">
                    🩸
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] bg-red-600/15 border border-red-500/25 text-red-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">UPI SCANNER ACTIVE</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">GPay, PhonePe, Paytm, BHIM या किसी भी बैंकिंग ऐप से स्कैन करके दान करें।</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Official Donation UPI ID</span>
                <div className="flex bg-slate-950 border border-slate-850 rounded-xl p-1 items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-200 pl-3">donate@bloodai</span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">बैंक ट्रांसफर विवरण (Bank Accounts)</span>
                <div className="text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Account Name:</span>
                    <strong className="text-white">Blood AI Social Initiative</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Bank Name:</span>
                    <strong className="text-white">State Bank of India (SBI)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Account Number:</span>
                    <strong className="text-white font-mono">10293847565 (Simulated)</strong>
                  </div>
                  <div className="flex justify-between pb-0.5">
                    <span className="text-slate-500">IFSC Code:</span>
                    <strong className="text-white font-mono">SBIN0001234</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

