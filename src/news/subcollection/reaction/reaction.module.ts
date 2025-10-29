import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [FirebaseService, ReactionService],
  controllers: [ReactionController],
})
export class ReactionModule {}
