'use client';

export type WithId<T> = T & { id: string };

export type UserRole = 'superadmin' | 'admin' | 'special' | 'visitor';
export type CosmeticRank = 'registered_member' | 'background_name' | 'super_name' | 'mythical_admin';

export interface Alert {
    fromName: string;
    text: string;
    timestamp: any;
}

export interface User {
  name: string;
  avatarUrl: string;
  avatarColor: string;
  deviceId: string;
  role: UserRole;
  originalRole?: UserRole | null;
  isRoleStripped?: boolean;
  cosmeticRole: CosmeticRank | null;
  isMuted: boolean;
  isTyping?: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
  canSpeakWithOthers?: boolean; // New field for co-host
  handRaised: boolean;
  handRaisedAt: number | null;
  micTimeStarted: number | null;
  hasOpenMic: boolean;
  newPrivateMessageFrom?: string[];
  status: string | null;
  statusText?: string | null;
  lastSeen?: any;
  alerts?: Alert[];
  backgroundUrl?: string | null;
  dnd?: boolean;
  kickReason?: string;
  isBot?: boolean;
}

export interface Message {
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  color: string;
  timestamp: any; 
  type: 'user' | 'status';
  userName_en?: string;
}

export interface PrivateMessage {
  fromId: string;
  fromName: string;
  fromRole: UserRole;
  toId: string;
  text: string;
  timestamp: any;
  read: boolean;
  participantIds: string[];
  color: string;
}


export interface RegisteredMember {
  name: string;
  role: UserRole;
  color: string;
  password?: string;
  cosmeticRank?: CosmeticRank | null;
}

export interface BannedUser {
    name: string;
    deviceId: string;
    reason: string;
    bannedAt: any;
    bannedBy: string;
}

export interface GlobalBan {
    userName: string;
    bannedAt: any;
}

export interface ResellerBan {
    userName: string;
    bannedAt: any;
    reason: string;
}

export interface MicQueueEntry {
    userId: string;
    userName: string;
    role: UserRole;
    handRaisedAt: number;
}


export interface Room {
  name: string;
  description: string;
  ownerId: string;
  isPublic: boolean;
  userCount: number;
  botCount: number;
  cameraOnCount?: number;
  maxUsers: number;
  welcomeMessage: string;
  renewalDate: string;
  
  // Control fields
  icon: string;
  isLocked: boolean;
  showJoinLeaveMessages: boolean;
  isPrivateChatEnabled: boolean;
  muteVisitorsVoice: boolean;
  muteVisitorsText: boolean;
  ownerPanelPassword?: string;
  backgroundGradient?: string | null;

  // Reaction counts
  heartCount?: number;
  starCount?: number;
  heartUsers?: string[];
  starUsers?: string[];
  
  mic_queue?: MicQueueEntry[];

  // Optional arrays that need to be handled carefully
  activityLog?: string[];
  bannedUsers?: WithId<BannedUser>[];
  wordFilter?: string[];
  reservedNames?: string[];
  registeredMembers?: WithId<RegisteredMember>[];
  categories?: string[];
}

export interface ReservedName {
  name: string;
  color: string;
  reseller: string;
  renewalDate: string;
  password?: string;
  role: UserRole;
  cosmeticRank?: CosmeticRank | null;
}

export interface Reseller {
  name: string;
  userId: string;
  apiKey: string;
  isActive: boolean;
  rooms: number;
  status: 'Active' | 'Expired';
  renewalDate: string;
  password?: string;
}

export interface AdminRole {
    createdAt: string;
}

export interface Post {
    title: string;
    content: string;
    slug: string;
    title_en?: string;
    content_en?: string;
    authorName: string;
    authorAvatarUrl: string;
    timestamp: any;
    imageUrl?: string;
    likesCount?: number;
    likedBy?: string[];
    comments?: WithId<Comment>[];
}

export interface Comment {
    postId: string;
    authorName: string;
    text: string;
    timestamp: any;
}

// Signaling types for WebRTC
export interface RTCSessionDescription {
    type: 'offer' | 'answer';
    sdp: string;
}

export interface RTCIceCandidate {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
}

export interface VisitorLog {
    userId: string;
    userName: string;
    userAvatar: string;
    roomId: string;
    roomName: string;
    ownerId: string;
    timestamp: any;
    ipAddress?: string;
    country?: string;
    city?: string;
}
