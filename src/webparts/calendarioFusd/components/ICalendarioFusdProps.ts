import { SelectedCalendar } from "../model/SelectedCalendar";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ICalendarioFusdProps {
  header: string;
  selectedCalendarLists: SelectedCalendar[];
  lists: string | string[]; // Stores the list ID(s)
  context: WebPartContext;
  domElement: HTMLElement;
  dateFormat: string;
  showLegend: boolean;
}
