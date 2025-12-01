

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Using public TURN servers is not recommended for production apps.
    // For a production app, it is highly recommended to use your own TURN server
    // or a paid service for better reliability and security.
    // The previous credentials were invalid and causing connection failures.
  ],
};
