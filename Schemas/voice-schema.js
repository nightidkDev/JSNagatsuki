const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
    voiceID: String,
    ownerID: String,
    date: Number
})

const name = 'voiceprivate'

module.exports = mongoose.models[name] || mongoose.model(name, schema)