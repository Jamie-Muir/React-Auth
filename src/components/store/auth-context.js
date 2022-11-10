import React, { useState } from 'react';

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

export const AuthContextProvider = (props) => {
	const initialToken = localStorage.getItem('token')
	const [token, setToken] = useState(initialToken);

	const userIsLoggedIn = !!token;
	
	const logoutHander = () => {
		setToken(null);
		localStorage.removeItem('token', token);
	};

	const loginHandler = (token, expirationTime) => {
		setToken(token);
		localStorage.setItem('token', token);

		const remainingTime = calcRemainingTime(expirationTime);

		setTimeout(logoutHander, remainingTime);
	};

	const contextValue = {
		token: token,
		isLoggedIn: userIsLoggedIn,
		login: loginHandler,
		logout: logoutHander,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
