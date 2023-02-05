import express from "express";
const app = express();
app.get("/", (req, res) => {
    console.log("o mais pica q já se viu");
});
app.listen(3333);
