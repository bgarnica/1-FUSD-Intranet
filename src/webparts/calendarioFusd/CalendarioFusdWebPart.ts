import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log, Version } from '@microsoft/sp-core-library';
import { SPComponentLoader } from '@microsoft/sp-loader';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'CalendarioFusdWebPartStrings';
import CalendarioFusd from './components/CalendarioFusd';
import { ICalendarioFusdProps } from './components/ICalendarioFusdProps';
//import { PropertyFieldCustomList, CustomListFieldType } from 'sp-client-custom-fields/lib/PropertyFieldCustomList';
import { SelectedCalendar } from './model/SelectedCalendar';
//import { PropertyFieldDropDownSelect } from 'sp-client-custom-fields/lib/PropertyFieldDropDownSelect';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { MessageBarType } from 'office-ui-fabric-react';
import MessageComponent, { IMessageComponentProps } from '../shared/components/MessageComponent';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';
import { IPropertyFieldSite, PropertyFieldSitePicker } from '@pnp/spfx-property-controls/lib/PropertyFieldSitePicker';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';

export interface ICalendarioFusdWebPartProps {
  header: string;
  dateFormat: string;
  showLegend: boolean;
  lists: string | string[]; // Stores the list ID(s)
  sites: IPropertyFieldSite[];
  collectionData: any[];
}

export default class CalendarioFusdWebPart extends BaseClientSideWebPart<ICalendarioFusdWebPartProps> {

  private availableViews: IDropdownOption[] = require("../shared/availableViews.json");
  private timeFormat: IDropdownOption[] = require("../shared/timeFormat.json");
  protected onInit(): Promise<void> {
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.4.0/fullcalendar.min.css');
    return super.onInit();
  }

  public render(): void {

    Log.verbose("render()", "Inside Render", this.context.serviceScope);
    if (this.needsConfiguration()) {
      Log.warn("render()", "Webpart not configured", this.context.serviceScope);
      this.renderMessage(strings.WebPartNotConfigured, MessageBarType.error, true);
    } else {
      Log.info("render()", "Webpart configuration not needed", this.context.serviceScope);
      
      let calendars: SelectedCalendar[] = [];

      this.properties.collectionData.forEach(colData => {
        if(colData.Mostrar){
          calendars.push({
            CalendarListTitle: colData.CalendarList,
            CalendarTitle: "",
            Color: colData.Color,
            SiteUrl: colData.SiteURL
          })
        }
      });

      const element: React.ReactElement<ICalendarioFusdProps> = React.createElement(
        CalendarioFusd,
        {
          header: this.properties.header,
          lists: this.properties.lists,
          selectedCalendarLists: calendars,
          context: this.context,
          domElement: this.domElement,
          dateFormat: this.properties.dateFormat,
          showLegend: this.properties.showLegend
        }
      );

      ReactDom.render(element, this.domElement);
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('header', {
                  label: strings.HeaderFieldLabel
                }),
                PropertyFieldCollectionData("collectionData", {
                  key: "collectionData",
                  label: "Collection data",
                  panelHeader: "Collection data panel header",
                  manageBtnLabel: "Manage collection data",
                  value: this.properties.collectionData,
                  fields: [
                    {
                      id: "SiteURL",
                      title: "Site",
                      type: CustomCollectionFieldType.url,
                      required: true
                    },
                    {
                      id: "CalendarList",
                      title: "Calendar List",
                      type: CustomCollectionFieldType.string
                      /*options: [
                        {
                          key: "antwerp",
                          text: "Antwerp"
                        },
                        {
                          key: "helsinki",
                          text: "Helsinki"
                        },
                        {
                          key: "montreal",
                          text: "Montreal"
                        }
                      ]*/
                    },
                    {
                      id: "Color",
                      title: "Color",
                      type: CustomCollectionFieldType.color,
                      required: true
                    },
                    {
                      id: "Mostrar",
                      title: "Mostrar",
                      type: CustomCollectionFieldType.boolean
                    }
                  ],
                  disabled: false
                }),
                /*PropertyFieldCustomList('calendarList', {
                  label: strings.SelectCalendarLabel,
                  value: this.properties.calendarList,
                  headerText: 'Manage Calendar',
                  fields: [
                    { id: 'CalendarTitle', title: 'Calendar Title', required: true, type: CustomListFieldType.string },
                    { id: 'SiteUrl', title: 'Site Url', required: true, type: CustomListFieldType.string },
                    {
                      id: 'CalendarListTitle', title: 'Calendar List Title', required: true,
                      type: CustomListFieldType.string
                    },
                    { id: 'Color', title: 'Color', required: false, type: CustomListFieldType.color }
                  ],
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  render: this.render.bind(this),
                  disableReactivePropertyChanges: this.disableReactivePropertyChanges,
                  properties: this.properties,
                  context: this.context,
                  key: 'calendarList'
                }),*/
                PropertyPaneDropdown('dateFormat', {
                  label: strings.SelectDateFormatFieldLabel,
                  selectedKey: "MMMM Do YYYY, h: mm a",
                  options: this.timeFormat
                }),
                PropertyPaneToggle('showLegend', {
                  label: strings.ShowLegendFieldLabel,
                  onText: strings.OnTextFieldLabel,
                  offText: strings.OffTextFieldLabel,
                  checked: false
                })
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Check whether Aggregated Calendar needs configuration
   * or not
   * @private
   * @returns {boolean}
   * @memberof CalendarioFsdWebPart
   */
   private needsConfiguration(): boolean {
    Log.verbose("needsConfiguration()", "calendarList : " + this.properties.lists, this.context.serviceScope);
    return this.properties.lists === null ||
      this.properties.lists === undefined ||
      this.properties.lists.length === 0;
  }

  /**
   * Render Message method to render the message component
   *
   * @private
   * @param {string} statusMessage
   * @param {MessageBarType} statusMessageType
   * @param {boolean} display
   * @memberof CalendarioFsdWebPart
   */
   private renderMessage(statusMessage: string, statusMessageType: MessageBarType,
    display: boolean): void {
    Log.verbose("renderMessage()", "Rendering Message " + statusMessage + " of type " + statusMessageType, this.context.serviceScope);
    const messageElement: React.ReactElement<IMessageComponentProps> = React.createElement(
      MessageComponent,
      {
        Message: statusMessage,
        Type: statusMessageType,
        Display: display
      }
    );

    ReactDom.render(messageElement, this.domElement);
  }
}
