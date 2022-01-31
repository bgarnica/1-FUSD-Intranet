import * as React from "react";
import "jquery";
import {
	Calendar,
	Component,
	createElement,
	DayHeaderContentArg,
} from "@fullcalendar/core";
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import styles from "./CalendarioFusd.module.scss";
import { ICalendarioFusdProps } from "./ICalendarioFusdProps";
import { escape } from "@microsoft/sp-lodash-subset";
import { FullCalendarEvent } from "../model/FullCalendarEvent";
import { css, Callout, DirectionalHint, Label } from "office-ui-fabric-react";
import * as moment from "moment";
import * as strings from "CalendarioFusdWebPartStrings";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { AggregatedCalendarService } from "../service/AggregatedCalendarService";
import { AggregatedCalendarMockService } from "../service/AggregatedCalendarMockService";

export interface ICalendarioFusdState {
	isCalloutVisible?: boolean;
	selectedEvent: FullCalendarEvent;
	directionalHint?: DirectionalHint;
	isBeakVisible?: boolean;
	gapSpace?: number;
	beakWidth?: number;
	EventElement: HTMLElement;
}

class CustomDayHeader extends Component<{ text: string }> {
	render() {
		return createElement("div", {}, "!" + this.props.text + "!");
	}
}

export default class CalendarioFusd extends React.Component<
	ICalendarioFusdProps,
	ICalendarioFusdState
