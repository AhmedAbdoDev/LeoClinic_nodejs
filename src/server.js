import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

console.log('MONGODB_URI VALUE:', process.env.MONGODB_URI);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("server is online on port " + PORT));