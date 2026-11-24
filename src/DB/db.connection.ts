import mongoose from "mongoose";
import { dbConfig } from "../config/db.config";


const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(dbConfig);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
