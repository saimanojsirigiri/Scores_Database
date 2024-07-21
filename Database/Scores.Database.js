const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ScoresData = new schema({
    event_id: {
        type: String,
        default: "",
    },
    userName: {
        type: String,
        default: "",
    },
    correctAnswersCount: {
        type: Number,
        default: 0,
    },
    scores: {
        type: Number,
        default: 0,
    },
    averageTimeToAnswer:{
        type: Number,
        default: 0,
    },
    level: {
        type: String,
        default: "",
    },
}, {strict: false});

const scoresData = mongoose.model("scoresData", ScoresData);
module.exports = scoresData;