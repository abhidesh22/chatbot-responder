import * as mongoose from 'mongoose';

/*
    Schema to maintain history for all challanges
*/
const ChallengeHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        conversationId: {
            type: String,
            required: true
        },
        challengeQnA: [{
            question: String,
            answer: String
        }]
    },
    {
      timestamps: true,
    }
);

const ChallengeHistory = mongoose.model("ChallengeHistory", ChallengeHistorySchema)

export { ChallengeHistory };