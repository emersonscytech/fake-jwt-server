const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const jwt = require("jsonwebtoken");
const exjwt = require("express-jwt");

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const JWT_SECRET = "fake jwt server 4real";
const PORT = 8081;

const jwtMW = exjwt({
    secret: JWT_SECRET
});

const USERS = require("./users");

const findUser = (username, password) => {
    const candidates = USERS.filter((usr) => {
        return usr.username === username && usr.password === password;
    });

    if (candidates.length > 0) {
        return candidates[0]
    }

    return null;
}

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("Auth Attempt: ", {username, password});

    const foundUser = findUser(username, password);
    let authResponse = {};

    if (foundUser) {

        const tokenOptions = {
            expiresIn: 129600
        };

        const token = jwt.sign(foundUser, JWT_SECRET, tokenOptions);

        authResponse = {
            sucess: true,
            err: null,
            token
        };

        console.log(authResponse);
        res.json(authResponse);

    } else {
        authResponse = {
            sucess: false,
            token: null,
            err: "Username or password is incorrect"
        };
        console.log(authResponse);
        res.status(401).json(authResponse);
    }
});

app.get("/", jwtMW, (req, res) => {
    res.send("Auth ok: You are authenticated");
});


app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).send(err);
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`JTW Server running on ${PORT}`);
});
