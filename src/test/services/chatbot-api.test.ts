import { BadRequestError } from '@cygnetops/common';
import { ChatbotApiHandler } from '../../services/chatbot-api';
let userId!: string;
let conversationId!: string;
it('registration works when good email and name is provided', async () => {
    userId = await ChatbotApiHandler.registerNewChallenge('test','test@test.com');
    expect(!!userId).toBe(true);
    expect(typeof userId).toBe('string');
});

it('getting conversation Id works fine', async () => {
    conversationId = await ChatbotApiHandler.getChallengeConversationId(userId);
    expect(!!conversationId).toBe(true);
    expect(typeof conversationId).toBe('string');
});

it('getting questions works fine', async () => {
    const question = await ChatbotApiHandler.getChallengeBehaviorQuestion(conversationId);
    expect(!!question).toBe(true);
});
