import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { BackupService } from './backup.service';
import { CreateBackupDto } from './dto/create-backup.dto';
import { UpdateBackupDto } from './dto/update-backup.dto';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get('manualold')
  async manualBackup() {
    return await this.backupService.processDataAndSendEmail();
  }

  @Get('manual')
  async groupBackup() {
    return await this.backupService.backupdata();
  }

  @Get('manuel')
  async downloadBackup(@Res() res: Response) {
    const filePath = await this.backupService.createBackup();
    return res.download(filePath); // plus d'erreur ici
  }

  @Post('sendMail')
  async sendEmail(@Body() body: any) {
    const { destination, subject, message } = body;
    await this.backupService.sendEmail(destination, subject, message);
    return 'E-mail envoyé avec succès';
  }
}
