import { READY_YES, PERFORM_SUM, FIND_LARGEST_NUMBER, FIND_EVEN_CHARACTER_STRINGS, SORT_WORDS, FIND_NHL_TEAM, FIND_BASEBALL_TEAM, FIND_TEAM_PER_ESTABLISHMENT_YEAR, CHALLENGE_COMPLETED, NO_RESPONSE_REQUIRED } from './../constants/chatbot-constants';
import { ChallengeQnA } from './../interfaces/challengeQnA';
import { ChatbotApiHandler } from './../services/chatbot-api';

import { Request, Response } from 'express';
import { langProcessDataFeed } from '../services/lang-process';
import { Dataset } from '../interfaces/dataset';
import { ChallengeHistory } from '../models/challenge-history';
import { BadRequestError, NotFoundError } from '@cygnetops/common';
import { START_OF_HARD_QUESTIONS } from '../constants/chatbot-constants';

export class ChatbotController {

    /*
    This function handles the retrieval of the historical challenges that were played till now
    @route: /challenge-history/:id
        id -> user id for which the history needs to be fetched
    returns: list of all challenges and their details played by this user id. All questions and answers are listed as well.
    */
    public async getChallengeHistory(req: Request, res: Response): Promise<void> {
        const userId = req.params.id;
        const allChallengesHistory = await ChallengeHistory.find({userId});
        if (!allChallengesHistory.length) {
            throw new NotFoundError();
        }    
        res.json(allChallengesHistory);
    }


