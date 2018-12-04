import 'dotenv/config'
import express from 'express'
import multer from 'multer'
var upload = multer({ dest: 'uploads/' })

const app = express()

app.post('/profile', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.send({status: 'ok'})
})

app.get('/', (req, res) => {
  res.end(
  `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
  </head>
  
  <body>
    <form action="/profile" method="post" enctype="multipart/form-data">
      <input type="file" name="avatar" />
      <br />
      <button type="submit" >Submit</button>
    </form>
  </body>
  </html>
  `
  )
})

const PORT = process.env.PORT || 2048
app.listen(PORT, (req, res) =>{
  console.log(`Upload server start at ${PORT}`)
})