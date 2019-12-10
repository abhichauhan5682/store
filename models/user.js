var mongoose=require("mongoose");
var passportlocalmongooose=require("passport-local-mongoose");
var validator=require("validator");

var userSchema=mongoose.Schema({
    username:{
        type:String,
        unique:true,
        trim:true,
        requiired:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        requiired:true
    },    
    password:{
        type:String,
        rquired:true
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});
userSchema.plugin(passportlocalmongooose); 
module.exports=mongoose.model("user",userSchema);