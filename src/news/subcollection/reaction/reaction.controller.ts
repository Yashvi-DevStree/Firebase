/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReactionService } from './reaction.service';

@Controller('news/:newsId/reaction')
export class ReactionController {
    constructor(private readonly reactionService: ReactionService) { }
    
    // ❤️ Like or unlike a news article
    @Post('/:userId/like')
    async toggleLike(
        @Param('newsId') newsId: string,
        @Param('userId') userId: string
    ) {
        return this.reactionService.toggleLike(newsId, userId);
    }

    // ❤️ Add custom emoji reaction
    @Post(':userId/add-reaction')
    async addReaction(
        @Param('newsId') newsId: string,
        @Param('userId') userId: string,
        @Body('emoji') emoji: string,
    ) {
        return this.reactionService.addReaction(newsId, userId, emoji);
    }

    // 🧾 Get all reactions for the news article
    @Get()
    async getReactions(@Param('newsId') newsId: string) {
        return this.reactionService.getReactions(newsId);
    }

    // 📊 Get reaction stats (likes + emoji breakdown)
    @Get('stats')
    async getReactionStats(@Param('newsId') newsId: string) {
        return this.reactionService.getReactionStats(newsId);
    }
}
