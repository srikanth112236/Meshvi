import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpressInterestDto {
  @ApiPropertyOptional({ description: 'ID of originating OpportunityMatch if expressing interest from a match card' })
  @IsString()
  @IsOptional()
  opportunityMatchId?: string;

  @ApiProperty({ description: 'Target Opportunity ID receiving the business request' })
  @IsString()
  @IsNotEmpty()
  recipientOpportunityId!: string;

  @ApiProperty({ description: 'Your Opportunity ID proposing the partnership' })
  @IsString()
  @IsNotEmpty()
  senderOpportunityId!: string;

  @ApiProperty({ description: 'Specific commercial proposition or context' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message!: string;
}
