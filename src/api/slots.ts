import dayjs from 'dayjs';
import { countSlotBookings, generateSlots, listBookableSlots } from '@/domain/slot';
import { mockQuery } from './client';
import { BookableSlot, SlotDaySummary } from './interface';

export const listBookableSlotsFor = (cityKey: string): Promise<BookableSlot[]> =>
  mockQuery(db =>
    listBookableSlots(cityKey, db.candidates, dayjs()).map(slot => ({
      ...slot,
      seatsLeft: slot.capacity - countSlotBookings(db.candidates, slot.id),
    })),
  );

export const listUpcomingSlotDays = (): Promise<SlotDaySummary[]> =>
  mockQuery(db => {
    const slots = generateSlots(dayjs());
    const keys = [...new Set(slots.map(slot => `${slot.date}|${slot.cityKey}`))];

    return keys.map(key => {
      const [date, cityKey] = key.split('|');
      const daySlots = slots.filter(slot => slot.date === date && slot.cityKey === cityKey);

      return {
        date,
        cityKey,
        slots: daySlots.length,
        booked: daySlots.reduce((total, slot) => total + countSlotBookings(db.candidates, slot.id), 0),
        capacity: daySlots.reduce((total, slot) => total + slot.capacity, 0),
      };
    });
  });
