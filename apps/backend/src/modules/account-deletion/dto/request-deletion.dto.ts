import { IsEmail, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestAccountDeletionDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered account email address to be scheduled for permanent deletion',
  })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @ApiProperty({
    example: true,
    description: 'Mandatory confirmation acknowledgment flag',
  })
  @IsBoolean({ message: 'Confirmation checkbox must be a boolean value.' })
  confirm: boolean;
}
