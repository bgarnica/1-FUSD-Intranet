import * as React from 'react';
import styles from './BannerCarousel.module.scss';
import { IBannerCarouselProps } from './IBannerCarouselProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { IBannerCarouselState } from './IBannerCarouselState';
import { sp } from "@pnp/sp";
import { Carousel, CarouselButtonsLocation, CarouselButtonsDisplay, CarouselIndicatorShape } from "@pnp/spfx-controls-react/lib/Carousel";
import LinesEllipsis from 'react-lines-ellipsis';

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export default class BannerCarousel extends React.Component<IBannerCarouselProps, IBannerCarouselState> {

  constructor(props: IBannerCarouselProps, state: IBannerCarouselState) {
    super(props);

    sp.setup({
      spfxContext: this.props.context
    });

    this.state = {
      carouselElements: []
    };

    this._getFiles();
  }

  private async _getFiles() {

    let descripcionElement = document.createElement("DIV");
    const items: any[] = await sp.web.lists.getByTitle(this.props.listName.title.toString()).items.select("FileLeafRef", "FileRef", "Caption", "Summary", "Url").get();
    let banner: any[] = [];
    let i: number;

    items.forEach(element => {
      descripcionElement.innerHTML = element.Summary;
      let outputText = descripcionElement.innerText;
      i++;

      banner.push(
        <div key={i} >
          <div>
            <a href={(element.Url != null ? element.Url.Url : "#")}>
              <img className={this.props.fullWidth ? styles.imageFullWidthCover : styles.imageSideBarCover} src={element.FileRef} alt="banner" /*className={[styles['rounded-top'], styles['img-responsive']].join(' ')}*/ />
            </a>
            {element.Caption && element.Summary ?
              <div className={styles.bannerCaptionBlock}>
                <h2 className={styles.bannerCaption}>{element.Caption}</h2>
                <p>
                  <LinesEllipsis
                    text={outputText}
                    maxLine='9'
                    ellipsis='...'
                    trimRight
                    basedOn='letters'
                  />
                </p>
              </div> : ""}
          </div>
        </div>);
    });

    this.setState({ carouselElements: banner });
  }

  public render(): React.ReactElement<IBannerCarouselProps> {
    return (
      <div className={styles.bannerCarousel}>
        <Carousel
          containerStyles={this.props.fullWidth ? styles.bannerFullWidth : styles.bannerSideColumn}
          buttonsLocation={CarouselButtonsLocation.center}
          buttonsDisplay={CarouselButtonsDisplay.buttonsOnly}

          indicatorShape={CarouselIndicatorShape.circle}  
          containerButtonsStyles={styles.carouselButtonsContainer}  
            
          isInfinite={true}
          element={this.state.carouselElements}
          pauseOnHover={true}
        />
      </div>
    );
  }
}
