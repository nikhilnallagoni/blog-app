const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const app = express();
const salt = bcrypt.genSaltSync(10);
const secret = "daoewuer8elxnkdsfjdfhakvn";
const fs = require("fs");
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));
try {
  mongoose.connect(
    // "mongodb+srv://user:user@cluster0.ddbwjeo.mongodb.net/?retryWrites=true&w=majority"
    "mongodb://localhost:27017/mernblog"
  );
  console.log("connection successful");
} catch (err) {
  console.log("connetction error");
}
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (err) {
    res.status(400).json(err);
  }
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const UserDoc = await User.findOne({ username: username });
  const passOk = bcrypt.compareSync(password, UserDoc.password);
  if (passOk) {
    //loggedin
    jwt.sign({ username, id: UserDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      else
        res.cookie("token", token).json({
          id: UserDoc._id,
          username,
        });
    });
  } else {
    //notLoggedIn
    res.status(400).json("wrong credentials");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    res.json(info);
    // console.log(info);
  });
});

// app.get('/profile', (req, res) => {
//     const { token } = req.cookies;

//     if (!token) {
//         return res.status(401).json({ error: 'Token not provided' });
//     }

//     jwt.verify(token, secret, {}, (err, info) => {
//         if (err) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         } else {
//             res.json(info);
//         }
//     });
// });
app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDoc);
  });
  // res.json({ files: req.file });
  // res.json(postDoc);
});
app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("you are not the author");
    }
    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });
    res.json(postDoc);
  });
});
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["username"]);
  res.json(postDoc);
});

app.listen(4000);
