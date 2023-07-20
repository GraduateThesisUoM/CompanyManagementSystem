const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: false }));

/*--------   INDEX */
app.get('/', (req, res) => {
  res.render('index.ejs')
})
/*--------   LOG IN */
app.get('/log_in', (req, res) => {
  res.render('log_in.ejs')
})

/*--------   SING UP */
app.get('/sing_up', (req, res) => {
  res.render('sing_up.ejs')
})

app.post('/sing_up', async (req, res) => {
  try {
    console.log(req.body.firstname)
    res.redirect('/log_in')
  } catch {
    res.redirect('/sing_up?error')
  }
})

app.listen(3000)