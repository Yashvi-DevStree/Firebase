/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';


@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }
    
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
        const url = await this.storageService.uploadFile(file);
        return { message: 'File uploaded successfully', url };
    }

    @Delete('delete')
    async deleteFile(@Body('fileUrl') fileUrl: string) {
        const result = await this.storageService.deleteFile(fileUrl);
        return { message: result };
    }

    @Get('list')
    async list() {
        const files = await this.storageService.listFiles();
        return { message: 'File fetched successfully', files };
    }
}
