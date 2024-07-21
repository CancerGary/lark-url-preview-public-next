export interface EventReport {
  hasTokenNameShort: boolean;
  hasTokenNameLast: boolean;
  hasHbsHelper: boolean;
  hasTokenName: boolean;
  hasTime: boolean;
  hasHoliday: boolean;
}

export function createEventReport(): EventReport {
  return {
    hasTokenNameShort: false,
    hasTokenNameLast: false,
    hasHbsHelper: false,
    hasTokenName: false,
    hasTime: false,
    hasHoliday: false,
  };
}
