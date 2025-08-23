import mongoose from "mongoose";

export const connectDB= async()=>{
  await mongoose.connect('mongodb+srv://sadik2007120:ShibleSadik-1234@cluster0.qxhyrrz.mongodb.net/Foody').then(()=>console.log("DB connected"))
}