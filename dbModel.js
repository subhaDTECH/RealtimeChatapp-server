import mongoose from 'mongoose'

const whatsappSchema=mongoose.Schema({
    chatname:String,
    conversation:[
        {
            message:String,
            timestamp:String,
            user:{
                uid:String,
                email:String,
                photo:String,
                displayName:String
            }
        }
    ]

})
export default   mongoose.model('conversations',whatsappSchema);