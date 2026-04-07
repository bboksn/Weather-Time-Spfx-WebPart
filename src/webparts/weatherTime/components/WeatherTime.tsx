import * as React from 'react';
import styles from './WeatherTime.module.scss';
import type { IWeatherTimeProps } from './IWeatherTimeProps';
import Weather from './Weather';

export default class WeatherTime extends React.Component<IWeatherTimeProps> {

  public render(): React.ReactElement<IWeatherTimeProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
      azureMapsKey
    } = this.props;

    return (
      <section className={`${styles.weatherTime} ${hasTeamsContext ? styles.teams : ''}`}>
        <Weather azureMapsKey={azureMapsKey} />
      </section>
    );
  }
}
