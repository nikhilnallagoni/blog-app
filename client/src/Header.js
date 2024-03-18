import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./Pages/UserContext";
function Header() {
  // const [username,setUsername]=useState(null);
  const { setUserInfo, userInfo } = useContext(UserContext);
  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      method: "GET",
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        // setUsername(userInfo.username);
        setUserInfo(userInfo);
      });
    });
  }, []);
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const response = await fetch('http://localhost:4000/profile', {
  //         credentials: 'include',
  //       });
  //       if (!response.ok) {
  //         throw new Error(`Network response was not ok: ${response.status}`);
  //       }
  //       const userInfo = await response.json();
  //       setUsername(userInfo.username);
  //     } catch (error) {
  //       console.error('Error fetching user info:', error);
  //       // Display user-friendly error message or redirect to appropriate page
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }
  // async function logout() {
  //   try {
  //     const response = await fetch('http://localhost:4000/logout', {
  //       credentials: 'include',
  //       method: 'POST',
  //     });
  //     if (!response.ok) {
  //       throw new Error(`Network response was not ok: ${response.status}`);
  //     }
  //     setUsername(null); // Update state
  //     // Redirect to login page or handle logout state further
  //   } catch (error) {
  //     console.error('Error logging out:', error);
  //     // Display user-friendly error message
  //   }
  // }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        My Blog
      </Link>
      <nav>
        {username && (
          <>
            <span>Hello,{username}</span>
            <Link to="/create">Create new post </Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
