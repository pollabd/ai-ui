"use client";

import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Provider({ children }: any) {
  const [userDetail, setUserDetail] = useState();
  useEffect(() => {
    createNewUser();
  }, []);
  const createNewUser = async () => {
    const result = await axios.post("/api/user", {});
    console.log(result.data);
    setUserDetail(result.data);
  };
  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
