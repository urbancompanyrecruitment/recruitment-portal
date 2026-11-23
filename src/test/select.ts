import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const OPEN_OPTIONS = '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option';

const SLOT_TIME = /^\d{2}:00$/;

export const openOptionTitles = (): string[] => [...document.querySelectorAll<HTMLElement>(OPEN_OPTIONS)].map(item => item.title);

export const openSelect = async (label: string) => {
  await waitFor(() => expect(screen.getByLabelText(label)).toBeEnabled());

  fireEvent.mouseDown(screen.getByLabelText(label));
};

export const findOption = (option: string): Promise<HTMLElement> =>
  waitFor(() => {
    const matches = [...document.querySelectorAll<HTMLElement>(OPEN_OPTIONS)].filter(item => item.title === option);

    expect(matches.length).toBeGreaterThan(0);

    return matches[matches.length - 1];
  });

export const chooseOption = async (label: string, option: string) => {
  await openSelect(label);

  fireEvent.click(await findOption(option));
};

export const searchOption = async (label: string, option: string) => {
  await userEvent.type(screen.getByLabelText(label), option);

  await chooseOption(label, option);
};

export const findSlotButtons = (): Promise<HTMLElement[]> => screen.findAllByRole('radio', { name: SLOT_TIME });

export const chooseFirstSlot = async () => {
  const [firstSlot] = await findSlotButtons();

  fireEvent.click(firstSlot);
};
