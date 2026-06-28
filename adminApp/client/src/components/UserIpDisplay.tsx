"use client";

import { useEffect, useState } from "react";

export default function UserIpDisplay() {
  const [ip, setIp] = useState("UNKNOWN");

  useEffect(() => {
    setIp(sessionStorage.getItem("userIp") || "UNKNOWN");
  }, []);

  return <span className="text-black font-black uppercase">{ip}</span>;
}
