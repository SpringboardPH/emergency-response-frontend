$(document).ready(function () {
    $("#connectToCall").on("click", function () {
        $(".not-connected").removeClass("flex").addClass("hidden");
        $(".connected").removeClass("hidden").addClass("flex");

        setInterval(animateDropLabel, 100)


        // $("#audioOne")[0].play();
        // $("#audioOne").on('ended', function () {
        //     $("#audioThree")[0].play();
        // });

        openMediaDevices();
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

                let $audio = $("#userMicrophone");

                $audio[0].srcObject = stream;
                $audio[0].volume = 0; // Mute the audio element


                $audio[0].play();
            })
            .catch(function (error) {
                console.error('Error accessing the microphone:', error);
            });
    } else {
        console.error('getUserMedia is not supported in this browser.');
    }

}