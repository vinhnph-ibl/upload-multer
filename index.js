import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import readChunk from 'read-chunk'
import fileType from 'file-type'
import sharp from 'sharp'
import crypto from 'crypto'

const app = express()
const UPLOAD_PATH = path.join(__dirname, 'uploads')

const storage = multer.memoryStorage()

const upload = multer({ 
  storage
})

app.post('/upload', upload.single('file'), async function(req, res){
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

  if(!req.file){
    return res.status(400).send({status: 'error', error: 'Invalid file'})
  }
  const image = sharp(req.file.buffer)
  try {
    const { format, width, height } = await image.metadata()
    const validExtensions = ['png', 'jpeg', 'gif']
    if(!validExtensions.includes(format)){
      return res.status(400).send({status: 'error', error: 'Invalid file extension'})
    }
    if(width > 512 || height > 512){
      return res.status(400).send({status: 'error', error: 'Width / Height is too high definition'})
    }
  } catch (error) {
    return res.status(400).send({status: 'error', error: 'Invalid file'})
  }

  const raw = crypto.randomBytes(16)
  const fileName = raw.toString('hex')
  const filePath = path.join(UPLOAD_PATH, fileName)
  const wstream = fs.createWriteStream(filePath)
  wstream.write(req.file.buffer)
  wstream.end()

  // Everything went fine.
  res.status(200).send({status: 'success', fileName})
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