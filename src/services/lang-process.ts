import {
    START_OF_HARD_QUESTIONS, 
    READY_YES, 
    CHALLENGE_COMPLETED, 
    PERFORM_SUM, 
    FIND_LARGEST_NUMBER, 
    FIND_EVEN_CHARACTER_STRINGS, 
    SORT_WORDS, 
    FIND_BASED_ON_TEAMINFO, 
    FIND_TEAM_PER_ESTABLISHMENT_YEAR, 
    NO_RESPONSE_REQUIRED 
} from './../constants/chatbot-constants';
// @ts-ignore
import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['en'], forceNER: true });
// This function holds the responsibility of feeding the node-nlp manager with the questins data and their probable answering mechanism
const langProcessDataFeed = async () => {

    manager.addDocument('en', 'Welcome to the Rival Chatbot Challenge.', 'greetings.noresp');
    manager.addDocument('en', `First, let's do some math problems`, 'greetings.noresp');
    manager.addDocument('en', `Alright! Let's do some harder questions.`, 'greetings.hardquestions');
    manager.addDocument('en', 'Are you ready to begin?', 'greetings.yesno');
    manager.addDocument('en', 'Great! Are you ready to continue to some word questions?', 'greetings.yesno');
    manager.addDocument('en', 'Are you ready to go?', 'greetings.yesno');
    manager.addDocument('en', 'Thank you for taking the Rival Chatbot Challenge', 'greetings.bye');
    manager.addDocument('en', 'What is the sum of the following numbers', 'questions.sum');
    manager.addDocument('en', 'What is the largest of the following numbers:', 'questions.largest');
    manager.addDocument('en', 'Please repeat only the words with an even number of letters:', 'questions.repeateven');
    manager.addDocument('en', 'Please alphabetize the following words:', 'questions.sortwords');
    manager.addDocument('en', 'Which of the following is team:', 'questions.findteamDetail');
    manager.addDocument('en', 'What sports teams in the data set were established:', 'questions.establish');

    // Train also the NLG
    manager.addAnswer('en', 'greetings.noresp', NO_RESPONSE_REQUIRED);
    manager.addAnswer('en', 'greetings.hardquestions', START_OF_HARD_QUESTIONS);
    manager.addAnswer('en', 'greetings.yesno', READY_YES);
    manager.addAnswer('en', 'greetings.bye', CHALLENGE_COMPLETED);
    manager.addAnswer('en', 'questions.sum', PERFORM_SUM);
    manager.addAnswer('en', 'questions.largest', FIND_LARGEST_NUMBER);
    manager.addAnswer('en', 'questions.repeateven', FIND_EVEN_CHARACTER_STRINGS);
    manager.addAnswer('en', 'questions.sortwords', SORT_WORDS);
    manager.addAnswer('en', 'questions.findteamDetail', FIND_BASED_ON_TEAMINFO);
    manager.addAnswer('en', 'questions.establish', FIND_TEAM_PER_ESTABLISHMENT_YEAR);

    // Train and save the model.
        await manager.train();
        manager.save();
        return manager;
}

export { langProcessDataFeed };
