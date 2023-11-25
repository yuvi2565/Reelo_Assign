const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/questionsDB', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});


// This is the database schema here:
const questionSchema = mongoose.Schema({
    name: String,
    subject: String,
    topic: String,
    difficulty: String,
    marks: Number
});

const Question = mongoose.model("questions", questionSchema);

// Here is the API endpoint to get all questions 


app.post('/generate-paper', async (req, res) => {
    const totalMarks = req.body.totalMarks;
    const percentageEasy = req.body.percentageEasy;
    const percentageMedium = req.body.percentageMedium;
    const percentageHard = req.body.percentageHard;

    const easyMarks= (percentageEasy*totalMarks)/100;
    const mediumMarks= (percentageMedium*totalMarks)/100;
    const hardMarks= (percentageHard*totalMarks)/100;

    console.log(`Received data: ${totalMarks}, ${percentageEasy}, ${percentageMedium}, ${percentageHard}`);

    // Send a response back to the client
    // res.json({ message: 'Data received successfully' });
    // const subject = req.body.subject;
    // const topic = req.body.topic;
    let selectedQuestions = [];
    try {
        // Fetch questions from the database based on the specified criteria
        const easyQuestions = await getRandomQuestions('Easy', percentageEasy, totalMarks,);
        const mediumQuestions = await getRandomQuestions('Medium', percentageMedium, totalMarks,);
        const hardQuestions = await getRandomQuestions('Hard', percentageHard, totalMarks,);

        // Combine the selected questions

        selectedQuestions = easyQuestions.concat(mediumQuestions, hardQuestions);
        console.log('Selected Questions:', selectedQuestions);
        // Respond with the selected questions
        res.json({
            success: true,
            generatedPaper: {
                questions: selectedQuestions
            },
        });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, error: 'An error occurred while generating the paper.' });
    }
});

// Function to get random questions of a specific difficulty and percentage
async function getRandomQuestions(difficulty, percentage, totalMarks) {
    // Define the query based on difficulty, subject, and topic
    const query = { difficulty };
    // if (subject) query.subject = subject;
    // if (topic) query.topic = topic;
    console.log("Query:", query);

    const questions = await Question.find(query);
    const marksOfQuestions = Math.round((percentage / 100) * totalMarks);

    // // Ensure there are enough questions to meet the desired number
    // if (questions.length < numberOfQuestions) {
    //     throw new Error('Not enough questions available.');
    // }

    // Shuffle the array of questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    // Randomly exclude some questions to reduce the total sum of marks
    const selectedQuestions = [];
    let currentTotalMarks = 0;

    for (const question of shuffledQuestions) {
        // Randomly decide whether to include the question
        if (Math.random() < 0.7) { // Adjust the probability as needed
            selectedQuestions.push(question);
            currentTotalMarks += question.marks;

            // Check if the total sum of marks is sufficient
            if (currentTotalMarks >= marksOfQuestions) {
                break; // Stop adding questions once the desired total is reached
            }
        }
    }

    return selectedQuestions;
}



//  API endpoint to generate a question paper
// app.post('/generatePaper', (req, res) => {
//     const { easyPercentage, mediumPercentage, hardPercentage, totalMarks } = req.body;

//     // Implementing the logic for generating a question paper based on the percentages and total marks
//     // For now, let's just return a sample response with the input data
//     const generatedPaper = {
//         easyPercentage,
//         mediumPercentage,
//         hardPercentage,
//         totalMarks,
//         questions: [] // TODO: Add the generated questions here
//     };

//     res.json(generatedPaper);
// });

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
