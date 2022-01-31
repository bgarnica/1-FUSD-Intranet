import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'BannerCarouselWebPartStrings';
import BannerCarousel from './components/BannerCarousel';
import { IBannerCarouselProps } from './components/IBannerCarouselProps';
import { PropertyFieldListPicker, PropertyFieldListPickerOrderBy } from '@pnp/spfx-property-controls/lib/PropertyFieldListPicker';

export interface IBannerCarouselWebPartProps {
  lists: any;
  fullWidth: boolean;
}

export default class BannerCarouselWebPart extends BaseClientSideWebPart <IBannerCarouselWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IBannerCarouselProps> = React.createElement(
      BannerCarousel,
      {
        context: this.context,
        listName: this.properties.lists,
        fullWidth: this.properties.fullWidth
      }
    );

    ReactDom.render(element, this.domElement);
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
                PropertyFieldListPicker('lists', {
                  label: strings.ListLabel,
                  selectedList: this.properties.lists,
                  baseTemplate: 101,
                  includeListTitleAndUrl: true,
                  includeHidden: false,
                  orderBy: PropertyFieldListPickerOrderBy.Title,
                  disabled: false,
                  onPropertyChange: this.onPropertyPaneFieldChanged.bind(this),
                  properties: this.properties,
                  context: this.context as any,
                  onGetErrorMessage: null,
                  deferredValidationTime: 0,
                  key: 'listPickerFieldId'
                }),
                PropertyPaneToggle('fullWidth', {
                  label: strings.FullWidthLabel,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
