const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const connectDB = require('./db');
connectDB();

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = (email, password, done) => {
    getUserByEmail(email)
      .then(async (user) => {
        console.log(user)
        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }        
        try {
          //if (await bcrypt.compare(password, user.password)) {
          if (password == user.password) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Password incorrect' })
          }
        } catch (e) {
          return done(e)
        }
      })
      .catch((error) => done(error));
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    getUserById(id)
      .then((user) => done(null, user))
      .catch((error) => done(error));
  });
}

module.exports = initialize;
