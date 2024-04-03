import Navbar from './components/Navbar/Navbar';
import Grid from '@mui/material/Grid';
import { Outlet } from "react-router-dom";

function App() {
  return (
    <Grid container spacing={0} alignItems="center" justifyContent="center">
      <Navbar />
      <Outlet />
    </Grid>
  );
}

export default App;
