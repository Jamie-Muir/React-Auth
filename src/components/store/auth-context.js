import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;

const AuthContext = React.createContext({
	token: '',
	isLoggedIn: false,
	login: (token) => {},
	logout: () => {},
});

const calcRemainingTime = (expirationTime) => {
	const currentTime = new Date().getTime();
	const adjExpirationTime = new Date(expirationTime).getTime();
	
	const remainingTime = adjExpirationTime - currentTime;

	return remainingTime;
}

const retrieveStoredToken = () => {
	const storedToken = localStorage.getItem('token');
	const storedExpirationDate = localStorage.getItem('expirationTime');

	const remainingTime = calcRemainingTime(storedExpirationDate);

	if (remainingTime <= 60000) {
		localStorage.removeItem('token');
		localStorage.removeItem('expirationTime')
		return null;
	}

	return {
		token: storedToken,
		remainingTime,
	}
}

export const AuthContextProvider = (props) => {
	const tokenData = retrieveStoredToken();
	let initialToken;
	if(tokenData) {
		initialToken = tokenData.token;
	}
	const [token, setToken] = useState(initialToken);

	const userIsLoggedIn = !!token;
	
	const logoutHandler = useCallback(() => {
		setToken(null);
		localStorage.removeItem('token');
		localStorage.removeItem('expirationTime')

		logoutTimer && clearTimeout(logoutTimer);
	}, []);

	const loginHandler = (token, expirationTime) => {
		setToken(token);
		localStorage.setItem('token', token);
		localStorage.setItem('expirationTime', expirationTime)

		const remainingTime = calcRemainingTime(expirationTime);

		logoutTimer = setTimeout(logoutHandler, remainingTime);
	};

	useEffect(() => {
		if(tokenData) {
			console.log(tokenData.duration)
			logoutTimer = setTimeout(logoutHandler, tokenData.duration);
		}
	},[tokenData, logoutHandler]);


	const contextValue = {
		token: token,
		isLoggedIn: userIsLoggedIn,
		login: loginHandler,
		logout: logoutHandler,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
