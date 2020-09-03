const express=require('express')
require('./db/mongoose')
const UserRouter=require('./routers/user-router')
const TaskRouter=require('./routers/task-router')


const app=express()
const port=process.env.PORT



app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)




app.listen(port,()=>{
    console.log("server run up on the port "+port)
})
