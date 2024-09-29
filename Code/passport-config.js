const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const path_constants = require('./constantsPaths');
const Company = require('./Schemas/Company');

const connectDB = require('./db');

connectDB();

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = (email, password, done) => {
    getUserByEmail(email)
      .then(async (user) => {
        if (!user) {
          return done(null, false, { message: 'No user with that email' });
        }        
        try {
          if (await bcrypt.compare(password, user.password)) {
            if (user.status == '0') {
              return done(null, false, { message: 'disabled' })
            }
            if (user.status == '1') {
              if(user.type == 'user' ){
                if(user.companyOwner == 0){
                  const company = await Company.findOne({_id:user.company})
                  if(company.status == 1){
                    return done(null, user)
                  }
                  else{
                    return done(null, false, { message: 'company is not acive' })
                  }
                }
              }
              return done(null, user)
            }
            if (user.status == '2') {
              return done(null, false, { message: 'deleted' })
            }
            if (user.status == '3') {
              return done(null, false, { message: 'banned' })
            }
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
