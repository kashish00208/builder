import React, { Suspense } from "react";
import Chat from "./Chat";

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chat/>
    </Suspense>
  );
}
