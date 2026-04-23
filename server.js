const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')
const PDFDocument = require('pdfkit')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/data', (req, res) => {
  const data = fs.readFileSync('../data.json')
  res.json(JSON.parse(data))
})

app.post('/generate', async (req, res) => {
  const { prompt } = req.body

  try {
    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'gemma3:1b',
      prompt: prompt,
      stream: false
    })

    res.json({ output: response.data.response })

  } catch (err) {
    console.error("OLLAMA ERROR:", err.message)

    if (err.response) {
      console.error("DATA:", err.response.data)
    }

    res.status(500).json({ error: "Backend failed", details: err.message })
  }
})

app.post('/download-pdf', (req, res) => {
  const { text } = req.body

  const doc = new PDFDocument()
  const filePath = 'output.pdf'

  doc.pipe(fs.createWriteStream(filePath))
  doc.text(text)
  doc.end()

  doc.on('finish', () => {
    res.download(filePath)
  })
})

app.listen(5000, () => console.log('Server running on port 5000'))