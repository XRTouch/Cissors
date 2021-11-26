socket = io();

function setForce(val) {
    socket.emit("custom/setForce", val);
}
let cursor = document.getElementById("range");
socket.on("custom/getAngle", val => {
    cursor.value = (val-16)*1.165;
})