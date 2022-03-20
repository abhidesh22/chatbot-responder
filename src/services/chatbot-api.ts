import { ChallengeQnA } from './../interfaces/challengeQnA';
import { Dataset } from './../interfaces/dataset';
// @ts-ignore
import { NlpManager } from 'node-nlp';
import axios from 'axios';
import { ChallengeHistory } from '../models/challenge-history';
import { BadRequestError } from '@cygnetops/common';
import { BASE_URL } from '../constants/chatbot-constants';

export class ChatbotApiHandler {


    /*
        function : registerNewChallenge
        description: starts the chatbot challenge by registering a new user.
        parms: name and email (type: string)
        returns: userId (string)
    */

    static async registerNewChallenge(name: string, email: string ): Promise<string> {
        try {
            const config = {
                headers: {
                  "Content-Type": "application/json"
                },
            };
            const resp = await axios.post(
                `${BASE_URL}/challenge-register`,
                { name, email},
                config
            );
            return resp?.data?.user_id;

        } catch (err) {
            throw new BadRequestError('Error - Not able to register Challenge currently, please try again later');
        }
    }

    /*
        function : getChallengeConversationId
        description: gets a conversation Id from the chatbot to be used for the further communication
        parms: userId (which is obtained in registerNewChallenge)
        returns: conversationId (string)
    */

    static async getChallengeConversationId(userId: string): Promise<string> {
        try {
            const config = {
                headers: {
                  "Content-Type": "application/json"
                },
            };
            const resp = await axios.post(
                `${BASE_URL}/challenge-conversation`,
                { user_id: userId},
                config
            );
            return resp?.data?.conversation_id;

        } catch (err) {
            throw new BadRequestError('Error - Not able to start Challenge conversation currently, please try again later');
        }
    }

    /*
        function : getChallengeBehaviorQuestion
        description: gets the next question to continue the challenge
        parms: conversationId (which is obtained in getChallengeConversationId)
        returns: question array
    */
    
    static async getChallengeBehaviorQuestion(conversationId: string): Promise<any> {
        try {
            const config = {
                headers: {
                  "Content-Type": "application/json"
                },
            };
            const resp = await axios.get(
                `${BASE_URL}/challenge-behaviour/${conversationId}`,
                config
            );
            return resp?.data?.messages;

        } catch (err) {
            throw new BadRequestError('Error - Not able to register Challenge currently, please try again later');
        }
    }

    /*
        function : findChallengeBehaviorAnswer
        description: uses the nlp manager to get the stored answers for the questions
        parms: question: string , nlpManager: NlpManager
        returns: answer from nlp (string)
    */

    static async findChallengeBehaviorAnswer(question: string, nlpManager: NlpManager): Promise<string> {
        const response = await nlpManager.process('en', question);
        return response.answer;
    }

    /*
        function : postChallengeBehaviorAnswer
        description: post the response from node js application to chatboat
        parms: replyToQuestion : string, conversationId: string
        returns: correct -> property which is used for getting info regarding whether answer is correct
    */
    static async postChallengeBehaviorAnswer(replyToQuestion: string, conversationId: string): Promise<string> {
        try {
            const config = {
                headers: {
                  "Content-Type": "application/json"
                },
            };
            const resp = await axios.post(
                `${BASE_URL}/challenge-behaviour/${conversationId}`,
                { content: replyToQuestion },
                config
            );
            return resp?.data?.correct;

        } catch (err) {
            throw new BadRequestError('Error - Not able to continue challenge conversation currently, please try again later');
        }
    }

    /*
        function : fetchDatasetForQuestions
        description: load the data which is needed for sports related questions
        returns: dataset -> teams data
    */

    static async fetchDatasetForQuestions(): Promise<Dataset> {
        try {
            const config = {
                headers: {
                  "Content-Type": "application/json"
                },
            };
            const resp = await axios.get(
                `${BASE_URL}/challenge-behaviour/data`,
                config
            );
            return resp?.data;

        } catch (err) {
            throw new BadRequestError('Error - Not able to fetch Dataset currently, please try again later');
        }
    }

    /*
        function : updateDatabaseWithQandA
        description: update the mongoDB with the challenge Q&A history 
        parms: challengeQnA:ChallengeQnA[], userId: string, conversationId: string
    */

    static async updateDatabaseWithQandA(challengeQnA: ChallengeQnA[], userId: string, conversationId: string): Promise<void> {
        try {
            const challengeHistory = new ChallengeHistory({userId, date: new Date(), conversationId, challengeQnA });
            await challengeHistory.save();
        } catch (err) {
            throw new BadRequestError('Error - Not able to log challenge history, however you successfully completed the challenge!!');
        }
    }
}