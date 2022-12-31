const express = require("express");
const path = require("path");
const httpPort = 3001;
let VERSION = "02";
fs = require("fs");
const mockDB = "./mockDB.txt";

const app = express();
app.use(express.json()); // za VER06

app.use((req, res, next) => {
    console.log(new Date().toLocaleString() + " " + req.url);
    next();
});

app.use(express.static(path.join(__dirname, "public", VERSION)));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "index.html"));
});

app.post("/save", function (req, res) {
    let data = fs.readFileSync(mockDB, { encoding: "utf8", flag: "r" });
    if (data === "") {
        data = {};
    } else {
        data = JSON.parse(data);
    }

    if (!data.games) {
        data.games = [];
    }
    data.games.push(req.body);
    data = JSON.stringify(data);
    fs.writeFile(mockDB, data, function (err) {
        if (err) return console.log(err);
    });

    res.end("Data saved");
});

app.get("/about.html", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "about.html"));
});

app.get("/offline.html", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "offline.html"));
});

app.get("/score.html", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "score.html"));
});

app.get("/scorelist.html", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "scorelist.html"));
});

app.get("/games", async function (req, res) {
    let data = fs.readFileSync(mockDB);
    data = JSON.parse(data);
    res.json(data);
});

app.get("/404.html", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "404.html"));
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "public", VERSION, "404.html"));
});

app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});
