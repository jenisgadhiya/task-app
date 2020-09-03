const express=require('express')
const Task = require('../models/task')
const auth=require('../middleware/auth')
const router=new express.Router()

router.post('/tasks',auth,async (req,res)=>{
    const task=new Task({
        ...req.body,owner:req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks',auth,async (req,res)=>{
    const match={}
    const sort={}
    if(req.query.completed){
        if(req.query.completed==='true')
        match.completed=true
        else if(req.query.completed==='false')
        match.completed=false
    }

    if(req.query.sortby){
        const parts=req.query.sortby.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }

    try{
        //const tasks=await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'mytasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
            
        }).execPopulate()
        res.send(req.user.mytasks)
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/tasks/:id',auth,async (req,res)=>{
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }catch(e){
        res.status(500).send(e)   
    }
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allow=["description","completed"]
    const isvalid=updates.every((u)=>allow.includes(u))
    if(!isvalid){
        return res.status(400).send({
            error:"Invalid update"
        })
    }
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        updates.forEach(update=>task[update]=req.body[update])
        await task.save()

        //const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        await task.remove()
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports=router

