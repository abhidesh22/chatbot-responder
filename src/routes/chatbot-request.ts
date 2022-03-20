import { ChatbotController } from './../controllers/chatbot-controller';
import * as express from 'express';

const router = express.Router();
const chatbotController = new ChatbotController();

router.route('/play-challenge').post(chatbotController.playChallenge);
router.route('/challenge-history/:id').get(chatbotController.getChallengeHistory);

export { router as chatbotRequestRouter };
