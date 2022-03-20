import { ChallengeQnA } from './../interfaces/challengeQnA';
import { Dataset } from './../interfaces/dataset';
// @ts-ignore
import { NlpManager } from 'node-nlp';
import axios from 'axios';
import { ChallengeHistory } from '../models/challenge-history';
import { BadRequestError } from '@cygnetops/common';
import { BASE_URL } from '../constants/chatbot-constants';

export class ChatbotApiHandler {


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
            return resp?.data.user_id;

        } catch (err) {
            throw new BadRequestError('Error - Not able to register Challenge currently, please try again later');
        }
    }

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

    static async findChallengeBehaviorAnswer(question: string, nlpManager: NlpManager): Promise<string> {
        const response = await nlpManager.process('en', question);
        return response.answer;
    }

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

    static async fetchDatasetForQuestions(): Promise<Dataset | string> {
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
    static async updateDatabaseWithQandA(challengeQnA: ChallengeQnA[], userId: string, conversationId: string): Promise<void> {
        try {
            const challengeHistory = new ChallengeHistory({userId, date: new Date(), conversationId, challengeQnA });
            await challengeHistory.save();
        } catch (err) {
            throw new BadRequestError('Error - Not able to log challenge history, however you successfully completed the challenge!!');
        }
    }
}