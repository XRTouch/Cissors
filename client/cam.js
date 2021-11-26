let background = document.getElementById("background");

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        background.srcObject = stream;
    })
    .catch(function (err) {
        console.log("Something went wrong! "+err);
    });
}