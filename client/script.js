import * as THREE from "https://cdn.skypack.dev/three";

var camera, canvas, context, imageData; // opencv
var view, scene, cam, renderer, mesh; // three.js

let cameraMatrix = cv.matFromArray(3, 3, cv.CV_64F, [583.2829786373293, 0.0, 320.0, 0.0, 579.4112549695428, 240.0, 0.0, 0.0, 1.0]);
let distCoeffs   = cv.matFromArray(5, 1, cv.CV_64F, [-1.5007354215536557e-03, 9.8722389825801837e-01, 1.7188452542408809e-02, -2.6805958820424611e-02, -2.3313928379240205e+00]);
let camFOV = {x: 0, y: 0};

function calculateFOV()
{
    console.log(cameraMatrix);
    let fx = cameraMatrix.doubleAt(0, 0);
    let fy = cameraMatrix.doubleAt(1, 1);
    let x = cameraMatrix.doubleAt(0, 2);
    let y = cameraMatrix.doubleAt(1, 2);

    camFOV = {x: Math.atan(x / fx), y: Math.atan(y / fy)};
    console.log("FOV: "+(camFOV.x*180/3.1415)+", "+(camFOV.y*180/3.1415));
}

function printMat(mat) {
    console.log("Matrice "+mat.rows+"x"+mat.cols);
    console.log("channels: "+mat.channels());
    console.log("matSize: "+mat.matSize);
    console.log(mat);
}

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

    calculateFOV();
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera( camFOV.x * 180 / 3.1415926, window.innerWidth / window.innerHeight, 0.1, 1000 );
    cam.position.set(0, 0, 0);
    cam.lookAt(0, 0, 1);

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    view = renderer.domElement;
    view.style.width = canvas.width+"px";
    view.style.height = canvas.height+"px";
    let width = parseInt(view.style.width), height = parseInt(view.style.height);
    renderer.setSize(width, height, false);
    cam.aspect = width / height;
    cam.updateProjectionMatrix();

    mesh = new THREE.Mesh(
        new THREE.BoxBufferGeometry(0.05, 0.05, 0.05),
        new THREE.MeshPhongMaterial({color: "red"})
    );
    mesh.position.set(0, 1, 0);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    let lamp = new THREE.PointLight(0xffffff, 1, 100);
    lamp.position.set(0, 0, 0);
    scene.add(lamp);
}

document.onOpenCVReady = () => {
    init();
    setInterval(tick, 100);
}

function tick() {
    if (video.readyState != video.HAVE_ENOUGH_DATA) {
        return;
    }
    context.drawImage(video, 0, 0, camera.width, camera.height); 
    // let img = new Image(320, 240);
    // img.src = "./aruco.png";
    // context.drawImage(img, 0, 0, camera.width, camera.height);
    imageData = context.getImageData(0, 0, camera.width, camera.height);
    imageData = data2mat(imageData);
    
    cv.cvtColor(imageData, imageData, cv.COLOR_RGBA2RGB, 0);
    let markerImage = new cv.Mat();
    let dictionary = new cv.Dictionary(cv.DICT_4X4_50);
    let markerIds = new cv.Mat();
    let markerCorners = new cv.MatVector();
    let rvecs = new cv.Mat();
    let tvecs = new cv.Mat();

    cv.detectMarkers(imageData, dictionary, markerCorners, markerIds);
    if (markerIds.rows > 0) {
        //cv.drawDetectedMarkers(imageData, markerCorners, markerIds);
        let markers = [];
        for (let i = 0; i < markerCorners.size(); i++) {
            let data = markerCorners.get(i).data32F;
            for (let i = 0; i < data.length/2; i++) {
                markers.push({x: data[i*2] - imageData.width/2, y: data[i*2+1] - imageData.height/2});
            }
        }
        // cv.estimatePoseSingleMarkers(markerCorners, 0.05, cameraMatrix, distCoeffs, rvecs, tvecs);
        // cv.drawAxis(imageData, cameraMatrix, distCoeffs, rvecs, tvecs, 0.1);
        // let coords = tvecs.data64F;
        // let rot = rvecs.data64F;
        // document.getElementById("range-x").innerHTML = Math.round(coords[0]*100) / 100;
        // document.getElementById("range-y").innerHTML = Math.round(coords[1]*100) / 100;
        // document.getElementById("range-z").innerHTML = Math.round(coords[2]*100) / 100;
        // mesh.position.set(coords[0], coords[1], coords[2]);
        // mesh.quaternion.setFromEuler(new THREE.Euler(-rot[0], -rot[2], rot[1], "ZYX"));

        let posit = new POS.Posit(0.05, imageData.width);
        let pose = posit.pose(markers);
        let rotation = pose.bestRotation;
        let translation = pose.bestTranslation;

        document.getElementById("range-x").innerHTML = Math.round(translation[0]*100) / 100;
        document.getElementById("range-y").innerHTML = Math.round(translation[1]*100) / 100;
        document.getElementById("range-z").innerHTML = Math.round(translation[2]*100) / 100;

        mesh.rotation.x = -Math.asin(-rotation[1][2]);
		mesh.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
		mesh.rotation.z =  Math.atan2(rotation[1][0], rotation[1][1]);

		mesh.position.x =  translation[0];
		mesh.position.y =  translation[1];
		mesh.position.z = -translation[2];
        

        renderer.render(scene, cam);
    }
    cv.imshow("canvasOutput", imageData);
    imageData.delete(); markerImage.delete(); dictionary.delete(); markerIds.delete();
    markerCorners.delete(); rvecs.delete(); tvecs.delete();

}