import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import UsersController from "./controllers/users.controller"
// import routes from './routes'

dotenv.config()
const app = express()

// app.use(express.json())
// app.use(routes)

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(helmet())
app.use(express.json())


app.post('/users', UsersController.create)

export default app
