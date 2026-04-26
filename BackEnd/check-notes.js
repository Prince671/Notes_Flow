require("dotenv").config();
const mongoose = require("mongoose");
const Note = require("./models/notes.model");

async function checkNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const notes = await Note.find({});
    console.log("Total notes in DB:", notes.length);
    notes.forEach(n => {
      console.log(`- Title: ${n.title} | Attachments: ${JSON.stringify(n.attachments || [])}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkNotes();
