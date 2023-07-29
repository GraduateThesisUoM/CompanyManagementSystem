const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = (email, password, done) => {
    getUserByEmail(email)
      .then((user) => {
        console.log(user)
        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }
        return done(null, user);
        /*bcrypt.compare(password, password)
          .then((isMatch) => {
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          })
          .catch((error) => done(error));*/
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
