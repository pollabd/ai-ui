"use client";

import { SettingContext } from "@/context/SettingsContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Provider({ children }: any) {
  const [userDetail, setUserDetail] = useState();
  const [settingsDetail, setSettingsDetail] = useState();
  useEffect(() => {
    createNewUser();
  }, []);
  const createNewUser = async () => {
    const result = await axios.post("/api/user", {});
    // console.log(result.data);
    setUserDetail(result.data);
  };
  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <SettingContext.Provider value={{ settingsDetail, setSettingsDetail }}>
        <div>{children}</div>
      </SettingContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;
