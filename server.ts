import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Mock Database Structure
interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  contact: string;
  age: number;
  lastDonation: string;
}

interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  location: string;
  units: number;
  urgency: string;
  contact: string;
  createdAt: string;
}

interface BloodBank {
  id: string;
  name: string;
  location: string;
  address: string;
  contact: string;
  availableGroups: string[];
}

// Pre-seeded Data
let donors: Donor[] = [
  {
    id: "d1",
    name: "Rohan Sharma",
    bloodGroup: "O+",
    location: "Delhi",
    contact: "+91 98765 43210",
    age: 28,
    lastDonation: "4 months ago",
  },
  {
    id: "d2",
    name: "Priya Patel",
    bloodGroup: "B-",
    location: "Mumbai",
    contact: "+91 87654 32109",
    age: 24,
    lastDonation: "6 months ago",
  },
  {
    id: "d3",
    name: "Amit Singh",
    bloodGroup: "O-",
    location: "Bengaluru",
    contact: "+91 76543 21098",
    age: 32,
    lastDonation: "2 months ago",
  },
  {
    id: "d4",
    name: "Sneha Reddy",
    bloodGroup: "A+",
    location: "Hyderabad",
    contact: "+91 91234 56789",
    age: 29,
    lastDonation: "5 months ago",
  },
  {
    id: "d5",
    name: "Vikram Malhotra",
    bloodGroup: "AB-",
    location: "Delhi",
    contact: "+91 95432 10987",
    age: 35,
    lastDonation: "8 months ago",
  },
  {
    id: "d6",
    name: "Ananya Verma",
    bloodGroup: "O+",
    location: "Noida",
    contact: "+91 99887 76655",
    age: 27,
    lastDonation: "Never",
  },
  {
    id: "d7",
    name: "Rajesh Kumar",
    bloodGroup: "B+",
    location: "Mumbai",
    contact: "+91 98234 56712",
    age: 41,
    lastDonation: "3 months ago",
  },
  {
    id: "d8",
    name: "Siddharth Sen",
    bloodGroup: "A-",
    location: "Kolkata",
    contact: "+91 98300 12345",
    age: 31,
    lastDonation: "7 months ago",
  }
];

let emergencyRequests: EmergencyRequest[] = [
  {
    id: "r1",
    patientName: "Ramesh Gupta",
    bloodGroup: "B+",
    location: "Delhi",
    units: 2,
    urgency: "Urgent",
    contact: "+91 98112 23344",
    createdAt: new Date().toLocaleDateString(),
  },
  {
    id: "r2",
    patientName: "Baby of Meera",
    bloodGroup: "O-",
    location: "Mumbai",
    units: 1,
    urgency: "Critical",
    contact: "+91 93221 12233",
    createdAt: new Date().toLocaleDateString(),
  }
];

const bloodBanks: BloodBank[] = [
  {
    id: "b1",
    name: "Red Cross Blood Bank",
    location: "Delhi",
    address: "Connaught Place, New Delhi",
    contact: "+91 11 2371 6441",
    availableGroups: ["O+", "A+", "B+", "AB+", "O-"],
  },
  {
    id: "b2",
    name: "Lifeline Blood Center",
    location: "Mumbai",
    address: "Andheri West, Mumbai",
    contact: "+91 22 2630 1122",
    availableGroups: ["O-", "B-", "AB-", "O+"],
  },
  {
    id: "b3",
    name: "Rotary Bangalore Blood Bank",
    location: "Bengaluru",
    address: "Shivajinagar, Bengaluru",
    contact: "+91 80 2528 8214",
    availableGroups: ["O+", "A+", "B+", "AB+", "A-", "B-"],
  },
  {
    id: "b4",
    name: "Apollo Hospital Blood Bank",
    location: "Hyderabad",
    address: "Jubilee Hills, Hyderabad",
    contact: "+91 40 2360 7777",
    availableGroups: ["O+", "A-", "B+", "AB-"],
  },
  {
    id: "b5",
    name: "Kolkata Blood Bank",
    location: "Kolkata",
    address: "Salt Lake, Sector 2, Kolkata",
    contact: "+91 33 2334 5678",
    availableGroups: ["A+", "B+", "AB+", "O+"],
  }
];

