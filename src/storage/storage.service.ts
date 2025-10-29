/* eslint-disable prettier/prettier */
import { Injectable, } from "@nestjs/common";
import * as fs from "fs";
import path from "path";

@Injectable()
export class StorageService{
    private uploadPath = path.join(__dirname, '..', '..', 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    getLocalFileUrl(filename: string): string { 
        return `http://localhost:3000/uploads/${filename}`;
    }
}