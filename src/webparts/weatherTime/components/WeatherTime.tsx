import * as React from 'react';
import styles from './WeatherTime.module.scss';
import type { IWeatherTimeProps } from './IWeatherTimeProps';
import { escape } from '@microsoft/sp-lodash-subset';
import Weather from './Weather';
export default class WeatherTime extends React.Component<IWeatherTimeProps> {

  public render(): React.ReactElement<IWeatherTimeProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    return (
      <section className={`${styles.weatherTime} ${hasTeamsContext ? styles.teams : ''}`}>
     <h1>hello :)</h1>
      <Weather></Weather>
      </section>
    );
  }
}
