import React, { useState, useEffect, useCallback } from 'react';

let logoutTimer;

// THE Context object provided to everything else
const AuthContext = React.createContext({
	token: '',  // Firebase auth token
	isLoggedIn: false, // Conditional Rendering flag + lil derivitive logic
	login: (token) => { },
	logout: () => { },
});

/* Calc time left on Auth Token
	STRING: expirationTime
	1hr added onto time token recieved in ms, for conversion into dates for timer
*/
const calcRemainingTime = (expirationTime) => {
	const currentTime = new Date().getTime();
	const adjExpirationTime = new Date(expirationTime).getTime(); // translate string into date, get ms

	const remainingTime = adjExpirationTime - currentTime; // Return RemainingTime

	return remainingTime;
}

/* Check if user already logged in */
const retrieveStoredToken = () => {
	const storedToken = localStorage.getItem('token');
	const storedExpirationDate = localStorage.getItem('expirationTime');

	const remainingTime = calcRemainingTime(storedExpirationDate); // check duration on last token

	if (remainingTime <= 30000) { // if less than 1min left, delete old token
		localStorage.removeItem('token');
		localStorage.removeItem('expirationTime')
		return null;
	}

	return {
		token: storedToken,
		duration: remainingTime,
	}
}


/* Wrapper function
	Provides Context object to the app via Wrapping children with context.provider 
*/
export const AuthContextProvider = (props) => {
	const tokenData = retrieveStoredToken(); // Check if token
	let initialToken;
	if (tokenData) {
		initialToken = tokenData.token; // if logged in already, stay logged in
	}
	const [token, setToken] = useState(initialToken); // either existing token or undefined

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
		if (tokenData) {
			logoutTimer = setTimeout(logoutHandler, tokenData.duration);
		}
	}, [tokenData, logoutHandler]);

	// Assign Context object Values to provide to app
	const contextValue = {
		token: token,
		isLoggedIn: userIsLoggedIn,
		login: loginHandler,
		logout: logoutHandler,
	};

	// Wrap it
	return (
		<AuthContext.Provider value={contextValue}>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
