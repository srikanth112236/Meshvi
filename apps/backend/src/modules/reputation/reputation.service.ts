import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitOutcomeDto } from './dto/submit-outcome.dto';

@Injectable()
export class ReputationService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileReputation(profileId: string) {
    return this.prisma.reputationScore.findUnique({
      where: { profileId },
    });
  }

  async submitOutcome(userId: string, dealRoomId: string, dto: SubmitOutcomeDto) {
    const room = await this.prisma.dealRoom.findUnique({ where: { id: dealRoomId } });
    if (!room) throw new NotFoundException('Deal Room not found');
    if (room.initiatorUserId !== userId && room.partnerUserId !== userId)
      throw new ForbiddenException('You are not a participant in this Deal Room');

    const isInitiator = room.initiatorUserId === userId;
    let outcome = await this.prisma.partnershipOutcome.findUnique({ where: { dealRoomId } });

    if (!outcome) {
      // Create outcome record
      outcome = await this.prisma.partnershipOutcome.create({
        data: {
          dealRoomId,
          outcomeType: dto.outcomeType,
          partnershipCategory: dto.partnershipCategory,
          geographyTag: dto.geographyTag,
          dealValue: dto.dealValue,
          initiatorRating: isInitiator ? dto.ratingForOtherParty : null,
          partnerRating: isInitiator ? null : dto.ratingForOtherParty,
          initiatorFeedback: isInitiator ? dto.feedback : null,
          partnerFeedback: isInitiator ? null : dto.feedback,
          initiatorSubmittedAt: isInitiator ? new Date() : null,
          partnerSubmittedAt: isInitiator ? null : new Date(),
        },
      });
    } else {
      // Check not already submitted
      if (isInitiator && outcome.initiatorSubmittedAt)
        throw new ConflictException('You have already submitted your outcome report');
      if (!isInitiator && outcome.partnerSubmittedAt)
        throw new ConflictException('You have already submitted your outcome report');

      outcome = await this.prisma.partnershipOutcome.update({
        where: { dealRoomId },
        data: {
          outcomeType: dto.outcomeType,
          partnershipCategory: dto.partnershipCategory ?? outcome.partnershipCategory,
          geographyTag: dto.geographyTag ?? outcome.geographyTag,
          dealValue: dto.dealValue ?? outcome.dealValue,
          initiatorRating: isInitiator ? dto.ratingForOtherParty : outcome.initiatorRating,
          partnerRating: isInitiator ? outcome.partnerRating : dto.ratingForOtherParty,
          initiatorFeedback: isInitiator ? dto.feedback : outcome.initiatorFeedback,
          partnerFeedback: isInitiator ? outcome.partnerFeedback : dto.feedback,
          initiatorSubmittedAt: isInitiator ? new Date() : outcome.initiatorSubmittedAt,
          partnerSubmittedAt: isInitiator ? outcome.partnerSubmittedAt : new Date(),
        },
      });
    }

    // Recompute reputation for the other party
    const otherUserId = isInitiator ? room.partnerUserId : room.initiatorUserId;
    await this.recomputeReputation(otherUserId);

    return outcome;
  }

  async recomputeReputation(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) return;

    // Find all deal rooms where this user participated
    const dealRooms = await this.prisma.dealRoom.findMany({
      where: { OR: [{ initiatorUserId: userId }, { partnerUserId: userId }] },
      include: { outcome: true },
    });

    const outcomes = dealRooms.map(r => r.outcome).filter(Boolean) as any[];
    const totalDeals = outcomes.length;
    const closedWon = outcomes.filter(o => o.outcomeType === 'DEAL_CLOSED' || o.outcomeType === 'MOU_SIGNED').length;

    // Ratings received by this user from their partners
    const ratingsReceived: number[] = [];
    for (const room of dealRooms) {
      const outcome = room.outcome;
      if (!outcome) continue;
      if (room.initiatorUserId === userId && outcome.partnerRating != null) ratingsReceived.push(outcome.partnerRating);
      if (room.partnerUserId === userId && outcome.initiatorRating != null) ratingsReceived.push(outcome.initiatorRating);
    }

    const avgRating = ratingsReceived.length > 0 ? ratingsReceived.reduce((a, b) => a + b, 0) / ratingsReceived.length : 0;

    const topCategories = [...new Set(outcomes.map(o => o.partnershipCategory).filter(Boolean))].slice(0, 5);
    const topGeographies = [...new Set(outcomes.map(o => o.geographyTag).filter(Boolean))].slice(0, 5);

    await this.prisma.reputationScore.upsert({
      where: { profileId: profile.id },
      update: {
        totalDeals,
        closedWonCount: closedWon,
        averageRatingReceived: Math.round(avgRating * 100) / 100,
        topCategories: JSON.stringify(topCategories),
        topGeographies: JSON.stringify(topGeographies),
        lastComputedAt: new Date(),
      },
      create: {
        profileId: profile.id,
        totalDeals,
        closedWonCount: closedWon,
        averageRatingReceived: Math.round(avgRating * 100) / 100,
        topCategories: JSON.stringify(topCategories),
        topGeographies: JSON.stringify(topGeographies),
      },
    });
  }
}