> {
	public constructor(props: ICalendarioFusdProps) {
		super(props);

		this.onCalloutDismiss = this.onCalloutDismiss.bind(this);
		this.eventClickHandler = this.eventClickHandler.bind(this);

		// Initialize the State for ReactAggregatedCalendar
		this.state = {
			isCalloutVisible: false,
			selectedEvent: {
				id: 0,
				title: "",
				color: "",
				start: moment(),
				end: moment(),
				description: "",
				location: "",
				allDay: false,
				category: "",
			},
			directionalHint: DirectionalHint.bottomCenter,
			isBeakVisible: true,
			gapSpace: 10,
			beakWidth: 20,
			EventElement: null,
		};
	}

	public componentDidMount() {
		this.renderContents();
	}

	/**
	 * componentDidUpdate
	 *
	 * @memberof CalendarioFsd
	 */
	public componentDidUpdate() {
		this.renderContents();
	}

	public render(): React.ReactElement<ICalendarioFusdProps> {
		const { isCalloutVisible } = this.state;
		let calendarLegend: JSX.Element[] = [];

		// Render the Legend for the Calendar Events
		calendarLegend = this.props.selectedCalendarLists.map((calendar) => {
			let calendarLegendColor = {
				"background-color": `${calendar.Color}`,
			};
			return (
				<div className={styles.outerLegendDiv} title={calendar.CalendarTitle}>
					<div
						className={styles.innerLegendDiv} /*style={calendarLegendColor}*/
					></div>
					{calendar.CalendarTitle}
				</div>
			);
		});

		// Render the FullCalendar container
		return (
			<div className={styles.calendarioFusd}>
				<h1>{this.props.header}</h1>
				<div>
					<div>
						<div>
							<div id="aggregatedCalendarComp"></div>
							{this.props.showLegend && (
								<div className={styles.legend}>{calendarLegend}</div>
							)}
						</div>
					</div>
				</div>

				{isCalloutVisible && (
					<Callout
						className="ms-CalloutExample"
						ariaLabelledBy={"callout-label-1"}
						ariaDescribedBy={"callout-description-1"}
						role={"alertdialog"}
						target={this.state.EventElement}
						onDismiss={this.onCalloutDismiss}
						gapSpace={this.state.gapSpace}
						isBeakVisible={this.state.isBeakVisible}
						beakWidth={this.state.beakWidth}
						directionalHint={this.state.directionalHint}
						setInitialFocus={true}
					>
						<button
							onClick={this.onCalloutDismiss}
							className={css(
								styles.msCalloutclose,
								styles.closeIconFocus,
								"ms-fontColor-white"
							)}
						>
							<i className="ms-Icon ms-Icon--Clear"></i>
						</button>
						<div className={css(styles.msCalloutheader, "ms-fontColor-white")}>
							<p className={styles.msCallouttitle}>
								{this.state.selectedEvent.title}
							</p>
						</div>
						<div
							className={css(
								styles.msCalloutinner,
								styles.calloutInnerEventContent
							)}
						>
							<div className="ms-Callout-content">
								<p
									className={styles.msCalloutsubText}
									dangerouslySetInnerHTML={this.createMarkup(
										this.state.selectedEvent.description
									)}
								/>
								<p className={styles.msCalloutsubText}>
									<Label>
										{strings.StartTimeLabel}
										{this.state.selectedEvent.start.format(
											this.props.dateFormat
										)}{" "}
									</Label>
									{this.state.selectedEvent.end !== null && (
										<Label>
											{strings.EndTimeLabel}{" "}
											{this.state.selectedEvent.end.format(
												this.props.dateFormat
											)}
										</Label>
									)}
									{this.state.selectedEvent.location !== "" && (
										<Label>
											{strings.LocationLabel}
											{this.state.selectedEvent.location}
										</Label>
									)}
									{this.state.selectedEvent.category !== "" && (
										<Label>
											{strings.CategoryLabel}
											{this.state.selectedEvent.category}
										</Label>
									)}
								</p>
							</div>
						</div>
					</Callout>
				)}
			</div>
		);
	}

	private renderContents() {
		let containerEl = $("#aggregatedCalendarComp");
		let eventSourcesArray: any[] = [];
		const dataService =
			Environment.type === EnvironmentType.Test ||
				Environment.type === EnvironmentType.Local
				? new AggregatedCalendarMockService()
				: this.props.context.serviceScope.consume(
					AggregatedCalendarService.serviceKey
				);
		console.log(this.props.selectedCalendarLists);
		this.props.selectedCalendarLists.forEach((calendarData) => {
			const calendarRestApi: string =
				calendarData.SiteUrl.trim() +
				"/_api/Web/Lists/GetByTitle('" +
				calendarData.CalendarListTitle.trim() +
				"')/items";

			eventSourcesArray.push({
				events: (
					start: moment.Moment,
					end: moment.Moment,
					timezone,
					callback
				) => {
					const startDate = "2021-01-01";//start.format("YYYY-MM-DD");
					const endDate = "2022-12-31";//end.format("YYYY-MM-DD");
					dataService
						.getEventsForCalendar(
							calendarRestApi,
							calendarData.Color,
							startDate,
							endDate
						)
						.then((response: FullCalendarEvent[]) => {
							console.log(response);
							callback(response);
						});
				},
			});
		});

		let calendar = new Calendar(
			document.getElementById("aggregatedCalendarComp"),
			{
				plugins: [ interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin ],
				headerToolbar: {
					left: "prev,next today",
					center: "title",
					right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
				},
				initialView: "dayGridMonth",
				initialDate: "2022-01-27",
				navLinks: true, // can click day/week names to navigate views
				editable: true,
				dayMaxEvents: true, // allow "more" link when too many events
				dayHeaderContent(arg: DayHeaderContentArg) {
					return createElement(CustomDayHeader, { text: arg.text });
				},
				events: eventSourcesArray[0].events
			}
		);

		calendar.render();

		/*
	containerEl.fullCalendar({
	  timezone: 'local',
	  header: {
		left: 'prev,next today',
		center: 'title'
	  },
	  defaultDate: new Date(),
	  navLinks: true,
	  editable: true,
	  eventLimit: true,
	  eventSources: eventSourcesArray,
	  eventClick: this.eventClickHandler
	});
	*/
	}

	/**
	 * Click Event handler when the event is clicked on the Calendar
	 * Display the Callout function to display event details
	 * @private
	 * @param {*} eventObj
	 * @param {*} jsEvent
	 * @param {*} view
	 * @memberof CalendarioFsd
	 */
	private eventClickHandler(eventObj: any, jsEvent: any, view: any) {
		this.setState(() => {
			return {
				isCalloutVisible: !this.state.isCalloutVisible,
				selectedEvent: {
					id: eventObj.id,
					title: eventObj.title,
					color: eventObj.color,
					start: moment(eventObj.start),
					end: moment(eventObj.end),
					description: eventObj.description,
					location: eventObj.location,
					allDay: eventObj.allDay,
					category: eventObj.category,
				},
				EventElement: jsEvent.toElement,
			};
		});
	}

	/**
	 * Hide the call out component on close
	 *
	 * @private
	 * @memberof CalendarioFsd
	 */
	private onCalloutDismiss() {
		this.setState({
			isCalloutVisible: false,
		});
	}

	/**
	 * Create markup for rendering HTML on react component
	 *
	 * @private
	 * @returns
	 * @memberof CalendarioFsd
	 */
	private createMarkup(description: string) {
		return { __html: description };
	}
}
