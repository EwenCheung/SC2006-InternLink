import React from "react";
import NavigationBar from "../../components/layout/NavigationBar";
import MessagesComponent from "../../components/messages/MessagesComponent";

export default function MessagesPage() {
  return (
    <>
      <NavigationBar userRole="jobseeker" />
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Messages</h1>
        <MessagesComponent />
      </div>
    </>
  );
}