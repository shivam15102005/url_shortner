require("dotenv").config();
const express = require("express");
const path = require("node:path");
const { connectMongoDb } = require("./connect");
const userRoute = require("./routes/user");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const URL = require("./models/url");
const { checkForAuthentication, restrictTo} = require("./middleware/auth");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = process.env.PORT;


connectMongoDb( process.env.MONGO_URL).then(() =>{
    console.log("MongoDB Connected");
});

app.set("view engine","ejs");
app.set("views", path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthentication)

app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);

app.use("/url/:shortId", async(req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    }, 
        {
            $push: {
                visitHistory: {
               timestamp: Date.now(),
            },
        },
    }
    );
       res.redirect( entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));

