import { useState } from "react";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const loginURL = `http://localhost:3333/api/auth/login`;
      const credentials = {
        username,
        password,
      };

      const response = await axios.post(loginURL, credentials);

      sessionStorage.setItem("token", response.data.token);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <div className={""}>
        <h1 className={""}>Staff Stream</h1>
      </div>
      <div className={""}>
        <input
          type="text"
          placeholder="Username"
          className={""}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="Password"
          className={""}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <div className={""}>
        <button
          type={"submit"}
          className={""}
        >
          login
        </button>
      </div>
    </form>
  );
}

export default Login;
