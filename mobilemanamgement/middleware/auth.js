const authhandler=(req,res,next)=>{
    console.log("authorisation completed");
    next();
    
}
module.exports=authhandler;