/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [SeedService, FirebaseService]
})
export class SeedModule {}
