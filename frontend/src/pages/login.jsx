import React, { useState } from 'react';
// Import the styles you saved in the previous step
// NOTE: Adjust the path below to where you saved your Login.css file!
import './../assets/css/login.css'; 

const Login = () => {
  // State to manage form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // State to manage the error message visibility
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);

  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault(); // Prevents the browser's default form submission behavior

    // --- YOUR ACTUAL AUTHENTICATION LOGIC GOES HERE ---
    
    // Example: Check if the credentials match a simple hardcoded test case
    if (username === 'admin' && password === 'password') {
      console.log('Login successful! Redirecting...');
      setErrorMessageVisible(false);
      
      // In a real app, you would handle a successful login (e.g., redirect user)
      // window.location.href = "/admin-dashboard"; 
      
    } else {
      console.log('Login failed.');
      setErrorMessageVisible(true);
    }
  };

  return (
    // NOTE: In a React App, you typically don't render the <body> tag. 
    // The main container div is enough, and the global styles (like background)
    // are applied via the imported CSS to the body or a root element in index.html.
    <div className="login-container">
      <h1>Panel de Administración</h1>
      
      {/* Replaces <form onsubmit="return handleLogin(event)"> */}
      <form onSubmit={handleLogin} id="loginForm"> 
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          {/* Input state is controlled by React */}
          <input 
            type="text" 
            id="username" 
            name="username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          {/* Input state is controlled by React */}
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button type="submit" className="login-button">
          Iniciar Sesión
        </button>
        
        {/* Error message visibility is controlled by the errorMessageVisible state */}
        <div 
          id="errorMessage" 
          className="error-message"
          style={{ display: errorMessageVisible ? 'block' : 'none' }} // Override 'display: none' from CSS
        >
          Credenciales inválidas
        </div>
      </form>
    </div>
    
  );
};

export default Login;