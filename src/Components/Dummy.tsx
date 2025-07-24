"use client"
import React, { useEffect } from "react";
import { BACKEND_URL } from "../../config";
const sendMessage = async () => {
    console.log("it should work hete atlease letsdooo")
  const result = await fetch(`${BACKEND_URL}/appType`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: "Create a todo application" }),
  });
  console.log("Results : ",result)
};
const Dummt = () => {
useEffect(()=>{
    sendMessage()
})
  return <div></div>;
};

export default Dummt;
