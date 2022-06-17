const mongoose = require('mongoose')
const { Schema } = mongoose

const reqString = {
    type: String,
    required: true,
}

const schema = new Schema({
    guildId: reqString,
    supportId: Array,
    supportCatId: String,
})

const name = 'setupSchema'

module.exports = mongoose.models[name] || mongoose.model(name, schema)