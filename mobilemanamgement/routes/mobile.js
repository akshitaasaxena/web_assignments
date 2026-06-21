const express=require("express");
const router= express.Router();

const control=require("../controllers/controller.js");

router.get("/",control.home);
router.get("/insert",control.insert);
router.post("/addmobile",control.addmobile);
router.get("/getmobile",control.getdata);
router.get("/edit/:mobileid",control.edit);
router.post("/update/:mobileid",control.update);
router.get("/delete/:mobileid",control.delete);
router.get("/searchbrand",control.searchbrand)

module.exports = router;