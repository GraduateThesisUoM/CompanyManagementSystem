const express = require('express');

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/log-in');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
};