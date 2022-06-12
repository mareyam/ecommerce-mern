var express = require("express");
var router = express.Router();
const validateProduct = require("../../middlewares/validateProduct");
var { Product } = require("../../models/product");
const multer = require("multer");
const auth = require("../../middlewares/auth");
const admin = require("../../middlewares/admin");


const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "././public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage: Storage });

/* GET home page. */
router.get("/", async (req, res) => {
  console.log(req.user);
  let products = await Product.find();
  return res.send(products);
});

router.get("/:id", async (req, res) => {
  try {
    let products = await Product.findById(req.params.id);
    if (!products)
      return res.status(400).send("product with given id not present");
    return res.send(products);
  } catch (err) {
    return res.status(400).send("invalid id");
  }
});

// router.put("/:id", validateProduct, auth, admin, async (req, res) => {
//   let products = await Product.findById(req.params.id);
//   console.log(req.body.name);
//   products.name = req.body.name;
//   products.price = req.body.price;
//   // products.image = req.file.image;
//   await products.save();
//   return res.send(products);
// });

// router.put("/:id", /*validateProduct, auth, admin*/  async (req, res) => {
//   console.log("in put methd")
//   console.log(req.body);
//   let products = await Product.findById(req.params.id);
 
//   products.name = req.body.name;
//   products.price = req.body.price;
//   // products.image = req.file.imagenp;
//   await products.save();
//   return res.send(products);
// });

router.put("/:id", upload.single("image"), async (req, res) => {
  console.log("in put methd");
  console.log(req.body);
  let products = await Product.findById(req.params.id);

  products.name = req.body.name;
  products.price = req.body.price;
  if(req.file){
    products.image = req.file.filename;
    products.imagePath = req.file.path;    
  }
  // products.image = req.file.imagenp;
  await products.save();
  return res.send(products);
});

router.delete("/:id",  auth,admin, async (req, res) => {
  let products = await Product.findByIdAndDelete(req.params.id);
  return res.send(products);
});

router.post("/", upload.single("image"), /*validateProduct,auth,*/  async (req, res) => {
  console.log(req.file);
  if(!req.body.name && !req.body.price && !req.file) return res.status(400).send("enter valid details");
  if(!req.file) return res.status(400).send("enter product image");
  if(!req.body.name) return res.status(400).send("enter product name");
  if(!req.body.price) return res.status(400).send("enter product price");

  let products = new Product();
  products.name = req.body.name;
  products.price = req.body.price;
  products.image = req.file.filename;
  products.imagePath = req.file.path;
  await products.save();
  return res.send(products);
});

module.exports = router;
