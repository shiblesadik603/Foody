import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type:String, required:true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  // pass the function, not Date.now(), so it runs for every new order
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  stripeSessionId: { type: String }
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
