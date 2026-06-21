const mongoose=require("mongoose");

const mobileSchema= new mongoose.Schema({
    model: String,
    name: String,
    ram: String,
    storage: String,
    price: Number,
    brand:String
})

module.exports=mongoose.model("mobiles",mobileSchema);
