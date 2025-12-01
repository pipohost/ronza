
import type { Room, User, Message, Reseller, ReservedName, WithId } from './types';

export const mockRooms: WithId<Room>[] = [
    { id: 'room-1', name: 'Community Hangout', description: 'A place to chill and chat.', ownerId: 'root', isPublic: true, userCount: 15, maxUsers: 50, renewalDate: '', icon: '', welcomeMessage: 'Welcome to the Community Hangout!', isLocked: false, showJoinLeaveMessages: true, isPrivateChatEnabled: true, muteVisitorsVoice: false, muteVisitorsText: false },
    { id: 'room-2', name: 'Gaming Lobby', description: 'Discuss the latest games.', ownerId: 'res-1', isPublic: true, userCount: 42, maxUsers: 100, renewalDate: '', icon: '', welcomeMessage: 'Welcome, gamer!', isLocked: false, showJoinLeaveMessages: true, isPrivateChatEnabled: true, muteVisitorsVoice: false, muteVisitorsText: false },
    { id: 'room-3', name: 'Tech Talk', description: 'All things tech.', ownerId: 'root', isPublic: false, userCount: 8, maxUsers: 25, renewalDate: '', icon: '', welcomeMessage: 'Tech enthusiasts gather here.', isLocked: false, showJoinLeaveMessages: true, isPrivateChatEnabled: true, muteVisitorsVoice: false, muteVisitorsText: false },
    { id: 'room-4', name: 'Art Corner', description: 'Share your creations.', ownerId: 'res-1', isPublic: true, userCount: 23, maxUsers: 50, renewalDate: '', icon: '', welcomeMessage: 'Creative minds welcome.', isLocked: false, showJoinLeaveMessages: true, isPrivateChatEnabled: true, muteVisitorsVoice: false, muteVisitorsText: false },
];

export const mockUsers: WithId<User>[] = [
    { id: 'user-1', name: 'Alice', avatarUrl: 'https://picsum.photos/seed/alice/100/100', role: 'visitor', isMuted: false, isCameraOn: false, isSpeaking: false, handRaised: false, handRaisedAt: null, hasNewPrivateMessage: false, status: null },
    { id: 'user-2', name: 'Bob', avatarUrl: 'https://picsum.photos/seed/bob/100/100', role: 'admin', isMuted: false, isCameraOn: true, isSpeaking: true, handRaised: false, handRaisedAt: null, hasNewPrivateMessage: true, status: 'oncall' },
    { id: 'user-3', name: 'Charlie', avatarUrl: 'https://picsum.photos/seed/charlie/100/100', role: 'superadmin', isMuted: true, isCameraOn: false, isSpeaking: false, handRaised: true, handRaisedAt: Date.now(), hasNewPrivateMessage: false, status: 'away' },
    { id: 'user-4', name: 'Diana', avatarUrl: 'https://picsum.photos/seed/diana/100/100', role: 'special', isMuted: false, isCameraOn: false, isSpeaking: false, handRaised: false, handRaisedAt: null, hasNewPrivateMessage: false, status: 'eating' },
];

export const mockResellers: WithId<Reseller>[] = [
    { id: 'res-1', name: 'PipoHost', userId: 'user-pipo', apiKey: 'abc-123', isActive: true, rooms: 50, status: 'Active', renewalDate: '2025-12-31' },
    { id: 'res-2', name: 'ChatNet', userId: 'user-chatnet', apiKey: 'def-456', isActive: false, rooms: 10, status: 'Expired', renewalDate: '2024-01-01' },
];

export const mockColoredNames: WithId<ReservedName>[] = [
    { id: 'cname-1', name: 'VIP_User', color: '#FFD700', reseller: 'root', renewalDate: '2025-12-31', role: 'special' },
    { id: 'cname-2', name: 'Legend', color: '#8A2BE2', reseller: 'res-1', renewalDate: '2025-06-15', role: 'special' },
];

export const fullMockRoom: Room & { id: string, users: User[], messages: Message[] } = {
  id: "mock-room-1",
  name: "Ronza Mock Room",
  description: "A mock room for demonstration purposes.",
  ownerId: "mock-owner",
  isPublic: true,
  userCount: 4,
  maxUsers: 50,
  welcomeMessage: "Welcome to the Ronza Chat Template! This is a mock-up for demonstration.",
  renewalDate: "2025-01-01",
  icon: "MessageSquare",
  isLocked: false,
  showJoinLeaveMessages: true,
  isPrivateChatEnabled: true,
  muteVisitorsVoice: false,
  muteVisitorsText: false,
  users: mockUsers,
  messages: [],
};
