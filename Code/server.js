const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.render('index.ejs')
  })

app.get('/log_in', (req, res) => {
    res.render('log_in.ejs')
  })

app.listen(3000)