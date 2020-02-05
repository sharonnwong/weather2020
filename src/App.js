import React, {useContext,useState} from 'react';
import './App.css';
import {Input, Button} from 'antd'
import {Bar} from 'react-chartjs-2'

const context = React.createContext() 
/*this is like global constant. We use this instead of useState, which needs to be passed up and down */

function App() {
  const [state, setState] = useState({searchTerm:''})
  return <context.Provider value={{
    ...state,
    set: v=> setState({...state, ...v}) /*take all existing pieces of 'state', and add in new pieces 'v' */
    
  }}>
    <div className="App">
      <Header />
      <Body />
    </div>
  </context.Provider> /*everything inside context.Provider will have the access to const context by useContext(context) */
}


function Header(){
  const ctx = useContext(context)


  return <header className="App-header">
    <Input 
      value={ctx.searchTerm}
      onChange={e=> ctx.set({searchTerm: e.target.value})}
      style={{height:'3rem',fontSize:'2rem'}}
      onKeyPress={e=>{
        if(e.key==='Enter' && ctx.searchTerm) search(ctx)
      }}
    />
    <Button style={{marginLeft:5,height:'3rem'}}
      type="primary"
      onClick={()=>search(ctx)}
      disabled={!ctx.searchTerm}>
      Search
    </Button>
  </header>
}

function Body() {
  const ctx = useContext(context)
  const {error, weather} = ctx
  console.log(weather)
  let data
  if(weather){
    console.log(weather)
    data = {
      labels:weather.daily.data.map(d=>d.time),
      datasets: [{
        data: weather.daily.data.map(d=>d.temperatureHigh)
      }]
    }
  }
  return <div className="App-body">
    {error && <div className="error">{error}</div>}
    {data && <div>
      <Bar data={data}
        width={800} height={400}
      />
    </div>}
  </div>
}


async function search({searchTerm, set}){ /*the set function is defined up in function App(); we do async since we want to access api */
  try {
    console.log(searchTerm)
    const term = searchTerm
    set({searchTerm:'', error:''}) /*set the searchTerm into an empty string */

    const osmurl = 'https://nominatim.openstreetmap.org/search/${term}?format=json' 
    const response = await fetch(osmurl)
    const location = await response.json()
    if(!location){
      return set({error:'No city matching that query'})
    }
    const city = location[0]
    console.log(city.lat,city.lon)

    const key = '59ba7e760e021499470662acc50bb222'
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${city.lat},${city.lon}`
    const response2 = await fetch(url)
    const weather = await response2.json()
    console.log(weather)
    set({weather})
  } catch(e) {
    set({error: e.message})
  }
}

export default App;
