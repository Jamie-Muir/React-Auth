import { useState, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import AuthContext from '../store/auth-context';
import classes from './AuthForm.module.css';
import useHttp from '../../hooks/use-http';

const AuthForm = () => {
	const history = useHistory();
	const emailInputRef = useRef();
	const passwordInputRef = useRef();

	const authCtx = useContext(AuthContext);

	const [isLogin, setIsLogin] = useState(true);
	// const [isLoading, setIsLoading] = useState(false);
	const { isLoading, error, sendRequest: sendLoginRequest } = useHttp();

	const switchAuthModeHandler = () => {
		setIsLogin((prevState) => !prevState);
	};

	const saveToken = (data) => {
		const expirationTime = new Date(new Date().getTime() + (+data.expiresIn * 1000));
		authCtx.login(data.idToken, expirationTime.toISOString());
		history.replace('/')
	}

	const handleError = (err) => {
		alert(err);
	}

	const submitHandler = async (event) => {
		event.preventDefault();

		const enteredEmail = emailInputRef.current.value;
		const enteredPassword = passwordInputRef.current.value;

		// add validation

		let url;
		isLogin ? url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAoFi3e8-mTtwVKGBrRn7KMJEdZy2GNnfY'
			: url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAoFi3e8-mTtwVKGBrRn7KMJEdZy2GNnfY'

		await sendLoginRequest({
			url,
			method: 'POST',
			body: {
				email: enteredEmail,
				password: enteredPassword,
				returnSecureToken: true
			},
			headers: {
				'Content-Type': 'application/json'
			},
		}, saveToken)
		.catch(handleError)
	}

	return (
		<section className={classes.auth}>
			<h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
			<form onSubmit={submitHandler}>
				<div className={classes.control}>
					<label htmlFor='email'>Your Email</label>
					<input type='email' id='email' required ref={emailInputRef} />
				</div>
				<div className={classes.control}>
					<label htmlFor='password'>Your Password</label>
					<input type='password' id='password' required ref={passwordInputRef} />
				</div>
				<div className={classes.actions}>
					{!isLoading && <button>{isLogin ? 'Login' : 'Create Account'}</button>}
					{isLoading && <p>Sending Request...</p>}
					<button
						type='button'
						className={classes.toggle}
						onClick={switchAuthModeHandler}
					>
						{isLogin ? 'Create new account' : 'Login with existing account'}
					</button>
				</div>
			</form>
		</section>
	);
};

export default AuthForm;
