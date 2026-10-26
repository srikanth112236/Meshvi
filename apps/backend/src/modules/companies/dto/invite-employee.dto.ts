import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteEmployeeDto {
  @ApiProperty({ example: 'colleague@apexpacific.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ example: 'raw_single_use_invitation_token' })
  @IsNotEmpty()
  token: string;
}
