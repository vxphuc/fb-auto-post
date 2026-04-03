const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

router.get("/", (req, res) => {
    try{
        const groupPath = path.join(__dirname, "../data/groups.txt");
        
    }catch(err){

    }
})