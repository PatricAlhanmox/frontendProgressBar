import { Container, Button, Typography, TextField, Box } from '@material-ui/core';
import logOut from '../auth/logout';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import React from 'react';

const urlPath = 'http://localhost:5005';

function removeID () {
  let removeID = '';
  for (let i = 0; i < localStorage.length; i++) {
    const tmpKey = localStorage.key(i);
    if (tmpKey === 'idx') {
      removeID = tmpKey
    }
  }
  return removeID;
}

function edditPilot () {
  function handleDecTime (event) {
    event.preventDefault();
    const requestBag = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token') + ''
      },
      body: JSON.stringify({
        time: event.target.dectime.value,
        month: event.target.month.value,
        symbol: '-'
      })
    }
    const item = parseInt(localStorage.getItem('idx')) + 1;
    const listID = localStorage.getItem(`${item}`);
    fetch(`${urlPath}/listings/eddit/${listID}`, requestBag).then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          alert('修改成功');
          localStorage.removeItem('idx');
          window.location = '../';
        })
      } else if (response.status === 400 || response.status === 403) {
        response.json().then(res => {
          alert(res.error);
        })
      }
    })
  }
  function handleAddTime (event) {
    event.preventDefault();
    const requestBag = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token') + ''
      },
      body: JSON.stringify({
        time: event.target.time.value,
        month: event.target.month.value,
        symbol: '+'
      })
    }
    const item = parseInt(localStorage.getItem('idx')) + 1;
    const listID = localStorage.getItem(`${item}`);
    fetch(`${urlPath}/listings/eddit/${listID}`, requestBag).then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          alert('成功修改');
          localStorage.removeItem('idx');
          window.location = '../';
        })
      } else if (response.status === 400 || response.status === 403) {
        response.json().then(res => {
          alert(res.error);
        })
      }
    })
  }
  function handleGoalTime (event) {
    event.preventDefault();
    const requestBag = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token') + ''
      },
      body: JSON.stringify({
        time: event.target.goaltime.value,
        month: event.target.month.value,
        symbol: ''
      })
    }
    const item = parseInt(localStorage.getItem('idx')) + 1;
    const listID = localStorage.getItem(`${item}`);
    fetch(`${urlPath}/listings/eddit/${listID}`, requestBag).then(response => {
      if (response.status === 200) {
        response.json().then(res => {
          alert('成功修改');
          localStorage.removeItem('idx');
          window.location = '../';
        })
      } else if (response.status === 400 || response.status === 403) {
        response.json().then(res => {
          alert(res.error);
        })
      }
    })
  }
  return (<>
    <Container component="main" sx={{ justifyContent: 'center' }}>
      <form onSubmit={() => logOut()}>
          <Button variant="contained" type="submit">
            <LogoutIcon color="primary"/><Typography component="p">LOGOUT</Typography>
          </Button>
      </form>
      <Button type="submit" onClick={() => { window.location = '../'; const rID = removeID(); localStorage.removeItem(rID) }}>
        <ArrowBackIcon color="primary"/><Typography variant="body2" component="p">Go Back</Typography>
      </Button>
      <Typography variant="h3"> 更改飞行时间 </Typography>
      <Box component="form" onSubmit={(event) => handleAddTime(event)} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          id="month"
          label="输入月份数字"
          name="mon"
          autoFocus
        />
        <TextField
          margin="normal"
          id="time"
          label="输入要增加的飞行时间"
          name="time"
          autoFocus
        />
        <Button
          type="submit"
          id="addsubmit"
          variant="contained"
          style={{ backgroundColor: '#4134B4' }}
        >
          <AddIcon fontSize='large' />
        </Button>
      </Box>
    </Container>
    <Container component="main" sx={{ justifyContent: 'center' }}>
      <Box component="form" onSubmit={(event) => handleDecTime(event)} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          id="month"
          label="输入月份数字"
          name="mon"
          autoFocus
        />
        <TextField
          margin="normal"
          id="dectime"
          label="输错了可以从这里减去"
          name="dectime"
          autoFocus
        />
        <Button
          type="submit"
          id="subsubmit"
          variant="contained"
          style={{ backgroundColor: '#4134B4' }}
        >
          <RemoveIcon fontSize='large' />
        </Button>
      </Box>
    </Container>
    <Container component="main" sx={{ alignItem: 'center', justifyContent: 'center' }}>
      <Box component="form" onSubmit={(event) => handleGoalTime(event)} sx={{ width: '100%' }}>
        <TextField
          margin="normal"
          id="month"
          label="输入月份数字"
          name="mon"
          autoFocus
        />
        <TextField
          margin="normal"
          id="goaltime"
          label="设置本月目标飞行时间"
          name="goaltime"
          autoFocus
        />
        <Button
          type="submit"
          id="subsubmit"
          variant="contained"
          justifyContent='center'
          style={{ backgroundColor: '#4134B4' }}
        >
          <AirplaneTicketIcon fontSize='large' />
        </Button>
      </Box>
    </Container>
  </>)
}

export default edditPilot;
