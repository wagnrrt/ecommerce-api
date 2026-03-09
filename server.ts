import express from "express"

const server = express()
const port = 3000

server.get('/', (req, res) => {
  res.send('Hello World')
})

server.listen(port, () => {
  console.log(`server running in http://localhost:${port}`)
})
