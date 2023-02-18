const path = require("path");
const {app, BrowserWindow, Menu, ipcMain, shell, dialog} = require("electron");
const os = require("os");
const fs = require("fs");
const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";
const resizeImg = require("resize-img");
const PNG = require('pngjs').PNG;
const imageToRgbaMatrix = require('image-to-rgba-matrix');
const {MCut} = require("./dest/MCut");

let mainWindow;

//Create main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Image resizer",
        width: isDev ? 1000 : 500,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "./preload.js"),
        },
    });
    //open devtools if in dev env
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.loadFile(path.join(__dirname, "/renderer/index.html"));
}

//When app is ready
app.whenReady().then(() => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //remove main window when closed
    mainWindow.on("closed", () => (mainWindow = null));

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});

//Menu template
const menu = [
    ...(isMac
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: "About",
                        click: () => createAboutWindow(),
                    },
                ],
            },
        ]
        : []),
    {
        role: "fileMenu",
    },
    ...(!isMac
        ? [
            {
                label: "Help",
                submenu: [
                    {
                        label: "About",
                        click: () => createAboutWindow(),
                    },
                ],
            },
        ]
        : []),
];

//Create about window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: "About Image resizer",
        width: 300,
        height: 300,
    });
    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

//respond to ipcRenderer reize image
ipcMain.on("image:resize", (e, options) => {
    console.log(options);
    loadAndSave(options);
    // resizeImage(options);
});

//resize image
async function resizeImage({imgPath, height, width, dest}) {
    try {
        // Resize image
        const newImage = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        });
        ///
        const filename = path.basename(imgPath);
        //create dest folder
        if (!fs.existsSync(dest)) {
            console.log(dest);
            fs.mkdirSync(dest);

        }

        //Write file to dest folder
        fs.writeFileSync(path.join(dest, filename), newImage);

        //Open dest folder
        await shell.openPath(dest);

        //Send success message
        mainWindow.webContents.send("image:done");


    } catch (error) {
        console.log(error);
    }

}

async function loadAndSave({imgPath, numColor, dest, newName}) {
    try {

        //Load the image from the path
        let rgbaMatrix = await imageToRgbaMatrix(imgPath);
        let rgbMatrix = [];
        let data = [];
        // rgba matrix to rgb matrix and to data array
        for (let i = 0; i < rgbaMatrix.length; i++) {
            rgbMatrix[i] = [];
            for (let j = 0; j < rgbaMatrix[0].length; j++) {
                rgbMatrix[i].push([rgbaMatrix[i][j][0], rgbaMatrix[i][j][1], rgbaMatrix[i][j][2]]);
                data.push([rgbaMatrix[i][j][0], rgbaMatrix[i][j][1], rgbaMatrix[i][j][2]]);
            }
        }
        //initialize the median cut algorithm
        let medianCut = new MCut(data);
        let palette = medianCut.getFixedSizePalette(numColor);
        console.log("palette");
        console.log(palette);
        console.log(palette.length)

        //quantize the image
        quantize(rgbMatrix, palette);

        //save the image
        saveRGBMatrixAsImage(rgbMatrix, dest, newName);
        setTimeout(() => {
            mainWindow.webContents.send("image:done", imgPath, numColor, dest, newName);
        }, 2000);

        // await shell.openPath(dest);


    } catch (error) {
        console.log(error);
    }

    function quantize(imageData, palette) {
        for (let i = 0; i < imageData.length; i++) {
            for (let k = 0; k < imageData[0].length; k++) {
                const r = imageData[i][k][0];
                const g = imageData[i][k][1];
                const b = imageData[i][k][2];
                let minDistance = Number.MAX_VALUE;
                let bestColor = null;
                for (let j = 0; j < palette.length; j++) {
                    const [pr, pg, pb] = palette[j];
                    const distance = Math.sqrt(
                        Math.pow(pr - r, 2) +
                        Math.pow(pg - g, 2) +
                        Math.pow(pb - b, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestColor = palette[j];
                    }
                }
                imageData[i][k][0] = bestColor[0];
                imageData[i][k][1] = bestColor[1];
                imageData[i][k][2] = bestColor[2];
            }
        }
    }

}

function saveRGBMatrixAsImage(matrix, dest, filename) {
    const width = matrix[0].length;
    const height = matrix.length;

    // create a new PNG image with the same dimensions as the matrix
    const png = new PNG({width, height});

    // write the pixel data to the PNG image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            png.data[pixelIndex] = matrix[y][x][0]; // red
            png.data[pixelIndex + 1] = matrix[y][x][1]; // green
            png.data[pixelIndex + 2] = matrix[y][x][2]; // blue
            png.data[pixelIndex + 3] = 255; // alpha
        }
    }

    // create a stream for the PNG image data
    const stream = png.pack();

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    //Remove the extension

    // pipe the stream to a file
    stream.pipe(fs.createWriteStream(path.join(dest, filename))
        .on('finish', () => {
            console.log('Image saved to ' + dest);
        })
        .on('error', err => {
            console.error(err);
        }));
}