import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import Link from '@mui/material/Link';

const Group = (props) => {
  return (
    <Card sx={{ maxWidth: 1024, marginBottom: "2px" }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            <Link href={props.group.url}>
              {props.group.title.replaceAll('$', ',').replace('[', '"').replace(']', '"')}
            </Link>
          </Typography>
          <Typography variant="body2" color="black" sx={{ marginBottom: "2px" }}>
            {props.group.desc}
          </Typography>
          <Typography variant="body1" color="grey.400">
            {props.group.city} [{props.group.latitude} , {props.group.longitude}] · {props.group.members_k} members · {props.group.post} · {props.group.miles.toFixed(1)} miles
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default Group;