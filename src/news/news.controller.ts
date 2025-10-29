/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query, UnauthorizedException, BadRequestException, UseInterceptors, UploadedFile } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateNewsDto } from './dto/update-news.dto';
import { CommentService } from './subcollection/comments/comment.service';
import { IncrementViewsDto } from './dto/increment-views.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('news')
export class NewsController {
    constructor(
        private readonly newsService: NewsService,
        private readonly commentService: CommentService,
    ) { }

    // 1️⃣ CREATE NEWS (with image upload)
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Post()
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const suffix = Date.now() + extname(file.originalname);
                callback(null, `${suffix}`);
            }
        })
    }))
    async createNews(@UploadedFile() image: Express.Multer.File, @Body() dto: CreateNewsDto, @Req() req) {
        const imageUrl = image ? `http://localhost:3000/uploads/${image.filename}` : undefined;
        return this.newsService.createNews({ ...dto, imageUrl }, req.user);
    }

    // 3️⃣ FILTERING / LIST APIs
    @Get('all')
    async getAllNews() {
        return this.newsService.getNews();
    }

    @Get()
    async list(@Query('limit') limit: number, @Query('startAfterId') startAfterId?: string) {
        return this.newsService.getPaginatedNews(Number(limit) || 10, startAfterId);
    }

    @Get('category')
    async listByCategoryAndRole(@Query('category') category: string, @Query('role') role: string) {
        return this.newsService.getNewsByCategoryAndRole(category, role);
    }

    @Get('tag/:tag')
    async listByTag(@Param("tag") tag: string) {
        return this.newsService.getNewsByTag(tag);
    }

    @Get('date-range')
    async getDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.newsService.getNewsByDateRange(startDate, endDate);
    }

    // 4️⃣ COMMENTS (subcollection)
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author', 'user')
    @Post(':id/add-comment')
    async addComment(@Param('id') id: string, @Body('text') text: string, @Req() req) {
        if (!req.user?.uid) throw new UnauthorizedException('User not authenticated');
        if (!text) throw new BadRequestException('Comment text is required');
        return this.commentService.addComment(id, req.user.uid, text);
    }

    @Get(':id/read-comments')
    async getComment(@Param('id') newsId: string) {
        return this.commentService.getComment(newsId);
    }

    // 5️⃣ INCREMENT VIEWS
    @Patch(':id/views')
    async incrementViews(@Param('id') id: string, @Body() dto: IncrementViewsDto) {
        return this.newsService.IncrementView(id, dto);
    }

    // 6️⃣ GET / UPDATE / DELETE NEWS (keep at bottom)
    @Get(':id')
    async getNewsById(@Param('id') id: string) {
        return this.newsService.getNewsById(id);
    }

    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `news-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async updateNews(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UpdateNewsDto,
        @Req() req: any,
    ) {
        return this.newsService.updateNews(id, dto, req.user, file);
    }


    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('admin', 'author')
    @Delete(':id')
    async deleteNews(@Param('id') id: string, @Req() req) {
        return this.newsService.deleteNews(id, req.user);
    }
}

// {"email": "yashvi.author@gmail.com",
//     "password": "yashvi.author@123"}         