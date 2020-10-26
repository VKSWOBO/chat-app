import React from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import Geocode from "react-geocode";
import "@reach/combobox/styles.css";

const libraries = ["places"]
const mapContainerStyle = {
  width: "100vw",
  height: "70vh"
}
const center = {
  lat: 25.612677,
  lng: 85.158875
}


function SimpleMap(props) {
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.API_KEY,
    libraries,
  });

  Geocode.setApiKey(process.env.API_KEY);

  const [mainAddress, setMainAddress] = React.useState("")
  const [marker,setMarker] = React.useState("")
  const [selected,setSelected] = React.useState(null)

  const sendBack =(send)=>{
    const data = {
      location:marker,
      address:mainAddress,
      who:send
    }
    props.handelData(data)
  }

  const onMapClick = React.useCallback((event) => {
    setMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
   })
  },[])
  
  Geocode.fromLatLng(marker.lat,marker.lng).then(
    response => {
      const address = response.results[0].formatted_address;
      setMainAddress(address)
      return true
    },
    error => {
      console.error(error);
    }
  );
  
  const mapRef = React.useRef()
  const onMapLoad = React.useCallback((map)=>{
    mapRef.current = map
  },[]);

  const panTo = React.useCallback(({lat,lng}) => {
    mapRef.current.panTo({lat,lng});
    mapRef.current.setZoom(14);
  },[])

  if(loadError) return "Error";
  if(!isLoaded) return "Loading...";

  return (
    <div>

      <Search panTo={panTo}/>

      <GoogleMap
       mapContainerStyle= {mapContainerStyle} 
       zoom={14} 
       center={center}
       onClick={onMapClick}
       onLoad={onMapLoad}
      >
        <Marker 
          position={{lat:marker.lat, lng:marker.lng}}
          onClick={()=>{
            setSelected(marker)
          }}
        />
        {selected ? (<InfoWindow position={{lat: selected.lat, lng: selected.lng}}
          onCloseClick= {()=>{setSelected(null)}}>
          <div>
            <h2>{mainAddress}</h2>
          </div>
        </InfoWindow>): null}
      </GoogleMap>
      <div style={{ marginTop:"5%"}}>
            <button onClick={()=>sendBack(props.inputClick)}>Send</button>
          </div> 
          <div style={{marginTop:"2%"}}>
            <button onClick={()=>sendBack('close')}>Close</button>
          </div> 
    </div>
  )
}

export default SimpleMap

function Search ({panTo}){
  const {ready,value,suggestions:{ status, data}, setValue, clearSuggestions} = usePlacesAutocomplete({
    requestOptions: {
      location: {
        lat: () => 25.612677,
        lng: () => 85.158875
      },
      radius: 200 * 1000,
    }
  })

  return (
    <div className="search">
      <Combobox
        onSelect={async (address)=>{
          setValue(address,false)
          clearSuggestions()
          try{
            const reults = await getGeocode({address})
            const {lat,lng} = await getLatLng(reults[0])
            panTo({lat,lng})
          } catch (error){
            console.log(error)
          }
        }}
      >
        <ComboboxInput
          value= {value}
          onChange={(e) =>{
            setValue(e.target.value)
          }}
          disabled={!ready}
          placeholder= 'Enter an address'
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" && data.map(({id,description}) =>(
              <ComboboxOption key={id} value={description} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  )
}