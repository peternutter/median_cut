// Some JavaScript to load the image and show the form. There is no actual backend functionality. This is just the UI

const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const img = document.querySelector("#img");
const form = document.querySelector("#img-form");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    allertError("Please select an image file");
    return;
  }

  //Get original dimensions
  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  document.querySelector("#filename").innerHTML = file.name;
  outputPath.innerText = path.join(os.homedir(), "IdeaProjects\\electron");
  console.log(os.homedir());
  // console.log("test");
  // outputPath.innerText = outputPath.innerText.replace(/\\/g, "/");
}

// Resize image
function resizeImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    alertError("Please upload an image");
    return;
  }

  if (widthInput.value === "" || heightInput.value === "") {
    alertError("Please enter a width and height");
    return;
  }

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  ipcRenderer.send("image:resize", {
    imgPath,
    height,
    width,
  });
}

//Catch image:done event
ipcRenderer.on("image:done", () => {
  allertSucess("Image resized successfully");
});

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

document.querySelector("#img").addEventListener("change", loadImage);
form.addEventListener("submit", resizeImage);

function allertError(message) {
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

function allertSucess(message) {
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
