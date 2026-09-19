import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({url,setToken}) => {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${url}/api/user/login`,{email,password});
      if(!response.data.success){
        return toast.error(response.data.message)
      }
      if(response.data.role !== "admin"){
        return toast.error("This account is not an admin")
      }
      localStorage.setItem("adminToken",response.data.token);
      setToken(response.data.token);
    } catch (error) {
      toast.error("Login failed")
    }
  }

  return (
    <form onSubmit={onSubmitHandler} style={{maxWidth:"320px",margin:"100px auto",display:"flex",flexDirection:"column",gap:"12px"}}>
      <h2>Admin Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{padding:"10px"}}/>
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required style={{padding:"10px"}}/>
      <button type="submit" style={{padding:"10px",cursor:"pointer"}}>Login</button>
    </form>
  )
}

export default Login