    /*
    This function handles the complete automated game play for the challenges. The steps taken by this function are as follows:
        1. Register for a new challenge
        2. Obtain a new conversation Id for challenge to start
        3. Load the Natural language processing model and train it for latest data on intent and answers to produce.
        4. Loop through all questions and respond with the answers by calculating them per the logic required for each type of question
        5. Once the game is completed successfully, add the logs to the mongoDB collection and exit with success code.
        6. if any of the above step gets error, then return with error code 400 and respective message

    @route: /play-challenge (POST request)
        @body: {
            "name" : "name",
            "email": "email"
        }
        both name and email are mandatory to proceed further.
    returns: Success or failure message and status. Also, give list of all questions and answer on successful completion of the game.
    */
    public async playChallenge(req: Request, res: Response): Promise<void> {
        const { name, email } = req.body;
        if(!name || !email) {
            throw new BadRequestError('Name and Email are mandatory to play the Challenge');
        }
        let qnaLogger: ChallengeQnA[] = [];
        const userId = await ChatbotApiHandler.registerNewChallenge(name, email);
        const conversationId = await ChatbotApiHandler.getChallengeConversationId(userId);
        const nlpManager = await langProcessDataFeed();
        let gameOver = false;
        let dataset!: Dataset;

        while(!gameOver) {
            let replyToQuestion = '';
            let numberArray = [];
            let stringArray = [];
            let workingElementArray: string | any[] = [];
            let workingAnswerArray: string[] = [];

            const question = await ChatbotApiHandler.getChallengeBehaviorQuestion(conversationId);

            if(question?.length > 1) {
                qnaLogger.push({
                    question: question[0]?.text,
                    answer: ''
                });
                if( (await ChatbotApiHandler.findChallengeBehaviorAnswer(question[0]?.text, nlpManager)) === START_OF_HARD_QUESTIONS ) {
                    dataset = (await ChatbotApiHandler.fetchDatasetForQuestions()) as Dataset;
                }
            }
            const questionToCheck: string = question?.length > 1 ? question?.[1]?.text : question?.[0]?.text;
            const parsedIntent = await ChatbotApiHandler.findChallengeBehaviorAnswer(questionToCheck, nlpManager);

            switch(parsedIntent) {
                case NO_RESPONSE_REQUIRED:
                    break;
                    
                case READY_YES:
                    replyToQuestion = 'yes';
                    break;

                case PERFORM_SUM:
                    numberArray = ChatbotController.getNumbersFromQuestion(questionToCheck);
                    replyToQuestion = numberArray.reduce((prev, curr) => prev + curr, 0).toString();
                    break;

                case FIND_LARGEST_NUMBER:
                    numberArray = ChatbotController.getNumbersFromQuestion(questionToCheck);
                    replyToQuestion = Math.max(...numberArray).toString();
                    break;

                case FIND_EVEN_CHARACTER_STRINGS:
                    stringArray = ChatbotController.getWordsFromQuestion(questionToCheck);
                    stringArray = stringArray.filter(str => !(str.length % 2));
                    replyToQuestion = stringArray.join(',');
                    break;
                    
                case SORT_WORDS:
                    stringArray = ChatbotController.getWordsFromQuestion(questionToCheck).sort((a,b) =>
                        a.toLowerCase() < b.toLowerCase() ? -1 : 1
                    );
                    replyToQuestion = stringArray.join(',');
                    break;

                case FIND_NHL_TEAM:
                    workingElementArray = ChatbotController.getWordsFromQuestion(questionToCheck);;
                    workingAnswerArray = [];
                    if(dataset) {
                        dataset.teams.forEach(team => {
                            if(workingElementArray.includes(team.name) && team.league === 'NHL') {
                                workingAnswerArray.push(team.name);
                            }
                        });
                        replyToQuestion = workingAnswerArray?.join(',');
                    } else {
                        console.log('error in fetching dataset');
                    }
                    break;

                case FIND_BASEBALL_TEAM:
                    workingElementArray = ChatbotController.getWordsFromQuestion(questionToCheck);
                    workingAnswerArray = [];
                    if(dataset) {
                        dataset.teams.forEach(team => {
                            if(workingElementArray.includes(team.name) && team.sport === 'baseball') {
                                workingAnswerArray.push(team.name);
                            }
                        });
                        replyToQuestion = workingAnswerArray?.join(',');
                    } else {
                        console.log('error in fetching dataset');
                    }
                    gameOver = true;
                    break;

                case FIND_TEAM_PER_ESTABLISHMENT_YEAR:
                    workingElementArray = questionToCheck.slice(0, -1).split(' ');
                    const yearToCheck = workingElementArray[workingElementArray.length - 1];
                    workingAnswerArray = [];
                    if(dataset) {
                        dataset.teams.forEach(team => {
                            if(team.year === yearToCheck) {
                                workingAnswerArray.push(team.name);
                            }
                        });
                        replyToQuestion = workingAnswerArray?.join(',');
                    } else {
                        console.log('error in fetching dataset');
                    }
                    break;

                case CHALLENGE_COMPLETED:
                    qnaLogger.push({
                        question: questionToCheck,
                        answer: 'Celebration Time!!! Challenge complete.. '
                    });
                    await ChatbotApiHandler.updateDatabaseWithQandA(qnaLogger, userId, conversationId);
                    gameOver = true;
                    replyToQuestion = '';
                    res.status(201).json({
                        message: 'Thanks for playing the game and completing it!!!',
                        challengedetails: qnaLogger,
                        userId
                    });
                    break;

            }

            if(replyToQuestion) {
                const isCorrect = await ChatbotApiHandler.postChallengeBehaviorAnswer(replyToQuestion, conversationId);
                gameOver = isCorrect ? false : true;
                if(!isCorrect) {
                    res.status(200).json({
                        message: 'Thanks for playing the game, Sorry you were not able to complete the game!!!',
                        challengedetails: qnaLogger
                    })
                } else {
                    qnaLogger.push({
                        question: questionToCheck,
                        answer: replyToQuestion
                    });
                }
            }

        }
        return ;
    }

    public static getNumbersFromQuestion(questionToCheck: string): number[] {
        return questionToCheck.split(':')[1].split(',').map((ele: string) =>  {
            return ele.endsWith('?') ? Number(ele.split('?')[0]) : Number(ele);
        });
    }

    public static getWordsFromQuestion(questionToCheck: string): string[] {
        return questionToCheck.slice(0, -1).split(':')[1].split(',').map(ele => ele.trim())
    }
}
