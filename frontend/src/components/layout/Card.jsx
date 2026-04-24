import React from "react";

const Card = ({
  title,
  value,
  icon,
  color = "blue",
  className = "",
}) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between border border-gray-100 hover:shadow-md transition ${className}`}
    >
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-1">
          {value ?? 0}
        </h2>
      </div>

      {icon && (
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

export default Card;