const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const createError = require("http-errors");
require("dotenv").config();
require("./Helper/start_database");

const app = express();
const scoresData = require("./Database/Scores.Database");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

const PORT = process.env.PORT || 8080;

app.get("/", async(req,res,next) => {
    res.send("Hello");
});

app.post("/leaderboard", async(req,res,next) => {
    const {event_id, level} = req.body;
    try{
        const leaderBoard = await scoresData.find({event_id, level}).
                            populate('userName', 'scores', 'averageTimeToAnswer').
                            sort({scores: -1, averageTimeToAnswer: 1}).
                            limit(100);

        console.log(leaderBoard);
        if(leaderBoard) return res.status(200).json({data: leaderBoard});
        else return res.status(400).json({message: "Data not found"});
    }catch(err){
        return res.status(500).json({message: "Internal Server Error"});
    }
});

app.post("/saveData", async(req,res,next) => {
    console.log(req.body);

    const{
        event_id,
        userName,
        correctAnswersCount,
        scores,
        averageTimeToAnswer,
        level,
    } = req.body;

    try{
        const userCheck = await scoresData.findOne({event_id, userName, level});
        if(userCheck){
            return res.status(400).json({message: "User Data already Saved"});
        }else{
            const newScoresData = new scoresData({
                event_id,
                userName,
                correctAnswersCount,
                scores,
                averageTimeToAnswer,
                level,
            });

            const data = await scoresData.create(newScoresData);
            console.log(data);
            if(data) return res.status(200).json({message: "Data Saved"});
            else return res.status(400).json({message: "Data not saved"});
        }
    }catch(err){
        return res.status(500).json({message: "Internal Server Error"});
    }
});

app.put("/updateData", async(req,res,next) => {
    console.log(req.body);
    const{
        event_id,
        userName,
        correctAnswersCount,
        scores,
        averageTimeToAnswer,
        level,
    } = req.body;

    try{
        const scoresDataCheck = await scoresData.findOne({event_id, userName, level});
        if(scoresDataCheck){
            // if(scoresDataCheck.level === level){
                let userScoreUpdate = await scoresData.findOneAndUpdate(
                    {event_id, userName, level},
                    {$set: {correctAnswersCount,scores,averageTimeToAnswer}},
                    {upsert: true, new: true}
                );
                if(userScoreUpdate){
                    return res.status(200).json({message: "User Data Updated"});
                }else{
                    return res.status(400).json({message: "User not found"});
                }
            }else{
                // Insert new score data if it doesn't exist
                const newScore = new scoresData({
                  event_id,
                  userName,
                  correctAnswersCount,
                  scores,
                  averageTimeToAnswer,
                  level
                });
          
                const data = await scoresData.create(newScore);
                if(data) return res.status(200).json({message: "New Data Saved"})
                else return res.status(400).json({message: "User not found"});
            }
        }
        // else{
        //     // Insert new score data if it doesn't exist
        //     const newScore = new scoresData({
        //       event_id,
        //       userName,
        //       correctAnswersCount,
        //       scores,
        //       averageTimeToAnswer,
        //       level
        //     });
      
        //     const data = await scoresData.create(newScore);
        //     if(data) return res.status(200).json({message: "New Data Saved"})
        //     else return res.status(400).json({message: "User not found"});
        // }
    catch(err){
        return res.status(500).json({message: "Internal Server Error"});
    }
});

app.use(async(req, res, next) => {
    next(createError.NotFound("Url doesnt exist"));
});

app.use(async(err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status || 500,
            message: "Incorrect Data",
        },
    });
    console.log(err);
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});