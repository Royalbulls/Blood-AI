import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Locate, Navigation, Compass, MapPin, Map, Globe, Youtube, Car, AlertTriangle, Phone, Search, HelpCircle, Activity } from "lucide-react";

interface MapViewProps {
  userCoords: { lat: number; lng: number };
  customLocationName: string;
  isProximityActive: boolean;
  isDetectingLocation: boolean;
  onDetectMyLocation: () => void;
  onToggleProximity: (active: boolean) => void;
  getProximityText: (locationName: string, id: string) => string;
  filteredRequests: any[];
  filteredDonors: any[];
  filteredBanks: any[];
  isDriverModeActive: boolean;
  driverSpeed: number | null;
  driverHeading: number | null;
  onToggleDriverMode: () => void;
  onDriverSosTrigger: () => void;
  selectedMapItem: {
    title: string;
    location: string;
    lat: number;
    lng: number;
    type: string;
    details: string;
  } | null;
  onClearSelectedMapItem: () => void;
}

export default function MapView({
  userCoords,
  customLocationName,
  isProximityActive,
  isDetectingLocation,
  onDetectMyLocation,
  onToggleProximity,
  getProximityText,
  filteredRequests,
  filteredDonors,
  filteredBanks,
  isDriverModeActive,
  driverSpeed,
  driverHeading,
  onToggleDriverMode,
  onDriverSosTrigger,
  selectedMapItem,
  onClearSelectedMapItem
}: MapViewProps) {
  const [mapZoom, setMapZoom] = useState(0.04);

  // Derive center lat and lng
  const centerLat = selectedMapItem ? selectedMapItem.lat : userCoords.lat;
  const centerLng = selectedMapItem ? selectedMapItem.lng : userCoords.lng;

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl p-6 space-y-6 text-left">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
            <Map className="w-5 h-5 text-red-500" />
            <span>Proximity Radar & Maps Grounding</span>
          </h3>
          <p className="text-xs text-slate-400">जीपीएस आधारित रक्तदाता एवं आपातकालीन ट्रैकिंग नक्शा</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Locate Button */}
          <button
            onClick={onDetectMyLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1 bg-slate-950 hover:bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 px-3 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50 font-semibold cursor-pointer"
          >
            <Locate className={`w-3.5 h-3.5 text-emerald-400 ${isDetectingLocation ? "animate-spin" : ""}`} />
            <span>{isDetectingLocation ? "स्थान ढूँढ रहे हैं..." : "GPS Detect Location"}</span>
          </button>

          {/* Proximity Toggle */}
          <button
            onClick={() => onToggleProximity(!isProximityActive)}
            className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer font-semibold ${
              isProximityActive 
                ? "bg-red-950/40 border-red-500/40 text-red-400 shadow-inner" 
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${isProximityActive ? "text-red-500 animate-spin" : ""}`} />
            <span>Proximity Sort</span>
          </button>
        </div>
      </div>

      {/* Proximity Location Banner indicator */}
      {isProximityActive && (
        <div className="flex items-center justify-between bg-red-950/20 border border-red-500/10 px-3 py-1.5 rounded-lg text-xs text-red-400/90 font-mono">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-red-400 rotate-45 animate-pulse" />
            <span>सक्रिय जीपीएस स्थान: <strong className="text-white">{customLocationName}</strong></span>
          </span>
          <button 
            onClick={() => onToggleProximity(false)} 
            className="hover:text-white transition-colors underline text-[11px] cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      )}

      {/* Embedded OpenStreetMap Iframe */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
        <iframe
          title="Interactive Proximity Radar Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - mapZoom}%2C${centerLat - (mapZoom * 0.8)}%2C${centerLng + mapZoom}%2C${centerLat + (mapZoom * 0.8)}&layer=mapnik&marker=${centerLat}%2C${centerLng}`}
          className="w-full h-full opacity-85 hover:opacity-100 transition-opacity"
          referrerPolicy="no-referrer"
        />

        {/* Map Overlays */}
        <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 font-mono flex items-center gap-1.5 shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>{selectedMapItem ? "लक्षित: " + selectedMapItem.location : "जीपीएस: " + customLocationName}</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-400 font-mono shadow-md backdrop-blur-sm">
          Lat: {centerLat.toFixed(5)}, Lng: {centerLng.toFixed(5)}
        </div>
      </div>

      {/* Selected marker detail HUD */}
      {selectedMapItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-950/20 border border-red-500/25 p-4 rounded-xl space-y-2 relative"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wide">Selected Location</span>
            <button 
              onClick={onClearSelectedMapItem}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Clear Focus
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{selectedMapItem.title}</h4>
          <p className="text-xs text-slate-400">स्थान: {selectedMapItem.location}</p>
          <p className="text-xs text-red-300 font-medium font-mono">{selectedMapItem.details}</p>
        </motion.div>
      )}

      {/* Google and External Navigation Anchors */}
      <div className="grid grid-cols-3 gap-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`blood banks and emergency hospitals in ${customLocationName}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-white rounded-xl py-2 transition-all text-xs font-semibold"
        >
          <Map className="w-3.5 h-3.5 text-red-500" />
          <span>Google Maps</span>
        </a>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`government approved red cross blood banks directory list in ${customLocationName}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/30 text-slate-300 hover:text-white rounded-xl py-2 transition-all text-xs font-semibold"
        >
          <Globe className="w-3.5 h-3.5 text-sky-450" />
          <span>Google Search</span>
        </a>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`blood donation camps safety guide and awareness`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-white rounded-xl py-2 transition-all text-xs font-semibold"
        >
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          <span>YouTube Live</span>
        </a>
      </div>

      {/* Driver Mode Section */}
      <div className="border-t border-slate-800/80 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">🚗 Interactive Driver Mode Hud</span>
          </div>
          <button
            onClick={onToggleDriverMode}
            className={`text-xs border px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer font-bold ${
              isDriverModeActive
                ? "bg-amber-600/20 border-amber-500/40 text-amber-400"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            {isDriverModeActive ? "Exit Driver Mode" : "Activate Driver Mode"}
          </button>
        </div>

        {isDriverModeActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
          >
            {/* Speedometer */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">LIVE GPS SPEED</span>
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-amber-500/30 flex flex-col items-center justify-center my-3 relative animate-spin-slow">
                <div className="absolute inset-2 rounded-full border border-amber-500/10"></div>
              </div>
              <div className="absolute flex flex-col items-center justify-center mt-2">
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  {driverSpeed !== null ? driverSpeed : "0"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">km/h</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                <span>Direction: {driverHeading !== null ? `${driverHeading}°` : "GPS Locked"}</span>
              </div>
            </div>

            {/* Pulsing SOS accident transmitter */}
            <div className="bg-red-950/25 border border-red-500/20 p-5 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <span className="text-[10px] uppercase tracking-wider text-red-400 font-mono font-bold animate-pulse">Accident SOS Transmitter</span>
              <button
                onClick={onDriverSosTrigger}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-2xl transition-all active:scale-95 cursor-pointer my-3 animate-pulse border-2 border-red-500/40"
              >
                <AlertTriangle className="w-5 h-5 text-white" />
                <span>TAP SOS</span>
              </button>
              <span className="text-[10px] text-slate-400 leading-normal font-medium">
                दुर्घटना होने पर तुरंत दबाएं। लाइव जीपीएस कोऑर्डिनेट्स के साथ आपातकाल अलर्ट नजदीकी दाताओं को भेजा जाएगा।
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Proximity Distance Insights */}
      <div className="border-t border-slate-800/80 pt-5 space-y-3">
        <div className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
          <span>दूरी की लाइव रिपोर्ट (Distance Insights)</span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Real-Time GPS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Nearest Patient */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 font-bold">निकटतम मरीज (Request)</span>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <span className="text-xs font-bold text-red-400 font-mono">
              {filteredRequests.length > 0 ? getProximityText(filteredRequests[0].location, filteredRequests[0].id) : "N/A"}
            </span>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              {filteredRequests.length > 0 ? `${filteredRequests[0].patientName} (${filteredRequests[0].bloodGroup})` : "कोई अनुरोध नहीं है"}
            </span>
          </div>

          {/* Nearest Donor */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 font-bold">निकटतम दाता (Donor)</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {filteredDonors.length > 0 ? getProximityText(filteredDonors[0].location, filteredDonors[0].id) : "N/A"}
            </span>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              {filteredDonors.length > 0 ? `${filteredDonors[0].name} (${filteredDonors[0].bloodGroup})` : "कोई दाता नहीं है"}
            </span>
          </div>

          {/* Nearest Blood Bank */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 font-bold">निकटतम ब्लड बैंक (Bank)</span>
              <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
            </div>
            <span className="text-xs font-bold text-sky-400 font-mono">
              {filteredBanks.length > 0 ? getProximityText(filteredBanks[0].location, filteredBanks[0].id) : "N/A"}
            </span>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              {filteredBanks.length > 0 ? filteredBanks[0].name : "कोई ब्लड बैंक नहीं है"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
