const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const { PORT } = require("./config");


const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));


app.listen(PORT, () => {
    console.log(`App started successfully in port ${PORT}.`);
});
