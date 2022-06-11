function admin(req,res,next) {
if(req.user.role != "admin")
    return res.status(400).send("youre not admin");
next();
}
module.exports = admin;