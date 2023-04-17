const mongoose=require("mongoose")

const BlacklistSchema=mongoose.Schema({
    token:{type:String,require:true}
})
const Blacklist=mongoose.model("blacklist",BlacklistSchema)

module.exports={Blacklist}