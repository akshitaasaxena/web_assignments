const mongoose=require("mongoose")

const connectdb= async ()=>{
    try{
        await mongoose.connect("mongodb+srv://saxenashita21_db_user:jQRB2HnbB97V0cKs@cluster0.bekk8nh.mongodb.net/?appName=Cluster0")
        console.log("db connected");
        
    }
    catch(err){
        console.log(err);
        
    }
}

module.exports=connectdb;