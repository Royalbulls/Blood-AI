export interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  contact: string;
  age: number;
  lastDonation: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  bloodGroup: string;
  location: string;
  units: number;
  urgency: string;
  contact: string;
  createdAt: string;
}

export interface BloodBank {
  id: string;
  name: string;
  location: string;
  address: string;
  contact: string;
  availableGroups: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  action?: {
    type: string;
    params?: any;
  };
}

export interface CommunityComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
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

