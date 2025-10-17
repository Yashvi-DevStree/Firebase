/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CommentService } from './subcollection/comment.service';
import { IncrementViewsDto } from './dto/increment-views.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/storage.service';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService,
        private readonly commentService: CommentService,
        private readonly storageService: StorageService
    ) { }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Post()
    @UseInterceptors(FileInterceptor('image')) // 👈 handle image upload
    async createNews(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: CreateNewsDto,
        @Req() req
    ) {
        let imageUrl;

        // Upload to Firebase Storage if image exists
        if (file) {
            imageUrl = await this.storageService.uploadFile(file);
        }

        // Create news in Firestore (including image URL)
        return this.newsService.createNews({ ...dto, imageUrl }, req.user);
    }

    @Get('all')
    async getAllNews() {
        return this.newsService.getNews();
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
    @Get('category')
    async listByCategoryAndRole(
        @Query('category') category: string,
        @Query('role') role: string
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
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.newsService.getNewsByDateRange(startDate, endDate);
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
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author', 'user')
    @Post(':id/add-comment')
    async addComment(
        @Param('id') id: string,
        @Body('text') text: string,
        @Req() req
    ) {
        if (!req.user?.uid) throw new UnauthorizedException('User not authenticated');
        if (!text) throw new BadRequestException('Comment text is required');
        return this.commentService.addComment(id, req.user.uid, text);
    }

    // Subcollection: Get comments
    @Get(':id/read-comments')
    async getComment(
        @Param('id') newsId: string
    ) {
        return this.commentService.getComment(newsId);
    }

    @Get(':id')
    async getNewsById(@Param('id') id: string) {
        return this.newsService.getNewsById(id);
    }

    // Update news
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Patch(':id')
    async updateNews(@Param('id') id: string, @Body() dto: UpdateNewsDto, @Req() req) {
        return this.newsService.updateNews(id, dto, req.user);
    }

    // delete news
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Delete(':id')  
    async deleteNews(@Param('id') id: string, @Req() req) {
        return this.newsService.deleteNews(id, req.user);
    } 

}

// {"email": "yashvi.author@gmail.com",
//     "password": "yashvi.author@123"}