var mongoose=require("mongoose");

var storeSchema= new mongoose.Schema({
    name:{
        type:String,
        required:"you have to enter your name"
    },
    description:String,
    tags:[String]
});
storeSchema.index({
    name:"text",
    description:"text"
});
storeSchema.statics.getTagsList=function(){
    return this.aggregate([
        {
            $unwind:"$tags"
        },
        {
            $group :{_id:"$tags",count :{$sum :1}} // we have to make_id it is compulsory  ,when we group this item
        },                                          // count will itself add 1
        {
            $sort:{count:-1}  // -1 descending +1 ascending
        }                                          
    ]);
};
module.exports=mongoose.model("store",storeSchema);