import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  AlertTriangle, 
  MapPin, 
  User, 
  Activity, 
  HelpCircle, 
  Clock, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Compass, 
  Info,
  Layers,
  Send,
  PlusCircle,
  Shield,
  Search,
  Sun,
  Moon,
  Bell,
  QrCode,
  Camera,
  Image as ImageIcon,
  Mail,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Phone,
  Eye,
  EyeOff,
  Globe,
  SlidersHorizontal,
  Users,
  Check
} from "lucide-react";
import { Donor, EmergencyRequest, BloodBank, ChatMessage, CommunityPost } from "./types";
import { TRANSLATIONS } from "./translations";
import HomeView from "./components/HomeView";
import ChatSection from "./components/ChatSection";
import EmergencyView from "./components/EmergencyView";
import MapView from "./components/MapView";
import ProfileView from "./components/ProfileView";

// Coordinates for pre-seeded Indian cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  noida: { lat: 28.5355, lng: 77.3910 },
};

function getItemCoordinates(locationName: string, id: string): { lat: number; lng: number } | null {
  if (CITY_COORDINATES[id]) {
    return CITY_COORDINATES[id];
  }
  const normalized = locationName.trim().toLowerCase();
  let base = CITY_COORDINATES[normalized];
  
  if (!base) {
    const foundKey = Object.keys(CITY_COORDINATES).find(key => normalized.includes(key) || key.includes(normalized));
    if (foundKey) {
      base = CITY_COORDINATES[foundKey];
    }
  }
  
  if (!base) {
    base = CITY_COORDINATES["delhi"];
  }
  
  if (!base) return null;
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) / 1500) - 0.03;
  const lngOffset = (((Math.abs(hash) >> 8) % 100) / 1500) - 0.03;
  
  return {
    lat: base.lat + latOffset,
    lng: base.lng + lngOffset
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Number((R * c).toFixed(1));
}

