import express from "express"
import mongoose from 'mongoose'
import cors from "cors"
import conversations from './dbModel.js';
import Pusher from "pusher"
// app config 
const app=express();
const port=process.env.PORT || 5000;




const pusher = new Pusher({
    appId: "1222989",
    key: "94e467a4140db68818da",
    secret: "4caa0b2411569de5ebb3",
    cluster: "ap2",
    useTLS: true
  });

app.use(express.json())
app.use(cors())
// db 
const dbUrl="mongodb+srv://admin:CGzmpu762v9tbfAS@cluster0.ssjv4.mongodb.net/whatsappDatabase?retryWrites=true&w=majority"
mongoose.connect(dbUrl,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then((result)=>console.log("conn success")).catch((e)=>console.log(e))

// middleware 
mongoose.connection.once('open',()=>{

    console.log("DB connected")
    const changeStream=mongoose.connection.collection('conversations').watch()
    changeStream.on('change',(change)=>{
        if(change.operationType==='insert'){
            pusher.trigger("chatname", "newChatname", {
                'change':change
              });
        }else if(change.operationType==='update'){
            pusher.trigger("addmessage", "newMessage", {
                'change':change
              });

        }else{
            throw new Error("pusher trigger error")
        }

    })
})
// CGzmpu762v9tbfAS

// route 
app.get('/',(req,res)=>{
    res.send("hiiii")
})

app.post('/new/chat',(req,res)=>{
    const dbData=req.body;
    conversations.create(dbData,(err,data)=>{
        if(err){
            res.status(400).send(err)
        }else{
            res.status(201).send(data)
        }
    })

})

app.get('/get/chatlist',(req,res)=>{
    conversations.find({},(err,data)=>{
        if(err){
            res.status(400).send(err)
        }else{
            let chatlist=[];
            data.map((chat)=>{
              const chatinfo={
                  id:chat._id,
                  name:chat.chatname
              }
              chatlist.push(chatinfo)

            })
            res.status(200).send(chatlist)
        }

    })
})
app.post('/new/message',(req,res)=>{
    conversations.updateOne(
        {_id:req.query.id},
        {$push:{conversation:req.body}},
        (err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(201).send(data)
            }
        }
        
        )
})
app.get('/get/messages',(req,res)=>{
    conversations.find({_id:req.query.id},(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
            console.log(data[0].conversation)
        }
    })
   

})
app.get('/last/message',(req,res)=>{
    conversations.find({_id:req.query.id},(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})
app.listen(port,()=>console.log("server run on port 5000"))