const {Router}=require("express")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const {User}=require("../model/user.model")
const {Blacklist}=require("../model/blacklist.model")
const {Blog}=require("../model/user.model")

const userRouter=Router()
userRouter.post("/signup", async(req,res)=>{
    try {
        const {name,email,password,role}=req.body
        const isUserPresent=await User.findOne({email})
        if(isUserPresent){
            return res.status(200).send({msg:"User Already Present plz login"})
        }
        const hashedPassword=bcrypt.hashSync(password,8)
        const newUser=new User({...req.body,password:hashedPassword});
        await newUser.save()
        res.send({msg:"Sigup Succesfull",user:newUser})
        
    } catch (error) {
        res.status(500).send({msg:error.message})
        
    }
})

userRouter.post("/login", async(req,res)=>{
    try {
        const {email,password}=req.body
        const isUserPresent=await User.findOne({email})
        if(!isUserPresent){
            return res.status(400).send({msg:"Not a user ,sigup first"})
        }
        const isPasswordCorrect=bcrypt.compareSync(password,isUserPresent.password)
        if(!isPasswordCorrect){
            return res.status(400).send({msg:"Wrong Credentilas"})
        }

        const accessToken=jwt.sign(
            {email,role:isUserPresent.role},
            "jwtsecretkey",
            {expiresIn:"1m"}
        )

        const refreshToken=jwt.sign(
            {email,role:isUserPresent.role},
            "jwtsecretkeyrefresh",
            {expiresIn:"5m"}

        )

        res.cookie("evaAccessToken",accessToken,{maxAge:2000*60})
        res.cookie("evaRefreshToken",refreshToken,{maxAge:1000*60*5})
        res.send({msg:"Login Successful"})
        
    } catch (error) {
        res.status(500).send({msg:error.message})
        
    }
})

userRouter.post("/logout", async(req,res)=>{
    try {
        const {evaAccessToken,evaRefreshToken}=req.cookies
        const  blacklistAccessToken=new Blacklist(evaAccessToken)
        const blacklistRefreshToken=new Blacklist(evaRefreshToken)
        await blacklistAccessToken.save();
        await blacklistRefreshToken.save();
        res.send({msg:"Logout successful"})
        
    } catch (error) {
        res.status(500).send({msg:error.message})
        
    }
})


userRouter.post("/refresh-token", async(req,res)=>{
    try {
        const evaRefreshToken=req.cookies.evaRefreshToken || req?.headers?.authorization
        const isTokenBlacklisted=await Blacklist.find({token:evaRefreshToken})
        if(isTokenBlacklisted) return res.status(400).send({msg:"Please Login"})

        const isTokenvalid=jwt.verify(
            evaRefreshToken,
            "jwtsecretkeyrefresh"
        );
        if(!isTokenvalid) return res.status(400).send({msg:"Plz login again"})

        const newAccessToken=jwt.sign(
            {email,role:isTokenvalid.role},
            "jwtsecretkey",
            {expiresIn:"1m"}
        )

        res.cookie("evaAccessToken",newAccessToken,{maxAge:1000*60})
        res.send({msg:"Token generated"})
    } catch (error) {
        res.status(500).send({msg:error.message})
        
    }
})

userRouter.post('/blogs', (req, res) => {
    const { title, content } = req.body;
    const blog = new Blog({ title, content, author: req.user.id });
    blog.save((err) => {
      if (err) {
        res.status(500).send({ error: "Couldn't Create a blog" });
      } else {
        res.send(blog);
      }
    });
  
});

userRouter.get('/Get', (req, res) => {
    Blog.find({}, (err, blogs) => {
      if (err) {
        res.status(500).send({ error: 'Cannot get the blog' });
      } else {
        res.send(blogs);
      }
    });
  
});



module.exports={userRouter}

