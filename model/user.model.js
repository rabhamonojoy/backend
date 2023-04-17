const mongoose=require("mongoose")
const UserSchema=mongoose.Schema({
    name:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true,unique:true},
    role:{type:String,enum:["User","Moderator"],default:"User"}
})
const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  
})

UserSchema.hasMany(BlogSchema);
BlogSchema.belongsTo(UserSchema);
const Blog=mongoose.model("blogs",UserSchema)
module.exports={Blog}
const User=mongoose.model("user",UserSchema)
module.exports={User}