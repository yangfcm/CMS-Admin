import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import AppBar from '@material-ui/core/AppBar'; 
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import Avatar from '../common/Avatar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	toolbar: {
		paddingRight: 24
	},
	title: {
		flexGrow: 1
	},
	greeting: {
		marginRight: 10,
		textTransform: 'capitalize',
		[theme.breakpoints.down('xs')]: {
			display: 'none'
		}
	}
}));

const Header = (props) => {
	const { admin } = props.auth.auth.data;
	const classes = useStyles();
	return (
		<React.Fragment>
			<AppBar position="absolute">
				<Toolbar className={classes.toolbar}>
					<IconButton
						edge="start"
						color="inherit"
					>
						<MenuIcon />
					</IconButton>	{/* Menu button */}	
					<Typography 
						commponent="h1"
						variant="h6"
						noWrap
						className={classes.title}
					>
						<span style={{textTransform: "capitalize"}}>
							{props.location.pathname.replace('/', '')}
						</span>
					</Typography>	{ /* Title */}
					<Typography
						className={classes.greeting} 
						variant="body2"
						noWrap
					> Welcome, {admin.firstname} {admin.lastname}
					</Typography>
					<Avatar loginUser = {admin}/> 
				</Toolbar>
			</AppBar>
		</React.Fragment>
	)
}

const mapStateToProps = (state) => {
	return {
		auth: state.auth
	}
}

export default connect(mapStateToProps, null)(withRouter(Header));