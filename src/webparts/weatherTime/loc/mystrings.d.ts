declare interface IWeatherTimeWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  AzureMapsKeyFieldLabel: string;
  UnknownEnvironment: string;
}

declare module 'WeatherTimeWebPartStrings' {
  const strings: IWeatherTimeWebPartStrings;
  export = strings;
}
