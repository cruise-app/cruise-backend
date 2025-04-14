const express = require('express')
const mongoose = require('mongoose')

const app = express()

//mongoose.connect("mongodb+srv://CruiseDB:cVR9n199knvMMGCs@cluster0.rgfcr8x.mongodb.net/CruiseDB")

mongoose.connect("mongodb+srv://CruiseDB:cVR9n199knvMMGCs@cluster0.rgfcr8x.mongodb.net/CruiseDB?retryWrites=true&w=majority")

const userSchema = new mongoose.Schema({
    name:String,
    age:Number
    
})

const userModel = mongoose.model("emp2" , userSchema);


app.listen("3001" , () => {
    console.log("Server started on port 3001 and running!!!")
}
)            




