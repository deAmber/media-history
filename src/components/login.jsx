import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import mainStore from "../stores/mainStore.js";

const ClientId = "803994679308-qk0cpk827asnvoshdtegmuiq5igl8rbc.apps.googleusercontent.com";

const Login = () => {
  const { setUser } = mainStore();
  const [ loginError, setLoginError ] = useState(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: ClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
      });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const token = user.getAuthResponse().access_token;

      // Save the token and logged-in status in localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token);
      setUser(user.getBasicProfile().getName());
    } catch (error) {
      console.error('Login failed', error);
      setLoginError(true);
    }
  };
  if (loginError) {
    return (
      <>
        <h2>Login Error</h2>
        <p>We're sorry, there seems to have been some trouble logging you in.<br/>
          Please try again later, or if this issue persists, please contact us.
        </p>
      </>
    )
  }

  return <>
    <h2>Please log in to continue</h2>
    <button onClick={handleGoogleLogin}>Login with Google</button>
  </>
}

export default Login;