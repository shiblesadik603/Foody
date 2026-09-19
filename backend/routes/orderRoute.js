import express from "express";
import authMiddleware, { adminMiddleware } from "../middleware/auth.js";
import { listOrders, placeOrder,updateStatus,userOrders,verifyOrder } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders",authMiddleware,userOrders)
orderRouter.get('/list',authMiddleware,adminMiddleware,listOrders);
orderRouter.post("/status",authMiddleware,adminMiddleware,updateStatus);

export default orderRouter;
