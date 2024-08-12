const servers = {

    iceServers: [
        { urls: ["stun:stun.l.google.com:19302"] },
    ],

    iceCandidatePoolSize: 10,
};

let pc = new RTCPeerConnection(servers);
let localStream = null;
let remoteStream = null;