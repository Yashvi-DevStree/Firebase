import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [UserService, FirebaseService],
  controllers: [UserController],
})
export class UserModule {}
