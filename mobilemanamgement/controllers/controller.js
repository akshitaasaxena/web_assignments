const mobiles=require("../model/model.js");

const mobile={
    home:(req,res)=>{
        res.render("home.ejs");
    },

    getdata:async(req,res)=>{
        let allmobile=await mobiles.find();
        res.render("mobile.ejs",{allmobile});
    },

    insert:(req,res)=>{
        res.render("form.ejs");
    },

    addmobile:async(req,res)=>{
        req.body.ip=req.ip;
        await mobiles.create(req.body);
        res.redirect("/getmobile");
    },

    edit:async(req,res)=>{
        const data=await mobiles.findById(req.params.mobileid);
        res.render("edit.ejs",{data});
    },

    update:async(req,res)=>{
        await mobiles.findByIdAndUpdate(req.params.mobileid,req.body,{new:true});
        res.redirect("/getmobile");
    },

    delete:async(req,res)=>{
        await mobiles.findByIdAndDelete(req.params.mobileid);
        res.redirect("/getmobile");
    },

    searchbrand: async (req, res) => {
     let data = await mobiles.find({ brand: req.query.brand });
    res.render("search.ejs", { data });
}
};

module.exports=mobile;