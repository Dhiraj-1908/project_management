import Header from "@/components/Header";
import React from "react";

const Settings = () => {
  const userSettings = {
    username: "johndoe",
    email: "john.doe@example.com",
    teamName: "Development Team",
    roleName: "Developer",
  };

  const labelStyles = "block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1";
  const valueContainerStyles =
    "mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-200";
  const cardStyles =
    "bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 md:p-8 space-y-6";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8">
      <Header name="Settings" />
      <div className="max-w-3xl mx-auto mt-8">
        <div className={cardStyles}>
          <div>
            <label className={labelStyles}>Username</label>
            <div className={valueContainerStyles}>{userSettings.username}</div>
          </div>
          <div>
            <label className={labelStyles}>Email</label>
            <div className={valueContainerStyles}>{userSettings.email}</div>
          </div>
          <div>
            <label className={labelStyles}>Team</label>
            <div className={valueContainerStyles}>{userSettings.teamName}</div>
          </div>
          <div>
            <label className={labelStyles}>Role</label>
            <div className={valueContainerStyles}>{userSettings.roleName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;