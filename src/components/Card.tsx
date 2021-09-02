import React, { useState } from 'react';
import { Select } from '../components/Select';
import { Calendar } from '../components/Calendar';
import { ContainerPlacholder } from '../components/ContainerPlacholder';
import { BlockWeatherWeek } from '../components/BlockWeatherWeek';
import { BlockWeatherPast } from '../components/BlockWeatherPast';

type CardType = {
  title: String
  time: Boolean
}

let lat = "";
let lon = "";
let timeValue = "";

export const Card: React.FC<CardType> = ({ title, time }) => {

  let value: string;
  let array: any = [];
  const urlWeather = 'https://api.openweathermap.org/data/2.5/onecall';

  const cities: any = [
    { name: "Samara", lat: 53.195873, lon: 50.100193 },
    { name: "Tolyatti", lat: 53.507836, lon: 49.420393 },
    { name: "Saratov", lat: 51.533557, lon: 46.034257 },
    { name: "Kazan", lat: 55.796127, lon: 49.106405 },
    { name: "Krasnodar ", lat: 45.035470, lon: 38.975313 }
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June ", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [arr, setArray] = useState([]);
  const [weatherObj, setObj] = useState({});



  const select: any = {
    text: "Select city",
    image: "../images/down.png",
    state: true
  }

  const [obj, setText] = useState(select);


  const getOption = () => {
    if (obj.state) {
      setText({ ...select, image: "../images/up.png", state: false })
    } else {
      setText({ ...select, image: "../images/down.png", state: true })
    }
  }

  const getValuesPresent = async (e: any) => {
    let target = e.target;
    let lat = target.getAttribute("data-lat");
    let lon = target.getAttribute("data-lon");
    if (target.tagName == 'LI') {
      value = target.textContent;
      setText({ ...select, text: value })
    }

    const api = await fetch(urlWeather + '?lat=' + lat + '&lon=' + lon + '&exclude=current,minutely,hourly&units=metric&cnt=7&appid=b7ffe509c620c29c32fabe4bb2890f00')
    const data = await api.json();
    data.daily.forEach((item: any) => {
      let date = new Date(item.dt * 1000);
      let setDate = ` ${date.getDate()} ${months[date.getMonth()]} ${date.getUTCFullYear()}`;
      if (array.length < 7) {
        array.push({
          day: setDate,
          temp: Math.round(item.temp.day),
          weather: item.weather[0]
        })
      }
    })

    setArray(array);
  }

  const getTime = (e: any) => {
    let target = e.target;

    if (target.type == 'date') {
      let time = target;
      timeValue = time.valueAsDate;
    }

    getValuesPast();
  }

  const getLocation = (e: any) => {
    let target = e.target;
    if (target.tagName == 'LI') {
      lat = target.getAttribute("data-lat");
      lon = target.getAttribute("data-lon");

      value = target.textContent;
      setText({ ...select, text: value })
    }

    getValuesPast();

  }

  const getValuesPast = async () => {
    let datePast = Math.round(new Date(timeValue).getTime() / 1000);

    if (lat && lon && timeValue) {
      console.log("ok");
      const api = await fetch(`${urlWeather}/timemachine?lat=${lat}&lon=${lon}&dt=${datePast}&appid=b7ffe509c620c29c32fabe4bb2890f00`)
      const data = await api.json();
      let date = new Date(data.current.dt * 1000);
      let setDate = ` ${date.getDate()} ${months[date.getMonth()]} ${date.getUTCFullYear()}`;
      let temp = Math.round(data.current.temp - 273.15);
      let weatherPast = {
        day: setDate,
          temp: temp,
          weather: data.current.weather[0]
      }
      setObj(weatherPast);
      console.log(data);
      
    }

  }

  const present = <Select cities={cities} obj={obj} getOption={getOption} getValue={getValuesPresent} />
  const past = <><Select cities={cities} obj={obj} getOption={getOption} getValue={getLocation} getValuesPast={getValuesPast} /><Calendar getTime={getTime} getValuesPast={getValuesPast} /></>

  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="containerInputs">
        {time ? present : past}
      </div>
      {time ?
        arr.length ?
          <BlockWeatherWeek arrayWeather={arr} />
          :
          <ContainerPlacholder />
        :
        Object.keys(weatherObj).length  ?
          <BlockWeatherPast objectWeather={weatherObj} />
          :
          <ContainerPlacholder />
      }
    </div>
  )
}