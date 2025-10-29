/* eslint-disable prettier/prettier */
import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { BookmarkService } from './bookmark.service';

@Controller('bookmark')
export class BookmarkController{
    constructor(private readonly bookmarkService: BookmarkService) { }
    
    @Post('add-bookmark/:userId/:newsId')
    async addBookmark(
        @Param('userId') userId: string,
        @Param('newsId') newsId: string
    ) {
        return this.bookmarkService.addBookmark(userId, newsId);
    }

    @Get(":userId")
    async getBookmarks(@Param("userId") userId: string) {
        return this.bookmarkService.getBookmark(userId);
    }

    @Delete(":userId/:newsId")
    async removeBookmark(@Param("userId") userId: string, @Param("newsId") newsId: string) {
        return this.bookmarkService.removeBookmark(userId, newsId);
    }

    @Post("restore/:userId/:newsId")
    async restoreBookmark(@Param("userId") userId: string, @Param("newsId") newsId: string) {
        return this.bookmarkService.restoreBookmark(userId, newsId);
    }

    @Get("analytics/:userId")
    async analytics(@Param("userId") userId: string) {
        return this.bookmarkService.getUserAnalytics(userId);
    }
}