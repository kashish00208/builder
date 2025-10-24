import mongoose from "mongoose"
async function Dbconnect() {
    const mongoUri = process.env.MONGO_URI
    if(!mongoUri){
        throw new Error("Provide a valid databse connection string")
    }
    try{
        await mongoose.connect(mongoUri)
        console.log("Database connected")
    }catch(err){
        console.error("MongoDB connectioon falied")
    }
}
export default Dbconnect;