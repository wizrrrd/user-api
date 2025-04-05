const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const passport = require("./auth");
dotenv.config();
const userService = require("./user-service");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Register
app.post("/api/user/register", (req, res) => {
    userService.registerUser(req.body)
    .then(msg => res.json({ message: msg }))
    .catch(msg => res.status(422).json({ message: msg }));
});

// Login
app.post("/api/user/login", (req, res) => {
    userService.checkUser(req.body)
    .then(user => {
        const payload = {
            _id: user._id,
            userName: user.userName
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.json({ message: "login successful", token });
    }).catch(msg => {
        res.status(422).json({ message: msg });
    });
});

// Protected Routes (passport.authenticate middleware)
app.get("/api/user/favourites", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.getFavourites(req.user._id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.addFavourite(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/favourites/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.removeFavourite(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.get("/api/user/history", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.getHistory(req.user._id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/history/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.addHistory(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/history/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
    userService.removeHistory(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

userService.connect()
.then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("API listening on: " + HTTP_PORT);
    });
})
.catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
});
