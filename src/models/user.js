const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task = require('./task')
const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("email is not valid")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.includes('password')){
                throw new Error('password is not permit to set password')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("age is not valid")
            }
        }
    },
    avatar:{
        type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
    
},{
    timestamps:true
})

userschema.virtual('mytasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userschema.methods.genrateAuthToken=async function(){
    const user=this
    const token=jwt.sign({ _id:user._id.toString() },process.env.JWT_KEY)
    user.tokens=user.tokens.concat({ token })
    await user.save()
    return token
}

userschema.methods.getpublicprofile=function(){
    const user=this
    const userobject=user.toObject()
    delete userobject.password
    delete userobject.tokens
    delete userobject.avatar
    return userobject
}

userschema.statics.findByCredential=async (email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('unable to login..')
    }
    const ismatch=await bcrypt.compare(password,user.password)
    if(!ismatch){
        throw new Error('unable to login..')
    }
    return user
}

userschema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()

})

userschema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
})

const User=mongoose.model('User',userschema)

module.exports=User