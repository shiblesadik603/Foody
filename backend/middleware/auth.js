import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

const authMiddleware = (req, res, next) => {
  const {token} = req.headers;
  if(!token){
    return res.status(401).json({success:false,message:"Not Authorized Login Again"})
  }
  try {
    const token_decode = jwt.verify(token,process.env.JWT_SECRET);
    // keep server-trusted data off req.body, which the client controls
    req.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({success:false,message:"Invalid or expired token"})
  }
}

// only lets users with role "admin" through
export const adminMiddleware = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if(!user || user.role !== "admin"){
      return res.status(403).json({success:false,message:"Admin access only"})
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"})
  }
}

export default authMiddleware;
