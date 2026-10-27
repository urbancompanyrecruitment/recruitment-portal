import { GEOGRAPHY_TIME_ZONE } from '@/domain/constant';
import { toIsoDate } from '@/domain/format';
import { Geography, InterviewSlot } from '@/domain/interface';
import { compareSlots, countSlotBookings, listBookableSlots } from '@/domain/slot';
import { findOrThrow, mockMutation, mockQuery } from './client';
import { API_ERROR } from './constant';
import { BookableSlot, SlotInput } from './interface';

export const listSlots = (): Promise<InterviewSlot[]> => mockQuery(db => [...db.slots].sort(compareSlots));

export const listBookableSlotsFor = (geography: Geography): Promise<BookableSlot[]> =>
  mockQuery(db =>
    listBookableSlots(db.slots, db.candidates, geography, toIsoDate()).map(slot => ({
      ...slot,
      seatsLeft: slot.capacity - countSlotBookings(db.candidates, slot.id),
    })),
  );

export const createSlot = (input: SlotInput): Promise<InterviewSlot> =>
  mockMutation(db => {
    const trainer = findOrThrow(db.trainers, item => item.id === input.trainerId, API_ERROR.trainerNotFound);
    if (input.date < toIsoDate() || input.capacity < 1) throw new Error(API_ERROR.invalidSlot);

    const clashes = db.slots.some(
      slot => slot.isOpen && slot.trainerId === input.trainerId && slot.date === input.date && slot.time === input.time,
    );
    if (clashes) throw new Error(API_ERROR.duplicateSession);

    const slot: InterviewSlot = {
      ...input,
      id: crypto.randomUUID(),
      geography: trainer.geography,
      timeZone: GEOGRAPHY_TIME_ZONE[trainer.geography],
      isOpen: true,
    };
    return { db: { ...db, slots: [...db.slots, slot] }, result: slot };
  });

export const toggleSlotAvailability = (slotId: string): Promise<InterviewSlot> =>
  mockMutation(db => {
    const current = findOrThrow(db.slots, slot => slot.id === slotId, API_ERROR.slotNotFound);
    const next = { ...current, isOpen: !current.isOpen };
    return { db: { ...db, slots: db.slots.map(slot => (slot.id === slotId ? next : slot)) }, result: next };
  });
