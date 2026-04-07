export interface WeatherDataInterface {
  city: string;
  temp: number;
  description: string;
  icon: string;
  apiKey: string;
}
import * as React from 'react';
import styles from './WeatherTime.module.scss'; 
let time = new Date().toLocaleTimeString(); //just to test not reactive yet
export default function Weather(){
    return(
<div>
        <h1>weather component</h1>
        <h2>current time is : {time}</h2>
        </div>
    );
}