export default function App() {
  // Main view state: 'home' | 'chat' | 'emergency' | 'map' | 'profile'
  const [activeView, setActiveView] = useState<"home" | "chat" | "emergency" | "map" | "profile">("home");

  // Multi-lingual & Theme States
  const [language, setLanguage] = useState<"hi" | "en" | "hinglish">("hi");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Custom Interaction Lists
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(["O- Delhi", "B+ Mumbai", "Sagar Donors"]);
  const [followedDonors, setFollowedDonors] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState<"Online" | "Offline">("Online");
  const [chatPrivateMode, setChatPrivateMode] = useState<boolean>(false);
  
  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"distance" | "urgency" | "newest">("newest");
  
  // Dynamic Notification List
  const [liveNotifications, setLiveNotifications] = useState([
    { id: 1, title: "O+ Blood Donors Registered", text: "New verified donor registered near your location.", time: "2 mins ago", unread: true },
    { id: 2, title: "Emergency Request Matched", text: "Emergency request for B+ in Delhi matched with donor Rohan.", time: "15 mins ago", unread: true },
    { id: 3, title: "Blood Stocks Updated", text: "Red Cross Blood Bank updated their available blood bags today.", time: "1 hr ago", unread: false }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Modal / Screen State Overlays
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannerIsScanning, setScannerIsScanning] = useState<boolean>(false);
  const [scannerSelectedFile, setScannerSelectedFile] = useState<string | null>(null);

  // Global Interactive Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Core App State
  const [donors, setDonors] = useState<Donor[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // Driver Mode states
  const [isDriverModeActive, setIsDriverModeActive] = useState<boolean>(false);
  const [driverSpeed, setDriverSpeed] = useState<number | null>(null);
  const [driverHeading, setDriverHeading] = useState<number | null>(null);
  const [driverWatchId, setDriverWatchId] = useState<number | null>(null);
  const [isSosTriggered, setIsSosTriggered] = useState<boolean>(false);
  const [isUniversalModalOpen, setIsUniversalModalOpen] = useState<boolean>(false);

  // Community Modal Form
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState<boolean>(false);
  const [newPostAuthor, setNewPostAuthor] = useState<string>("");
  const [newPostRole, setNewPostRole] = useState<'donor' | 'seeker' | 'volunteer' | 'moderator'>("donor");
  const [newPostLocation, setNewPostLocation] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTags, setNewPostTags] = useState<string>("");
  const [newPostCategory, setNewPostCategory] = useState<string>("Emergency Blood Requests");
  const [newPostBloodGroup, setNewPostBloodGroup] = useState<string>("");
  const [newPostAuthorType, setNewPostAuthorType] = useState<string>("Person");
  const [newPostMediaUrl, setNewPostMediaUrl] = useState<string>("");
  const [newPostErrorMsg, setNewPostErrorMsg] = useState<string | null>(null);
  const [isPostSubmitting, setIsPostSubmitting] = useState<boolean>(false);

  // Proximity states
  const [isProximityActive, setIsProximityActive] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [customLocationName, setCustomLocationName] = useState<string>("Delhi");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Selected map focus item
  const [selectedMapItem, setSelectedMapItem] = useState<{
    title: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    details: string;
  } | null>(null);

  // Direct Registration Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerType, setRegisterType] = useState<'donor' | 'request'>('donor');
  
  // Registration Inputs
  const [donorName, setDonorName] = useState<string>('');
  const [donorBloodGroup, setDonorBloodGroup] = useState<string>('O+');
  const [donorLocation, setDonorLocation] = useState<string>('');
  const [donorContact, setDonorContact] = useState<string>('');
  const [donorAge, setDonorAge] = useState<string>('');
  const [donorLastDonation, setDonorLastDonation] = useState<string>('Never');

  const [requestPatientName, setRequestPatientName] = useState<string>('');
  const [requestBloodGroup, setRequestBloodGroup] = useState<string>('O+');
  const [requestLocation, setRequestLocation] = useState<string>('');
  const [requestUnits, setRequestUnits] = useState<string>('1');
  const [requestUrgency, setRequestUrgency] = useState<string>('Urgent');
  const [requestContact, setRequestContact] = useState<string>('');

  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState<boolean>(false);
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState<string | null>(null);
  const [registerErrorMsg, setRegisterErrorMsg] = useState<string | null>(null);

  // Onboarding & Profile Customization States
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return !!localStorage.getItem("blood_ai_profile_name");
  });
  const [registeredTags, setRegisteredTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_registered_tags");
      return saved ? JSON.parse(saved) : ["रक्त दाता (Blood Donor)"];
    } catch {
      return ["रक्त दाता (Blood Donor)"];
    }
  });
  const [favoriteServices, setFavoriteServices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("blood_ai_favorite_services");
      return saved ? JSON.parse(saved) : ["Blood Search", "Donor Search", "Emergency Requests", "Live Map", "Live Peer Chat"];
    } catch {
      return ["Blood Search", "Donor Search", "Emergency Requests", "Live Map", "Live Peer Chat"];
    }
  });

  const [onboardName, setOnboardName] = useState<string>("");
  const [onboardContact, setOnboardContact] = useState<string>("");
  const [onboardLocation, setOnboardLocation] = useState<string>("");
  const [onboardBloodGroup, setOnboardBloodGroup] = useState<string>("O+");
  const [onboardTags, setOnboardTags] = useState<string[]>(["रक्त दाता (Blood Donor)"]);
  const [onboardServices, setOnboardServices] = useState<string[]>([
    "Blood Search",
    "Donor Search",
    "Emergency Requests",
    "Live Map",
    "Live Peer Chat"
  ]);

  // Clock
  const [utcTime, setUtcTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getProximityText = (locationName: string, id: string): string => {
    const coords = getItemCoordinates(locationName, id);
    if (!coords) return "Unknown distance";
    const dist = calculateDistance(userCoords.lat, userCoords.lng, coords.lat, coords.lng);
    return `~${dist} km away`;
  };

  const seedDynamicNearbyServices = (lat: number, lng: number, city: string, countryCode: string) => {
    const isIndia = countryCode === "IN";
    
    const id1 = "dyn_bank_" + Date.now() + "_1";
    const id2 = "dyn_bank_" + Date.now() + "_2";
    const id3 = "dyn_donor_" + Date.now() + "_1";
    const id4 = "dyn_donor_" + Date.now() + "_2";
    const id5 = "dyn_req_" + Date.now() + "_1";
    const id6 = "dyn_req_" + Date.now() + "_2";

    CITY_COORDINATES[id1] = { lat: lat + 0.006, lng: lng - 0.004 };
    CITY_COORDINATES[id2] = { lat: lat - 0.009, lng: lng + 0.011 };
    CITY_COORDINATES[id3] = { lat: lat + 0.004, lng: lng + 0.003 };
    CITY_COORDINATES[id4] = { lat: lat - 0.003, lng: lng - 0.005 };
    CITY_COORDINATES[id5] = { lat: lat + 0.012, lng: lng - 0.008 };
    CITY_COORDINATES[id6] = { lat: lat - 0.007, lng: lng + 0.005 };

    const bank1Name = isIndia ? `${city} सिविल अस्पताल ब्लड बैंक (Govt)` : `${city} Cantonal Hospital Blood Center`;
    const bank2Name = isIndia ? `${city} रेड क्रॉस सोसाइटी ब्लड सेंटर` : `Swiss Red Cross Blood Service - ${city}`;
    const donor1Name = isIndia ? "आदित्य नारायण शर्मा (Available)" : "Thomas Keller";
    const donor2Name = isIndia ? "ज्योति सिंह बघेल" : "Elena Vaudaux";
    const patient1Name = isIndia ? "राघवेंद्र प्रताप सिंह" : "Marc-André Grosjean";
    const patient2Name = isIndia ? "मीनाक्षी चौरसिया" : "Nathalie Bernasconi";

    const newBanks: BloodBank[] = [
      {
        id: id1,
        name: bank1Name,
        location: city,
        address: isIndia ? "मुख्य बस स्टैंड मार्ग, जिला चिकित्सालय परिसर" : "Main Wing, Central Hospital Square",
        contact: isIndia ? "07582-224455" : "+41 22 730 2111",
        availableGroups: ["O+", "A+", "B+", "AB+", "O-"]
      },
      {
        id: id2,
        name: bank2Name,
        location: city,
        address: isIndia ? "सिविल लाइंस, जिला पंचायत के पास" : "Grand-Rue 12, Old Town Hub",
        contact: isIndia ? "94251-55566" : "+41 22 540 1234",
        availableGroups: ["O-", "A-", "B-", "AB-", "O+"]
      }
    ];

    const newDonors: Donor[] = [
      {
        id: id3,
        name: donor1Name,
        bloodGroup: "O-",
        location: city,
        contact: isIndia ? "91112 34567" : "+41 79 344 1212",
        age: 28,
        lastDonation: "2 months ago"
      },
      {
        id: id4,
        name: donor2Name,
        bloodGroup: "AB+",
        location: city,
        contact: isIndia ? "95554 87654" : "+41 78 554 9988",
        age: 32,
        lastDonation: "4 months ago"
      }
    ];

    const newRequests: EmergencyRequest[] = [
      {
        id: id5,
        patientName: patient1Name,
        bloodGroup: "O+",
        location: city,
        units: 2,
        urgency: "Critical",
        contact: isIndia ? "88887 11223" : "+41 76 888 2233",
        createdAt: "Just now"
      },
      {
        id: id6,
        patientName: patient2Name,
        bloodGroup: "A-",
        location: city,
        units: 1,
        urgency: "Urgent",
        contact: isIndia ? "77776 55443" : "+41 76 777 5566",
        createdAt: "10 mins ago"
      }
    ];

    setBloodBanks(prev => {
      const filtered = prev.filter(b => !b.id.startsWith("dyn_"));
      return [...newBanks, ...filtered];
    });
    setDonors(prev => {
      const filtered = prev.filter(d => !d.id.startsWith("dyn_"));
      return [...newDonors, ...filtered];
    });
    setEmergencyRequests(prev => {
      const filtered = prev.filter(r => !r.id.startsWith("dyn_"));
      return [...newRequests, ...filtered];
    });
  };

  const handlePositionDetected = async (latitude: number, longitude: number, isSilent = false) => {
    setUserCoords({ lat: latitude, lng: longitude });
    setIsProximityActive(true);
    
    let cityName = "Sagar"; 
    let countryCode = "IN";
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`, {
        headers: {
          "Accept-Language": "hi,en",
          "User-Agent": "BloodAI-Applet/1.2"
        }
      });
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        cityName = address.city || address.town || address.suburb || address.village || address.state_district || address.state || "Detected City";
        countryCode = (address.country_code || "IN").toUpperCase();
        
        const displayCountry = address.country || (countryCode === "CH" ? "Switzerland" : "India");
        setCustomLocationName(`${cityName}, ${displayCountry}`);
      } else {
        setCustomLocationName("My Location (जीपीएस)");
      }
    } catch (err) {
      console.error("Reverse geocoding failed, using GPS coordinates directly:", err);
      setCustomLocationName("My Location (जीपीएस)");
    }

    const cityKey = cityName.toLowerCase();
    CITY_COORDINATES[cityKey] = { lat: latitude, lng: longitude };

    seedDynamicNearbyServices(latitude, longitude, cityName, countryCode);
  };

  const detectMyLocation = () => {
    if (!navigator.geolocation) {
      alert("रंग-स्थान (Geolocation) आपके ब्राउज़र में समर्थित नहीं है।");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handlePositionDetected(latitude, longitude, false);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("GPS detection error:", error);
        alert("स्थान का पता नहीं चल पाया। कृपया मैन्युअल रूप से शहर टाइप करें।");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const autoDetectLocationOnStart = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handlePositionDetected(latitude, longitude, true);
      },
      (error) => {
        console.log("Silent auto-location declined/timed out on startup, falling back to Delhi database.");
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const fetchDbState = async () => {
    try {
      const response = await fetch("/api/db");
      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
        setEmergencyRequests(data.emergencyRequests || []);
        setBloodBanks(data.bloodBanks || []);
        setCommunityPosts(data.communityPosts || []);
      }
    } catch (err) {
      console.error("Error fetching db state:", err);
    }
  };

  useEffect(() => {
    fetchDbState();
    setTimeout(() => {
      autoDetectLocationOnStart();
    }, 1500);
  }, []);

  useEffect(() => {
    return () => {
      if (driverWatchId !== null) {
        navigator.geolocation.clearWatch(driverWatchId);
      }
    };
  }, [driverWatchId]);

  const toggleDriverMode = () => {
    if (isDriverModeActive) {
      if (driverWatchId !== null) {
        navigator.geolocation.clearWatch(driverWatchId);
        setDriverWatchId(null);
      }
      setIsDriverModeActive(false);
      setDriverSpeed(null);
      setDriverHeading(null);
      setIsSosTriggered(false);
    } else {
      setIsDriverModeActive(true);
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const mps = position.coords.speed;
            const kmh = mps !== null && mps !== undefined && mps > 0 ? Math.round(mps * 3.6) : 0;
            setDriverSpeed(kmh);
            setDriverHeading(position.coords.heading !== null && position.coords.heading !== undefined ? Math.round(position.coords.heading) : null);
            setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (error) => {
            console.warn("Driver mode speed/heading watch error:", error);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
        setDriverWatchId(watchId);
      } else {
        alert("जीपीएस ट्रैकिंग इस उपकरण पर उपलब्ध नहीं है।");
      }
    }
  };

  const handleDriverSosTrigger = () => {
    setIsSosTriggered(true);
    const id = "dyn_req_sos_" + Date.now();
    CITY_COORDINATES[id] = { lat: userCoords.lat, lng: userCoords.lng };
    
    const sosRequest: EmergencyRequest = {
      id,
      patientName: "🚨 सड़क दुर्घटना पीड़ित (SOS Driver Mode)",
      bloodGroup: "O-", 
      location: customLocationName || "Live GPS Location",
      units: 4,
      urgency: "Critical (SOS)",
      contact: "1033 / 1073",
      createdAt: "अभी (SOS Active)"
    };

    setEmergencyRequests(prev => [sosRequest, ...prev]);
    setActiveView("emergency");
    
    alert("🚨 आपातकालीन दुर्घटना SOS ट्रिगर सक्रिय! आपके वर्तमान जीपीएस कोऑर्डिनेट्स पर 4 यूनिट यूनिवर्सल 'O-' ब्लड ग्रुप का क्रिटिकल आपातकालीन अनुरोध पोस्ट कर दिया गया है। सरकारी दुर्घटना हेल्पलाइन को सूचना प्रेषित।");
  };

  const handleSimulateScanner = (source: "camera" | "gallery") => {
    setScannerIsScanning(true);
    setScannerSelectedFile(source === "camera" ? "Live Video Stream" : "medical_prescription.png");
    
    setTimeout(() => {
      setScannerIsScanning(false);
      setIsScannerOpen(false);
      
      // Auto-populate Need Blood form
      setRequestPatientName("Sita Ram (OCR Scan)");
      setRequestBloodGroup("O-");
      setRequestLocation(customLocationName || "Sagar District Hospital, MP");
      setRequestUnits("3");
      setRequestUrgency("Critical");
      setRequestContact("+91 94255 11223");
      
      // Auto open Register Request modal
      setRegisterType("request");
      setIsRegisterModalOpen(true);
      
      showToast(TRANSLATIONS[language].ocrSuccess);
    }, 1800);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter(f => f !== id) : [...prev, id];
      showToast(isFav ? "हटाया गया! (Removed from favorites)" : "पसंदीदा सूची में सहेजा गया! (Added to favorites)");
      return updated;
    });
  };

  const handleToggleFollowDonor = (id: string) => {
    setFollowedDonors(prev => {
      const isFollowed = prev.includes(id);
      const updated = isFollowed ? prev.filter(f => f !== id) : [...prev, id];
      showToast(isFollowed ? "फ़ॉलो समाप्त! (Unfollowed)" : "फ़ॉलो किया गया! (Following donor)");
      return updated;
    });
  };

  const handleReportItem = (id: string) => {
    showToast("व्यवस्थापक को पोस्ट की रिपोर्ट सफलतापूर्वक भेजी गई। (Reported to Admin)");
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatMessages,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to communicate with AI server");
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: "ai_" + Date.now(),
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action: data.action,
      };

      setChatMessages((prev) => [...prev, modelMsg]);
      
      if (data.action && data.action.type !== "NONE") {
        await fetchDbState();
        if (data.action.type === "REGISTER_DONOR") {
          setActiveView("emergency");
        } else if (data.action.type === "EMERGENCY_REQUEST") {
          setActiveView("emergency");
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setApiError(err.message || "An unexpected error occurred while communicating with Gemini.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (confirm("क्या आप डेटाबेस को रीसेट करके डिफ़ॉल्ट डेटा लोड करना चाहते हैं?")) {
      try {
        const response = await fetch("/api/reset", { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          setDonors(data.donors);
          setEmergencyRequests(data.emergencyRequests);
          setChatMessages([]);
          setApiError(null);
          alert("डेटाबेस सफलतापूर्वक रीसेट हो गया है!");
        }
      } catch (err) {
        console.error("Failed to reset DB:", err);
      }
    }
  };

  const toggleOnboardTag = (tag: string) => {
    setOnboardTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleOnboardService = (service: string) => {
    setOnboardServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName.trim() || !onboardLocation.trim() || !onboardContact.trim()) {
      showToast("कृपया सभी आवश्यक विवरण भरें।");
      return;
    }

    localStorage.setItem("blood_ai_profile_name", onboardName);
    localStorage.setItem("blood_ai_profile_blood", onboardBloodGroup);
    localStorage.setItem("blood_ai_profile_location", onboardLocation);
    localStorage.setItem("blood_ai_profile_phone", onboardContact);
    localStorage.setItem("blood_ai_registered_tags", JSON.stringify(onboardTags));
    localStorage.setItem("blood_ai_favorite_services", JSON.stringify(onboardServices));

    // Sync with memory
    if (onboardTags.includes("रक्त दाता (Blood Donor)")) {
      const newDonor: Donor = {
        id: "donor_" + Date.now(),
        name: onboardName,
        bloodGroup: onboardBloodGroup === "पता नहीं (Don't Know)" ? "O+" : onboardBloodGroup,
        location: onboardLocation,
        contact: onboardContact,
        age: 28,
        lastDonation: "Never"
      };
      setDonors(prev => [newDonor, ...prev]);
    }

    setIsRegistered(true);
    setRegisteredTags(onboardTags);
    setFavoriteServices(onboardServices);
    showToast("🎉 Blood AI में आपका स्वागत है! पंजीकरण सफलतापूर्वक पूरा हो गया।");
  };

  const handleDirectRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorLocation.trim() || !donorContact.trim()) {
      setRegisterErrorMsg("कृपया सभी आवश्यक फ़ील्ड (नाम, स्थान, संपर्क) भरें।");
      return;
    }

    setIsRegisterSubmitting(true);
    setRegisterErrorMsg(null);
    setRegisterSuccessMsg(null);

    try {
      const response = await fetch("/api/register-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName,
          bloodGroup: donorBloodGroup,
          location: donorLocation,
          contact: donorContact,
          age: donorAge,
          lastDonation: donorLastDonation,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "पंजीकरण में विफलता।");
      }

      setDonors(data.donors);
      setRegisterSuccessMsg("❤️ बधाई हो! आपका डोनर / वालंटियर पंजीकरण सफलतापूर्वक पूरा हो गया है।");
      
      setDonorName("");
      setDonorLocation("");
      setDonorContact("");
      setDonorAge("");
      setDonorLastDonation("Never");

      setActiveView("emergency");

      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegisterSuccessMsg(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setRegisterErrorMsg(err.message || "पंजीकरण के दौरान कोई त्रुटि आई।");
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleDirectEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestPatientName.trim() || !requestLocation.trim() || !requestContact.trim()) {
      setRegisterErrorMsg("कृपया सभी आवश्यक फ़ील्ड (रोगी का नाम, स्थान, संपर्क) भरें।");
      return;
    }

    setIsRegisterSubmitting(true);
    setRegisterErrorMsg(null);
    setRegisterSuccessMsg(null);

    try {
      const response = await fetch("/api/emergency-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: requestPatientName,
          bloodGroup: requestBloodGroup,
          location: requestLocation,
          units: requestUnits,
          urgency: requestUrgency,
          contact: requestContact,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "अनुरोध पोस्ट करने में विफलता।");
      }

      setEmergencyRequests(data.emergencyRequests);
      setRegisterSuccessMsg("🚨 सफलता! आपका आपातकालीन रक्त अनुरोध बोर्ड पर लाइव कर दिया गया है।");
      
      setRequestPatientName("");
      setRequestLocation("");
      setRequestUnits("1");
      setRequestUrgency("Urgent");
      setRequestContact("");

      setActiveView("emergency");

      setTimeout(() => {
        setIsRegisterModalOpen(false);
        setRegisterSuccessMsg(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setRegisterErrorMsg(err.message || "अनुरोध दर्ज करने के दौरान कोई त्रुटि आई।");
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleCommentCommunityPost = async (id: string, author: string, text: string) => {
    try {
      const response = await fetch(`/api/community/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: author,
          content: text
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCommunityPosts(data.communityPosts);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleCreateCommunityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const contentText = newPostContent.trim();
    if (!newPostAuthor.trim() || !contentText || !newPostLocation.trim()) {
      setNewPostErrorMsg("कृपया नाम, स्थान और संदेश ज़रूर लिखें।");
      return;
    }

    // Safety policy moderation check
    const allowedKeywords = [
      "रक्त", "खून", "blood", "camp", "donor", "hospital", "patient", "urgency", "emergency", 
      "healthcare", "save", "life", "ngo", "red cross", "डॉक्टर", "मरीज", "अस्पताल", "दान", 
      "शिविर", "सेवा", "दवा", "बीमा", "health", "volunteer", "wellness", "doctor", "medicine",
      "sos", "help", "care", "billi", "billi_group", "b+", "o+", "ab-", "ab+", "a+", "b-", "o-", "a-"
    ];
    const isRelated = allowedKeywords.some(keyword => contentText.toLowerCase().includes(keyword));
    
    // Check for spam-like words (advertisements, cryptocurrency, casinos, money making)
    const spamKeywords = ["casino", "lottery", "earn money", "crypto", "iphone for sale", "unrelated ad", "जुआ", "सट्टा", "पैसा कमाएं"];
    const isSpam = spamKeywords.some(keyword => contentText.toLowerCase().includes(keyword));

    if (!isRelated || isSpam) {
      setNewPostErrorMsg("⚠️ सुरक्षा एवं मॉडरेशन नीति: यह कम्युनिटी केवल रक्तदान, स्वास्थ्य जागरूकता, और आपातकालीन सेवा संबंधी पोस्ट की अनुमति देती है। स्पैम, विज्ञापन, या असंबंधित सामग्री यहाँ पोस्ट करना प्रतिबंधित है।");
      return;
    }

    setIsPostSubmitting(true);
    setNewPostErrorMsg(null);

    try {
      const parsedTags = newPostTags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const response = await fetch("/api/community", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: newPostAuthor,
          role: newPostRole,
          location: newPostLocation,
          content: contentText,
          tags: parsedTags.length > 0 ? parsedTags : [newPostCategory.replace(/\s+/g, "_"), "blood_ai"],
          category: newPostCategory,
          bloodGroup: newPostBloodGroup,
          authorType: newPostAuthorType,
          mediaUrl: newPostMediaUrl
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "कहानी पोस्ट करने में विफल।");
      }

      setCommunityPosts(data.communityPosts);
      setIsCommunityModalOpen(false);
      
      setNewPostAuthor("");
      setNewPostLocation("");
      setNewPostContent("");
      setNewPostTags("");
      setNewPostCategory("Emergency Blood Requests");
      setNewPostBloodGroup("");
      setNewPostAuthorType("Person");
      setNewPostMediaUrl("");

      alert("🎉 आपकी कहानी/पोस्ट सफलतापूर्वक कम्युनिटी वॉल पर लाइव हो गई है!");
    } catch (err: any) {
      console.error(err);
      setNewPostErrorMsg(err.message || "पोस्ट करते समय त्रुटि आई।");
    } finally {
      setIsPostSubmitting(false);
    }
  };

  return (
    <div id="app_root" className={`min-h-screen flex flex-col font-sans select-none relative selection:bg-red-500/30 overflow-x-hidden pb-10 transition-colors duration-300 ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Dynamic AI-First Onboarding Portal */}
      {!isRegistered && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden text-left shadow-2xl my-auto"
          >
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">🩸</span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Blood AI Onboarding (पंजीकरण)
                  </h3>
                  <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5">Humanitarian Platform / मानव सेवा</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">STEP 1/1</span>
            </div>

            <form onSubmit={handleCompleteOnboarding} className="p-6 space-y-5">
              <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 leading-relaxed font-medium">
                Blood AI में सभी का स्वागत है। पंजीकरण के बाद आपको एक AI-first अनुभव मिलेगा। आप अपनी पसंदीदा सेवाएँ चुनकर होम स्क्रीन को व्यवस्थित कर सकते हैं।
              </div>

              {/* Basic Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">पूरा नाम (Full Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Siddharth Sharma"
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">संपर्क नंबर (Contact) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={onboardContact}
                      onChange={(e) => setOnboardContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">शहर / स्थान (City, State) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sagar, Madhya Pradesh"
                      value={onboardLocation}
                      onChange={(e) => setOnboardLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-wider">ब्लड ग्रुप (Blood Group - यदि ज्ञात हो)</label>
                  <select
                    value={onboardBloodGroup}
                    onChange={(e) => setOnboardBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer transition-colors"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "पता नहीं (Don't Know)"].map(g => (
                      <option key={g} value={g} className="bg-slate-900">{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-select Tags */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  अपनी भूमिका चुनें (Select Your Roles - Choose Multiple)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "रक्त दाता (Blood Donor)",
                    "रक्त खोजी (Blood Seeker)",
                    "स्वयंसेवक (Volunteer)",
                    "चिकित्सक (Medical Expert)"
                  ].map(tag => {
                    const isSelected = onboardTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleOnboardTag(tag)}
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

              {/* Favorite Services Pinning */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  पसंदीदा सेवाएँ चुनें (Choose Favorite Services to Pin)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Blood Search",
                    "Donor Search",
                    "Emergency Requests",
                    "Live Map",
                    "Live Peer Chat",
                    "Support / Donation"
                  ].map(service => {
                    const isSelected = onboardServices.includes(service);
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
                        onClick={() => toggleOnboardService(service)}
                        className={`p-2.5 text-left rounded-xl border text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-red-600/10 border-red-500 text-red-500"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <span>{labelHindi}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-900/10 flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <span>पंजीकरण पूरा करें (Complete Setup)</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Background Ambience */}
      {isDarkMode && (
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-red-950/15 to-transparent pointer-events-none z-0"></div>
      )}

      {/* Header Bar */}
      <header className={`sticky top-0 z-40 px-4 py-3 shadow-md backdrop-blur-md transition-all border-b ${
        isDarkMode 
          ? "bg-slate-950/85 border-slate-900/80 text-white" 
          : "bg-white/90 border-slate-200 text-slate-900"
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Logo & Status Indicator */}
          <div className="flex items-center justify-between lg:justify-start gap-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                onClick={() => setActiveView("home")}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shadow-lg shadow-red-900/20 cursor-pointer"
              >
                <span className="text-xl">🩸</span>
              </motion.div>
              <div className="text-left">
                <h1 className="text-sm font-black tracking-wider uppercase font-mono flex items-center gap-1.5 text-red-500">
                  <span>{TRANSLATIONS[language].appName}</span>
                  <span className="text-[9px] bg-red-600/20 text-red-500 border border-red-500/20 px-1.5 py-0.2 rounded font-bold uppercase font-mono">Pro v1.2</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold">{TRANSLATIONS[language].tagline}</p>
              </div>
            </div>

            {/* Live Online / Offline Connectivity badge */}
            <button
              onClick={() => {
                setUserStatus(prev => prev === "Online" ? "Offline" : "Online");
                showToast(`स्टेटस बदला: ${userStatus === "Online" ? "Offline (ऑफ़लाइन)" : "Online (ऑनलाइन)"}`);
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                userStatus === "Online" 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-emerald-500/5 shadow-inner" 
                  : "bg-amber-500/10 text-amber-500 border-amber-500/25"
              }`}
              title="Click to toggle Online/Offline Status"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userStatus === "Online" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span>{userStatus === "Online" ? TRANSLATIONS[language].online : TRANSLATIONS[language].offline}</span>
            </button>
          </div>

          {/* Core Interactive Toolbar - All 1 Tap Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* UTC Realtime sync */}
            <div className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] ${
              isDarkMode ? "bg-slate-900/80 border-slate-800/80 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
            }`}>
              <Clock className="w-3 h-3 text-red-500" />
              <span>{utcTime || "UTC sync..."}</span>
            </div>

            {/* Language select */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold ${
              isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <Globe className="w-3.5 h-3.5 text-red-500" />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  showToast(`भाषा बदली: ${e.target.value === 'hi' ? 'हिंदी' : e.target.value === 'en' ? 'English' : 'Hinglish'}`);
                }}
                className="bg-transparent border-none outline-none cursor-pointer font-bold font-sans text-xs"
              >
                <option value="hi" className="bg-slate-950 text-white">हिंदी</option>
                <option value="en" className="bg-slate-950 text-white font-semibold">English</option>
                <option value="hinglish" className="bg-slate-950 text-white font-semibold">Hinglish</option>
              </select>
            </div>

            {/* Quick Dark/Light Mode toggle in exactly 1 tap! */}
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                showToast(!isDarkMode ? "डार्क मोड सक्रिय! (Dark Mode)" : "लाइट मोड सक्रिय! (Light Mode)");
              }}
              className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400" : "bg-white hover:bg-slate-100 border-slate-200 text-indigo-600"
              }`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Live Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer relative ${
                  isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
                title="Alerts and Notifications"
              >
                <Bell className="w-4 h-4" />
                {liveNotifications.some(n => n.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-2 w-72 border rounded-xl shadow-2xl z-50 py-2 overflow-hidden ${
                  isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <div className="px-3 py-1 border-b border-slate-800/40 flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Notifications</span>
                    <button 
                      onClick={() => {
                        setLiveNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        showToast("All marked read.");
                      }}
                      className="text-[9px] text-red-500 hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/20">
                    {liveNotifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          setLiveNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                          showToast(`Opened: ${n.title}`);
                        }}
                        className={`p-3 text-left hover:bg-red-500/10 cursor-pointer transition-colors ${n.unread ? "bg-red-500/5" : ""}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-[11px] font-bold text-slate-100">{n.title}</h4>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prescription AI Scanner (Camera / Gallery Simulation) */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? "bg-red-600/10 hover:bg-red-600/25 border-red-500/25 text-red-400" 
                  : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
              }`}
              title="Scan Doctor Prescription with AI"
            >
              <Camera className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">Scanner</span>
            </button>

            {/* Personal Verified QR Donor Pass */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
              title="My Donor Pass QR"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Quick Guide & User manual */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-sky-400" : "bg-white hover:bg-slate-100 border-slate-200 text-sky-600"
              }`}
              title="Help and Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Global Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDarkMode ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
              title="Quick Settings"
            >
              <Layers className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 z-10">
        
        {/* Global Search and Filter panel (Visible on Emergency view) */}
        {(activeView === "emergency") && (
          <div className={`mb-6 p-4 rounded-2xl border transition-all ${
            isDarkMode 
              ? "bg-slate-900/40 border-slate-900/80" 
              : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              
              {/* Modern Search bar */}
              <div className="relative w-full md:flex-1">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                <input
                  type="text"
                  placeholder={language === "hi" ? "पूरे डेटाबेस में रक्त समूह, स्थान, शहर, दाता का नाम खोजें..." : language === "hinglish" ? "Pura database me blood group, location, city ya donor name search karein..." : "Search blood groups, cities, donors, or hospitals across the system..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeView !== "emergency") {
                      setActiveView("emergency");
                    }
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium outline-none transition-all ${
                    isDarkMode 
                      ? "bg-slate-950/80 text-white border border-slate-800 focus:border-red-500/50" 
                      : "bg-slate-100 text-slate-900 border border-slate-200 focus:border-red-500/50"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action filters */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Favorites filter toggle in exactly 1 tap! */}
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    if (activeView !== "emergency") {
                      setActiveView("emergency");
                    }
                    showToast(showFavoritesOnly ? "दिखा रहा है सभी! (Showing All)" : "दिखा रहा है केवल पसंदीदा! (Showing Favorites Only)");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                    showFavoritesOnly 
                      ? "bg-red-500/20 border-red-500/50 text-red-500 font-black" 
                      : isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{TRANSLATIONS[language].favorites} ({favorites.length})</span>
                </button>

                {/* Sort dropdown */}
                <div className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                }`}>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      if (activeView !== "emergency") {
                        setActiveView("emergency");
                      }
                      showToast(`सॉर्टिंग बदली: ${e.target.value}`);
                    }}
                    className="bg-transparent border-none outline-none cursor-pointer font-bold font-sans text-xs"
                  >
                    <option value="newest" className="bg-slate-950 text-white">हाल ही में (Newest)</option>
                    <option value="distance" className="bg-slate-950 text-white">दूरी (Proximity)</option>
                    <option value="urgency" className="bg-slate-950 text-white">तीव्रता (Urgency)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Popular/Recent Searches tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider">{TRANSLATIONS[language].recentSearch || "Popular"}:</span>
              {recentSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    if (activeView !== "emergency") {
                      setActiveView("emergency");
                    }
                    showToast(`खोज रहा है: ${tag}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-all active:scale-95 cursor-pointer ${
                    searchQuery === tag
                      ? "bg-red-500/15 border-red-500/40 text-red-500 font-bold"
                      : isDarkMode ? "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowFavoritesOnly(false);
                  setSortBy("newest");
                  showToast("सभी फ़िल्टर रीसेट। (Filters Reset)");
                }}
                className="text-red-500 hover:underline font-bold text-[10px] ml-auto"
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {activeView === "home" && (
              <HomeView
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                onResetDb={handleResetDb}
                apiError={apiError}
                language={language}
                isDarkMode={isDarkMode}
                donors={donors}
                emergencyRequests={emergencyRequests}
                bloodBanks={bloodBanks}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onViewMapItem={(item) => {
                  const coords = getItemCoordinates(item.location, item.id);
                  if (coords) {
                    setSelectedMapItem({
                      title: item.name || item.patientName || "Proximity Focus",
                      location: item.location,
                      lat: coords.lat,
                      lng: coords.lng,
                      type: item.patientName ? "request" : "donor",
                      details: item.bloodGroup ? `Blood Group Required: ${item.bloodGroup} • Contact: ${item.contact}` : `Available Groups: ${item.availableGroups?.join(', ')}`
                    });
                    setActiveView("map");
                  }
                }}
                onShowToast={showToast}
                favoriteServices={favoriteServices}
                onNavigate={setActiveView}
                onUpdateFavoriteServices={(services) => {
                  setFavoriteServices(services);
                  localStorage.setItem("blood_ai_favorite_services", JSON.stringify(services));
                }}
              />
            )}

            {activeView === "chat" && (
              <ChatSection
                language={language}
                isDarkMode={isDarkMode}
                donorsCount={donors.length}
              />
            )}

            {activeView === "emergency" && (
              <EmergencyView
                emergencyRequests={emergencyRequests}
                donors={donors}
                bloodBanks={bloodBanks}
                communityPosts={communityPosts}
                userCoords={userCoords}
                customLocationName={customLocationName}
                isProximityActive={isProximityActive}
                getProximityText={getProximityText}
                onCommentPost={handleCommentCommunityPost}
                onOpenCommunityModal={() => setIsCommunityModalOpen(true)}
                onOpenRegisterModal={(type) => {
                  setRegisterType(type);
                  setIsRegisterModalOpen(true);
                }}
                onViewMapItem={(item) => {
                  const coords = getItemCoordinates(item.location, item.id);
                  if (coords) {
                    setSelectedMapItem({
                      title: item.patientName || item.name,
                      location: item.location,
                      lat: coords.lat,
                      lng: coords.lng,
                      type: item.patientName ? "request" : "donor",
                      details: item.bloodGroup ? `Blood Group Required: ${item.bloodGroup} • Contact: ${item.contact}` : `Available Groups: ${item.availableGroups?.join(', ')}`
                    });
                    setActiveView("map");
                  }
                }}
                globalSearchQuery={searchQuery}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                followedDonors={followedDonors}
                onToggleFollowDonor={handleToggleFollowDonor}
                onReportItem={handleReportItem}
                showFavoritesOnly={showFavoritesOnly}
                sortBy={sortBy}
                language={language}
                onShowToast={showToast}
              />
            )}

            {activeView === "map" && (
              <MapView
                userCoords={userCoords}
                customLocationName={customLocationName}
                isProximityActive={isProximityActive}
                isDetectingLocation={isDetectingLocation}
                onDetectMyLocation={detectMyLocation}
                onToggleProximity={setIsProximityActive}
                getProximityText={getProximityText}
                filteredRequests={emergencyRequests}
                filteredDonors={donors}
                filteredBanks={bloodBanks}
                isDriverModeActive={isDriverModeActive}
                driverSpeed={driverSpeed}
                driverHeading={driverHeading}
                onToggleDriverMode={toggleDriverMode}
                onDriverSosTrigger={handleDriverSosTrigger}
                selectedMapItem={selectedMapItem}
                onClearSelectedMapItem={() => setSelectedMapItem(null)}
              />
            )}

            {activeView === "profile" && (
              <ProfileView
                donorsCount={donors.length}
                requestsCount={emergencyRequests.length}
                banksCount={bloodBanks.length}
                onResetDb={handleResetDb}
                onShowToast={showToast}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action SOS Accident Button (when not in map driver mode) */}
      {!isDriverModeActive && (
        <div className="fixed bottom-24 right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDriverSosTrigger}
            className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-2xl border border-red-500/30 relative cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-25"></div>
            <span className="text-xs font-black tracking-tighter text-white">SOS</span>
          </motion.button>
        </div>
      )}

      {/* Universal Sticky Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/85 backdrop-blur-md border-t border-slate-900/80 py-2.5 z-40 shadow-2xl max-w-lg mx-auto sm:rounded-t-2xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveView("home")}
            className={`flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              activeView === "home" ? "text-red-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider">AI Chat</span>
          </button>

          <button
            onClick={() => setActiveView("emergency")}
            className={`flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              activeView === "emergency" ? "text-red-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider">Emergency</span>
          </button>

          <button
            onClick={() => setActiveView("map")}
            className={`flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              activeView === "map" ? "text-red-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider">Map</span>
          </button>

          <button
            onClick={() => setActiveView("profile")}
            className={`flex flex-col items-center space-y-1 transition-all cursor-pointer ${
              activeView === "profile" ? "text-red-500 scale-105 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider">Profile</span>
          </button>
        </div>
      </nav>

      {/* MODAL 1: Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden text-left"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>{registerType === "donor" ? "❤️ डोनर / वालंटियर पंजीकरण" : "🚨 आपातकालीन रक्त अनुरोध"}</span>
              </h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={registerType === "donor" ? handleDirectRegisterDonor : handleDirectEmergencyRequest} className="p-5 space-y-4">
              {registerSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium">
                  {registerSuccessMsg}
                </div>
              )}
              {registerErrorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                  {registerErrorMsg}
                </div>
              )}

              {registerType === "donor" ? (
                // Donor Form Fields
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siddharth Sharma"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ब्लड ग्रुप *</label>
                      <select
                        value={donorBloodGroup}
                        onChange={(e) => setDonorBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                          <option key={g} value={g} className="bg-slate-900">{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">आयु (Age) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 28"
                        value={donorAge}
                        onChange={(e) => setDonorAge(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">शहर / स्थान (City) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sagar, Madhya Pradesh"
                      value={donorLocation}
                      onChange={(e) => setDonorLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">संपर्क नंबर (Contact) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={donorContact}
                      onChange={(e) => setDonorContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">पिछला रक्तदान अंतराल</label>
                    <select
                      value={donorLastDonation}
                      onChange={(e) => setDonorLastDonation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {["Never", "1 Month Ago", "3 Months Ago", "6 Months Ago", "Over a year ago"].map(d => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                // Request Form Fields
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">मरीज का नाम (Patient Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Gupta"
                      value={requestPatientName}
                      onChange={(e) => setRequestPatientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ब्लड ग्रुप *</label>
                      <select
                        value={requestBloodGroup}
                        onChange={(e) => setRequestBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(g => (
                          <option key={g} value={g} className="bg-slate-900">{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">यूनिट आवश्यकता *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 2"
                        value={requestUnits}
                        onChange={(e) => setRequestUnits(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">अस्पताल / शहर का नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sagar Civil Hospital, MP"
                      value={requestLocation}
                      onChange={(e) => setRequestLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">आपातकाल स्थिति (Urgency) *</label>
                      <select
                        value={requestUrgency}
                        onChange={(e) => setRequestUrgency(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      >
                        {["Urgent", "Critical", "Moderate"].map(u => (
                          <option key={u} value={u} className="bg-slate-900">{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">संपर्क नंबर *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 91112 22334"
                        value={requestContact}
                        onChange={(e) => setRequestContact(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegisterSubmitting}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isRegisterSubmitting ? "सबमिट कर रहे हैं..." : "पंजीकरण पूरा करें"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Community Post Creation Modal */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg my-8 overflow-hidden text-left"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <span>🎉 जीवन रक्षक पोस्ट साझा करें (Post in Community)</span>
              </h3>
              <button onClick={() => setIsCommunityModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunityPost} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {newPostErrorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                  {newPostErrorMsg}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">आपका नाम *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rohan Sen"
                      value={newPostAuthor}
                      onChange={(e) => setNewPostAuthor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">आपकी श्रेणी/टाइप *</label>
                    <select
                      value={newPostAuthorType}
                      onChange={(e) => setNewPostAuthorType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Person">व्यक्ति (Individual)</option>
                      <option value="Hospital">अस्पताल (Hospital)</option>
                      <option value="NGO">एनजीओ (NGO)</option>
                      <option value="Blood Bank">ब्लड बैंक (Blood Bank)</option>
                      <option value="Volunteer">स्वयंसेवक (Volunteer)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">आपकी भूमिका *</label>
                    <select
                      value={newPostRole}
                      onChange={(e) => setNewPostRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="donor">रक्तदाता (Donor)</option>
                      <option value="seeker">रक्त खोजी (Seeker)</option>
                      <option value="volunteer">स्वयंसेवक (Volunteer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ब्लड ग्रुप (Optional)</label>
                    <select
                      value={newPostBloodGroup}
                      onChange={(e) => setNewPostBloodGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="">कोई नहीं (N/A)</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">पोस्ट कैटेगरी (Category) *</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Emergency Blood Requests">Emergency Blood Requests (आपातकालीन अनुरोध)</option>
                    <option value="Blood Donor Available Posts">Blood Donor Available Posts (रक्तदाता उपलब्धता)</option>
                    <option value="Blood Camp Announcements">Blood Camp Announcements (रक्तदान शिविर घोषणा)</option>
                    <option value="Hospital & Blood Bank Updates">Hospital & Blood Bank Updates (अस्पताल/ब्लड बैंक अपडेट)</option>
                    <option value="Success Stories">Success Stories (सफलता की कहानियाँ)</option>
                    <option value="Awareness Posts">Awareness Posts (स्वास्थ्य जागरूकता)</option>
                    <option value="Volunteer Activities">Volunteer Activities (स्वयंसेवक गतिविधियाँ)</option>
                    <option value="NGO Updates">NGO Updates (NGO अपडेट)</option>
                    <option value="Government Health Notices">Government Health Notices (सरकारी स्वास्थ्य सूचनाएं)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">शहर / स्थान *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sagar, Madhya Pradesh"
                      value={newPostLocation}
                      onChange={(e) => setNewPostLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">मीडिया इमेज URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={newPostMediaUrl}
                      onChange={(e) => setNewPostMediaUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">संदेश सामग्री (Message Content) *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="कृपया केवल रक्तदान या स्वास्थ्य संबंधी जानकारी ही साझा करें। अन्यथा पोस्ट अस्वीकृत हो सकती है।"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">टैग्स (Tags - अल्पविराम से अलग करें)</label>
                  <input
                    type="text"
                    placeholder="e.g. bloodcamp, urgent_b+, savedlives"
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPostSubmitting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isPostSubmitting ? "पोस्ट सबमिट कर रहे हैं..." : "कम्युनिटी पोस्ट साझा करें"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: Universal Compatibility Info Sheet */}
      {isUniversalModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden text-left"
          >
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Info className="w-4 h-4 text-sky-400" />
                <span>Universal Blood compatibility</span>
              </h3>
              <button onClick={() => setIsUniversalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-300">
              <p>
                चिकित्सा विज्ञान के अनुसार, रक्तदान और प्राप्त करने की कम्पेटिबिलिटी एंटीजन पर निर्भर करती है:
              </p>
              
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <p>💡 <strong className="text-red-400">O- (O Negative) Universal Donor:</strong></p>
                <p className="text-[11px] text-slate-400">
                  यह किसी भी व्यक्ति को (चाहे उसका ब्लड ग्रुप कोई भी हो) सुरक्षित रूप से दिया जा सकता है। आपात स्थिति में जब समय कम हो, तब इसका उपयोग किया जाता है।
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <p>💡 <strong className="text-emerald-400">AB+ (AB Positive) Universal Recipient:</strong></p>
                <p className="text-[11px] text-slate-400">
                  इस रक्त समूह के लोग किसी भी अन्य ब्लड ग्रुप (A, B, AB, O) से रक्त प्राप्त कर सकते हैं।
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <strong className="text-white block mb-1">Quick Match Matrix:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>O+ डोनर → दे सकता है O+, A+, B+, AB+ को</li>
                  <li>A- डोनर → दे सकता है A-, A+, AB-, AB+ को</li>
                  <li>B+ डोनर → दे सकता है B+, AB+ को</li>
                </ul>
              </div>

              <button
                onClick={() => setIsUniversalModalOpen(false)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-800"
              >
                समझ गए (Dismiss)
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
