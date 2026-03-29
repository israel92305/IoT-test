const express = require("express")
const dotenv = require("dotenv").config()
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)



const app = express()
const PORT = 3000

//male sure app reads json

app.use(express.json())

app.post("/add-reading", async (req, res)=>{
    const { device_id, value } = req.body

    if(!device_id || value == undefined){
        return res.status(400).json({ error: "device_id and value are required"})
    }

    try{
        //inserting into supabase
        const { data, error } = await supabase
        .from("device_readings")
        .insert([{device_id, value}])
    
        if(error){
            return res.status(500).json({ error: error.message})
        }
    
        res.json({success: true, data})
    }catch (err){
        console.error("Backend error:", err)
        res.status(500).json({ error: "Internal server"})
    }
    
})



app.listen(PORT, ()=>{
    console.log("Server running on PORT", PORT);
})