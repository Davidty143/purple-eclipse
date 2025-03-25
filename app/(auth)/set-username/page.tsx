import React from "react";
import { SetUsernameForm } from "./components/SetUsernameForm"; // Ensure the path is correct

const SetUsernamePage = () => {
  return (
    <div className="flex items-start justify-center pt-10 min-h-screen">
      <SetUsernameForm />
    </div>
  );
};

export default SetUsernamePage;
