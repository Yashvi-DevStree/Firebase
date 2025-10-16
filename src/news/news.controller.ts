/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CommentService } from './subcollection/comment.service';
import { IncrementViewsDto } from './dto/increment-views.dto';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService,
        private readonly commentService: CommentService
    ) { }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Post()
    async createNews(@Body() dto: CreateNewsDto, @Req() req) {
        return this.newsService.createNews(dto, req.user);
    }

    // @Get()
    // async getAllNews() {
    //     return this.newsService.getNews();
    // }

    @Get(':id')
    async getNewsById(@Param('id') id: string) {
        return this.newsService.getNewsById(id);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Patch(':id')
    async updateNews(@Param('id') id: string, @Body() dto: UpdateNewsDto, @Req() req) {
        return this.newsService.updateNews(id, dto, req.user);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Delete(':id')
    async deleteNews(@Param('id') id: string, @Req() req) {
        return this.newsService.deleteNews(id, req.user);
    }

    // paginated news with optional cursor
    @Get()
    async list(
        @Query('limit') limit: number,
        @Query('startAfterId') startAfterId?: string
    ) {
        return this.newsService.getPaginatedNews(Number(limit) || 10, startAfterId);
    }

    // compound query: category +  role
    @Get('category/:category/role/:role')
    async listByCategoryAndRole(
        @Param('category') category: string,
        @Param('role') role: string
    ) {
        return this.newsService.getNewsByCategoryAndRole(category, role);
    }

    // Array contains query for tags
    @Get('tag/:tag')
    async listByTag(
        @Param("tag") tag: string
    ) {
        return this.newsService.getNewsByTag(tag)
    }

    // Date-range queries
    @Get('date-range')
    async getDateRange(
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date
    ) {
        return this.newsService.getNewsByDateRange(startDate, endDate);
    }

    // OR-Like Query
    @Get('category-or-role')
    async listByCategoryOrRole(
        @Param('category') category: string,
        @Param('role') role: string
    ) {
        return this.newsService.getNewsByCategoryOrRole(category, role);
    }

    // Transaction example: increment views
    @Patch(':id/views')
    async incrementViews(
        @Param('id') id: string,
        @Body() dto: IncrementViewsDto
    ) {
        return this.newsService.IncrementView(id, dto);
    }

    // Subcollection: Add comment
    @Post(':id/add-comment')
    async addComment(
        @Param('id') id: string, @Body('text') text: string, @Req() req
    ) {
        return this.commentService.addComment(id, req.user.uid, text)
    }

    // Subcollection: Get comments
    @Get(':id/read-comments')
    async getComment(
        @Param('id') newsId: string
    ) {
        return this.commentService.getComment(newsId);
    }

}

// {"email": "yashvi.author@gmail.com",
//     "password": "yashvi.author@123"}