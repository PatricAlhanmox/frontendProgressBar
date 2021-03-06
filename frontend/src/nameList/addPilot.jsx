import { React } from 'react';
import Box from '@material-ui/core/Box';
import { Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import { Container, TextField, Button } from '@material-ui/core';
import logOut from '../auth/logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import fileToDataUrl from '../asset/helper';

const urlPath = 'http://localhost:5005';
function addPilot () {
  function handleCreation (event) {
    event.preventDefault();
    fileToDataUrl(document.getElementById('Thumbnail').files[0]).then(r => {
      const requestBag = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token') + ''
        },
        body: JSON.stringify({
          name: event.target.name.value,
          goalTime: event.target.goalTime.value,
          patternNumber: event.target.patternNumber.value,
          monthlyTime: event.target.monthlyTime.value,
          quaterTime: event.target.quaterTime.value,
          yearlyTime: event.target.yearlyTime.value,
          thumbnail: r
        })
      };
      console.log(r);
      fetch(`${urlPath}/listings/new`, requestBag).then(response => {
        if (response.status === 200) {
          response.json().then(res => {
            const listId = res.listingId;
            const idNext = res.listingLen;
            localStorage.setItem(`${idNext}`, listId);
            window.location = '../';
          })
        } else if (response.status === 400 || response.status === 403) {
          response.json().then(res => {
            alert(res.error);
            console.log(res.error);
          })
        }
      });
    })
  }

  return (<>
    <Container component="main" maxWidth="md">
      <form onSubmit={() => logOut()}>
        <Button variant="contained" type="submit">
          <LogoutIcon color="primary"/><Typography component="p">LOGOUT</Typography>
        </Button>
      </form>
      <Button type="submit" onClick={() => { window.location = '../' }}>
        <ArrowBackIcon color="primary"/><Typography variant="body2" component="p">Go Back</Typography>
      </Button>
      <Box component="form" onSubmit={(event) => handleCreation(event) } sx = {{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5">???????????????????????????</Typography>
        <TextField
          margin="normal"
          id="name"
          label="???????????????"
          name="name"
          autoFocus
        />
        <TextField
          margin="normal"
          id="patternNumber"
          label="???????????????"
          name="Bathroom"
          autoFocus
        />
        <TextField
          margin="normal"
          id="goalTime"
          label="?????????????????????"
          name="goalTime"
          autoFocus
        />
        <TextField
          margin="normal"
          id="monthlyTime"
          label="????????????????????????"
          name="Address"
          autoFocus
        />
        <TextField
          margin="normal"
          id="quaterTime"
          label="????????????????????????"
          name="Price"
          autoFocus
        />
        <TextField
          margin="normal"
          id="yearlyTime"
          label="????????????????????????"
          name="Price"
          autoFocus
        />
        <Typography variant="p">??????</Typography>
        <input
          margin="normal"
          id="Thumbnail"
          lable="????????????"
          name="Thumbnail"
          type="file"
          multiple="multiple"
        />
        <Button type="submit">
          <CreateIcon margin="normal" color="primary"/><Typography variant="p" component="p">Create</Typography>
        </Button>
      </Box>
    </Container>
  </>);
}

export default addPilot;
