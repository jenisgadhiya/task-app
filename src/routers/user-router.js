const express=require('express')
const User = require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const { sendwelcomemail }=require('../emails/account')
const { sendcancelmail }=require('../emails/account')
const router=new express.Router()

router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()
        sendwelcomemail(user.email,user.name)
        const token=await user.genrateAuthToken()
        res.status(201).send({user:user.getpublicprofile(),token})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/login',async (req,res)=>{
    try{
        const user=await User.findByCredential(req.body.email,req.body.password)
        const token=await user.genrateAuthToken()
        res.send({user:user.getpublicprofile(),token})
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/logout',auth,async (req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()   
        res.send({user:req.user.getpublicprofile()})
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send({user:req.user.getpublicprofile()})
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me',auth,async (req,res)=>{
    res.send({user:req.user.getpublicprofile()})    
})




router.patch('/users/me',auth,async (req,res)=>{
    const updates=Object.keys(req.body)
    const allow=["name","email","password","age"]
    const isvalid=updates.every((u)=>allow.includes(u))
    if(!isvalid){
        return res.status(400).send({
            error:"Invalid update"
        })
    }
    try{
        updates.forEach(update=>req.user[update]=req.body[update])
        if(updates.includes('password')){
            req.user.tokens=[]
            await req.user.save()
            res.send({user:req.user.getpublicprofile()})
        }else{
            await req.user.save()
            res.send({user:req.user.getpublicprofile()})   
        }
        
        
        // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try{
        await req.user.remove()
        sendcancelmail(req.user.email,req.user.name)
        res.send({user:req.user.getpublicprofile()})
    }catch(e){
        res.status(500).send(e)
    }
})

const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('upload only jpg,jpeg,png file'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()    
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send({user:req.user.getpublicprofile()})
})

router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})



module.exports=router