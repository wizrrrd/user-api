const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const userService = require("./user-service");

const jwtOptions = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JWTStrategy(jwtOptions, (jwt_payload, done) => {
    userService.getUserById(jwt_payload._id)
        .then(user => {
            if (user) {
                return done(null, { _id: user._id, userName: user.userName });
            } else {
                return done(null, false);
            }
        }).catch(err => {
            return done(err, false);
        });
}));

module.exports = passport;