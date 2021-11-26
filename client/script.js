var camera, canvas, context, imageData, pixels, detector;
var debugImage, warpImage, homographyImage;

function data2mat(data) {
    return new cv.matFromArray(data.height, data.width, cv.CV_8UC4, data.data);
}

function init() {
    camera = document.getElementById("video");
    canvas = document.getElementById("canvasOutput");
    context = canvas.getContext("2d");

    camera.width = 320;
    camera.height = 240;

    canvas.width = parseInt(camera.width);
    canvas.height = parseInt(camera.height);

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            if ("srcObject" in video) {
                camera.srcObject = stream;
            } else {
                camera.src = window.URL.createObjectURL(stream);
            }
        }).catch((err) => {
            console.log(err.name + ": " + err.message);
        }
    );
}

function onOpenCVReady() {
    console.log('OpenCV.js is ready.');
    requestAnimationFrame(tick);
}

window.onload = init;

function tick() {
    requestAnimationFrame(tick);
    if (video.readyState != video.HAVE_ENOUGH_DATA) {
        return;
    }
    context.drawImage(video, 0, 0, camera.width, camera.height);
    imageData = context.getImageData(0, 0, camera.width, camera.height);
    imageData = data2mat(imageData);
    
    cv.cvtColor(imageData, imageData, cv.COLOR_RGBA2RGB, 0);
    let markerImage = new cv.Mat();
    let dictionary = new cv.Dictionary(cv.DICT_4X4_50);
    let markerIds = new cv.Mat();
    let markerCorners = new cv.MatVector();
    let rvecs = new cv.Mat();
    let tvecs = new cv.Mat();

    let cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [9.6635571716090658e+02, 0., 2.0679307818305685e+02, 0., 9.6635571716090658e+02, 2.9370020600555273e+02, 0., 0., 1.]);
    let distCoeffs   = cv.matFromArray(5, 1, cv.CV_64F, [-1.5007354215536557e-03, 9.8722389825801837e-01, 1.7188452542408809e-02, -2.6805958820424611e-02, -2.3313928379240205e+00]);

    cv.detectMarkers(imageData, dictionary, markerCorners, markerIds);
    console.log(markerIds.rows);
    if (markerIds.rows > 0) {
        cv.drawDetectedMarkers(imageData, markerCorners, markerIds);
        cv.estimatePoseSingleMarkers(markerCorners, 0.1, cameraMatrix, distCoeffs, rvecs, tvecs);
        cv.drawAxis(imageData, cameraMatrix, distCoeffs, rvecs, tvecs, 0.1);
    }
    cv.imshow("canvasOutput", imageData);
    imageData.delete(); markerImage.delete(); dictionary.delete(); markerIds.delete();
    markerCorners.delete(); rvecs.delete(); tvecs.delete(); cameraMatrix.delete(); distCoeffs.delete();
}