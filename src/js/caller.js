const conn = io("ws://localhost:3000");
let intervalId = "";

$(document).ready(function () {
    $("#connectToCall").on("click", function () {
        $(".not-connected").removeClass("flex").addClass("hidden");
        $(".connected").removeClass("hidden").addClass("flex");

        intervalId = setInterval(animateDropLabel, 1000)


        $("#audioOne")[0].play();
        $("#audioOne").on('ended', function () {
            $("#audioThree")[0].play();
            openMediaDevices();
        });
    })
})

function animateDropLabel() {
    $("#dropCallLabel").fadeOut(100, function () {
        $(this).text("connecting...").fadeIn(1000);
    });
}

function openMediaDevices() {
    const constraints = {
        audio: {
            echoCancellation: true, // Enable echo cancellation
            noiseSuppression: true, // Optional: Enable noise suppression
            autoGainControl: true   // Optional: Enable automatic gain control
        }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request access to the microphone
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                localStream = stream;
                $('#localAudio')[0].srcObject = stream;
                $('#localAudio')[0].volume = 0;
                $('#localAudio')[0].play();

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                pc.createOffer()
                    .then(offer => pc.setLocalDescription(offer))
                    .then(() => {
                        conn.emit('offer', { sdp: pc.localDescription.sdp });
                    })
                    .catch(error => console.error('Offer creation error:', error));


                pc.onicecandidate = async function (event) {
                    if (event.candidate) {

                        const { lat, long } = await getCurrentLocation();
                        conn.emit('candidate', { candidate: event.candidate, lat, long, user: conn.id });
                    }
                };

                pc.ontrack = function (event) {
                    $('#remoteAudio')[0].srcObject = event.streams[0];
                    $('#remoteAudio')[0].play();
                };


            })
            .catch(function (error) {
                console.error('Error accessing the microphone:', error);
            });
    } else {
        console.error('getUserMedia is not supported in this browser.');
    }

}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                resolve({ lat, long });
            },
            (error) => {
                reject(error);
            }
        );
    });
}


conn.on('offer', function (data) {
    pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => {
            conn.emit('answer', { sdp: pc.localDescription.sdp });
        })
        .catch(error => console.error('Offer handling error:', error));
});

conn.on('answer', function (data) {
    pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }))
        .catch(error => console.error('Answer handling error:', error));
});

conn.on('candidate', function (data) {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        .catch(error => console.error('ICE candidate error:', error));
});

conn.on("accepted", function () {
    clearInterval(intervalId);
    $("#dropCallLabel").text("Connected")
})