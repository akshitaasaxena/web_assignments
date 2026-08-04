const express=require("express")
const mongoose=require("mongoose")

const app=express();
app.use(express.static("public"));
mongoose.connect("mongodb+srv://saxenashita21_db_user:Akshita21@cluster0.xpfwtbp.mongodb.net/?appName=Cluster0")
.then(()=>{
    console.log("db connected");
    
})
.catch(err=> console.log(err));
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}))
const taskschema= new mongoose.Schema({
    taskname:{
        type:String,
        required:true,
        minlength:1
    }
});
const task=mongoose.model("todo",taskschema);

app.get("/",async(req,res)=>{
    let alltask= await task.find();
    console.log(alltask);

    res.render("task.ejs",{alltask});
    
})
app.post("/createdata",async(req,res)=>{
    console.log(req.body);
    
    let data=await task.create(req.body)
    console.log(data);
    res.redirect("/");
    
})
app.get("/postdata",async(req,res)=>{
    res.render("task.ejs")
})

app.listen(4000,()=>{
    console.log("server is running on port 3000");

    
})