interface CommunityComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommunityPost {
  id: string;
  authorName: string;
  role: 'donor' | 'seeker' | 'volunteer' | 'moderator';
  location: string;
  content: string;
  likes: number;
  comments: CommunityComment[];
  createdAt: string;
  tags?: string[];
  category?: string;
  bloodGroup?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  authorType?: 'Person' | 'Hospital' | 'NGO' | 'Blood Bank' | 'Volunteer';
  dislikes?: number;
  reportsCount?: number;
}

let communityPosts: CommunityPost[] = [
  {
    id: "p1",
    authorName: "Ramesh Gupta",
    role: "seeker",
    location: "Noida",
    content: "🚨 आपातकालीन अनुरोध (EMERGENCY): फोर्टिस अस्पताल नोएडा में कार्डियक सर्जरी के लिए तत्काल B- (B Negative) रक्त की 3 यूनिट की आवश्यकता है। मरीज: श्रीमती कमलेश देवी। कृपया हमसे तुरंत संपर्क करें या शेयर करें!",
    likes: 34,
    comments: [
      {
        id: "c1",
        authorName: "Siddharth Sen",
        content: "मैंने अपनी टीम के 2 B- डोनर्स को सूचित कर दिया है, वे जल्द ही संपर्क करेंगे। 🙏",
        createdAt: "10 मिनट पहले"
      }
    ],
    createdAt: "आज सुबह 09:30",
    tags: ["आपातकालीन", "Noida", "B_Negative"],
    category: "Emergency Blood Requests",
    bloodGroup: "B-",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    authorType: "Person",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p2",
    authorName: "Rohan Sharma",
    role: "donor",
    location: "Delhi",
    content: "रक्तदाता उपलब्ध (DONOR AVAILABLE): मैं एक सक्रिय स्वैच्छिक रक्तदाता हूँ। मेरा रक्त समूह O- (यूनिवर्सल डोनर) है। मैं दिल्ली एनसीआर में किसी भी आपात स्थिति में रक्तदान करने के लिए तैयार हूँ। मेरा अंतिम रक्तदान 4 महीने पहले हुआ था।",
    likes: 21,
    comments: [],
    createdAt: "आज सुबह 10:15",
    tags: ["रक्तदाता", "Delhi", "Universal_Donor"],
    category: "Blood Donor Available Posts",
    bloodGroup: "O-",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80",
    authorType: "Volunteer",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p3",
    authorName: "Red Cross Noida Division",
    role: "volunteer",
    location: "Noida",
    content: "🏫 स्वैच्छिक रक्तदान शिविर (MEGA BLOOD DONATION CAMP): अगले रविवार (12 जुलाई 2026) को नोएडा सेक्टर 62 में सुबह 9:00 बजे से शाम 5:00 बजे तक एक विशाल स्वैच्छिक रक्तदान शिविर आयोजित किया जा रहा है। सभी रक्तदाताओं को सत्कार, जूस, प्रमाणपत्र और एक विशेष लाइफ-सेवर डोनर कार्ड प्रदान किया जाएगा। कृपया इस महादान में भाग लें!",
    likes: 45,
    comments: [],
    createdAt: "कल शाम 06:12",
    tags: ["रक्तदान_शिविर", "Noida", "RedCross"],
    category: "Blood Camp Announcements",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=100&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1615461066841-6116ecdacd04?auto=format&fit=crop&w=600&q=80",
    mediaType: "image",
    authorType: "NGO",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p4",
    authorName: "Apollo Hospital Delhi",
    role: "moderator",
    location: "Delhi",
    content: "🏥 अस्पताल ब्लड बैंक अपडेट (HOSPITAL UPDATE): हमारे ब्लड बैंक में इस समय A+, B+, और O+ रक्त की पर्याप्त आपूर्ति है। हालांकि, दुर्लभ नेगेटिव ग्रुप (O-, AB-, A-) की भारी कमी चल रही है। इन ग्रुप्स के स्वस्थ लोगों से अनुरोध है कि वे आज ही अपोलो अस्पताल आकर रक्तदान करें। फोन: +91 11 2692 5858.",
    likes: 28,
    comments: [],
    createdAt: "कल दोपहर 12:40",
    tags: ["Apollo", "Delhi", "Rare_Groups"],
    category: "Hospital & Blood Bank Updates",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=100&q=80",
    authorType: "Hospital",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p5",
    authorName: "Amit Verma",
    role: "seeker",
    location: "Mumbai",
    content: "💖 सफलता की कहानी (SUCCESS STORY): मेरी माताजी के सफल हार्ट सर्जरी के लिए आधी रात को मुंबई के डोनर आकाश भाई ने आकर AB- रक्त दान किया। ब्लड AI कम्युनिटी और आकाश भाई को दिल से बहुत-बहुत धन्यवाद! आप लोगों ने हमारी अमूल्य जान बचाई।",
    likes: 92,
    comments: [
      {
        id: "c2",
        authorName: "Priya Patel",
        content: "यह सुनकर अत्यंत खुशी हुई! माताजी के शीघ्र स्वस्थ होने की कामना करते हैं।",
        createdAt: "कल रात 08:30"
      }
    ],
    createdAt: "2 दिन पहले",
    tags: ["सफलता_कहानी", "Mumbai", "LifeSaved"],
    category: "Success Stories",
    bloodGroup: "AB-",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    mediaType: "image",
    authorType: "Person",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p6",
    authorName: "Dr. Anjali Mehta",
    role: "moderator",
    location: "Mumbai",
    content: "💡 स्वास्थ्य जागरूकता (HEALTH AWARENESS): क्या आप जानते हैं? एक बार रक्तदान करने से आप 3 लोगों की जान बचा सकते हैं! इसके अलावा, नियमित रक्तदान से रक्तदाताओं में हृदय रोग का खतरा कम होता है और शरीर में नई लाल रक्त कोशिकाएं (RBCs) बनती हैं जो ऊर्जा को बढ़ाती हैं।",
    likes: 67,
    comments: [],
    createdAt: "3 दिन पहले",
    tags: ["स्वास्थ्य_टिप्स", "Awareness", "रक्तदान_फायदे"],
    category: "Awareness Posts",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80",
    authorType: "Volunteer",
    dislikes: 0,
    reportsCount: 0
  },
  {
    id: "p7",
    authorName: "Pune Youth Blood Association",
    role: "volunteer",
    location: "Pune",
    content: "🤝 स्वयंसेवक गतिविधि (VOLUNTEER ACTIVITY): हमारे युवा स्वयंसेवकों की टीम ने आज पुणे विश्वविद्यालय परिसर में एक जागरूकता मार्च और संगोष्ठी का आयोजन किया। आज के दिन में ही 120 नए युवाओं ने 'ब्लड AI' पर आपातकालीन दाता के रूप में पंजीकरण कराया है। गर्व है हमारी टीम पर!",
    likes: 38,
    comments: [],
    createdAt: "4 दिन पहले",
    tags: ["YouthPower", "Pune", "Volunteers"],
    category: "Volunteer Activities",
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=100&q=80",
    authorType: "NGO",
    dislikes: 0,
    reportsCount: 0
  }
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // API to retrieve database state
  app.get("/api/db", (req, res) => {
    res.json({ donors, emergencyRequests, bloodBanks, communityPosts });
  });

  // GET community posts
  app.get("/api/community", (req, res) => {
    res.json(communityPosts);
  });

  // POST new community post
  app.post("/api/community", (req, res) => {
    try {
      const { authorName, role, location, content, tags, category, bloodGroup, authorType, mediaUrl } = req.body;
      if (!authorName || !content || !location) {
        return res.status(400).json({ error: "नाम, स्थान और संदेश भरना अनिवार्य है।" });
      }
      const newPost: CommunityPost = {
        id: "p_" + Date.now(),
        authorName,
        role: role || "donor",
        location,
        content,
        likes: 0,
        comments: [],
        createdAt: "अभी-अभी",
        tags: tags || [],
        category: category || "Awareness Posts",
        bloodGroup: bloodGroup || "",
        authorType: authorType || "Person",
        isVerified: false,
        mediaUrl: mediaUrl || "",
        mediaType: mediaUrl ? "image" : undefined,
        dislikes: 0,
        reportsCount: 0
      };
      communityPosts.unshift(newPost);
      res.json({ success: true, communityPosts });
    } catch (err: any) {
      res.status(500).json({ error: "पोस्ट करने में विफलता।", details: err.message });
    }
  });

  // POST like a community post
  app.post("/api/community/:id/like", (req, res) => {
    try {
      const { id } = req.params;
      const post = communityPosts.find(p => p.id === id);
      if (post) {
        post.likes += 1;
        return res.json({ success: true, communityPosts });
      }
      res.status(404).json({ error: "पोस्ट नहीं मिला।" });
    } catch (err: any) {
      res.status(500).json({ error: "लाइक करने में त्रुटि आई।", details: err.message });
    }
  });

  // POST comment on a community post
  app.post("/api/community/:id/comment", (req, res) => {
    try {
      const { id } = req.params;
      const { authorName, content } = req.body;
      if (!authorName || !content) {
        return res.status(400).json({ error: "नाम और टिप्पणी देना अनिवार्य है।" });
      }
      const post = communityPosts.find(p => p.id === id);
      if (post) {
        const newComment: CommunityComment = {
          id: "c_" + Date.now(),
          authorName,
          content,
          createdAt: "अभी-अभी"
        };
        post.comments.push(newComment);
        return res.json({ success: true, communityPosts });
      }
      res.status(404).json({ error: "पोस्ट नहीं मिला।" });
    } catch (err: any) {
      res.status(500).json({ error: "टिप्पणी पोस्ट करने में त्रुटि आई।", details: err.message });
    }
  });

  // API to handle conversational Chat with Gemini
  app.post("/api/chat", async (req, res) => {
    const { message = "", history = [] } = req.body || {};

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "Gemini API key is not configured in the environment. Please configure it in Settings > Secrets.",
        });
      }

      // Convert standard client-side chat history to GenAI contents structure
      const contents = history.map((h: any) => {
        return {
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: typeof h.text === "string" ? h.text : JSON.stringify(h.text) }],
        };
      });

      // Add the current message
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const systemInstruction = `You are 'Blood AI' (रक्त AI), a compassionate, professional conversational AI assistant designed to streamline blood search, donor registration, blood bank location, and medical guidance.
You communicate beautifully in the language the user is speaking (Hindi, Hinglish, English, etc.).
Your primary directive is to understand user intent:
1. If the user wants blood (e.g. "I need O+ blood", "O+ रक्त चाहिए"):
   - Extract: Blood Group, Location (e.g. Delhi, Mumbai), Units, and Urgency (Urgent, Critical, Normal).
   - If missing critical info (like blood group or location), ask the user for it warmly.
   - Once you have the info, invoke the SEARCH_BLOOD action to search donors and blood banks.
2. If the user wants to donate or register as a donor (e.g. "रक्तदान करना चाहता हूँ", "I want to donate"):
   - Ask for: Name, Blood Group, Age, Contact details, Location, and Last Donation details.
   - If they are eligible (usually age 18-65, last donation > 3 months ago), invoke REGISTER_DONOR. If not eligible, explain kindly.
3. If they want to create an active emergency blood request card on the public board:
   - Ask for: Patient Name, Blood Group, Location, Units, Urgency, Contact.
   - Once details are present, invoke EMERGENCY_REQUEST.
4. If they ask a general medical or compatibility question (e.g. "Universal donor", "कौन किसे खून दे सकता है"):
   - Answer scientifically yet simply. You can trigger MEDICAL_INFO action.

You must respond with a strictly formatted JSON object matching the requested schema. If no database transaction is needed, set the action type to "NONE".

Current database summary for your context (CRITICAL: These lists are dynamic. Use them to answer searches or provide specific details of newly registered donors and patient requests):
- Pre-seeded locations available: Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Noida, and any custom location.
- Active Donors and Volunteers in directory:
${donors.map(d => `  * ${d.name} (Blood Group: ${d.bloodGroup}, Location: ${d.location}, Contact: ${d.contact}, Age: ${d.age}, Last Donation: ${d.lastDonation})`).slice(0, 30).join("\n")}
- Active Emergency Blood Requests:
${emergencyRequests.map(r => `  * Patient: ${r.patientName} (Blood Group: ${r.bloodGroup}, Location: ${r.location}, Units: ${r.units}, Urgency: ${r.urgency}, Contact: ${r.contact}, Date: ${r.createdAt})`).slice(0, 30).join("\n")}
- Blood Banks:
${bloodBanks.map(b => `  * ${b.name} (${b.availableGroups.join(", ")} available, Address: ${b.address}, Location: ${b.location}, Contact: ${b.contact})`).join("\n")}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Your text reply to the user in their preferred language. Empathize with emergency requests.",
              },
              action: {
                type: Type.OBJECT,
                description: "Optional database command based on user statement.",
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "One of: SEARCH_BLOOD, REGISTER_DONOR, EMERGENCY_REQUEST, MEDICAL_INFO, NONE",
                  },
                  params: {
                    type: Type.OBJECT,
                    description: "Properties extracted from conversation.",
                    properties: {
                      bloodGroup: { type: Type.STRING, description: "e.g. 'O+', 'B-', 'AB+'" },
                      location: { type: Type.STRING, description: "e.g. 'Delhi', 'Mumbai'" },
                      units: { type: Type.NUMBER, description: "Number of units requested" },
                      name: { type: Type.STRING, description: "Name of donor or patient" },
                      age: { type: Type.NUMBER, description: "Age of donor" },
                      contact: { type: Type.STRING, description: "Phone number/Contact of donor or patient" },
                      urgency: { type: Type.STRING, description: "Urgent, Critical, or Normal" },
                      lastDonation: { type: Type.STRING, description: "e.g. 'Never', '3 months ago'" }
                    },
                  },
                },
              },
            },
            required: ["reply"],
          },
        },
      });

      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText.trim());

      // Server side database execution based on AI Action
      if (result.action && result.action.type !== "NONE") {
        const { type, params } = result.action;

        if (type === "REGISTER_DONOR" && params) {
          const newDonor: Donor = {
            id: "d_" + Date.now(),
            name: params.name || "Anonymous Donor",
            bloodGroup: params.bloodGroup?.toUpperCase() || "O+",
            location: params.location || "Unknown",
            contact: params.contact || "+91 XXXXX XXXXX",
            age: params.age || 25,
            lastDonation: params.lastDonation || "Never",
          };
          donors.unshift(newDonor); // Add to the top
          result.reply += `\n\n❤️ **डोनर प्रोफ़ाइल सफलतापूर्वक पंजीकृत!** आप अब हमारे 'सत्यापित डोनर्स' बोर्ड पर सूचीबद्ध हैं। धन्यवाद!`;
        } else if (type === "EMERGENCY_REQUEST" && params) {
          const newReq: EmergencyRequest = {
            id: "r_" + Date.now(),
            patientName: params.name || "Unknown Patient",
            bloodGroup: params.bloodGroup?.toUpperCase() || "O+",
            location: params.location || "General",
            units: params.units || 1,
            urgency: params.urgency || "Urgent",
            contact: params.contact || "+91 XXXXX XXXXX",
            createdAt: new Date().toLocaleDateString(),
          };
          emergencyRequests.unshift(newReq);
          result.reply += `\n\n🚨 **आपातकालीन रक्त अनुरोध बोर्ड पर लाइव है!** डोनर्स से संपर्क किया जा रहा है।`;
        }
      }

      res.json(result);
    } catch (error: any) {
      console.error("Gemini route error:", error);
      
      // Smart Fallback Handling: Return robust, intelligent reply offline if Gemini is unavailable
      const userMsgLower = message.toLowerCase();
      let reply = `⚠️ **नोट:** मुख्य AI सर्वर व्यस्त है, मैं *आपातकालीन ऑफलाइन रक्त सहायक* (Emergency Offline Assistant) के रूप में आपकी मदद कर रहा हूँ।\n\n`;
      let action = { type: "NONE", params: {} as any };

      // 1. Detect Blood Search Intent
      const bgMatch = message.toUpperCase().match(/(A|B|AB|O)[+-]/i);
      const bg = bgMatch ? bgMatch[0].toUpperCase() : null;

      // Extract locations
      let detectedLocation = "Delhi";
      if (userMsgLower.includes("mumbai")) detectedLocation = "Mumbai";
      else if (userMsgLower.includes("bengaluru") || userMsgLower.includes("bangalore")) detectedLocation = "Bengaluru";
      else if (userMsgLower.includes("hyderabad")) detectedLocation = "Hyderabad";
      else if (userMsgLower.includes("kolkata")) detectedLocation = "Kolkata";
      else if (userMsgLower.includes("noida")) detectedLocation = "Noida";

      if (userMsgLower.includes("need") || userMsgLower.includes("require") || userMsgLower.includes("चाहिए") || userMsgLower.includes("आवश्यकता") || userMsgLower.includes("urgency") || userMsgLower.includes("emergency")) {
        if (bg) {
          reply += `🚨 **रक्त आवश्यकता दर्ज की गई!**\nमैंने **${bg}** रक्त के लिए **${detectedLocation}** स्थान में खोज शुरू कर दी है।\n\n**सक्रिय डोनर्स जिन्हें आप तुरंत संपर्क कर सकते हैं:**\n`;
          const matchingDonors = donors.filter(d => d.bloodGroup === bg && d.location.toLowerCase() === detectedLocation.toLowerCase());
          
          if (matchingDonors.length > 0) {
            matchingDonors.forEach((d, i) => {
              reply += `${i+1}. **${d.name}** - संपर्क: \`${d.contact}\` (स्थान: ${d.location})\n`;
            });
          } else {
            reply += `• वर्तमान में इस स्थान पर ${bg} डोनर सीधे सूचीबद्ध नहीं हैं। पर आप ऊपर दिए गए 'आपातकालीन अनुरोध' बोर्ड पर अपना अनुरोध सबमिट करने के लिए स्क्रीन के ऊपर मौजूद **'पंजीकरण (Register)'** बटन का उपयोग कर सकते हैं।\n`;
          }
          action = {
            type: "SEARCH_BLOOD",
            params: { bloodGroup: bg, location: detectedLocation }
          };
        } else {
          reply += `🚨 आपको आपातकालीन रक्त की आवश्यकता है। कृपया मुझे अपना **ब्लड ग्रुप** (जैसे: O+, B-, AB+) और **शहर का नाम** (जैसे: Delhi, Mumbai) बताएं ताकि मैं सटीक डोनर्स खोज सकूँ।\n\nआप वैकल्पिक रूप से ऊपर दाहिने कोने में मौजूद **'पंजीकरण'** बटन दबाकर सीधे फॉर्म के जरिए आपातकालीन अनुरोध जोड़ सकते हैं।`;
        }
      }
      // 2. Detect Donor Registration Intent
      else if (userMsgLower.includes("donate") || userMsgLower.includes("donor") || userMsgLower.includes("रक्तदान") || userMsgLower.includes("दान करना")) {
        reply += `🙋 **रक्तदाता पंजीकरण सहायक (Donor Registry Assistant):**\nरक्तदान करके आप किसी की जान बचा सकते हैं! कृपया स्क्रीन के ऊपर मौजूद **'पंजीकरण (Register)'** बटन पर क्लिक करें और **'डोनर पंजीकरण (Donor)'** टैब चुनें। वहाँ अपना नाम, संपर्क और ब्लड ग्रुप सबमिट करें, जिससे कि आपका नाम लाइव सत्यापित डोनर सूची में दर्ज हो सके।`;
      }
      // 3. Detect Medical Compatibility / Universal Donor Intent
      else if (userMsgLower.includes("universal") || userMsgLower.includes("compatibility") || userMsgLower.includes("कौन किसे") || userMsgLower.includes("संगतता")) {
        reply += `📊 **रक्त अनुकूलता और कम्पेटिबिलिटी वैज्ञानिक जानकारी:**\n\n1. **Universal Donor (सार्वभौमिक दाता):** **O Negative (O-)** है। इसका उपयोग आपातकाल में किसी भी मरीज के लिए किया जा सकता है।\n2. **Universal Receiver (सार्वभौमिक प्राप्तकर्ता):** **AB Positive (AB+)** है। ये लोग किसी भी रक्त समूह का खून ले सकते हैं।\n\n**रक्त अनुकूलता सूची:**\n• **O+** वाले लोग: O+, A+, B+, AB+ को दे सकते हैं।\n• **A+** वाले लोग: A+, AB+ को दे सकते हैं।\n• **B+** वाले लोग: B+, AB+ को दे सकते हैं।\n• **AB+** वाले लोग: केवल AB+ को दे सकते हैं।`;
        action = { type: "MEDICAL_INFO", params: {} };
      }
      // 4. General fallback response
      else {
        reply += `नमस्ते! मैं ब्लड AI रक्त खोज सहायक हूँ। \nवर्तमान में सर्वर अत्यधिक व्यस्त है, लेकिन हमारे सारे बोर्ड और स्थानीय प्रोक्सिमिटी मैप बिल्कुल लाइव हैं।\n\n**आप यहाँ ये महत्वपूर्ण कार्य कर सकते हैं:**\n1. **ब्लड ग्रुप सर्च:** कोई भी ब्लड ग्रुप और शहर खोजें (उदा: 'O+ Delhi' या 'B- Mumbai').\n2. **सीधा पंजीकरण:** ऊपर मौजूद **'पंजीकरण (Register)'** बटन का उपयोग करके खुद को डोनर के रूप में पंजीकृत करें या नया आपातकालीन रक्त अनुरोध बोर्ड पर लाइव करें।\n3. **आपातकालीन रिपोर्ट:** 'Download Report' बटन पर क्लिक करके सभी सक्रिय आपातकालीन रोगियों की सूची डाउनलोड करें।\n\nकृपया बताएं कि मैं किस रक्त समूह के लिए डोनर खोजने में आपकी तत्काल सहायता करूँ?`;
      }

      res.json({ reply, action });
    }
  });

  // Direct Registration API for Donors / Volunteers
  app.post("/api/register-donor", (req, res) => {
    try {
      const { name, bloodGroup, location, contact, age, lastDonation } = req.body;
      if (!name || !bloodGroup || !location || !contact) {
        return res.status(400).json({ error: "सभी आवश्यक फ़ील्ड (नाम, रक्त समूह, स्थान, संपर्क) भरना अनिवार्य है।" });
      }
      const newDonor: Donor = {
        id: "d_" + Date.now(),
        name,
        bloodGroup: bloodGroup.toUpperCase(),
        location,
        contact,
        age: Number(age) || 25,
        lastDonation: lastDonation || "Never"
      };
      donors.unshift(newDonor);
      res.json({ success: true, donors });
    } catch (err: any) {
      res.status(500).json({ error: "पंजीकरण में त्रुटि आई।", details: err.message });
    }
  });

  // Direct Emergency Blood Request API
  app.post("/api/emergency-request", (req, res) => {
    try {
      const { patientName, bloodGroup, location, units, urgency, contact } = req.body;
      if (!patientName || !bloodGroup || !location || !contact) {
        return res.status(400).json({ error: "सभी आवश्यक फ़ील्ड (रोगी का नाम, रक्त समूह, स्थान, संपर्क) भरना अनिवार्य है।" });
      }
      const newReq: EmergencyRequest = {
        id: "r_" + Date.now(),
        patientName,
        bloodGroup: bloodGroup.toUpperCase(),
        location,
        units: Number(units) || 1,
        urgency: urgency || "Urgent",
        contact,
        createdAt: new Date().toLocaleDateString()
      };
      emergencyRequests.unshift(newReq);
      res.json({ success: true, emergencyRequests });
    } catch (err: any) {
      res.status(500).json({ error: "अनुरोध दर्ज करने में त्रुटि आई।", details: err.message });
    }
  });

  // Reset database endpoint
  app.post("/api/reset", (req, res) => {
    donors = [
      {
        id: "d1",
        name: "Rohan Sharma",
        bloodGroup: "O+",
        location: "Delhi",
        contact: "+91 98765 43210",
        age: 28,
        lastDonation: "4 months ago",
      },
      {
        id: "d2",
        name: "Priya Patel",
        bloodGroup: "B-",
        location: "Mumbai",
        contact: "+91 87654 32109",
        age: 24,
        lastDonation: "6 months ago",
      },
      {
        id: "d3",
        name: "Amit Singh",
        bloodGroup: "O-",
        location: "Bengaluru",
        contact: "+91 76543 21098",
        age: 32,
        lastDonation: "2 months ago",
      },
      {
        id: "d4",
        name: "Sneha Reddy",
        bloodGroup: "A+",
        location: "Hyderabad",
        contact: "+91 91234 56789",
        age: 29,
        lastDonation: "5 months ago",
      },
      {
        id: "d5",
        name: "Vikram Malhotra",
        bloodGroup: "AB-",
        location: "Delhi",
        contact: "+91 95432 10987",
        age: 35,
        lastDonation: "8 months ago",
      },
      {
        id: "d6",
        name: "Ananya Verma",
        bloodGroup: "O+",
        location: "Noida",
        contact: "+91 99887 76655",
        age: 27,
        lastDonation: "Never",
      },
      {
        id: "d7",
        name: "Rajesh Kumar",
        bloodGroup: "B+",
        location: "Mumbai",
        contact: "+91 98234 56712",
        age: 41,
        lastDonation: "3 months ago",
      }
    ];

    emergencyRequests = [
      {
        id: "r1",
        patientName: "Ramesh Gupta",
        bloodGroup: "B+",
        location: "Delhi",
        units: 2,
        urgency: "Urgent",
        contact: "+91 98112 23344",
        createdAt: new Date().toLocaleDateString(),
      },
      {
        id: "r2",
        patientName: "Baby of Meera",
        bloodGroup: "O-",
        location: "Mumbai",
        units: 1,
        urgency: "Critical",
        contact: "+91 93221 12233",
        createdAt: new Date().toLocaleDateString(),
      }
    ];

    res.json({ status: "success", donors, emergencyRequests });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
