import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Header from '../components/Header';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Group from '../components/Group';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const Search = () => {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([{ name: 'MA' }])
  const [town, setTown] = useState('');
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [groups, setGroups] = useState([]);
  const [miles, setMiles] = useState(20);
  useEffect(() => {
    async function fetchCities() {
      fetch('http://localhost:3000/cities/ma')
        .then((response) => response.json())
        .then((data) => {
          //console.log(data);
          setCities(data);
        })
    }
    fetchCities();
  }, []);

  async function fetchGroups(city, miles) {
    console.log('fetchGroups miles:', miles);
    fetch(`http://localhost:3000/worker/${city}/${miles}`)
      .then(response => response.json())
      .then(data => {
        console.log(data.result);
        setGroups(data.result);
      });
  }

  function setTownAndCoords(town) {
    if (town == null) {
      return;
    }
    setTown(town);
    for (const city of cities) {
      if (city.name.toLowerCase() === town.toLowerCase()) {
        setLatitude(city.latitude);
        setLongitude(city.longitude);
        break;
      }
    }
  }

  return (
    <Grid item xs={10}>
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Header />
        </Grid>
        {/* State */}
        <Grid item xs={1}>
          <Autocomplete
            freeSolo
            disableClearable
            disablePortal
            disabled
            options={states.map((option) => option.name)}
            defaultValue={"MA"}
            renderInput={(params) => <TextField {...params} label="STATE" />}
            onKeyDown={(event) => {

            }}
            onChange={(event, value) => {

            }}
          />
        </Grid>
        {/* city */}
        <Grid item xs={3}>
          <Autocomplete
            freeSolo
            options={cities.map((option) => option.name)}
            renderInput={(params) => <TextField {...params} label="TOWN" />}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Prevent's default 'Enter' behavior.
                //event.defaultMuiPrevented = true;
                const city = event.target.value;
                setTownAndCoords(city);
                const m = miles ? Number(miles) : 20;
                fetchGroups(city, m);
              }
            }}
            onChange={(event, value) => {
              // console.log(value)
              setTownAndCoords(value);
            }}
          />
        </Grid>
        {/* miles */}
        <Grid item xs={1}>
          <TextField
            sx={{
              width: 100
            }}
            type="number"
            InputProps={{
              min: 0, max: 10000
            }}
            label="MILES"
            defaultValue={20}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Prevent's default 'Enter' behavior.
                event.defaultMuiPrevented = true;
                const miles = event.target.value;
                setMiles(miles);
                const m = miles ? Number(miles) : 20;
                fetchGroups(town, m);
              }
            }}
            onChange={e => {
              setMiles(e.target.value);
            }}
          />
        </Grid>
        {/* buttons */}
        <Grid item xs={4}>
          <Button variant="contained"
            sx={{ marginLeft: "0px" }}
            onClick={() => {
              const m = miles ? Number(miles) : 20;
              console.log(town);
              fetchGroups(town, m);
            }}
          >Find</Button>
          <Button
            variant="contained"
            sx={{ marginLeft: "10px" }}
            onClick={() => {
              setGroups([]);
            }}
          >CLEAR</Button>
        </Grid>
        <Grid item xs={3}></Grid>
        {/* coords */}
        <Grid item xs={8}>
          <Typography variant="body1" color="grey.400">
            latitude: {latitude}, longitude, {longitude} (total: {groups.length})
          </Typography>
        </Grid>
        <Grid item xs={4}>
        </Grid>
        {/* Group List */}
        <Grid item xs={12}>
          <Stack spacing={2}>
            {groups && groups.map((g) => (<Group
              key={g.group_id}
              group={g}
            />))}
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Search