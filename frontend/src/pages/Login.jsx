import {useState} from 'react';

function Login() {
    const [email , setEmail] = useState('');
    const [password , setPassword] = useState('');

    const [error , setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();

        try{
            const response = await fetch('http://localhost:5000/api/auth/login' , {
                method : 'POST',
                headers : { 'Content-Type' : 'application/json' } ,
                body : JSON.stringify({email , password}),
            });

            const data = await response .json();

            if(!response.ok){
                setError(data.message);
                return;
            }
            localStorage.setItem('token' , data.token);
            localStorage.setItem('role' , data.user.role);
            alert('Login Succesfull!');

        }  catch (err){

            setError('Something went wrong . please try again later.');
        }
    };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {/* Agar error state mein kuch hai, to red text mein dikhao */}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
