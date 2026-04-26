const mongoose=require('mongoose')
const dotenv=require('dotenv').config()

const connection = mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("mongo connected");
    return mongoose.connection;
})
.catch(errro=>{
    console.log("nhi connected hue");
    throw errro;
})

module.exports = connection;