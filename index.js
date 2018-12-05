import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import readChunk from 'read-chunk'
import fileType from 'file-type'

const app = express()
const UPLOAD_PATH = path.join(__dirname, 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH)
  }
})

const upload = multer({ 
  storage,
  fileFilter: function(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
  
    // To reject this file pass `false`, like so:

    // req.fileValidationError = "Forbidden extension";
    // return cb(null, false, req.fileValidationError)
  
    // To accept the file pass `true`, like so:
    // cb(null, true)
  
  }
})

app.post('/upload', upload.single('file'), function(req, res){
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  if (req.fileValidationError) {
    return res.status(400).send({error: req.fileValidationError})
  }
  // Everything went fine.
  res.status(200).send({status: 'ok', filename: req.file.filename})
})

app.get('/image/:id', function(req, res){
  // Validate that req.params.id is 16 bytes hex string
  if (/^[0-9A-F]{32}$/i.test(req.params.id)) {
    const filePath = path.join(UPLOAD_PATH, req.params.id);
    let buffer
    try {
      buffer = readChunk.sync(filePath, 0, 4100);
    } catch (error) {
      return res.status(400).send({error: 'Not found'})
    }
    // Get the stored image type for this image
    const storedMimeType = fileType(buffer);
    res.setHeader('Content-Type', storedMimeType.mime);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(400).send({error: 'Invalid img url'});
  }
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send({error: 'Unexpected error'})
})

app.get('/', (req, res) => {
  res.end(
  `<!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
  </head>
  
  <body>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file" />
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