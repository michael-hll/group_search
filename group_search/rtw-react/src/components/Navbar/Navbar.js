import * as React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";
import Logo from "../../logo.png";

const drawerWidth = 280;

const Navbar = () => {
  const naviage = useNavigate();
  return (
    <Grid item xs={2} spacing={0}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box
          component="img"
          sx={{
            margin: 0,
            padding: 0,
            height: 64,
            width: { drawerWidth },
          }}
          alt="Ride The Wave"
          src={Logo}
        />
        <Divider />
        <List>
          {['Search', 'About'].map((text, index) => (
            <ListItem key={text} disablePadding onClick={() => { naviage(text.toLowerCase()) }}>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <SearchIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Grid>
  )
}

export default Navbar