import express from "express"
import { addFood,listFood,removeFood } from "../controllers/foodController.js"
import multer from "multer"
import authMiddleware, { adminMiddleware } from "../middleware/auth.js"

const foodRouter = express.Router();

//Image Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ✅ save files to uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// accept only images up to 5 MB
const upload = multer({
  storage:storage,
  limits:{fileSize:5*1024*1024},
  fileFilter:(req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
      cb(null,true)
    }else{
      cb(new Error("Only image files are allowed"))
    }
  }
})

foodRouter.post("/add",authMiddleware,adminMiddleware,upload.single("image"),addFood)
foodRouter.get("/list",listFood)
foodRouter.post("/remove",authMiddleware,adminMiddleware,removeFood);


export default foodRouter;
