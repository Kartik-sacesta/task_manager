const Razorpay = require("razorpay");

const crypto = require("crypto");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createorder = async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "kartik.sacesta@gmail.com",
    payment_capture: 1,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Something went wrong!" });
  }
};

const verifypayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  if (digest === razorpay_signature) {
    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature!" });
  }
};

module.exports = {
  verifypayment,
  createorder
};
