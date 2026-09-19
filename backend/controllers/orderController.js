import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DELIVERY_CHARGE = 2;

//placing user order for frontend
const placeOrder = async (req, res) => {

  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5174";

  try {
    // never trust prices sent by the client: look every item up in the DB
    const requested = req.body.items || [];
    const ids = requested.map((item) => item._id);
    const foods = await foodModel.find({ _id: { $in: ids } });

    const items = [];
    for (const item of requested) {
      const food = foods.find((f) => f._id.toString() === item._id);
      const quantity = Number(item.quantity);
      if (!food || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({success:false,message:"Invalid cart items"});
      }
      items.push({ _id: food._id, name: food.name, price: food.price, quantity });
    }
    if (items.length === 0) {
      return res.status(400).json({success:false,message:"Cart is empty"});
    }

    const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0) + DELIVERY_CHARGE;

    const newOrder = new orderModel({
      userId: req.userId,
      items,
      amount,
      address: req.body.address
    })
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency:"inr",
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100 * 80
      },
      quantity: item.quantity
    }))

    line_items.push({
      price_data: {
        currency:"inr",
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: DELIVERY_CHARGE * 100 * 80
      },
      quantity: 1
    })

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: 'payment',
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    res.json({success:true,session_url:session.url});

  }catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"});
  }
}

// ask Stripe whether the order was really paid instead of trusting the
// "success" query param, which the user can edit
const verifyOrder = async (req,res) => {
  const {orderId} = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if(!order || !order.stripeSessionId){
      return res.status(404).json({success:false,message:"Order not found"});
    }
    if(order.payment){
      return res.json({success:true,message:"Paid"});
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if(session.payment_status === "paid"){
      order.payment = true;
      await order.save();
      // empty the cart only after payment succeeds
      await userModel.findByIdAndUpdate(order.userId,{cartData:{}});
      res.json({success:true,message:"Paid"});
    }else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success:false,message:"Not Paid"});
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"});
  }
}

//user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({userId: req.userId});
    res.json({success:true,data:orders});
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"});
  }
}

//Listing orders for admin dashboard
const listOrders = async (req, res) => {
  try {
    const orders= await orderModel.find({});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"});
  }
}

//api for updating order status
const updateStatus = async (req,res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,message:"Error"});
  }

}

export { placeOrder, verifyOrder,userOrders,listOrders,updateStatus };
