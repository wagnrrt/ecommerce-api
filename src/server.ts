import server from './app'

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
