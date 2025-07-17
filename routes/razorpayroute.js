const app=require("express");
const router=app.Router();

const {createorder,verifypayment}=require("../controllers/razorpaycontroller");

router.post("/create",createorder);
router.post("/verify",verifypayment);

module.exports=router;