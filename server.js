const express = require("express");
const path = require("path");
const httpPort = process.env.PORT || 3001;
let VERSION = "02";

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

app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});
