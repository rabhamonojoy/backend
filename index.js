const express=require("express")
const cookieParser=require("cookie-parser")
const {userRouter}=require("./route/user.router")
const {auth}=require("./middleware/auth.middleware")
const app=express()
require("dotenv").config()
const {connection}=require("./config/db")
app.use(express.json())

app.use(cookieParser())

app.use("/",userRouter)

app.use("/auth",auth,userRouter)
app.listen(process.env.port,async ()=>{
    try {
        await connection
        console.log("connected To DB");
        
    } catch (error) {
        console.log(error.message);
        
    }
    console.log("server is running")
})