import dotenv from 'dotenv'
import app from "./src/app.js";
import connectToDb from './src/config/db.js';

dotenv.config()
connectToDb()

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Server is ready to run on port: ${port}`)
})