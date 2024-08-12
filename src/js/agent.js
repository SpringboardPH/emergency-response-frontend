const conn = io("ws://localhost:3000");

conn.on('candidate', function (data) {

    $("#callerContainer > li").remove();

    let candidateJson = JSON.stringify(data.candidate);


    let callerList = `
        <li class="flex flex-col lg:flex-row justify-between place-items-center bg-white border-2 border-blue-100 px-8 py-2 rounded-lg">
            <div class="">
                <p>User ID: ${data.user}</p>
            </div>
            <div class="space-y-4">
                <button class="bg-emerald-500 text-white py-1 px-4 w-28 rounded-md" data-candidate='${candidateJson}' onclick="acceptCall(this, '${data.lat}', '${data.long}');">Accept</button>
                <button class="bg-red-500 text-white py-1 px-4 w-28 rounded-md">Reject</button>
            </div>
        </li>
    `;

    $("#callerContainer").html(callerList)

    pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        .catch(error => console.error('ICE candidate error:', error));
});

conn.on('answer', function (data) {
    pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: data.sdp }))
        .catch(error => console.error('Answer handling error:', error));
});

conn.on('offer', function (data) {
    pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: data.sdp }))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => {
            conn.emit('answer', { sdp: pc.localDescription.sdp });
        })
        .catch(error => console.error('Offer handling error:', error));
});


function acceptCall(obj, lat, long) {

    const buttonObj = obj;
    const candidate = JSON.parse(buttonObj.dataset.candidate);

    openMediaDevices();

    renderLocation(+lat, +long)

    pc.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => console.error('ICE candidate error:', error));

    conn.emit("accepted")
    obj.closest("li").remove();
}


function openMediaDevices() {
    const constraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            localStream = stream;
            $('#localAudio')[0].srcObject = stream;
            $('#localAudio')[0].play();

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    conn.emit('offer', { sdp: pc.localDescription.sdp });
                })
                .catch(error => console.error('Offer creation error:', error));

            pc.onicecandidate = function (event) {
                if (event.candidate) {
                    conn.emit('candidate', { candidate: event.candidate });
                }
            };

            pc.ontrack = function (event) {
                $('#remoteAudio')[0].srcObject = event.streams[0];
                $('#remoteAudio')[0].play();
            };
        })
        .catch(error => console.error('Media access error:', error));
}


function renderLocation(lat, lng) {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat, lng },
        zoom: 15,
    });

    const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: "Hello World!",
    });
}