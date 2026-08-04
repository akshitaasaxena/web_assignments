let btn=document.querySelector("button");
let input=document.querySelector("input");
let main=document.querySelector(".main");
const getweather=async()=>{
let inpval=input.value;

const URL= `https://api.openweathermap.org/data/2.5/weather?q=${inpval}&appid=08a4a9ba3264701d71fee260a1e87bbb&units=metric`;
try{
let response= await fetch(URL);
let data=await response.json();
console.log(data);

main.innerHTML = `
<h2>📍 ${data.name}</h2>
<h2>🌡 Temperature: ${data.main.temp} °C</h2>
<h2>☁ Weather: ${data.weather[0].description}</h2>
<h2>💧 Humidity: ${data.main.humidity}%</h2>
`;

}catch(err){
    console.log(err);
}
}
btn.addEventListener("click", getweather)