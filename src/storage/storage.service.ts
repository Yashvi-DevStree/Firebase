/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
    private bucket: any;

    constructor(private readonly firebaseService: FirebaseService) { }

    private getBucket() {
        if (!this.bucket) {
            this.bucket = this.firebaseService.getStorage().bucket(); // now safe
        }
        return this.bucket;
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const bucket = this.getBucket();
        const destination = `uploads/${Date.now()}_${file.originalname}`;
        const tempFilePath = path.join(__dirname, '..', '..', 'temp', file.originalname);

        if (!fs.existsSync(path.dirname(tempFilePath))) {
            fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
        }

        fs.writeFileSync(tempFilePath, file.buffer);

        await bucket.upload(tempFilePath, {
            destination,
            contentType: file.mimetype,
        });

        fs.unlinkSync(tempFilePath);

        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
            destination,
        )}?alt=media`;

        return publicUrl;
    }

    async deleteFile(fileUrl: string): Promise<string> {
        const bucket = this.getBucket();
        const filePath = this.extractFilePath(fileUrl);
        await bucket.file(filePath).delete();
        return `File deleted Successfully: ${filePath}`;
    }

    async listFiles(prefix = 'uploads/'): Promise<string[]> {
        const bucket = this.getBucket();
        const [files] = await bucket.getFiles({ prefix });
        return files.map((file) => file.name);
    }

    private extractFilePath(fileUrl: string): string {
        const decodedUrl = decodeURIComponent(fileUrl);
        const match = decodedUrl.match(/\/o\/(.*?)\?/);
        if (match && match[1]) return match[1];
        throw new Error('Invalid file URL');
    }
}
//         b    sdsd    gfghgh   jbjg    c      ffdfd                     zscfsde mtddd