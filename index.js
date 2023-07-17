//=============Node js============================================================
// import http from "http"
// import { generateLovePercentage } from "./userdefinemod.js"
 
// console.log(generateLovePercentage())

// const server = http.createServer((req,res)=>{
//     if(req.url === "/about"){
//         res.end(`<h1>Love is ${generateLovePercentage()}</h1>`);
//     }else if(req.url === "/"){
//         res.end("<h1>home</h1>");
//     } else if(req.url === "/contact") {
//         res.end("<h1>contact</h1>");
//     }else{
//         res.end("<h1>page not found</h1>");
//     }
// })  

// server.listen(5000, () => {
//     console.log("server is working")
// })

// ======================================================================================

// `--`-`-`-`-`-`Express js which node js's framework-``-`-`-`--`-`-`-`-`-`--`-`-`-``--`-`-`-`-```
// import express from "express"

// const app = express()

// app.get("/getproducts", (req, res) => {
//     // res.sendStatus(500)
//     res.json({
//         "name": "gaurav",
//         "orders": [],
//         "rate": 23
//     })
// })

// app.get("/", (req, res)=> {
//     res.send("go to slash getproducts api")
// })

// app.listen(5000, ()=>{
//     console.log("Server is working")
// })

//--``--``-`-`-`-`--`-`-`-``--`-`-EJS-``-`-`--``--`-`-`-`-`-``--``--`-``--`-`-`-`--`-`-``


// import express from "express"
// import path from "path"

// const app = express()

// // setting absolute path 
// middleware
// app.use(express.static(path.join(path.resolve(), "public")))

// // setting up view engine
// app.set("view engine", "ejs")

// app.get("/", (req, res) => {
//     // res.sendStatus(500)
//     res.render("index", {provider: "saiyam"})
//     // res.sendFile("index")
// })

// // app.get("/", (req, res)=> {
// //     res.send("go to slash getproducts api")
// // })

// app.listen(5000, ()=>{
//     console.log("Server is working")
// })


// ================================Form project=====================================
// import express from "express"
// import path from "path"
// import mongoose from "mongoose"

// // connecting mongoDB
// mongoose.connect("mongodb://127.0.0.1:27017", {
//     dbName: "backend"
// })
// .then( () => console.log("Database connected"))
// .catch((err) => console.log(err));

// // setting schema 
// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String
// });

// // setting model means collection
// const Message = mongoose.model("Message", messageSchema)
 

// // our server name is app.
// const app = express()
// const users = [] 

// // middleware
// app.use(express.urlencoded( {extends: true} ))
// app.use(express.static(path.join(path.resolve(), "public")))

// // setting up view engine
// app.set("view engine", "ejs")

// app.get("/", (req, res) => {
//     // res.render("index", {provider: "saiyam"});
    
// });


// app.post("/contact", async (req, res) => {
//     // here we can get the data from post method and can store in db.
//     // console.log(req.body.name)
//     const {name, email} = req.body
//     await Message.create({name, email})
//     res.redirect("/success");
// });

// app.get("/users", (req, res)=>{
//     res.json({
//         users,
//     });
// });

// app.get("/success", (req, res)=>{
//     res.render("success")
// });

// app.listen(5000, ()=>{
//     console.log("Server is working");
// });



// ==================Authentication====================================
import express from "express"
import path from "path"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


// connecting mongoDB
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
})
.then( () => console.log("Database connected"))
.catch((err) => console.log(err));

// setting schema 
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// setting model means collection
const User = mongoose.model("User", userSchema)

// our server name is app.
const app = express()

// middleware
app.use(express.urlencoded( {extends: true} ))
app.use(express.static(path.join(path.resolve(), "public")))
app.use(cookieParser())


// setting up view engine
app.set("view engine", "ejs")


const isAuthenticated = async (req, res, next) => {
    const {token} = req.cookies
    if(token) {

        const decoded = jwt.verify(token, "dndjcnskndjcnjjekw")
        console.log(decoded)
        req.user = await User.findById(decoded)

        next()
    }
    else {        
        res.redirect("/login");
    }
};

app.get("/", isAuthenticated, (req, res)=>{
    console.log(req.user)
    res.render("logout", {name: req.user.name})
});


app.get("/register", (req, res)=>{
    res.render("register")
});

app.get("/login", (req, res)=>{
    res.render("login")
});

app.post("/login", async(req, res)=>{
    const {email, password} = req.body
    let user = await User.findOne({email})
    if(!user) return res.redirect("/register")

    let isMatch = await bcrypt.compare(password, user.password)
    
    if(!isMatch) return res.render("login", {email, message: "Incorrect password"})

    const token = jwt.sign({_id: user._id}, "dndjcnskndjcnjjekw");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    
    res.redirect("/")
})


app.post("/register", async (req, res)=>{
    const {name, email, password} = req.body

    let user = await User.findOne({email})

    if(user) {
        return res.redirect("/login")
    }
    const hashedPasswd = await bcrypt.hash(password, 10)
    user = await User.create({name, email, password: hashedPasswd})

    const token = jwt.sign({_id: user._id}, "dndjcnskndjcnjjekw");

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000)
    })
    
    res.redirect("/")
}) 

app.get("/logout", (req, res)=>{
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.listen(5000, ()=>{
    console.log("Server is working");
});
