// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI

const outputPath = document.querySelector("#output-path");
const img = document.querySelector("#img");
const form = document.querySelector("#img-form");
const numberOfColors = document.querySelector("#numCol");
const newName = document.querySelector("#new-name");

function loadImage(e) {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError("Please select an image file");
        return;
    }

    //Get original dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);

    form.style.display = "block";
    document.querySelector("#filename").innerHTML = file.name;
}

//Change the output path
function changePath(e) {
    //get the path from the event
    let destPath = e.target.files[0].path;
    //get just the directory
    destPath = path.dirname(destPath);
    outputPath.innerText = destPath;

}

// Resize image
function resizeImage(e) {
    e.preventDefault();

    if (!img.files[0]) {
        alertError("Please upload an image");
        return;
    }

    // Electron adds a bunch of extra properties to the file object including the path
    let imgPath = img.files[0].path;
    const numColor = numberOfColors.value;
    const dest = outputPath.innerText === "" ? path.join(os.homedir(), "electron-images") : path.join(outputPath.innerText);

    //check if the image is not going to be overwritten
    if(imgPath===path.join(dest, newName.value+'.png')){
        alertError("The output directory cannot be the same as source directory");
        return;
    }

    ipcRenderer.send("image:resize", {
        imgPath,
        numColor,
        dest,
        newName: newName.value+'.png',
    });
}

//Catch image:done event
ipcRenderer.on("image:done", (imgPath, numColor, dest, newName) => {
    alertSuccess("Image quantized successfully");
    document.querySelector('#image-selection').style.display = 'none';
    document.querySelector('#show-img').style.display = 'block';
    document.querySelector('#img-original').src = imgPath;
    document.querySelector('#img-quant').src = path.join(dest, newName);
});

function isFileImage(file) {
    const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
    return file && acceptedImageTypes.includes(file["type"]);
}

document.querySelector("#img").addEventListener("change", loadImage);


document.querySelector('#path').addEventListener('change', changePath);
form.addEventListener("submit", resizeImage);
document.querySelector('#return').addEventListener('click', () => {
    document.querySelector('#image-selection').style.display = '';
    document.querySelector('#show-img').style.display = 'none';
});
document.querySelector("#output-path").innerText = path.join(os.homedir(), "electron-images");

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "red",
            color: "white",
            textAlign: "center",
        },
    });
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "green",
            color: "white",
            textAlign: "center",
        },
    });
}
