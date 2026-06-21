const express= require("express");
const connectdb= require("./config/config.js");
const routees=require("./routes/mobile.js");
const logr=require("./middleware/log.js")
const auth=require("./middleware/auth.js");

const app=express();

connectdb();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(logr);
app.use(auth);
app.use("/",routees);

app.listen(3000,()=>{
    console.log("server is running on port 3000");
    })
