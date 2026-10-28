const adminMiddleware = (req, res, next) => {
    try{
       const adminRole = req.user.isAdmin;
       if(!adminRole){
              return res.status(403).json({msg:"Access denied, authorized Admin only"});
       }
       
       next();
    }
    catch(error){
        next(error);
}
};

module.exports = adminMiddleware;